"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TransactionSchema } from "@/types/schemas";
import { createTransaction } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
}

// UI Form schema accepts raw input naturally, will be parsed later
const FormSchema = z.object({
  amount: z.string().or(z.number()),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Pilih jenis transaksi" }),
  categoryId: z.string().min(1, { message: "Pilih kategori" }),
  date: z.date({ message: "Pilih tanggal transaksi" }),
  note: z.string().max(100, { message: "Panjang catatan maksimal 100 karakter" }).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function TransactionForm({
  categories,
  onSuccess,
}: {
  categories: Category[];
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: "",
      type: "EXPENSE",
      categoryId: "",
      date: new Date(),
      note: "",
    },
  });

  // Watch "type" to filter categories dynamically
  const selectedType = form.watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setServerError("");
    
    // Convert implicitly to the exact shape Zod schema expects on the Action validation
    const parsedValues = {
        amount: Number(values.amount) || 0,
        type: values.type,
        categoryId: values.categoryId,
        date: values.date,
        note: values.note
    };

    const res = await createTransaction(parsedValues);
    
    if (res.error) {
      setServerError(res.error);
    } else {
      form.reset({
        ...form.getValues(),
        amount: "",
        note: "",
      });
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <p className="text-sm font-medium text-destructive">{serverError}</p>}
        
        {/* TIPE TRANSAKSI */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Transaksi</FormLabel>
              <Select 
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("categoryId", ""); // reset category when type changes
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Jenis" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                  <SelectItem value="INCOME">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* NOMINAL */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nominal (Rp)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="50000" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* KATEGORI */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  {filteredCategories.length === 0 && (
                     <SelectItem value="null" disabled>Belum ada kategori</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TANGGAL */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal</FormLabel>
              <DatePicker date={field.value} setDate={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CATATAN */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="Makan siang jumat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Transaksi"}
        </Button>
      </form>
    </Form>
  );
}
