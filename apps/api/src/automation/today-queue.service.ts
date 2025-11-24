import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface TodayQueueItem {
  id: string;
  type: "overdue_followup" | "idle_lead" | "unopened_quote" | "high_value_lead" | "price_resistance";
  priority: number;
  title: string;
  subtitle: string;
  actionUrl: string;
  metadata: any;
}

@Injectable()
export class TodayQueueService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate prioritized "Today" queue
   */
  async generateTodayQueue(orgId: string): Promise<TodayQueueItem[]> {
    const items: TodayQueueItem[] = [];

    // 1. Overdue follow-ups (highest priority)
    const overdueFollowups = await this.prisma.followup.findMany({
      where: {
        lead: { orgId },
        dueAt: { lt: new Date() },
        doneAt: null,
      },
      include: { lead: true },
      orderBy: { dueAt: "asc" },
    });

    overdueFollowups.forEach((f, index) => {
      items.push({
        id: `overdue-${f.id}`,
        type: "overdue_followup",
        priority: 1000 - index, // Highest priority
        title: f.lead.title,
        subtitle: `Overdue since ${new Date(f.dueAt).toLocaleDateString()}`,
        actionUrl: `/leads/${f.leadId}`,
        metadata: { followupId: f.id, leadId: f.leadId },
      });
    });

    // 2. Idle leads (not replied in 24+ hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const idleLeads = await this.prisma.lead.findMany({
      where: {
        orgId,
        stage: { notIn: ["WON", "LOST"] },
        lastMessageAt: { lt: twentyFourHoursAgo },
        lastRepliedAt: { lt: twentyFourHoursAgo },
      },
      include: { contact: true },
      orderBy: { lastMessageAt: "asc" },
      take: 10,
    });

    idleLeads.forEach((lead, index) => {
      const hoursSinceLastMessage = lead.lastMessageAt
        ? Math.floor((new Date().getTime() - lead.lastMessageAt.getTime()) / (1000 * 60 * 60))
        : 0;

      items.push({
        id: `idle-${lead.id}`,
        type: "idle_lead",
        priority: 800 - index,
        title: lead.title,
        subtitle: `No reply in ${hoursSinceLastMessage} hours`,
        actionUrl: `/leads/${lead.id}`,
        metadata: { leadId: lead.id },
      });
    });

    // 3. Quotes sent but not opened in 24h
    const unopenedQuotes = await this.prisma.quote.findMany({
      where: {
        lead: { orgId },
        status: { in: ["SENT", "DRAFT"] },
        OR: [
          { lastViewedAt: null },
          { lastViewedAt: { lt: twentyFourHoursAgo } },
        ],
        createdAt: { gte: twentyFourHoursAgo },
      },
      include: { lead: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    unopenedQuotes.forEach((quote, index) => {
      items.push({
        id: `quote-${quote.id}`,
        type: "unopened_quote",
        priority: 700 - index,
        title: `Quote for ${quote.lead.title}`,
        subtitle: `$${quote.total.toFixed(2)} - Not opened yet`,
        actionUrl: `/quotes/${quote.id}`,
        metadata: { quoteId: quote.id, leadId: quote.leadId },
      });
    });

    // 4. High-value leads (quotes > $500)
    const highValueLeads = await this.prisma.lead.findMany({
      where: {
        orgId,
        stage: { notIn: ["WON", "LOST"] },
        quotes: {
          some: {
            total: { gte: 500 },
            status: { in: ["DRAFT", "SENT"] },
          },
        },
      },
      include: { quotes: { where: { total: { gte: 500 } }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    highValueLeads.forEach((lead, index) => {
      items.push({
        id: `highvalue-${lead.id}`,
        type: "high_value_lead",
        priority: 600 - index,
        title: lead.title,
        subtitle: `High-value quote: $${lead.quotes[0]?.total.toFixed(2)}`,
        actionUrl: `/leads/${lead.id}`,
        metadata: { leadId: lead.id },
      });
    });

    // 5. Price resistance leads
    const priceResistanceLeads = await this.prisma.lead.findMany({
      where: {
        orgId,
        priceResistance: true,
        stage: { notIn: ["WON", "LOST"] },
      },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    priceResistanceLeads.forEach((lead, index) => {
      items.push({
        id: `priceresist-${lead.id}`,
        type: "price_resistance",
        priority: 500 - index,
        title: lead.title,
        subtitle: "Price concerns detected - needs attention",
        actionUrl: `/leads/${lead.id}`,
        metadata: { leadId: lead.id },
      });
    });

    // Sort by priority (highest first)
    return items.sort((a, b) => b.priority - a.priority);
  }
}

