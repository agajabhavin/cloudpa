import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Silent Lead Capture - Auto-create lead when conversation hits threshold
   */
  async checkAndCaptureLead(conversationId: string, orgId: string) {
    // Check if lead already exists for this conversation
    const existingLead = await this.prisma.lead.findFirst({
      where: { conversationId, orgId },
    });
    if (existingLead) return null;

    // Count messages in conversation
    const messageCount = await this.prisma.message.count({
      where: { conversationId },
    });

    // Threshold: 3+ messages
    if (messageCount >= 3) {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { contact: true, messages: { orderBy: { sentAt: "desc" }, take: 1 } },
      });

      if (!conversation || !conversation.contact) return null;

      // Extract intent from latest message
      const latestMessage = conversation.messages[0];
      const intentGuess = this.extractIntent(latestMessage?.text || "");

      const lead = await this.prisma.lead.create({
        data: {
          orgId,
          contactId: conversation.contactId,
          conversationId,
          title: `${conversation.contact.name || conversation.contact.handle} – ${intentGuess}`,
          autoCaptured: true,
          tags: ["auto_captured"],
          lastMessageAt: conversation.lastMessageAt || new Date(),
        },
      });

      return lead;
    }

    return null;
  }

  /**
   * Detect price resistance keywords
   */
  detectPriceResistance(text: string): boolean {
    const keywords = [
      "too expensive",
      "expensive",
      "discount",
      "cheaper",
      "cheap",
      "another quote",
      "better price",
      "lower price",
      "price too high",
      "can't afford",
      "budget",
    ];
    const lowerText = text.toLowerCase();
    return keywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Auto-update pipeline stage based on chat keywords
   */
  async checkAndUpdateStage(leadId: string, messageText: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return null;

    const lowerText = messageText.toLowerCase();
    let newStage: string | null = null;

    // Check for WON signals
    const wonKeywords = ["yes", "okay", "ok", "done", "book", "confirm", "agreed", "accepted"];
    if (wonKeywords.some((kw) => lowerText.includes(kw))) {
      newStage = "WON";
    }

    // Check for LOST signals
    const lostKeywords = ["no", "not now", "later", "too costly", "can't", "won't work"];
    if (lostKeywords.some((kw) => lowerText.includes(kw))) {
      newStage = "LOST";
    }

    if (newStage && newStage !== lead.stage) {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { stage: newStage },
      });

      // If WON, create work order draft
      if (newStage === "WON") {
        await this.createWorkOrderDraft(leadId);
      }

      return newStage;
    }

    return null;
  }

  /**
   * Create auto-follow-up draft for idle leads
   */
  async createFollowupDraftIfNeeded(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { followupDrafts: { where: { sentAt: null }, take: 1 } },
    });

    if (!lead) return null;

    // Check if draft already exists
    if (lead.followupDrafts.length > 0) return null;

    const now = new Date();
    let shouldDraft = false;
    let draftText = "";

    // NEW stage for 24h
    if (lead.stage === "NEW" && lead.lastMessageAt) {
      const hoursSinceLastMessage = (now.getTime() - lead.lastMessageAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastMessage >= 24) {
        shouldDraft = true;
        draftText = `Hi! Just checking in on your inquiry. Are you still interested?`;
      }
    }

    // QUOTED for 48h
    if (lead.stage === "QUOTED" && lead.lastMessageAt) {
      const hoursSinceLastMessage = (now.getTime() - lead.lastMessageAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastMessage >= 48) {
        shouldDraft = true;
        draftText = `Hi! Just following up on the quote I sent. Do you have any questions?`;
      }
    }

    if (shouldDraft) {
      return await this.prisma.followupDraft.create({
        data: {
          leadId,
          text: draftText,
        },
      });
    }

    return null;
  }

  /**
   * Create work order draft when lead is won
   */
  async createWorkOrderDraft(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { contact: true, quotes: { where: { status: "ACCEPTED" }, take: 1 } },
    });

    if (!lead) return null;

    // Check if work order already exists
    const existing = await this.prisma.workOrder.findFirst({ where: { leadId } });
    if (existing) return existing;

    const quote = lead.quotes[0];
    const customer = lead.contact?.name || lead.title;

    return await this.prisma.workOrder.create({
      data: {
        leadId,
        orgId: lead.orgId,
        customer: customer,
        service: quote ? `Service from quote #${quote.id.slice(0, 8)}` : lead.title,
        price: quote?.total || 0,
        status: "PENDING",
      },
    });
  }

  /**
   * Get dead leads for revival (LOST or inactive 30+ days)
   */
  async getDeadLeadsForRevival(orgId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // LOST leads
    const lostLeads = await this.prisma.lead.findMany({
      where: {
        orgId,
        stage: "LOST",
        createdAt: { gte: thirtyDaysAgo },
      },
      include: { contact: true },
    });

    // Inactive leads (no activity in 30 days)
    const inactiveLeads = await this.prisma.lead.findMany({
      where: {
        orgId,
        stage: { not: "WON" },
        lastMessageAt: { lt: thirtyDaysAgo },
        createdAt: { lt: thirtyDaysAgo },
      },
      include: { contact: true },
    });

    return [...lostLeads, ...inactiveLeads];
  }

  /**
   * Create revival draft for dead lead
   */
  async createRevivalDraft(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: { contact: true },
    });

    if (!lead) return null;

    // Check if draft already exists
    const existing = await this.prisma.followupDraft.findFirst({
      where: { leadId, sentAt: null },
    });
    if (existing) return existing;

    const draftText = `Hey ${lead.contact?.name || "there"}, just checking if you still need help with ${lead.title}. Let me know!`;

    return await this.prisma.followupDraft.create({
      data: {
        leadId,
        text: draftText,
      },
    });
  }

  /**
   * Extract intent from message text
   */
  private extractIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("price") || lowerText.includes("cost") || lowerText.includes("quote")) {
      return "Pricing inquiry";
    }
    if (lowerText.includes("book") || lowerText.includes("schedule") || lowerText.includes("appointment")) {
      return "Booking request";
    }
    if (lowerText.includes("service") || lowerText.includes("help")) {
      return "Service inquiry";
    }
    
    return "General inquiry";
  }
}

