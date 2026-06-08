// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Wallet, ShoppingCart, Clock, CheckCircle2, TrendingUp, Gift, Zap, ArrowRight } from "lucide-react";

async function getDashboardData(userId: string) {
  const [user, orders, recentOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true, totalSpent: true, totalDeposited: true, referralEarnings: true, name: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),
    prisma.order.findMany({
      where: { userId },
      include: { service: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = o._count.status;
    return acc;
  }, {} as Record<string, number>);

  return { user, statusCounts, recentOrders };
}

export default async function DashboardPage() {
  const session = await auth();
  const { user, statusCounts, recentOrders } = await getDashboardData(session!.user.id);

  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const statCards = [
    {
      label: "Wallet Balance",
      value: formatCurrency(user?.walletBalance || 0),
      icon: Wallet,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      href: "/dashboard/wallet",
      action: "Fund Wallet",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      href: "/dashboard/orders",
      action: "View All",
    },
    {
      label: "Total Spent",
      value: formatCurrency(user?.totalSpent || 0),
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      href: "/dashboard/orders",
      action: "View Orders",
    },
    {
      label: "Referral Earnings",
      value: formatCurrency(user?.referralEarnings || 0),
      icon: Gift,
      color: "text-green-400",
      bg: "bg-green-400/10",
      href: "/dashboard/referral",
      action: "Refer Friends",
    },
  ];

  const orderStats = [
    { label: "Pending", count: statusCounts["PENDING"] || 0, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Processing", count: statusCounts["PROCESSING"] || 0, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Completed", count: statusCounts["COMPLETED"] || 0, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Partial", count: statusCounts["PARTIAL"] || 0, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const statusBadge: Record<string, string> = {
    PENDING: "status-pending",
    PROCESSING: "status-processing",
    COMPLETED: "status-completed",
    PARTIAL: "status-partial",
    CANCELLED: "status-cancelled",
    REFUNDED: "status-refunded",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your account.</p>
        </div>
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm shadow-lg shadow-primary/20"
        >
          <Zap className="w-4 h-4" />
          New Order
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="font-display text-2xl font-bold mb-1">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Order status breakdown */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Order Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {orderStats.map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.count}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">View all</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No orders yet.</p>
            <Link href="/dashboard/services" className="inline-flex items-center gap-1 text-primary text-sm mt-2 hover:underline">
              Place your first order <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{order.service.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    #{order.orderNumber} · {order.quantity.toLocaleString()} units · {formatDateTime(order.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-medium text-sm">{formatCurrency(order.charge)}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[order.status] || ""}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/wallet" className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group text-center">
          <Wallet className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-medium">Fund Wallet</div>
          <div className="text-xs text-muted-foreground mt-1">Add balance via Paystack</div>
        </Link>
        <Link href="/dashboard/services" className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group text-center">
          <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-medium">New Order</div>
          <div className="text-xs text-muted-foreground mt-1">Buy followers, likes & more</div>
        </Link>
        <Link href="/dashboard/referral" className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group text-center">
          <Gift className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <div className="font-medium">Invite Friends</div>
          <div className="text-xs text-muted-foreground mt-1">Earn 5% commission</div>
        </Link>
      </div>
    </div>
  );
}
