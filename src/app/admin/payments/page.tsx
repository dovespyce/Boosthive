// src/app/admin/payments/page.tsx
"use client";
import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Loader2, CreditCard, TrendingUp, DollarSign, RefreshCw } from "lucide-react";

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDeposits: 0, totalRefunds: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/payments?page=${page}&limit=30`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setTotal(data.total || 0);
    setStats(data.stats || { totalDeposits: 0, totalRefunds: 0, totalCount: 0 });
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [page]);

  const txTypeColor: Record<string, string> = {
    DEPOSIT: "text-green-500",
    ORDER_PAYMENT: "text-red-400",
    REFUND: "text-blue-400",
    REFERRAL_BONUS: "text-green-500",
    ADMIN_CREDIT: "text-green-500",
    ADMIN_DEBIT: "text-red-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="font-display text-2xl font-bold text-green-400">{formatCurrency(stats.totalDeposits)}</div>
          <div className="text-sm text-muted-foreground">Total Deposits</div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div className="font-display text-2xl font-bold text-blue-400">{formatCurrency(stats.totalRefunds)}</div>
          <div className="text-sm text-muted-foreground">Total Refunds</div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div className="font-display text-2xl font-bold">{stats.totalCount.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Transactions</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={fetchPayments} className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  {["User", "Type", "Amount", "Reference", "Status", "Date"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{tx.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{tx.user?.email}</div>
                    </td>
                    <td className={`px-4 py-3 font-medium text-xs ${txTypeColor[tx.type] || ""}`}>
                      {tx.type.replace(/_/g, " ")}
                    </td>
                    <td className={`px-4 py-3 font-semibold text-sm ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {tx.amount >= 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                      {tx.reference || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === "COMPLETED" ? "bg-green-500/10 text-green-500" :
                        tx.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > 30 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total: {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40 hover:bg-accent transition-colors">Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 30 >= total} className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40 hover:bg-accent transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
