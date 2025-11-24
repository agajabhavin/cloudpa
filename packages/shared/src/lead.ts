import { z } from "zod";

export const LeadStageSchema = z.enum(["NEW", "CONTACTED", "QUOTED", "WON", "LOST"]);
export type LeadStage = z.infer<typeof LeadStageSchema>;

export const LeadSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  conversationId: z.string().uuid().nullable(),
  title: z.string(),
  stage: LeadStageSchema,
  lastMessageAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type Lead = z.infer<typeof LeadSchema>;

