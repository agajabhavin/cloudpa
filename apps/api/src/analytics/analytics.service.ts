import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async dashboard(orgId: string) {
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const leadsThisWeek = await this.prisma.lead.count({
      where: { orgId, createdAt: { gte: start } },
    });

    const won = await this.prisma.lead.count({
      where: { orgId, stage: "WON" },
    });
    const lost = await this.prisma.lead.count({
      where: { orgId, stage: "LOST" },
    });
    const totalClosed = won + lost;

    const overdueFollowups = await this.prisma.followup.count({
      where: {
        lead: { orgId },
        dueAt: { lt: new Date() },
        doneAt: null,
      },
    });

    const quotes = await this.prisma.quote.findMany({
      where: { lead: { orgId } },
    });
    const accepted = quotes.filter((q) => q.status === "ACCEPTED").length;

    return {
      leadsThisWeek,
      wonRatio: totalClosed ? won / totalClosed : 0,
      avgResponseTime: 0, // MVP placeholder
      overdueFollowups,
      quoteAcceptance: quotes.length ? accepted / quotes.length : 0,
    };
  }
}

