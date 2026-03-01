"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ExpenseChart({ transactions }: { transactions: any[] }) {
  // Hanya ambil pengeluaran
  const expenses = transactions.filter((tx) => tx.type === "EXPENSE");
  
  if (expenses.length === 0) {
     return (
        <Card className="h-full bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
           <CardHeader>
               <CardTitle className="text-lg">Distribusi Pengeluaran</CardTitle>
               <CardDescription>Kosong</CardDescription>
           </CardHeader>
           <CardContent className="flex items-center justify-center p-6 h-64 text-muted-foreground text-sm border-dashed border-2 m-4 rounded-xl">
               Belum ada data pengeluaran.
           </CardContent>
        </Card>
     )
  }

  // Agregasi berdasar Kategori
  const categoryMap: Record<string, number> = {};
  expenses.forEach((tx) => {
    const catName = tx.category?.name || "Lainnya";
    categoryMap[catName] = (categoryMap[catName] || 0) + Number(tx.amount);
  });

  const data = Object.keys(categoryMap)
    .map((key) => ({ name: key, value: categoryMap[key] }))
    .sort((a, b) => b.value - a.value); // Urutkan dari yg terbesar

  // Palet modern HSL colors
  const COLORS = ["#4f46e5", "#ec4899", "#8b5cf6", "#14b8a6", "#f59e0b", "#06b6d4"];

  return (
    <Card className="h-full bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Distribusi Pengeluaran</CardTitle>
        <CardDescription>Berdasarkan Kategori</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
