/**
 * Shared message processing logic
 * Used by both pg-boss and BullMQ workers
 */

import { PrismaClient } from "@prisma/client";
import { AutomationService } from "../automation/automation.service";

const prisma = new PrismaClient();
const automationService = new AutomationService(prisma as any);

export interface MessageJobData {
  orgId: string;
  payload: any;
  receivedAt?: number;
}

export async function processInboundMessage(data: MessageJobData) {
  const { orgId, payload } = data;

  // Extract message data from Twilio WhatsApp webhook format
  // Twilio sends: From (whatsapp:+1234567890), Body (text), Timestamp (Unix seconds)
  const handle = payload.From || payload.handle || payload.phone;
  const text = payload.Body || payload.text || payload.message;
  
  // Twilio sends timestamp as Unix seconds (string or number)
  const sentAt = payload.Timestamp
    ? new Date(parseInt(payload.Timestamp) * 1000)
    : payload.DateSent
    ? new Date(payload.DateSent)
    : payload.sentAt
    ? new Date(payload.sentAt)
    : new Date();

  if (!handle || !text) {
    throw new Error("Missing required fields: handle or text");
  }

  // 1. Contact upsert (indexed lookup)
  const contact = await prisma.contact.upsert({
    where: { orgId_handle: { orgId, handle } },
    update: {},
    create: { orgId, handle },
  });

  // 2. Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      orgId,
      contactId: contact.id,
    },
    orderBy: { lastMessageAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        orgId,
        contactId: contact.id,
        lastMessageAt: sentAt,
      },
    });
  }

  // 3. Insert message (with denormalized orgId)
  await prisma.message.create({
    data: {
      orgId, // Denormalized for fast queries
      conversationId: conversation.id,
      direction: "IN",
      text,
      sentAt,
    },
  });

  // 4. Update conversation lastMessageAt
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: sentAt },
  });

  // 5. Silent Lead Capture - Check if we should auto-create lead
  try {
    await automationService.checkAndCaptureLead(conversation.id, orgId);
  } catch (error) {
    // Don't fail the job if automation fails
    console.error("Lead capture failed:", error);
  }

  // 6. Check for price resistance
  if (automationService.detectPriceResistance(text)) {
    const existingLead = await prisma.lead.findFirst({
      where: { conversationId: conversation.id, orgId },
    });
    if (existingLead) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          priceResistance: true,
          tags: { push: "price_resistance" },
        },
      });
    }
  }

  return { success: true, conversationId: conversation.id };
}

