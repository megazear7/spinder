import z from "zod";

export const Bucket = z.object({
  name: z.string(),
  filterTexts: z.array(z.string()),
  monthlyGoal: z.number().nonnegative().optional(),
});
export type Bucket = z.infer<typeof Bucket>;

export const BucketWithData = z.object({
  name: z.string(),
  filterTexts: z.array(z.string()),
  monthlyGoal: z.number().nonnegative().optional(),
  transactionCount: z.number(),
  totalAmount: z.number(),
  spentAmount: z.number().nonnegative(),
  goalProgress: z.number().nonnegative(),
  goalStatus: z.enum(["none", "on-track", "approaching", "exceeded"]),
});
export type BucketWithData = z.infer<typeof BucketWithData>;
