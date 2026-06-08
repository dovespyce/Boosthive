// src/app/dashboard/orders/page.tsx
"use client";
import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Loader2, ShoppingCart, RefreshCw, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

const STATUSES = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "PARTIAL", "CANCELLED", "REFUNDED"];

const statusClass: Record<string, string> = {
  PENDING: "status-pending",
  PROCESSING: "status-processing",
  COMPLETED: "status-completed",
  PARTIAL: "status-partial",
  CANCELLED: "status-cancelled",
  REFUNDED: "status-refunded",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No orders found.</p>
            <Link href="/dashboard/services" className="text-primary text-sm hover:underline mt-1 inline-block">Place your first order</Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    {["Order", "Service", "Link", "Qty", "Charge", "Status", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px] truncate font-medium">{order.service.name}</div>
                        <div className="text-xs text-muted-foreground">{order.service.category.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="max-w-[120px] truncate text-xs text-muted-foreground">{order.link}</span>
                          <button onClick={() => copyLink(order.link, order.id)} className="text-muted-foreground hover:text-foreground">
                            {copied === order.id ? <span className="text-green-500 text-[10px]">✓</span> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.charge)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass[order.status] || ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {orders.map(order => (
                <div key={order.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{order.service.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">#{order.orderNumber}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{order.quantity.toLocaleString()} units</span>
                    <span className="font-semibold">{formatCurrency(order.charge)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{formatDateTime(order.createdAt)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40 hover:bg-accent transition-colors"
            >Previous</button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40 hover:bg-accent transition-colors"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
