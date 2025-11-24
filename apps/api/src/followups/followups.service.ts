import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FollowupsService {
  constructor(private prisma: PrismaService) {}

  create(leadId: string, dueAt: Date) {
    return this.prisma.followup.create({ data: { leadId, dueAt } });
  }

  overdue(orgId: string) {
    return this.prisma.followup.findMany({
      where: {
        lead: { orgId },
        dueAt: { lt: new Date() },
        doneAt: null,
      },
      include: { lead: true },
    });
  }

  markDone(id: string) {
    return this.prisma.followup.update({
      where: { id },
      data: { doneAt: new Date() },
    });
  }
}

