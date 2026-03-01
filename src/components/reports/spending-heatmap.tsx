"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarHeart } from "lucide-react";
import type { HeatmapDay } from "@/actions/report";
import { getSpendingHeatmap } from "@/actions/report";
import { format, getDay, startOfYear, getWeek } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface SpendingHeatmapProps {
  initialData: HeatmapDay[];
  initialYear: number;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const DAY_LABELS = ["", "Sen", "", "Rab", "", "Jum", ""];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getIntensityClass(amount: number, max: number): string {
  if (amount === 0)
    return "bg-slate-100 dark:bg-slate-800";
  const ratio = amount / max;
  if (ratio < 0.25)
    return "bg-emerald-200 dark:bg-emerald-900";
  if (ratio < 0.5)
    return "bg-amber-300 dark:bg-amber-700";
  if (ratio < 0.75)
    return "bg-orange-400 dark:bg-orange-600";
  return "bg-red-500 dark:bg-red-500";
}

export function SpendingHeatmap({
  initialData,
  initialYear,
}: SpendingHeatmapProps) {
  const [year, setYear] = useState(initialYear);
  const [data, setData] = useState<HeatmapDay[]>(initialData);
  const [loading, setLoading] = useState(false);

  const maxAmount = useMemo(
    () => Math.max(...data.map((d) => d.amount), 1),
    [data]
  );

  // Build grid: 53 cols × 7 rows
  const grid = useMemo(() => {
    const weeks: (HeatmapDay | null)[][] = [];
    let currentWeek: (HeatmapDay | null)[] = [];

    // Pad the first week with nulls if year doesn't start on Monday
    const firstDayOfYear = startOfYear(new Date(year, 0, 1));
    const startDow = getDay(firstDayOfYear); // 0=Sun
    // Convert to Mon=0 format
    const mondayOffset = startDow === 0 ? 6 : startDow - 1;
    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push(null);
    }

    data.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Pad last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [data, year]);

  // Calculate month label positions
  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;

    grid.forEach((week, weekIdx) => {
      const firstDay = week.find((d) => d !== null);
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth) {
          positions.push({ label: MONTH_LABELS[month], col: weekIdx });
          lastMonth = month;
        }
      }
    });

    return positions;
  }, [grid]);

  async function handleYearChange(newYear: string) {
    const y = parseInt(newYear);
    setYear(y);
    setLoading(true);
    try {
      const newData = await getSpendingHeatmap(y);
      setData(newData);
    } catch (error) {
      console.error("Failed to fetch heatmap data:", error);
    } finally {
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarHeart className="h-5 w-5 text-rose-500" />
            Heatmap Pengeluaran
          </CardTitle>
          <CardDescription>
            Intensitas pengeluaran harian sepanjang tahun
          </CardDescription>
        </div>

        <Select value={year.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[140px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="flex ml-[30px] mb-1">
              {monthPositions.map((mp, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground"
                  style={{
                    position: "relative",
                    left: `${mp.col * 14}px`,
                    marginRight:
                      i < monthPositions.length - 1
                        ? `${((monthPositions[i + 1]?.col ?? mp.col) - mp.col) * 14 - 28}px`
                        : "0",
                  }}
                >
                  {mp.label}
                </div>
              ))}
            </div>

            <div className="flex gap-0">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] mr-1 pt-[2px]">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="h-[12px] w-[24px] text-[10px] text-muted-foreground leading-[12px]"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="flex gap-[2px]">
                {grid.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[2px]">
                    {week.map((day, dayIdx) => {
                      if (!day) {
                        return (
                          <div
                            key={dayIdx}
                            className="h-[12px] w-[12px] rounded-[2px]"
                          />
                        );
                      }

                      const dateObj = new Date(day.date);
                      const formattedDate = format(dateObj, "EEEE, d MMMM yyyy", {
                        locale: localeId,
                      });

                      return (
                        <Popover key={dayIdx}>
                          <PopoverTrigger asChild>
                            <button
                              className={`h-[12px] w-[12px] rounded-[2px] transition-colors hover:ring-1 hover:ring-foreground/30 ${getIntensityClass(day.amount, maxAmount)}`}
                              title={`${formattedDate}: ${formatCurrency(day.amount)}`}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-3"
                            side="top"
                            align="center"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {formattedDate}
                              </p>
                              <p
                                className={`text-sm font-semibold ${day.amount > 0 ? "text-red-500" : "text-muted-foreground"}`}
                              >
                                {day.amount > 0
                                  ? formatCurrency(day.amount)
                                  : "Tidak ada pengeluaran"}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 justify-end text-xs text-muted-foreground">
              <span>Sedikit</span>
              <div className="h-[12px] w-[12px] rounded-[2px] bg-slate-100 dark:bg-slate-800" />
              <div className="h-[12px] w-[12px] rounded-[2px] bg-emerald-200 dark:bg-emerald-900" />
              <div className="h-[12px] w-[12px] rounded-[2px] bg-amber-300 dark:bg-amber-700" />
              <div className="h-[12px] w-[12px] rounded-[2px] bg-orange-400 dark:bg-orange-600" />
              <div className="h-[12px] w-[12px] rounded-[2px] bg-red-500 dark:bg-red-500" />
              <span>Banyak</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
