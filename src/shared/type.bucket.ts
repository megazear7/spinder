import z from "zod";

export const Bucket = z.object({
  name: z.string(),
  filterTexts: z.array(z.string()),
});
export type Bucket = z.infer<typeof Bucket>;

export const BucketWithData = z.object({
  name: z.string(),
  filterTexts: z.array(z.string()),
  transactionCount: z.number(),
  totalAmount: z.number(),
});
export type BucketWithData = z.infer<typeof BucketWithData>;
