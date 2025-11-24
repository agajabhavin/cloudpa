import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { OrgService } from "./org.service";

@Controller("org")
@UseGuards(JwtAuthGuard)
export class OrgController {
  constructor(private org: OrgService) {}

  @Get("me")
  me(@CurrentUser() u: any) {
    return this.org.me(u.orgId);
  }

  @Patch()
  update(@CurrentUser() u: any, @Body() body: { name: string }) {
    return this.org.update(u.orgId, body.name);
  }

  @Post("invite")
  invite(@CurrentUser() u: any, @Body() body: { email: string }) {
    return this.org.invite(u.orgId, body.email);
  }

  @Post("chat-accounts")
  async createChatAccount(
    @CurrentUser() u: any,
    @Body() body: {
      provider: string;
      externalPhoneId: string;
      accountSid?: string;
      authToken?: string;
    }
  ) {
    return this.org.createChatAccount(u.orgId, body);
  }
}

