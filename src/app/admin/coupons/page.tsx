// src/app/admin/coupons/page.tsx
"use client";
import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Loader2, Plus, Tag, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", discountType: "percentage",
    discountValue: "", minOrderAmount: "0", maxUses: "", expiresAt: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || []);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase(),
          discountValue: parseFloat(form.discountValue),
          minOrderAmount: parseFloat(form.minOrderAmount) || 0,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (res.ok) {
        showToast("Coupon created!");
        setShowForm(false);
        setForm({ code: "", description: "", discountType: "percentage", discountValue: "", minOrderAmount: "0", maxUses: "", expiresAt: "" });
        fetchCoupons();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCoupon = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    showToast("Coupon deleted");
    fetchCoupons();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-card border border-border rounded-xl shadow-2xl text-sm animate-fade-in">{toast}</div>}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-xl font-bold">Coupon Codes</h2>
          <p className="text-muted-foreground text-sm">Manage discount codes for your customers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No coupons yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  {["Code", "Discount", "Min Order", "Uses", "Expires", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary">{c.code}</span>
                      {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {c.discountType === "percentage" ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(c.minOrderAmount)}</td>
                    <td className="px-4 py-3">
                      <span>{c.usedCount}</span>
                      {c.maxUses && <span className="text-muted-foreground"> / {c.maxUses}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {c.expiresAt ? formatDateTime(c.expiresAt) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleCoupon(c.id, c.isActive)} className={`flex items-center gap-1 text-xs font-medium ${c.isActive ? "text-green-500" : "text-muted-foreground"}`}>
                        {c.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {c.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteCoupon(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="font-display text-xl font-bold mb-5">Create Coupon</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Coupon Code *</label>
                <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="WELCOME20" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono uppercase" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. 20% off first order" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type *</label>
                  <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed ₦</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Value *</label>
                  <input type="number" step="0.01" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} placeholder={form.discountType === "percentage" ? "20" : "500"} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Min Order (₦)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} placeholder="Unlimited" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-secondary rounded-xl font-medium hover:bg-accent">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
