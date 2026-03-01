"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TransactionType } from "@prisma/client";
import {
  differenceInDays,
  differenceInMonths,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { id as localeId } from "date-fns/locale";

// ── Auth helper ──────────────────────────────────────────────────────
async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

// ── Helpers ──────────────────────────────────────────────────────────
function toStartOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}
function toEndOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

// ── 1. Report Summary ───────────────────────────────────────────────
export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netto: number;
  avgDailyExpense: number;
  transactionCount: number;
  changes: {
    income: number | null;
    expense: number | null;
    netto: number | null;
  };
}

export async function getReportSummary(
  from: string,
  to: string
): Promise<ReportSummary> {
  const userId = await getUserId();
  const dateFrom = toStartOfDay(from);
  const dateTo = toEndOfDay(to);
  const dayCount = differenceInDays(dateTo, dateFrom) + 1;

  // Previous period of equal length
  const prevTo = subDays(dateFrom, 1);
  const prevFrom = subDays(prevTo, dayCount - 1);

  const [currentAgg, currentCount, prevAgg] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { gte: dateFrom, lte: dateTo } },
      _sum: { amount: true },
    }),
    prisma.transaction.count({
      where: { userId, date: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: {
          gte: new Date(`${format(prevFrom, "yyyy-MM-dd")}T00:00:00.000Z`),
          lte: new Date(`${format(prevTo, "yyyy-MM-dd")}T23:59:59.999Z`),
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const sum = (
    agg: typeof currentAgg,
    type: TransactionType
  ): number => {
    const found = agg.find((a) => a.type === type);
    return found ? Number(found._sum.amount ?? 0) : 0;
  };

  const totalIncome = sum(currentAgg, "INCOME");
  const totalExpense = sum(currentAgg, "EXPENSE");
  const prevIncome = sum(prevAgg, "INCOME");
  const prevExpense = sum(prevAgg, "EXPENSE");

  const pctChange = (curr: number, prev: number): number | null => {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    totalIncome,
    totalExpense,
    netto: totalIncome - totalExpense,
    avgDailyExpense: dayCount > 0 ? Math.round(totalExpense / dayCount) : 0,
    transactionCount: currentCount,
    changes: {
      income: pctChange(totalIncome, prevIncome),
      expense: pctChange(totalExpense, prevExpense),
      netto: pctChange(
        totalIncome - totalExpense,
        prevIncome - prevExpense
      ),
    },
  };
}

// ── 2. Category Breakdown ────────────────────────────────────────────
export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  total: number;
  count: number;
  percentage: number;
}

export async function getCategoryBreakdown(
  from: string,
  to: string,
  type: TransactionType
): Promise<CategoryBreakdownItem[]> {
  const userId = await getUserId();
  const dateFrom = toStartOfDay(from);
  const dateTo = toEndOfDay(to);

  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type, date: { gte: dateFrom, lte: dateTo } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  // Fetch categories in one query
  const categoryIds = grouped.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const grandTotal = grouped.reduce(
    (acc, g) => acc + Number(g._sum.amount ?? 0),
    0
  );

  return grouped.map((g) => {
    const cat = catMap.get(g.categoryId);
    const total = Number(g._sum.amount ?? 0);
    return {
      categoryId: g.categoryId,
      categoryName: cat?.name ?? "Lainnya",
      categoryIcon: cat?.icon ?? null,
      categoryColor: cat?.color ?? null,
      total,
      count: g._count.id,
      percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
    };
  });
}

// ── 3. Income vs Expense Trend ───────────────────────────────────────
export interface TrendDataPoint {
  label: string;
  income: number;
  expense: number;
}

export async function getIncomeExpenseTrend(
  from: string,
  to: string
): Promise<TrendDataPoint[]> {
  const userId = await getUserId();
  const dateFrom = toStartOfDay(from);
  const dateTo = toEndOfDay(to);
  const totalDays = differenceInDays(dateTo, dateFrom) + 1;
  const totalMonths = differenceInMonths(dateTo, dateFrom);

  // Fetch raw transactions for the period
  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: dateFrom, lte: dateTo } },
    select: { date: true, type: true, amount: true },
    orderBy: { date: "asc" },
  });

  // Determine granularity
  type Bucket = { start: Date; end: Date; label: string };
  let buckets: Bucket[] = [];

  if (totalDays <= 31) {
    // Daily
    const days = eachDayOfInterval({ start: dateFrom, end: dateTo });
    buckets = days.map((d) => ({
      start: d,
      end: d,
      label: format(d, "dd MMM", { locale: localeId }),
    }));
  } else if (totalMonths <= 3) {
    // Weekly
    const weeks = eachWeekOfInterval(
      { start: dateFrom, end: dateTo },
      { weekStartsOn: 1 }
    );
    buckets = weeks.map((ws) => {
      const we = endOfWeek(ws, { weekStartsOn: 1 });
      return {
        start: ws,
        end: we > dateTo ? dateTo : we,
        label: `${format(ws, "dd MMM", { locale: localeId })}`,
      };
    });
  } else {
    // Monthly
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });
    buckets = months.map((ms) => {
      const me = endOfMonth(ms);
      return {
        start: ms,
        end: me > dateTo ? dateTo : me,
        label: format(ms, "MMM yyyy", { locale: localeId }),
      };
    });
  }

  return buckets.map((bucket) => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (
        isWithinInterval(txDate, { start: bucket.start, end: bucket.end })
      ) {
        const amount = Number(tx.amount);
        if (tx.type === "INCOME") income += amount;
        else expense += amount;
      }
    });

    return { label: bucket.label, income, expense };
  });
}

// ── 4. Top Expenses ──────────────────────────────────────────────────
export interface TopExpenseItem {
  id: string;
  date: Date;
  amount: number;
  note: string | null;
  categoryName: string;
  categoryIcon: string | null;
}

export async function getTopExpenses(
  from: string,
  to: string,
  limit: number = 5
): Promise<TopExpenseItem[]> {
  const userId = await getUserId();
  const dateFrom = toStartOfDay(from);
  const dateTo = toEndOfDay(to);

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: dateFrom, lte: dateTo },
    },
    include: { category: true },
    orderBy: { amount: "desc" },
    take: limit,
  });

  return rows.map((tx) => ({
    id: tx.id,
    date: tx.date,
    amount: Number(tx.amount),
    note: tx.note,
    categoryName: tx.category.name,
    categoryIcon: tx.category.icon,
  }));
}

// ── 5. Month-over-Month Comparison ──────────────────────────────────
export interface MonthComparisonItem {
  label: string;
  income: number;
  expense: number;
}

export async function getMonthComparison(
  months: number = 3
): Promise<MonthComparisonItem[]> {
  const userId = await getUserId();
  const now = new Date();
  const results: MonthComparisonItem[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const target = subMonths(now, i);
    const mStart = startOfMonth(target);
    const mEnd = endOfMonth(target);

    const agg = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: { gte: mStart, lte: mEnd },
      },
      _sum: { amount: true },
    });

    const income = Number(
      agg.find((a) => a.type === "INCOME")?._sum.amount ?? 0
    );
    const expense = Number(
      agg.find((a) => a.type === "EXPENSE")?._sum.amount ?? 0
    );

    results.push({
      label: format(mStart, "MMM yyyy", { locale: localeId }),
      income,
      expense,
    });
  }

  return results;
}

// ── 6. Export Transactions (for CSV) ────────────────────────────────
export interface ExportTransaction {
  date: string;
  type: string;
  categoryName: string;
  amount: number;
  note: string;
}

export async function getExportTransactions(
  from: string,
  to: string
): Promise<ExportTransaction[]> {
  const userId = await getUserId();
  const dateFrom = toStartOfDay(from);
  const dateTo = toEndOfDay(to);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: dateFrom, lte: dateTo } },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  return transactions.map((tx) => ({
    date: format(new Date(tx.date), "yyyy-MM-dd"),
    type: tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
    categoryName: tx.category.name,
    amount: Number(tx.amount),
    note: tx.note ?? "",
  }));
}

// ── 7. Spending Heatmap ─────────────────────────────────────────────
export interface HeatmapDay {
  date: string;
  amount: number;
}

export async function getSpendingHeatmap(
  year: number
): Promise<HeatmapDay[]> {
  const userId = await getUserId();
  const dateFrom = new Date(`${year}-01-01T00:00:00.000Z`);
  const dateTo = new Date(`${year}-12-31T23:59:59.999Z`);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: dateFrom, lte: dateTo },
    },
    select: { date: true, amount: true },
  });

  // Aggregate by day
  const dayMap = new Map<string, number>();
  transactions.forEach((tx) => {
    const key = format(new Date(tx.date), "yyyy-MM-dd");
    dayMap.set(key, (dayMap.get(key) ?? 0) + Number(tx.amount));
  });

  // Generate all days in the year
  const allDays = eachDayOfInterval({ start: dateFrom, end: dateTo });
  return allDays.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    return { date: key, amount: dayMap.get(key) ?? 0 };
  });
}

// ── 8. Budget vs Actual ─────────────────────────────────────────────
export interface BudgetVsActualItem {
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  budgetAmount: number;
  actualAmount: number;
  percentage: number;
  status: "safe" | "warning" | "over";
}

export async function getBudgetVsActual(
  month: number,
  year: number
): Promise<BudgetVsActualItem[]> {
  const userId = await getUserId();

  // Get budgets for the month/year
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: true },
  });

  if (budgets.length === 0) return [];

  // Get actual spending for each budgeted category
  const mStart = startOfMonth(new Date(year, month - 1));
  const mEnd = endOfMonth(new Date(year, month - 1));

  const actuals = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: mStart, lte: mEnd },
      categoryId: { in: budgets.map((b) => b.categoryId) },
    },
    _sum: { amount: true },
  });

  const actualMap = new Map(
    actuals.map((a) => [a.categoryId, Number(a._sum.amount ?? 0)])
  );

  return budgets.map((b) => {
    const budgetAmount = Number(b.amount);
    const actualAmount = actualMap.get(b.categoryId) ?? 0;
    const percentage =
      budgetAmount > 0 ? Math.round((actualAmount / budgetAmount) * 100) : 0;

    let status: "safe" | "warning" | "over" = "safe";
    if (percentage > 100) status = "over";
    else if (percentage >= 80) status = "warning";

    return {
      categoryName: b.category.name,
      categoryIcon: b.category.icon,
      categoryColor: b.category.color,
      budgetAmount,
      actualAmount,
      percentage,
      status,
    };
  });
}
