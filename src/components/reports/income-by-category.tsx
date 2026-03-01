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

interface IncomeByCategoryProps {
  data: CategoryBreakdownItem[];
}

const COLORS = [
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6",
  "#a855f7", "#84cc16", "#10b981", "#0ea5e9", "#6366f1",
];

export function IncomeByCategory({ data }: IncomeByCategoryProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-lg">🍩 Distribusi Pemasukan</CardTitle>
          <CardDescription>Belum ada data pemasukan.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-sm text-muted-foreground border-dashed border-2 mx-4 mb-4 rounded-xl">
          Tidak ada pemasukan dalam periode ini.
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
        <CardTitle className="text-lg">🍩 Distribusi Pemasukan</CardTitle>
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
                    key={`income-cell-${index}`}
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
