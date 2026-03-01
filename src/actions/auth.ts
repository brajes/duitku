"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { LoginSchema, RegisterSchema } from "@/types/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(data: z.infer<typeof LoginSchema>) {
  const result = LoginSchema.safeParse(data);

  if (!result.success) {
    return { error: "Data input tidak valid" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function register(data: z.infer<typeof RegisterSchema>) {
  const result = RegisterSchema.safeParse(data);

  if (!result.success) {
    return { error: "Data registrasi tidak valid" };
  }

  const supabase = await createClient();

  // 1. Didaftarkan ke Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Gagal membuat akun" };
  }

  const userId = authData.user.id;
  const userName = result.data.name || result.data.email.split("@")[0];

  try {
    // 2. Transaksi Prisma: Buat record User di tabel kita DAN generate kategori bawaan
    await prisma.$transaction(async (tx) => {
      // Masukkan User
      await tx.user.create({
        data: {
          id: userId,
          email: result.data.email,
          name: userName,
        },
      });

      // Siapkan mapping untuk kategori-kategori bawaan
      const categoriesToCreate = DEFAULT_CATEGORIES.map((cat) => ({
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        userId: userId,
      }));

      // Masukkan Kategori-Kategori Default
      await tx.category.createMany({
        data: categoriesToCreate,
      });
    });
  } catch (error) {
    console.error("Gagal inisialisasi user di prisma:", error);
    // Secara ideal bisa implementasi rollback manual supabase auth di sini,
    // namun kita biarkan log saja agar sistem tetap mencoba berlanjut walau profil error sementara waktu
    return { error: "Akun berhasil dibuat, namun inisialisasi data gagal. Coba hubungi support." };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
