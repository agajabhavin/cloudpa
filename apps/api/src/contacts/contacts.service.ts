import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  list(orgId: string) {
    return this.prisma.contact.findMany({
      where: { orgId },
      include: {
        conversations: {
          orderBy: { lastMessageAt: "desc" },
          take: 1,
        },
        leads: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(orgId: string, data: { name?: string; handle: string }) {
    return this.prisma.contact.create({
      data: {
        orgId,
        name: data.name,
        handle: data.handle,
      },
    });
  }

  get(orgId: string, id: string) {
    return this.prisma.contact.findFirst({
      where: { id, orgId },
      include: {
        conversations: {
          orderBy: { lastMessageAt: "desc" },
        },
        leads: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  update(orgId: string, id: string, data: { name?: string; handle?: string }) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }
}

