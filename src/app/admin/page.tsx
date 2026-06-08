// src/app/admin/page.tsx
"use client";
import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Loader2, Users, ShoppingCart, TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle, Plug } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const RANGES = [7, 14, 30, 90];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  if (loading || !data) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const { summary, dailyData, topServices, recentOrders, orderStatusBreakdown } = data;

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(summary.totalRevenue), icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10", sub: `Today: ${formatCurrency(summary.revenueToday)}` },
    { label: "Total Profit", value: formatCurrency(summary.totalProfit), icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10", sub: "From completed orders" },
    { label: "Total Users", value: summary.totalUsers.toLocaleString(), icon: Users, color: "text-purple-400", bg: "bg-purple-400/10", sub: `Today: +${summary.newUsersToday}` },
    { label: "Total Orders", value: summary.totalOrders.toLocaleString(), icon: ShoppingCart, color: "text-yellow-400", bg: "bg-yellow-400/10", sub: `Pending: ${summary.pendingOrders}` },
    { label: "Processing", value: summary.processingOrders.toLocaleString(), icon: Clock, color: "text-orange-400", bg: "bg-orange-400/10", sub: "Active orders" },
    { label: "Completed", value: summary.completedOrders.toLocaleString(), icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", sub: "All time" },
    { label: "Active Providers", value: summary.activeProviders.toLocaleString(), icon: Plug, color: "text-cyan-400", bg: "bg-cyan-400/10", sub: "Connected APIs" },
    { label: "Pending Orders", value: summary.pendingOrders.toLocaleString(), icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", sub: "Need attention" },
  ];

  const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#f97316", "#ef4444", "#8b5cf6"];

  const statusBadge: Record<string, string> = {
    PENDING: "status-pending", PROCESSING: "status-processing", COMPLETED: "status-completed",
    PARTIAL: "status-partial", CANCELLED: "status-cancelled", REFUNDED: "status-refunded",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Range selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">Analytics Overview</h2>
        <div className="flex gap-2">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${range === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="font-display text-2xl font-bold">{card.value}</div>
            <div className="text-sm text-muted-foreground">{card.label}</div>
            <div className="text-xs text-muted-foreground/70 mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold mb-5">Revenue & Orders Over Time</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Revenue (₦)" />
            <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top services */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top Services</h3>
          {topServices.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((s: any, i: number) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground/50 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.category.name}</div>
                  </div>
                  <div className="text-sm font-semibold">{s.totalOrders.toLocaleString()} orders</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order status pie */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={orderStatusBreakdown.map((s: any) => ({ name: s.status, value: s._count.status }))}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {orderStatusBreakdown.map((_: any, index: number) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {orderStatusBreakdown.map((s: any, i: number) => (
              <div key={s.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {s.status}: {s._count.status}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm text-primary hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                {["Order", "User", "Service", "Amount", "Profit", "Status", "Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.user.name}</div>
                    <div className="text-xs text-muted-foreground">{o.user.email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[150px] truncate">{o.service.name}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(o.charge)}</td>
                  <td className="px-4 py-3 text-green-500 font-medium">{formatCurrency(o.profit)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[o.status] || ""}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
