"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, CheckCircle } from "lucide-react";
import type { BudgetVsActualItem } from "@/actions/report";
import { getBudgetVsActual } from "@/actions/report";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface BudgetVsActualProps {
  initialData: BudgetVsActualItem[];
  initialMonth: number;
  initialYear: number;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_CONFIG = {
  safe: {
    color: "#22c55e",
    bgClass: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    label: "Aman",
    icon: CheckCircle,
  },
  warning: {
    color: "#eab308",
    bgClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Mendekati",
    icon: AlertTriangle,
  },
  over: {
    color: "#ef4444",
    bgClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    label: "Melebihi",
    icon: AlertTriangle,
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as BudgetVsActualItem | undefined;
    if (!data) return null;
    const config = STATUS_CONFIG[data.status];
    const StatusIcon = config.icon;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="text-sm font-semibold mb-1">
          {data.categoryIcon} {data.categoryName}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Budget: {formatFullCurrency(data.budgetAmount)}
          </p>
          <p className="text-muted-foreground">
            Aktual: {formatFullCurrency(data.actualAmount)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <StatusIcon className="h-3.5 w-3.5" style={{ color: config.color }} />
            <span style={{ color: config.color }} className="font-medium">
              {data.percentage}% — {config.label}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function BudgetVsActual({
  initialData,
  initialMonth,
  initialYear,
}: BudgetVsActualProps) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState<BudgetVsActualItem[]>(initialData);
  const [loading, setLoading] = useState(false);

  async function handlePeriodChange(newMonth?: number, newYear?: number) {
    const m = newMonth ?? month;
    const y = newYear ?? year;
    setMonth(m);
    setYear(y);
    setLoading(true);
    try {
      const newData = await getBudgetVsActual(m, y);
      setData(newData);
    } catch (error) {
      console.error("Failed to fetch budget data:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const overBudgetCount = data.filter((d) => d.status === "over").length;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Budget vs Aktual
          </CardTitle>
          <CardDescription>
            Perbandingan budget dan pengeluaran aktual per kategori
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={month.toString()}
            onValueChange={(v) => handlePeriodChange(parseInt(v), undefined)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year.toString()}
            onValueChange={(v) => handlePeriodChange(undefined, parseInt(v))}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center gap-3 p-6">
            <Target className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Belum ada data budget
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Buat budget terlebih dahulu untuk melihat perbandingan dengan
                pengeluaran aktual Anda.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Warning banner */}
            {overBudgetCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>{overBudgetCount} kategori</strong> melebihi budget
                  bulan {MONTH_NAMES[month - 1]} {year}
                </p>
              </div>
            )}

            {/* Chart */}
            <ResponsiveContainer width="100%" height={data.length * 60 + 40}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-border"
                />
                <XAxis
                  type="number"
                  tickFormatter={formatCurrency}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  type="category"
                  dataKey="categoryName"
                  width={100}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(name: string) =>
                    name.length > 12 ? name.slice(0, 12) + "…" : name
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                <Bar
                  dataKey="budgetAmount"
                  name="Budget"
                  fill="#a5b4fc"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  opacity={0.4}
                />
                <Bar
                  dataKey="actualAmount"
                  name="Aktual"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_CONFIG[entry.status].color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Status summary */}
            <div className="flex flex-wrap gap-2 mt-4">
              {data.map((item, i) => {
                const config = STATUS_CONFIG[item.status];
                return (
                  <Badge
                    key={i}
                    variant="outline"
                    className={`${config.bgClass} gap-1`}
                  >
                    {item.categoryIcon} {item.categoryName}: {item.percentage}%
                  </Badge>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
