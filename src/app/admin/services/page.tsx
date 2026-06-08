// src/app/admin/services/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";

const emptyForm = {
  name: "", description: "", categoryId: "", providerId: "",
  providerServiceId: "", pricePerThousand: "", minQuantity: "",
  maxQuantity: "", averageTime: "", successRate: "99",
  isActive: true, isFeatured: false,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchServices = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services || []);
    setCategories(data.categories || []);
    setProviders(data.providers || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      name: s.name, description: s.description || "", categoryId: s.categoryId, providerId: s.providerId,
      providerServiceId: s.providerServiceId || "", pricePerThousand: s.pricePerThousand.toString(),
      minQuantity: s.minQuantity.toString(), maxQuantity: s.maxQuantity.toString(),
      averageTime: s.averageTime || "", successRate: s.successRate.toString(),
      isActive: s.isActive, isFeatured: s.isFeatured,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      pricePerThousand: parseFloat(form.pricePerThousand),
      minQuantity: parseInt(form.minQuantity),
      maxQuantity: parseInt(form.maxQuantity),
      successRate: parseFloat(form.successRate),
    };
    try {
      const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(editingId ? "Service updated!" : "Service created!");
        setShowForm(false);
        fetchServices();
      } else {
        const d = await res.json();
        showToast(d.error || "Save failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchServices();
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    showToast("Service deleted");
    fetchServices();
  };

  const filtered = services.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-card border border-border rounded-xl shadow-2xl text-sm animate-fade-in">{toast}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
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
                  {["Service", "Category", "Provider ID", "Price/1K", "Min", "Max", "Orders", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm max-w-[200px] truncate">{s.name}</div>
                      {s.isFeatured && <span className="text-xs text-primary">★ Featured</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{s.category?.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.providerServiceId || "—"}</td>
                    <td className="px-4 py-3 font-medium text-xs whitespace-nowrap">{formatCurrency(s.pricePerThousand)}</td>
                    <td className="px-4 py-3 text-xs">{s.minQuantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">{s.maxQuantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">{s.totalOrders}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleService(s.id, s.isActive)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${s.isActive ? "text-green-500" : "text-muted-foreground"}`}>
                        {s.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {s.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteService(s.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-4 animate-fade-in">
            <h3 className="font-display text-xl font-bold mb-5">{editingId ? "Edit Service" : "Create Service"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Service Name *</label>
                <input type="text" value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g. TikTok Followers - Real & Active" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category *</label>
                <select value={form.categoryId} onChange={e => setForm((p: any) => ({ ...p, categoryId: e.target.value }))} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required>
                  <option value="">Select category</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Provider *</label>
                <select value={form.providerId} onChange={e => setForm((p: any) => ({ ...p, providerId: e.target.value }))} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required>
                  <option value="">Select provider</option>
                  {providers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Provider Service ID</label>
                <input type="text" value={form.providerServiceId} onChange={e => setForm((p: any) => ({ ...p, providerServiceId: e.target.value }))} placeholder="e.g. 101" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Price per 1000 (₦) *</label>
                <input type="number" step="0.01" value={form.pricePerThousand} onChange={e => setForm((p: any) => ({ ...p, pricePerThousand: e.target.value }))} placeholder="8.50" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Min Quantity *</label>
                <input type="number" value={form.minQuantity} onChange={e => setForm((p: any) => ({ ...p, minQuantity: e.target.value }))} placeholder="100" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Max Quantity *</label>
                <input type="number" value={form.maxQuantity} onChange={e => setForm((p: any) => ({ ...p, maxQuantity: e.target.value }))} placeholder="100000" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Average Time</label>
                <input type="text" value={form.averageTime} onChange={e => setForm((p: any) => ({ ...p, averageTime: e.target.value }))} placeholder="0-1 hour" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Success Rate (%)</label>
                <input type="number" step="0.1" max="100" value={form.successRate} onChange={e => setForm((p: any) => ({ ...p, successRate: e.target.value }))} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description..." className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none" />
              </div>
              <div className="sm:col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm((p: any) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm((p: any) => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-secondary rounded-xl font-medium hover:bg-accent transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
