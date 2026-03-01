"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function TransactionFilters({ categories }: { categories: any[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state helpers
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }
      
      return newSearchParams.toString();
    },
    [searchParams]
  );

  // States initialized from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Effect for Search debounce
  useEffect(() => {
    // Only push if debounced value is different from URL search param
    // to avoid infinite loops on mount if they match
    if (debouncedSearch !== (searchParams.get("search") || "")) {
       router.push(`${pathname}?${createQueryString({ search: debouncedSearch, page: "1" })}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, createQueryString, searchParams]);

  // Date Range state
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  
  // Category multi-select
  const currentCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  
  // Type filter
  const currentType = searchParams.get("type") || "ALL";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Cari transaksi..." className="pl-9" value="" readOnly disabled />
          </div>
          <Button variant="outline" className="w-full sm:w-[150px] justify-between" disabled>
            <span className="text-muted-foreground">Tipe</span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
          <Button variant="outline" className="w-full sm:w-[260px] justify-start text-muted-foreground" disabled>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Pilih rentang tanggal
          </Button>
          <Button variant="outline" className="w-full sm:w-[200px] justify-between text-muted-foreground" disabled>
            Pilih Kategori
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Cari transaksi..." 
            className="pl-9"
            value={searchTerm ?? ""}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <Select
          value={currentType}
          onValueChange={(val) => {
            router.push(`${pathname}?${createQueryString({ type: val === "ALL" ? null : val, page: "1" })}`, { scroll: false });
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            <SelectItem value="INCOME">Pemasukan</SelectItem>
            <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Picker (Simplistic from/to in one popover using Shadcn) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[260px] justify-start text-left font-normal",
                !from && !to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? (
                to ? (
                  <>
                    {format(new Date(from), "dd LLL", { locale: id })} -{" "}
                    {format(new Date(to), "dd LLL y", { locale: id })}
                  </>
                ) : (
                  format(new Date(from), "dd LLL y", { locale: id })
                )
              ) : (
                <span>Pilih rentang tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={from ? new Date(from) : new Date()}
              selected={{
                from: from ? new Date(from) : undefined,
                to: to ? new Date(to) : undefined,
              }}
              onSelect={(range) => {
                const dateParams: Record<string, string | null> = {
                  from: range?.from ? format(range.from, "yyyy-MM-dd") : null,
                  to: range?.to ? format(range.to, "yyyy-MM-dd") : null,
                  page: "1"
                };
                router.push(`${pathname}?${createQueryString(dateParams)}`, { scroll: false });
              }}
              numberOfMonths={2}
            />
            {/* Quick reset */}
            {(from || to) && (
              <div className="p-3 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full text-xs" 
                  onClick={() => router.push(`${pathname}?${createQueryString({ from: null, to: null, page: "1" })}`, { scroll: false })}
                >
                  Reset Tanggal
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Category Multi-select Array */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[200px] justify-between">
              {currentCategories.length > 0 ? (
                <div className="flex gap-1 overflow-hidden">
                  <span className="truncate">
                    {currentCategories.length} kategori dipilih
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">Pilih Kategori</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Cari kategori..." />
              <CommandList>
                <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => {
                    const isSelected = currentCategories.includes(category.id);
                    return (
                      <CommandItem
                        key={category.id}
                        onSelect={() => {
                          const newCategories = isSelected
                            ? currentCategories.filter((id) => id !== category.id)
                            : [...currentCategories, category.id];
                          
                          router.push(
                            `${pathname}?${createQueryString({ 
                              category: newCategories.length ? newCategories.join(",") : null,
                              page: "1"
                            })}`,
                            { scroll: false }
                          );
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
              {currentCategories.length > 0 && (
                <div className="p-1 border-t">
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs h-8"
                    onClick={() => router.push(`${pathname}?${createQueryString({ category: null, page: "1" })}`, { scroll: false })}
                  >
                    Reset Kategori
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
