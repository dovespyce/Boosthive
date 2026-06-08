// src/app/admin/orders/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Loader2, Search, RefreshCw, XCircle, RotateCcw, CheckCircle2 } from "lucide-react";

const STATUSES = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "PARTIAL", "CANCELLED", "REFUNDED"];

const statusClass: Record<string, string> = {
  PENDING: "status-pending",
  PROCESSING: "status-processing",
  COMPLETED: "status-completed",
  PARTIAL: "status-partial",
  CANCELLED: "status-cancelled",
  REFUNDED: "status-refunded",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAction = async (orderId: string, action: string) => {
    setActionLoading(orderId + action);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        fetchOrders();
      } else {
        showToast(data.error || "Action failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-card border border-border rounded-xl shadow-2xl text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order #, email, link..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

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

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  {["Order #", "User", "Service", "Link", "Qty", "Charge", "Profit", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-xs">{order.user.name}</div>
                      <div className="text-xs text-muted-foreground">{order.user.email}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <div className="truncate text-xs font-medium">{order.service.name}</div>
                      <div className="text-xs text-muted-foreground">{order.provider.name}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[100px]">
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                        {order.link.replace(/https?:\/\//, "").slice(0, 28)}…
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs">{order.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-xs whitespace-nowrap">{formatCurrency(order.charge)}</td>
                    <td className="px-4 py-3 text-green-400 font-medium text-xs whitespace-nowrap">{formatCurrency(order.profit)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusClass[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleAction(order.id, "cancel")}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Cancel"
                          >
                            {actionLoading === order.id + "cancel" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {["PENDING", "PROCESSING", "PARTIAL"].includes(order.status) && (
                          <button
                            onClick={() => handleAction(order.id, "refund")}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-500/10 transition-colors"
                            title="Refund"
                          >
                            {actionLoading === order.id + "refund" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {["PENDING", "PROCESSING"].includes(order.status) && (
                          <button
                            onClick={() => handleAction(order.id, "complete")}
                            disabled={!!actionLoading}
                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                            title="Mark Complete"
                          >
                            {actionLoading === order.id + "complete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total: {total} orders</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40 hover:bg-accent transition-colors">Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40 hover:bg-accent transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
