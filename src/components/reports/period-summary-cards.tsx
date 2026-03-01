import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Hash,
} from "lucide-react";
import type { ReportSummary } from "@/actions/report";

interface PeriodSummaryCardsProps {
  summary: ReportSummary;
}

function ChangeIndicator({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-muted-foreground">N/A</span>;

  const isPositive = value >= 0;
  return (
    <Badge
      variant="outline"
      className={`text-xs gap-0.5 font-medium ${
        isPositive
          ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
          : "text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value)}%
    </Badge>
  );
}

export function PeriodSummaryCards({ summary }: PeriodSummaryCardsProps) {
  const cards = [
    {
      title: "Total Pemasukan",
      value: summary.totalIncome,
      change: summary.changes.income,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      prefix: "+",
    },
    {
      title: "Total Pengeluaran",
      value: summary.totalExpense,
      change: summary.changes.expense,
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      prefix: "-",
    },
    {
      title: "Netto",
      value: summary.netto,
      change: summary.changes.netto,
      icon: DollarSign,
      color:
        summary.netto >= 0
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
      prefix: summary.netto >= 0 ? "+" : "",
    },
    {
      title: "Rata-rata Harian",
      value: summary.avgDailyExpense,
      change: null,
      icon: Activity,
      color: "text-orange-600 dark:text-orange-400",
      prefix: "",
    },
    {
      title: "Jumlah Transaksi",
      value: summary.transactionCount,
      change: null,
      icon: Hash,
      color: "text-indigo-600 dark:text-indigo-400",
      isCount: true,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="bg-slate-900 text-white border-slate-800 shadow-md hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-400">
                  {card.title}
                </p>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className={`text-xl font-bold ${card.color}`}>
                {"isCount" in card && card.isCount
                  ? card.value.toLocaleString("id-ID")
                  : `${card.prefix ?? ""}Rp ${Math.abs(card.value).toLocaleString("id-ID")}`}
              </p>
              {card.change !== null && (
                <div className="mt-2">
                  <ChangeIndicator value={card.change} />
                  <span className="text-[10px] text-slate-500 ml-1">
                    vs periode lalu
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
