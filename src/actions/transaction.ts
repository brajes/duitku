"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TransactionSchema } from "@/types/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Utility check Auth
async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

// 1. CREATE Transaction
export async function createTransaction(data: z.infer<typeof TransactionSchema>) {
  try {
    const userId = await getUserId();
    const result = TransactionSchema.safeParse(data);
    
    if (!result.success) {
      return { error: "Data input tidak valid" };
    }

    await prisma.transaction.create({
      data: {
        ...result.data,
        userId,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal membuat transaksi" };
  }
}

// 2. READ Transactions
export async function getTransactions(take: number = 50, filterType: string = "All") {
  try {
    const userId = await getUserId();
    
    // Setup filter dates
    let dateFilter = {};
    if (filterType !== "All") {
      const now = new Date();
      let startDate = new Date();
      
      switch (filterType) {
        case "Today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "Week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "Month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        default: break;
      }
      
      if (filterType !== "All") {
        dateFilter = {
          date: { gte: startDate }
        };
      }
    }

    // Server fetch Data Server-Side tanpa Route Handler (API)
    // demi kecepatan loading Dashboard (React Server Component paradigm)
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId,
        ...dateFilter
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc'
      },
      take,
    });

    return {
      data: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount), // Convert Decimal object to primitive JS Number
      })),
    };
  } catch (err: any) {
    return { error: err.message || "Gagal mengambil data" };
  }
}

// 3. DELETE Transaction
export async function deleteTransaction(id: string) {
  try {
    const userId = await getUserId();
    
    await prisma.transaction.delete({
      where: {
        id,
        userId // Keamanan ganda, pastikan record milik user itu sendiri
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal menghapus transaksi" };
  }
}
