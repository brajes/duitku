import { Suspense } from "react";
import { getFilteredTransactions } from "@/actions/transaction";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionSummary } from "@/components/transactions/transaction-summary";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionPagination } from "@/components/transactions/transaction-pagination";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Aktivitas Transaksi - Duitku",
};

export default async function TransactionsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch data
  const { data, pagination, summary, error } = await getFilteredTransactions(searchParams, 10);
  
  // Fetch user categories for filter dropdown
  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" }
  });

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Aktivitas Transaksi</h1>
        <p className="text-rose-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Transaksi</h2>
      </div>

      <TransactionSummary summary={summary!} />
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-md shadow-sm mb-6">
        <TransactionFilters categories={categories} />
        <TransactionTable transactions={data || []} />
        {pagination && (
          <TransactionPagination 
            currentPage={pagination.currentPage} 
            totalPages={pagination.totalPages} 
          />
        )}
      </div>
    </div>
  );
}
