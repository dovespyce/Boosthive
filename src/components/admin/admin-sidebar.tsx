// src/components/admin/admin-sidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, ShoppingCart, Package, CreditCard,
  BarChart3, Settings, Plug, Tag, LogOut, Menu, X, ChevronRight, MessageSquare
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Analytics", icon: BarChart3, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/services", label: "Services", icon: Package },
  { href: "/admin/providers", label: "Providers", icon: Plug },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/tickets", label: "Support", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">⚙️</div>
          <div>
            <div className="font-display font-bold text-lg leading-none">Admin Panel</div>
            <div className="text-xs text-muted-foreground">BoostHive</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}

        <div className="pt-2 border-t border-border/50 mt-2">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
            <LayoutDashboard className="w-4 h-4" />
            Client Dashboard
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            {getInitials(user.name || "A")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-primary">Administrator</p>
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
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-40">
        <NavContent />
      </aside>

      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-xl shadow-lg">
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-card border-r border-border flex flex-col shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary">
              <X className="w-4 h-4" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
