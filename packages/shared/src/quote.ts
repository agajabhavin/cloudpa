import { z } from "zod";

export const QuoteStatus = z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"]);
export type QuoteStatus = z.infer<typeof QuoteStatus>;

export const QuoteItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().positive(),
  price: z.number().nonnegative(),
});

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  status: QuoteStatus,
  total: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  items: z.array(QuoteItemSchema),
});

export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteItem = z.infer<typeof QuoteItemSchema>;

