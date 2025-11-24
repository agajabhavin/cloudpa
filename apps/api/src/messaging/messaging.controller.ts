import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/user.decorator";
import { MessagingService } from "./messaging.service";
import twilio from "twilio";

@Controller("messaging")
export class MessagingController {
  constructor(private msg: MessagingService) {}

  @Post("webhook")
  async webhook(@Body() body: any) {
    // Resolve orgId from webhook payload
    // In production, verify signature here
    const orgId = body.orgId || process.env.DEFAULT_ORG_ID || "default";
    
    // Fast path: enqueue and return immediately
    return this.msg.webhook(orgId, body);
  }

  @Post("webhook/whatsapp")
  async whatsappWebhook(
    @Body() body: any,
    @Headers("x-twilio-signature") signature: string,
    @Req() req: any
  ) {
    // Verify Twilio signature
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
      console.error("TWILIO_AUTH_TOKEN not configured");
      return { error: "Configuration error" };
    }

    // Get the full URL for signature validation
    const url = process.env.PUBLIC_BASE_URL 
      ? `${process.env.PUBLIC_BASE_URL}/api/v1/messaging/webhook/whatsapp`
      : req.protocol + "://" + req.get("host") + req.originalUrl;

    // Validate Twilio request signature
    const isValid = twilio.validateRequest(
      authToken,
      signature,
      url,
      body
    );

    if (!isValid) {
      console.error("Invalid Twilio signature");
      return { error: "Invalid signature" };
    }

    // Resolve org from the "To" number (our Twilio WhatsApp number)
    const toNumber = body.To; // e.g., whatsapp:+14155238886
    const orgId = await this.msg.resolveOrgFromToNumber(toNumber);

    if (!orgId) {
      console.error(`No org found for Twilio number: ${toNumber}`);
      // For sandbox testing, try to use default org from env if available
      const defaultOrgId = process.env.DEFAULT_ORG_ID;
      if (defaultOrgId) {
        console.log(`Using default org from env: ${defaultOrgId}`);
        return this.msg.webhook(defaultOrgId, body);
      }
      return { error: "Organization not found for this number. Please create a ChatAccount first." };
    }

    // Fast path: enqueue and return immediately
    return this.msg.webhook(orgId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("conversations")
  list(
    @CurrentUser() u: any,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string
  ) {
    return this.msg.listConversations(u.orgId, limit ? Number(limit) : 20, cursor);
  }

  @UseGuards(JwtAuthGuard)
  @Get("conversations/:id")
  get(@CurrentUser() u: any, @Param("id") id: string) {
    return this.msg.getConversation(u.orgId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("conversations/:id/send")
  send(
    @CurrentUser() u: any,
    @Param("id") id: string,
    @Body() body: { message: string }
  ) {
    return this.msg.send(u.orgId, id, body.message);
  }
}
