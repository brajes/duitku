import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { LogOut, PlusCircle, LayoutDashboard } from "lucide-react";
import { getTransactions } from "@/actions/transaction";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Parse filters parameter
  const resolvedParams = await searchParams;
  const filterType = typeof resolvedParams.filter === "string" ? resolvedParams.filter : "All";

  // Ambil profil User dan Kategori
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { categories: true },
  });

  if (!dbUser) {
    // Edge case if user deleted in DB but session exists
    return <div>Akun tidak ditemukan. Silakan login ulang.</div>;
  }

  // Ambil Transaksi (Terapkan filter ke server action)
  const txRes = await getTransactions(50, filterType);
  
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
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Duitku</h1>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:inline-block">Halo, {dbUser.name}</span>
          <form action={logout}>
            <Button variant="outline" size="sm">Logout</Button>
          </form>
        </div>
      </header>

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
          
          <Card className="lg:col-span-2 shadow-sm flex flex-col sm:flex-row gap-4 justify-around items-center p-6">
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
          </Card>
        </div>

        {/* FORM TRANSACTION */}
        <Card className="lg:col-span-1 border-t-4 border-t-indigo-500 rounded-t-sm shadow-sm">
          <CardHeader>
            <CardTitle>Catat Transaksi</CardTitle>
            <CardDescription>Masukkan rincian pemasukan/pengeluaran baru.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm categories={dbUser.categories} />
          </CardContent>
        </Card>

        {/* Grid Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
           <div className="lg:col-span-1">
             <ExpenseChart transactions={transactions || []} />
           </div>

           <div className="lg:col-span-2">
             <Card className="h-full bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
               <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
                   <CardDescription>Semua rekam jejak finansial Anda.</CardDescription>
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
               <CardContent>
                 <TransactionTable transactions={transactions || []} />
               </CardContent>
             </Card>
           </div>
        </div>
      </main>
    </div>
  );
}
