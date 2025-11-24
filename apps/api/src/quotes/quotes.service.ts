import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, leadId: string, items: any[]) {
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    const quote = await this.prisma.quote.create({
      data: {
        leadId,
        total,
        items: { create: items },
        status: "SENT", // Auto-send when created
      },
      include: { items: true, lead: { include: { conversation: true } } },
    });
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { stage: "QUOTED" },
    });

    // Auto-insert quote link into conversation if exists
    if (quote.lead.conversationId) {
      const quoteLink = `${process.env.FRONTEND_URL || "https://app.cloudpa.io"}/public/quotes/${quote.publicId}`;
      const messageText = `I've prepared a quote for you: ${quoteLink}`;
      
      // Get conversation to retrieve orgId
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: quote.lead.conversationId },
        select: { orgId: true },
      });
      
      if (conversation) {
        // Insert as system message or regular message
        await this.prisma.message.create({
          data: {
            orgId: conversation.orgId, // Denormalized orgId required
            conversationId: quote.lead.conversationId,
            direction: "OUT",
            text: messageText,
            sentAt: new Date(),
          },
        });
      }

      await this.prisma.quote.update({
        where: { id: quote.id },
        data: { insertedInChat: true },
      });
    }

    return quote;
  }

  get(orgId: string, id: string) {
    return this.prisma.quote.findFirst({
      where: { id, lead: { orgId } },
      include: { items: true, lead: true },
    });
  }

  update(orgId: string, id: string, status: string) {
    return this.prisma.quote.update({ where: { id }, data: { status } });
  }

  publicGet(publicId: string) {
    return this.prisma.quote.findUnique({
      where: { publicId },
      include: { items: true },
    });
  }

  async trackView(quoteId: string) {
    return this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });
  }
}

