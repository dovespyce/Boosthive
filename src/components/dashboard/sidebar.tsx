// src/components/dashboard/sidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingCart, Wallet, Gift, HeadphonesIcon,
  User, Bell, LogOut, Menu, X, Zap, ChevronRight, Settings
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard/services", label: "New Order", icon: Zap },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/referral", label: "Referrals", icon: Gift },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/support", label: "Support", icon: HeadphonesIcon },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">🐝</div>
          <div>
            <div className="font-display font-bold text-lg leading-none">BoostHive</div>
            <div className="text-xs text-muted-foreground">Social Growth</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Menu</p>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <>
            <div className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Admin</p>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
            {getInitials(user.name || "U")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-40">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-xl shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-card border-r border-border flex flex-col shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
