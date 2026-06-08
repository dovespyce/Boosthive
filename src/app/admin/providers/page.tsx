// src/app/admin/providers/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, Plug, CheckCircle2, XCircle, RefreshCw, Eye, EyeOff } from "lucide-react";

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", apiUrl: "", apiKey: "", description: "", currency: "USD" });
  const [submitting, setSubmitting] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [checkingBalance, setCheckingBalance] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchProviders = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/providers");
    const data = await res.json();
    setProviders(data.providers || []);
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("Provider added successfully!");
        setShowForm(false);
        setForm({ name: "", apiUrl: "", apiKey: "", description: "", currency: "USD" });
        fetchProviders();
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to add provider");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const checkBalance = async (providerId: string) => {
    setCheckingBalance(providerId);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/balance`);
      const data = await res.json();
      if (data.balance !== undefined) {
        setBalances(prev => ({ ...prev, [providerId]: `${data.balance} ${data.currency || ""}` }));
      } else {
        setBalances(prev => ({ ...prev, [providerId]: "Error" }));
      }
    } catch {
      setBalances(prev => ({ ...prev, [providerId]: "Error" }));
    } finally {
      setCheckingBalance(null);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/providers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchProviders();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-card border border-border rounded-xl shadow-2xl text-sm animate-fade-in">{toast}</div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-xl font-bold">SMM Providers</h2>
          <p className="text-muted-foreground text-sm">Manage your API provider connections</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : providers.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No providers configured. Add your first SMM API provider.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {providers.map(p => (
            <div key={p.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Plug className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className={`text-xs flex items-center gap-1 ${p.isActive ? "text-green-500" : "text-muted-foreground"}`}>
                        {p.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {p.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(p.id, p.isActive)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${p.isActive ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"}`}
                >
                  {p.isActive ? "Disable" : "Enable"}
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-16 flex-shrink-0">API URL</span>
                  <span className="font-mono text-xs text-foreground truncate">{p.apiUrl}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-16 flex-shrink-0">API Key</span>
                  <span className="font-mono text-xs text-foreground flex-1 truncate">
                    {showKeys[p.id] ? p.apiKey : "•".repeat(Math.min(p.apiKey.length, 24))}
                  </span>
                  <button onClick={() => setShowKeys(prev => ({ ...prev, [p.id]: !prev[p.id] }))} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                    {showKeys[p.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {p.description && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-16 flex-shrink-0">Note</span>
                    <span className="text-xs text-muted-foreground">{p.description}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="text-sm">
                  {balances[p.id] ? (
                    <span className="text-green-400 font-medium">Balance: {balances[p.id]}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Balance not checked</span>
                  )}
                </div>
                <button
                  onClick={() => checkBalance(p.id)}
                  disabled={checkingBalance === p.id}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-secondary rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${checkingBalance === p.id ? "animate-spin" : ""}`} />
                  Check Balance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Provider Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="font-display text-xl font-bold mb-5">Add SMM Provider</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Provider Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. SMM Panel Pro" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">API URL *</label>
                <input type="url" value={form.apiUrl} onChange={e => setForm(p => ({ ...p, apiUrl: e.target.value }))} placeholder="https://provider.com/api/v2" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">API Key *</label>
                <input type="text" value={form.apiKey} onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))} placeholder="Your API key" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Currency</label>
                <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
                  {["USD", "EUR", "GBP", "NGN"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Notes</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional notes" className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-secondary rounded-xl font-medium hover:bg-accent">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
