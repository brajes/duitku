"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteTransaction } from "@/actions/transaction";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function TransactionTable({ transactions }: { transactions: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(txId: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    setLoadingId(txId);
    await deleteTransaction(txId);
    setLoadingId(null);
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Belum ada transaksi.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">
                {format(new Date(tx.date), "dd MMM yy", { locale: id })}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{tx.category?.name || "Lainnya"}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{tx.note || "-"}</TableCell>
              <TableCell className={`text-right font-semibold ${tx.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {tx.type === "INCOME" ? "+" : "-"} Rp {Number(tx.amount).toLocaleString("id-ID")}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(tx.id)}
                  disabled={loadingId === tx.id}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
