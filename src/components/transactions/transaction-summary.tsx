import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react";

interface TransactionSummaryProps {
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
}

export function TransactionSummary({ summary }: TransactionSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Total Pemasukan</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-400">
            {formatCurrency(summary.totalIncome)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Total Pengeluaran</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-rose-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-400">
            {formatCurrency(summary.totalExpense)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Sisa Saldo (Net)</CardTitle>
          <WalletIcon className="h-4 w-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(summary.net)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
