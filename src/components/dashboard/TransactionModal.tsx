"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

export function TransactionModal({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          Catat Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Catat Transaksi</DialogTitle>
          <DialogDescription>
            Masukkan rincian pemasukan atau pengeluaran baru.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm categories={categories} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
