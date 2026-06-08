// src/app/admin/users/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Loader2, Search, UserX, UserCheck, DollarSign, Trash2, RefreshCw } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{ user: any; action: string } | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    setMsg("");
    try {
      const body: any = { action: actionModal.action, reason };
      if (["credit", "debit"].includes(actionModal.action)) body.amount = parseFloat(amount);
      const res = await fetch(`/api/admin/users/${actionModal.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message);
        fetchUsers();
        setTimeout(() => { setActionModal(null); setMsg(""); setAmount(""); setReason(""); }, 1500);
      } else {
        setMsg(data.error || "Action failed");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
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
                  {["User", "Balance", "Spent", "Orders", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-green-400">{formatCurrency(user.walletBalance)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(user.totalSpent)}</td>
                    <td className="px-4 py-3">{user._count.orders}</td>
                    <td className="px-4 py-3">
                      {user.isSuspended ? (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs rounded-full">Suspended</span>
                      ) : user.emailVerified ? (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActionModal({ user, action: user.isSuspended ? "unsuspend" : "suspend" })}
                          className={`p-1.5 rounded-lg transition-colors ${user.isSuspended ? "text-green-500 hover:bg-green-500/10" : "text-orange-500 hover:bg-orange-500/10"}`}
                          title={user.isSuspended ? "Unsuspend" : "Suspend"}
                        >
                          {user.isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setActionModal({ user, action: "credit" })}
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
                          title="Credit/Debit"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <span className="text-muted-foreground">Total: {total} users</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-4 py-2 bg-secondary rounded-xl disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActionModal(null)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="font-display text-xl font-bold mb-1 capitalize">{actionModal.action} User</h3>
            <p className="text-muted-foreground text-sm mb-5">{actionModal.user.name} · {actionModal.user.email}</p>

            {msg && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${msg.includes("failed") || msg.includes("error") ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"}`}>{msg}</div>
            )}

            {["credit", "debit"].includes(actionModal.action) && (
              <div className="mb-4 space-y-3">
                <div className="flex gap-3">
                  {["credit", "debit"].map(a => (
                    <button
                      key={a}
                      onClick={() => setActionModal(prev => prev ? { ...prev, action: a } : null)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize ${actionModal.action === a ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Amount (NGN)"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} className="flex-1 py-3 bg-secondary rounded-xl font-medium hover:bg-accent">Cancel</button>
              <button onClick={handleAction} disabled={processing} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
