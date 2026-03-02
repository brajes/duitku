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

        <Card className="lg:col-span-2 shadow-sm flex flex-col sm:flex-row gap-4 justify-around items-center p-6">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pemasukan</p>
            <Skeleton className="h-8 w-36" />
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pengeluaran</p>
            <Skeleton className="h-8 w-36" />
          </div>
        </Card>
      </div>

      {/* FORM SKELETON */}
      <Card className="lg:col-span-1 border-t-4 border-t-indigo-500 rounded-t-sm shadow-sm">
        <CardHeader>
          <CardTitle>Catat Transaksi</CardTitle>
          <CardDescription>Masukkan rincian pemasukan/pengeluaran baru.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>

      {/* Grid Charts & Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <Card className="h-full bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
