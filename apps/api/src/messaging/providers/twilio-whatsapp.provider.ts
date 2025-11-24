import twilio from "twilio";
import { PrismaService } from "../../prisma/prisma.service";

// Note: This provider should be used as a service, but for now we'll use PrismaClient directly
// In production, inject PrismaService via NestJS DI
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class TwilioWhatsAppProvider {
  private getClient(accountSid?: string, authToken?: string) {
    return twilio(
      accountSid || process.env.TWILIO_ACCOUNT_SID!,
      authToken || process.env.TWILIO_AUTH_TOKEN!
    );
  }

  async sendMessage(
    orgId: string,
    to: string,
    text: string
  ): Promise<{ sid: string }> {
    // Try to get account credentials from ChatAccount, fallback to env vars
    const chatAccount = await prisma.chatAccount.findFirst({
      where: {
        orgId,
        provider: "twilio_whatsapp",
        isActive: true,
      },
    });

    const accountSid = chatAccount?.accountSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = chatAccount?.authToken || process.env.TWILIO_AUTH_TOKEN;
    const from = chatAccount?.externalPhoneId || process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !from) {
      throw new Error("Twilio credentials not configured");
    }

    const client = this.getClient(accountSid, authToken);

    // Ensure 'to' is in WhatsApp format
    const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    // Send message via Twilio WhatsApp Sandbox
    // Note: For sandbox, we can reply within 24 hours without templates
    const message = await client.messages.create({
      from,
      to: toWhatsApp,
      body: text,
    });

    return { sid: message.sid };
  }
}

