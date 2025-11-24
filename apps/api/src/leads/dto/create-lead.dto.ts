import { z } from "zod";

export const CreateLeadDto = z.object({
  title: z.string().min(1),
  contactId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
});

export type CreateLeadDto = z.infer<typeof CreateLeadDto>;

