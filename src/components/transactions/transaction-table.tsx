"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTransaction } from "@/actions/transaction";

interface TransactionTableProps {
  transactions: any[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSort = (column: string) => {
    const currentSortBy = searchParams.get("sortBy");
    const currentSortOrder = searchParams.get("sortOrder");
    
    let newOrder = "desc";
    if (currentSortBy === column && currentSortOrder === "desc") {
      newOrder = "asc";
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", column);
    params.set("sortOrder", newOrder);
    params.set("page", "1"); // Reset pagination

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentSortBy = searchParams.get("sortBy") || "date";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const renderSortIcon = (column: string) => {
    if (currentSortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return currentSortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await deleteTransaction(id);
      if (res.error) {
        alert(res.error);
      } else {
        // success delete
        router.refresh(); 
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="rounded-md border bg-white dark:bg-slate-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent hover:bg-transparent px-4" onClick={() => handleSort("date")}>
                Tanggal
                {renderSortIcon("date")}
              </Button>
            </TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="w-[30%]">Catatan</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" className="h-8 justify-end w-full hover:bg-transparent" onClick={() => handleSort("amount")}>
                Nominal
                {renderSortIcon("amount")}
              </Button>
            </TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                Data transaksi tidak ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {format(new Date(tx.date), "dd MMM yyyy", { locale: localeId })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {/* Placeholder color box for category if color logic exists */}
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category?.color || '#ccc' }} />
                    <span>{tx.category?.name || "Uncategorized"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 dark:text-slate-400">
                  {tx.note || "-"}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={tx.type === "INCOME" ? "default" : "destructive"}
                    className={cn(
                      tx.type === "INCOME" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                    )}
                  >
                    {tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-medium",
                  tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Placeholder for edit feature */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data transaksi akan dihapus secara permanen dari server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(tx.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                          >
                            {isDeleting === tx.id ? "Menghapus..." : "Ya, Hapus"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
