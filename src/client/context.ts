import { createContext } from "@lit/context";
import z from "zod";
import { LoadingStatus } from "../shared/type.loading.js";
import { Transaction } from "../shared/type.transaction.js";

export const TransactionContext = z.object({
  transactions: Transaction.array().optional(),
  status: LoadingStatus,
  error: z.string().optional(),
});
export type TransactionContext = z.infer<typeof TransactionContext>;
export const transactionContext = createContext<TransactionContext>("transaction");

export const BucketFilterContext = z.object({
  name: z.string(),
  filterTexts: z.array(z.string()),
  isUncategorized: z.boolean().optional(),
});
export type BucketFilterContext = z.infer<typeof BucketFilterContext>;
export const bucketFilterContext = createContext<BucketFilterContext>("bucket-filter");

export const TimeFilterContext = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  label: z.string(),
});
export type TimeFilterContext = z.infer<typeof TimeFilterContext>;
export const timeFilterContext = createContext<TimeFilterContext>("time-filter");

export const LabelFilterContext = z.object({
  labelId: z.string().optional(),
  labelName: z.string().optional(),
});
export type LabelFilterContext = z.infer<typeof LabelFilterContext>;
export const labelFilterContext = createContext<LabelFilterContext>("label-filter");
