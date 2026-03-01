"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrendDataPoint } from "@/actions/report";

interface IncomeExpenseTrendProps {
  data: TrendDataPoint[];
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toString();
}

export function IncomeExpenseTrend({ data }: IncomeExpenseTrendProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tren Pemasukan vs Pengeluaran</CardTitle>
          <CardDescription>Belum ada data untuk periode ini.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">📈 Tren Pemasukan vs Pengeluaran</CardTitle>
        <CardDescription>Perbandingan pemasukan dan pengeluaran per periode</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                className="text-slate-600 dark:text-slate-400"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11 }}
                className="text-slate-600 dark:text-slate-400"
              />
              <Tooltip
                formatter={((value: number, name: string) => [
                  `Rp ${(value ?? 0).toLocaleString("id-ID")}`,
                  name === "income" ? "Pemasukan" : "Pengeluaran",
                ]) as any}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend
                formatter={(value: string) =>
                  value === "income" ? "Pemasukan" : "Pengeluaran"
                }
              />
              <Bar
                dataKey="income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
