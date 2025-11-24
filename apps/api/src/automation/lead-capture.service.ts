import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LeadsService } from "../leads/leads.service";

@Injectable()
export class LeadCaptureService {
  constructor(
    private prisma: PrismaService,
    private leadsService: LeadsService,
  ) {}

  /**
   * Check if conversation should auto-create a lead
   * Threshold: 3+ messages total
   */
  async checkAndCaptureLead(conversationId: string, orgId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, orgId },
      include: {
        contact: true,
        messages: true,
        leads: true, // Check if lead already exists
      },
    });

    if (!conversation) return null;

    // Don't create if lead already exists for this conversation
    if (conversation.leads && conversation.leads.length > 0) {
      return null;
    }

    const messageCount = conversation.messages?.length || 0;
    const threshold = 3;

    if (messageCount >= threshold) {
      // Extract intent from recent messages
      const recentMessages = conversation.messages
        .slice(-3)
        .map((m) => m.text)
        .join(" ");
      const intent = this.extractIntent(recentMessages);

      const title = conversation.contact?.name
        ? `${conversation.contact.name} – ${intent}`
        : `${conversation.contact?.handle || "Contact"} – ${intent}`;

      // Auto-create lead
      const lead = await this.leadsService.create(orgId, {
        title,
        contactId: conversation.contactId,
        conversationId: conversation.id,
        tags: ["auto_captured"],
        autoCaptured: true,
      });

      // Log the auto-capture
      await this.prisma.auditLog.create({
        data: {
          orgId,
          action: "LEAD_AUTO_CAPTURED",
          meta: {
            leadId: lead.id,
            conversationId,
            messageCount,
          },
        },
      });

      return lead;
    }

    return null;
  }

  /**
   * Extract intent from message text (basic keyword matching)
   * V2: Replace with LLM classifier
   */
  private extractIntent(text: string): string {
    const lower = text.toLowerCase();
    
    // Price/service keywords
    if (lower.match(/\b(price|cost|quote|pricing|how much|fee|charge)\b/)) {
      return "Price inquiry";
    }
    if (lower.match(/\b(service|work|job|project|help|need|want)\b/)) {
      return "Service inquiry";
    }
    if (lower.match(/\b(book|schedule|appointment|when|available)\b/)) {
      return "Booking inquiry";
    }
    
    return "General inquiry";
  }
}

