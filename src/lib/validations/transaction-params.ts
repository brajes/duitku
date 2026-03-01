import { z } from "zod";

export const transactionParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  search: z.string().optional().catch(""),
  category: z.string().optional().catch(""), // Comma-separated category IDs
  from: z.string().optional().catch(""), // YYYY-MM-DD
  to: z.string().optional().catch(""), // YYYY-MM-DD
  type: z.enum(["ALL", "INCOME", "EXPENSE"]).catch("ALL"),
  sortBy: z.enum(["date", "amount"]).catch("date"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
});

export type TransactionParams = z.infer<typeof transactionParamsSchema>;
