"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useState } from "react";

interface Preset {
  label: string;
  from: string;
  to: string;
}

function getPresets(): Preset[] {
  const now = new Date();
  const fmt = (d: Date) => format(d, "yyyy-MM-dd");

  return [
    { label: "Bulan Ini", from: fmt(startOfMonth(now)), to: fmt(now) },
    { label: "Bulan Lalu", from: fmt(startOfMonth(subMonths(now, 1))), to: fmt(endOfMonth(subMonths(now, 1))) },
    { label: "3 Bulan", from: fmt(startOfMonth(subMonths(now, 2))), to: fmt(now) },
    { label: "6 Bulan", from: fmt(startOfMonth(subMonths(now, 5))), to: fmt(now) },
    { label: "Tahun Ini", from: fmt(startOfYear(now)), to: fmt(now) },
    { label: "Tahun Lalu", from: fmt(startOfYear(subYears(now, 1))), to: fmt(endOfYear(subYears(now, 1))) },
  ];
}

export function ReportDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFrom = searchParams.get("from") ?? "";
  const currentTo = searchParams.get("to") ?? "";

  const [fromDate, setFromDate] = useState<Date | undefined>(
    currentFrom ? new Date(currentFrom) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    currentTo ? new Date(currentTo) : undefined
  );

  const presets = getPresets();

  const navigate = (from: string, to: string) => {
    const params = new URLSearchParams();
    params.set("from", from);
    params.set("to", to);
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  const isActivePreset = (p: Preset) => p.from === currentFrom && p.to === currentTo;

  const applyCustomRange = () => {
    if (fromDate && toDate) {
      navigate(format(fromDate, "yyyy-MM-dd"), format(toDate, "yyyy-MM-dd"));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant={isActivePreset(p) ? "default" : "outline"}
            size="sm"
            className={
              isActivePreset(p)
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : ""
            }
            onClick={() => navigate(p.from, p.to)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Custom Range */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              {fromDate ? format(fromDate, "dd MMM yyyy", { locale: localeId }) : "Dari"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={(d) => setFromDate(d ?? undefined)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground text-sm">–</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              {toDate ? format(toDate, "dd MMM yyyy", { locale: localeId }) : "Sampai"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={(d) => setToDate(d ?? undefined)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          size="sm"
          variant="secondary"
          onClick={applyCustomRange}
          disabled={!fromDate || !toDate}
        >
          Terapkan
        </Button>
      </div>
    </div>
  );
}
