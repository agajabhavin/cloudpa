import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrgService {
  constructor(private prisma: PrismaService) {}

  me(orgId: string) {
    return this.prisma.org.findUnique({ where: { id: orgId } });
  }

  update(orgId: string, name: string) {
    return this.prisma.org.update({ where: { id: orgId }, data: { name } });
  }

  async invite(orgId: string, email: string) {
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: "INVITED" },
    });
    await this.prisma.orgUser.upsert({
      where: { orgId_userId: { orgId, userId: user.id } },
      update: { role: "MEMBER" },
      create: { orgId, userId: user.id, role: "MEMBER" },
    });
    return { ok: true };
  }

  async createChatAccount(
    orgId: string,
    data: {
      provider: string;
      externalPhoneId: string;
      accountSid?: string;
      authToken?: string;
    }
  ) {
    // Check if already exists
    const existing = await this.prisma.chatAccount.findFirst({
      where: {
        orgId,
        provider: data.provider,
        externalPhoneId: data.externalPhoneId,
      },
    });

    if (existing) {
      // Update existing
      return this.prisma.chatAccount.update({
        where: { id: existing.id },
        data: {
          accountSid: data.accountSid || existing.accountSid,
          authToken: data.authToken || existing.authToken,
          isActive: true,
        },
      });
    }

    // Create new
    return this.prisma.chatAccount.create({
      data: {
        orgId,
        provider: data.provider,
        externalPhoneId: data.externalPhoneId,
        accountSid: data.accountSid,
        authToken: data.authToken,
        isActive: true,
      },
    });
  }
}

