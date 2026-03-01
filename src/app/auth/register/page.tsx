"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RegisterSchema } from "@/types/schemas";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/actions/auth";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    setLoading(true);
    setErrorMsg("");
    const res = await register(values);
    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-2xl">Daftar Akun Baru</CardTitle>
            <CardDescription>Registrasi untuk mulai mengelola keuangan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && <p className="text-sm font-medium text-destructive">{errorMsg}</p>}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="name">Nama (Opsional)</label>
              <Input
                id="name"
                type="text"
                placeholder="Budi"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? "Memproses..." : "Daftar Akun"}
            </Button>
            <div className="text-center text-sm">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="underline">Login di sini</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
