import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Channel1Adapter } from "./adapters/channel1.adapter";
import { TwilioWhatsAppProvider } from "./providers/twilio-whatsapp.provider";
import { AutomationService } from "../automation/automation.service";

@Injectable()
export class MessagingService {
  private adapter = new Channel1Adapter();
  private twilioProvider = new TwilioWhatsAppProvider();

  constructor(
    private prisma: PrismaService,
    private automation: AutomationService
  ) {}

  async webhook(orgId: string, payload: any) {
    // Fast path: Just enqueue and return
    // Processing happens async in worker
    const { inboundQueue } = await import("./queue");
    
    await inboundQueue.add("inbound", {
      orgId,
      payload,
      receivedAt: Date.now(),
    });

    return { ok: true }; // ACK < 100ms
  }

  listConversations(orgId: string, limit = 20, cursor?: string) {
    return this.prisma.conversation.findMany({
      where: { orgId },
      include: { contact: true },
      take: limit,
      skip: cursor ? 1 : 0,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: { lastMessageAt: "desc" },
    });
  }

  getConversation(orgId: string, id: string) {
    return this.prisma.conversation.findFirst({
      where: { id, orgId },
      include: {
        contact: true,
        messages: { orderBy: { sentAt: "asc" } },
      },
    });
  }

  async send(orgId: string, conversationId: string, text: string) {
    const convo = await this.prisma.conversation.findFirst({
      where: { id: conversationId, orgId },
      include: { contact: true },
    });
    if (!convo) throw new Error("Conversation not found");
    
    if (!convo.contact) {
      throw new Error("Contact not found for conversation");
    }

    // Send via Twilio WhatsApp
    const toHandle = convo.contact.handle; // e.g., whatsapp:+1234567890
    await this.twilioProvider.sendMessage(orgId, toHandle, text);
    
    // Insert message with denormalized orgId
    await this.prisma.message.create({
      data: {
        orgId, // Denormalized for fast queries
        conversationId,
        direction: "OUT",
        text,
        sentAt: new Date(),
      },
    });
    
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Update lead's lastRepliedAt if lead exists
    const lead = await this.prisma.lead.findFirst({
      where: { conversationId, orgId },
    });
    if (lead) {
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: { lastRepliedAt: new Date() },
      });

      // Check for auto-pipeline moves
      await this.automation.checkAndUpdateStage(lead.id, text);
    }

    return { ok: true };
  }

  async resolveOrgFromToNumber(to: string): Promise<string | null> {
    // Lookup ChatAccount where provider="twilio_whatsapp" and externalPhoneId == to
    const chatAccount = await this.prisma.chatAccount.findFirst({
      where: {
        provider: "twilio_whatsapp",
        externalPhoneId: to,
        isActive: true,
      },
    });

    return chatAccount?.orgId || null;
  }
}

