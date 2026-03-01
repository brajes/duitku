import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { TopExpenseItem } from "@/actions/report";

interface TopExpensesProps {
  data: TopExpenseItem[];
}

const RANK_COLORS: Record<number, string> = {
  0: "bg-yellow-500 text-white",
  1: "bg-slate-400 text-white",
  2: "bg-amber-700 text-white",
  3: "bg-slate-600 text-white",
  4: "bg-slate-600 text-white",
};

export function TopExpenses({ data }: TopExpensesProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">🏆 Top 5 Pengeluaran</CardTitle>
          <CardDescription>Belum ada data pengeluaran.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">🏆 Top 5 Pengeluaran Terbesar</CardTitle>
        <CardDescription>Transaksi dengan nominal terbesar dalam periode ini</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Badge className={`h-7 w-7 flex items-center justify-center text-xs font-bold rounded-full shrink-0 ${RANK_COLORS[index] ?? RANK_COLORS[4]}`}>
              {index + 1}
            </Badge>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {item.note || item.categoryName}
                </span>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {item.categoryName}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(item.date), "dd MMMM yyyy", { locale: localeId })}
              </p>
            </div>
            <p className="text-sm font-bold text-red-600 dark:text-red-400 shrink-0">
              Rp {item.amount.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
