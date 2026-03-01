"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getExportTransactions } from "@/actions/report";

interface ExportCsvButtonProps {
  from: string;
  to: string;
}

export function ExportCsvButton({ from, to }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const data = await getExportTransactions(from, to);

      // Build CSV
      const headers = ["Tanggal", "Tipe", "Kategori", "Nominal", "Catatan"];
      const rows = data.map((tx) => [
        tx.date,
        tx.type,
        tx.categoryName,
        tx.amount.toString(),
        `"${tx.note.replace(/"/g, '""')}"`,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      );

      // Trigger download
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-keuangan_${from}_${to}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
}
