"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TransactionSchema } from "@/types/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { transactionParamsSchema } from "@/lib/validations/transaction-params";
import { Prisma } from "@prisma/client";

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

// 2. READ Transactions (Dashboard Summary)
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

// 2.1 READ Filtered Transactions (Transaction Page with Pagination)
export async function getFilteredTransactions(params: unknown, pageSize: number = 10) {
  try {
    const userId = await getUserId();
    const parsedParams = transactionParamsSchema.parse(params);
    const { page, search, category, from, to, type, sortBy, sortOrder } = parsedParams;

    // Build the query where clause
    const whereClause: Prisma.TransactionWhereInput = {
      userId,
    };

    if (search) {
      whereClause.note = {
        contains: search,
        mode: "insensitive", // Postgres valid option
      };
    }

    if (category) {
      const categoryIds = category.split(",").filter(Boolean);
      if (categoryIds.length > 0) {
        whereClause.categoryId = {
          in: categoryIds,
        };
      }
    }

    if (type !== "ALL") {
      whereClause.type = type;
    }

    if (from || to) {
      whereClause.date = {};
      if (from) {
        whereClause.date.gte = new Date(`${from}T00:00:00.000Z`);
      }
      if (to) {
        whereClause.date.lte = new Date(`${to}T23:59:59.999Z`);
      }
    }

    // Combine queries for performance (transactions list + summary)
    const skip = (page - 1) * pageSize;

    const [transactions, totalCount, summaryData] = await Promise.all([
      // 1. Get transaction list with pagination
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: pageSize,
      }),
      // 2. Get total count for pagination math
      prisma.transaction.count({
        where: whereClause,
      }),
      // 3. Get total sum for incomes and expenses for the _filtered_ data
      prisma.transaction.groupBy({
        by: ["type"],
        where: whereClause,
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Parse summary
    let totalIncome = 0;
    let totalExpense = 0;

    summaryData.forEach((item) => {
      if (item.type === "INCOME") {
        totalIncome = Number(item._sum.amount || 0);
      } else if (item.type === "EXPENSE") {
        totalExpense = Number(item._sum.amount || 0);
      }
    });

    return {
      data: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      })),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
      },
      summary: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
      },
    };

  } catch (err: any) {
    console.error("Failed to fetch filtered transactions", err);
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
