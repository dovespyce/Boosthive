// src/components/dashboard/header.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/orders": "My Orders",
  "/dashboard/services": "New Order",
  "/dashboard/wallet": "Wallet",
  "/dashboard/referral": "Referral Program",
  "/dashboard/notifications": "Notifications",
  "/dashboard/support": "Support",
  "/dashboard/profile": "My Profile",
};

export default function DashboardHeader({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => setUnread(d.unreadCount || 0))
      .catch(() => {});
  }, [pathname]);

  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-8" />
        <h1 className="font-display text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link href="/dashboard/notifications" className="relative p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
