import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Nama minimal 2 karakter" }).optional().or(z.literal("")),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

export const TransactionSchema = z.object({
  amount: z.coerce.number().positive({ message: "Nominal harus lebih dari 0" }),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Pilih jenis transaksi" }),
  categoryId: z.string().min(1, { message: "Pilih kategori" }),
  date: z.date({ message: "Pilih tanggal transaksi" }),
  note: z.string().max(100, { message: "Panjang catatan maksimal 100 karakter" }).optional(),
});
