"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import type { CategoryBreakdownItem } from "@/actions/report";

interface CategoryBreakdownTableProps {
  data: CategoryBreakdownItem[];
  type: "EXPENSE" | "INCOME";
}

type SortKey = "categoryName" | "count" | "total" | "percentage";
type SortDir = "asc" | "desc";

export function CategoryBreakdownTable({ data, type }: CategoryBreakdownTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDir === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const title = type === "EXPENSE" ? "Breakdown Pengeluaran" : "Breakdown Pemasukan";

  if (data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">📋 {title}</CardTitle>
          <CardDescription>Belum ada data.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">📋 {title}</CardTitle>
        <CardDescription>Rincian per kategori</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("categoryName")}
              >
                <span className="flex items-center gap-1">
                  Kategori <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-center"
                onClick={() => toggleSort("count")}
              >
                <span className="flex items-center justify-center gap-1">
                  Transaksi <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("total")}
              >
                <span className="flex items-center justify-end gap-1">
                  Total <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("percentage")}
              >
                <span className="flex items-center justify-end gap-1">
                  % <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => (
              <TableRow key={item.categoryId}>
                <TableCell className="font-medium">
                  {item.categoryName}
                </TableCell>
                <TableCell className="text-center">{item.count}</TableCell>
                <TableCell className="text-right font-medium">
                  Rp {item.total.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  {item.percentage}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
