import { z } from "zod";
import { format, startOfMonth } from "date-fns";

const today = () => format(new Date(), "yyyy-MM-dd");
const monthStart = () => format(startOfMonth(new Date()), "yyyy-MM-dd");

export const reportParamsSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).catch(monthStart()),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).catch(today()),
});

export type ReportParams = z.infer<typeof reportParamsSchema>;
