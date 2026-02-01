import { z } from "zod";

export const Label = z.object({
  id: z.string(),
  name: z.string().max(10, "Label name must be 10 characters or less"),
});
export type Label = z.infer<typeof Label>;

export const TransactionWithLabels = z.object({
  details: z.string(),
  postingDate: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.string(),
  balance: z.string().optional(),
  checkOrSlipNumber: z.string().optional(),
  labels: z.array(Label).optional(),
});
export type TransactionWithLabels = z.infer<typeof TransactionWithLabels>;
