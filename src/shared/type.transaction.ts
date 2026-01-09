import { z } from "zod";

export const Transaction = z.object({
  details: z.string(),
  postingDate: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.string(),
  balance: z.string().optional(),
  checkOrSlipNumber: z.string().optional(),
});
export type Transaction = z.infer<typeof Transaction>;
