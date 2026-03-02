import { Suspense } from "react";
import { reportParamsSchema } from "@/lib/validations/report-params";
import { getAllReportData } from "@/actions/report";

import { ReportDateFilter } from "@/components/reports/report-date-filter";
import { PeriodSummaryCards } from "@/components/reports/period-summary-cards";
import { IncomeExpenseTrend } from "@/components/reports/income-expense-trend";
import { ExpenseByCategory } from "@/components/reports/expense-by-category";
import { IncomeByCategory } from "@/components/reports/income-by-category";
import { CategoryBreakdownTable } from "@/components/reports/category-breakdown-table";
import { TopExpenses } from "@/components/reports/top-expenses";
import { MonthComparisonChart } from "@/components/reports/month-comparison-chart";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { ExportPdfButton } from "@/components/reports/export-pdf-button";
import { SpendingHeatmap } from "@/components/reports/spending-heatmap";
import { BudgetVsActual } from "@/components/reports/budget-vs-actual";

export const metadata = {
  title: "Laporan Keuangan - Duitku",
  description: "Analisis komprehensif keuangan Anda",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

  // Parse and validate search params
  const resolvedParams = await searchParams;
  const { from, to } = reportParamsSchema.parse({
    from: resolvedParams.from,
    to: resolvedParams.to,
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 🚀 Single unified call — 1 auth check, all queries in parallel
  const {
    summary,
    expenseBreakdown,
    incomeBreakdown,
    trendData,
    topExpenses,
    monthComparison,
    heatmapData,
    budgetData,
  } = await getAllReportData(from, to, currentYear, currentMonth);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            📊 Laporan Keuangan
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Analisis mendalam kebiasaan finansial Anda
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <ExportCsvButton from={from} to={to} />
          <ExportPdfButton from={from} to={to} />
        </div>
      </div>

      {/* Date Filter */}
      <Suspense
        fallback={
          <div className="h-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        }
      >
        <ReportDateFilter />
      </Suspense>

      {/* Report content — wrapped with id for PDF export */}
      <div id="report-content" className="space-y-6">
        {/* Summary Cards */}
        <PeriodSummaryCards summary={summary} />

        {/* Trend Chart (full width) */}
        <IncomeExpenseTrend data={trendData} />

        {/* Donut Charts (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseByCategory data={expenseBreakdown} />
          <IncomeByCategory data={incomeBreakdown} />
        </div>

        {/* Category Breakdown Table */}
        <CategoryBreakdownTable data={expenseBreakdown} type="EXPENSE" />

        {/* Top 5 Expenses + Month Comparison (2 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopExpenses data={topExpenses} />
          <MonthComparisonChart data={monthComparison} />
        </div>

        {/* Spending Heatmap (full width) */}
        <SpendingHeatmap initialData={heatmapData} initialYear={currentYear} />

        {/* Budget vs Actual (full width) */}
        <BudgetVsActual
          initialData={budgetData}
          initialMonth={currentMonth}
          initialYear={currentYear}
        />
      </div>
    </div>
  );
}
