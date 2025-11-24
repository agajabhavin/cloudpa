import { z } from "zod";

export const SignupDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  orgName: z.string().min(1),
});

export type SignupDto = z.infer<typeof SignupDto>;

