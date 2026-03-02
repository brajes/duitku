import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      {/* KARTU SALDO & SUMMARY */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card className="bg-slate-900 text-white lg:col-span-1 shadow-lg border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-300">Total Saldo</CardDescription>
            <Skeleton className="h-10 w-48 bg-slate-700" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32 bg-slate-700" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-around items-center">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pemasukan</p>
              <Skeleton className="h-8 w-36" />
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pengeluaran</p>
              <Skeleton className="h-8 w-36" />
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
        </Card>
      </div>

      {/* DAFTAR 5 TRANSAKSI TERAKHIR */}
      <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
          <CardDescription>5 Transaksi Terakhir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
