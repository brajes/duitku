"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryBreakdownItem } from "@/actions/report";

interface ExpenseByCategoryProps {
  data: CategoryBreakdownItem[];
}

const COLORS = [
  "#4f46e5", "#ec4899", "#8b5cf6", "#14b8a6", "#f59e0b",
  "#06b6d4", "#f97316", "#84cc16", "#e11d48", "#6366f1",
];

export function ExpenseByCategory({ data }: ExpenseByCategoryProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-lg">🍩 Distribusi Pengeluaran</CardTitle>
          <CardDescription>Belum ada data pengeluaran.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-sm text-muted-foreground border-dashed border-2 mx-4 mb-4 rounded-xl">
          Tidak ada pengeluaran dalam periode ini.
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.total,
    percentage: item.percentage,
  }));

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg">🍩 Distribusi Pengeluaran</CardTitle>
        <CardDescription>Berdasarkan kategori</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`expense-cell-${index}`}
                    fill={data[index]?.categoryColor || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number | undefined) => `Rp ${(value ?? 0).toLocaleString("id-ID")}`}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string, entry: any) =>
                  `${value} (${entry?.payload?.percentage ?? 0}%)`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
