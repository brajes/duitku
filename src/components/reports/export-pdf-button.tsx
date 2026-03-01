"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

interface ExportPdfButtonProps {
  from: string;
  to: string;
}

export function ExportPdfButton({ from, to }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleExport() {
    setLoading(true);

    try {
      const reportContent = document.getElementById("report-content");
      if (!reportContent) return;

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Popup diblokir oleh browser. Izinkan popup untuk mengunduh PDF.");
        setLoading(false);
        return;
      }

      // Get all stylesheets from the current page
      const styles = Array.from(document.styleSheets)
        .map((sheet) => {
          try {
            return Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join("\n");
          } catch {
            // Cross-origin stylesheets can't be read
            if (sheet.href) {
              return `@import url("${sheet.href}");`;
            }
            return "";
          }
        })
        .join("\n");

      // Write content to print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laporan Keuangan - Duitku</title>
            <style>
              ${styles}

              /* Print-specific styles */
              @media print {
                body { 
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }

              body {
                padding: 20px;
                background: white !important;
                color: black !important;
              }

              .print-header {
                text-align: center;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 2px solid #e2e8f0;
              }

              .print-header h1 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
              }

              .print-header p {
                font-size: 14px;
                color: #64748b;
                margin: 4px 0 0 0;
              }

              .print-footer {
                text-align: center;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #94a3b8;
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>📊 Laporan Keuangan - Duitku</h1>
              <p>Periode: ${from} s/d ${to}</p>
            </div>
            ${reportContent.outerHTML}
            <div class="print-footer">
              Dibuat pada: ${new Date().toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for styles and content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setLoading(false);
        }, 500);
      };

      // Fallback if onload doesn't fire
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error("Failed to export PDF:", error);
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
        <FileText className="h-4 w-4" />
      )}
      Export PDF
    </Button>
  );
}
