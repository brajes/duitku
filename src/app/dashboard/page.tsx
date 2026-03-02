import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { getTransactions } from "@/actions/transaction";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Auth is already checked in dashboard layout — no need to check again
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parse filters parameter
  const resolvedParams = await searchParams;
  const filterType = typeof resolvedParams.filter === "string" ? resolvedParams.filter : "All";

  // Fetch categories and transactions in parallel
  const [dbUser, txRes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user!.id },
      include: { categories: true },
    }),
    getTransactions(5, filterType),
  ]);

  if (!dbUser) {
    return <div>Akun tidak ditemukan. Silakan login ulang.</div>;
  }

  const transactions = txRes.data;
  
  // Kalkulasi Saldo
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions?.forEach((tx) => {
    if (tx.type === "INCOME") totalIncome += Number(tx.amount);
    if (tx.type === "EXPENSE") totalExpense += Number(tx.amount);
  });
  
  const balance = totalIncome - totalExpense;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      
      {/* KARTU SALDO & SUMMARY */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card className="bg-slate-900 text-white lg:col-span-1 shadow-lg border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-300">Total Saldo</CardDescription>
            <CardTitle className="text-4xl">Rp {balance.toLocaleString("id-ID")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-400">Periode Aktif: Semua Waktu</div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 shadow-sm flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-around items-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Pemasukan</p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                + Rp {totalIncome.toLocaleString("id-ID")}
              </h3>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block"></div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Pengeluaran</p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                - Rp {totalExpense.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <TransactionModal categories={dbUser.categories} />
          </div>
        </Card>
      </div>

      {/* DAFTAR 5 TRANSAKSI TERAKHIR (full-width) */}
      <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
            <CardDescription>5 Transaksi Terakhir</CardDescription>
          </div>
          
          {/* Filters Menu */}
          <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-md text-sm font-medium w-fit">
            <Link href="/dashboard?filter=Today" className={`px-3 py-1.5 rounded-sm transition-all ${filterType === "Today" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}>
              Hari ini
            </Link>
            <Link href="/dashboard?filter=Week" className={`px-3 py-1.5 rounded-sm transition-all ${filterType === "Week" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}>
              7 Hari
            </Link>
            <Link href="/dashboard?filter=Month" className={`px-3 py-1.5 rounded-sm transition-all ${filterType === "Month" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}>
              30 Hari
            </Link>
            <Link href="/dashboard?filter=All" className={`px-3 py-1.5 rounded-sm transition-all ${filterType === "All" ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"}`}>
              Semua
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionTable transactions={transactions || []} />
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Lihat Semua Transaksi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

