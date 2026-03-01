import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  const userName = dbUser?.name || user.email?.split("@")[0] || "User";

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/20">
      <DashboardHeader userName={userName} />
      {children}
    </div>
  );
}
