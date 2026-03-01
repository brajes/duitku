"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { logout } from "@/actions/auth";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity"
      >
        Duitku
      </Link>

      {/* Desktop Nav Links */}
      <NavLinks />

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme Toggle (desktop only — mobile has it inside sheet) */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* User Name (desktop only) */}
        <span className="text-sm font-medium hidden md:inline-block text-muted-foreground">
          {userName}
        </span>

        {/* Logout (desktop only) */}
        <form action={logout} className="hidden md:block">
          <Button variant="outline" size="sm" className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>

        {/* Mobile Nav */}
        <MobileNav userName={userName} />
      </div>
    </header>
  );
}
