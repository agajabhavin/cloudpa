import { z } from "zod";

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  lastMessageAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  direction: z.enum(["IN", "OUT"]),
  text: z.string(),
  sentAt: z.string().datetime(),
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type Message = z.infer<typeof MessageSchema>;

