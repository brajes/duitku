"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logout } from "@/actions/auth";

interface MobileNavProps {
  userName: string;
}

export function MobileNav({ userName }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-left text-indigo-600 dark:text-indigo-400 font-bold">
            Duitku
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-65px)]">
          {/* Navigation Links */}
          <div className="flex-1 p-4">
            <NavLinks orientation="vertical" onLinkClick={() => setOpen(false)} />
          </div>

          {/* Bottom Section */}
          <div className="border-t p-4 space-y-3">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 py-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium truncate">{userName}</span>
            </div>

            {/* Logout */}
            <form action={logout}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 border-red-200 dark:border-red-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
