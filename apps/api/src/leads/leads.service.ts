import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  list(orgId: string, stage?: string, search?: string) {
    return this.prisma.lead.findMany({
      where: {
        orgId,
        ...(stage ? { stage } : {}),
        ...(search
          ? { title: { contains: search, mode: "insensitive" } }
          : {}),
      },
      include: { contact: true, followups: true, quotes: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(orgId: string, dto: any) {
    const lead = await this.prisma.lead.create({
      data: { orgId, ...dto },
    });
    return lead;
  }

  get(orgId: string, id: string) {
    return this.prisma.lead.findFirst({
      where: { id, orgId },
      include: {
        contact: true,
        notes: true,
        followups: true,
        quotes: { include: { items: true } },
      },
    });
  }

  update(orgId: string, id: string, data: any) {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  addNote(orgId: string, id: string, text: string) {
    return this.prisma.leadNote.create({
      data: { leadId: id, text },
    });
  }
}

