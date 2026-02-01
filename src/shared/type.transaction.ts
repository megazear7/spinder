import { z } from "zod";
import { Label } from "./type.label.js";

export const Transaction = z.object({
  details: z.string(),
  postingDate: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.string(),
  balance: z.string().optional(),
  checkOrSlipNumber: z.string().optional(),
  labels: z.array(Label).optional(),
});
export type Transaction = z.infer<typeof Transaction>;
