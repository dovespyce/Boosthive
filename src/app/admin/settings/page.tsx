// src/app/admin/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, Settings } from "lucide-react";

const GROUPS = [
  { key: "general", label: "General", icon: "🌐" },
  { key: "payment", label: "Payment", icon: "💳" },
  { key: "auth", label: "Authentication", icon: "🔐" },
  { key: "referral", label: "Referral", icon: "🎁" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState("general");
  const [toast, setToast] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        setSettings(d.settings || []);
        const map: Record<string, string> = {};
        d.settings?.forEach((s: any) => { map[s.key] = s.value; });
        setValues(map);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      if (res.ok) showToast("Settings saved successfully!");
      else showToast("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const groupSettings = settings.filter(s => s.group === activeGroup);

  if (loading) return <div className="flex items-center justify-center min-h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {toast && <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-card border border-border rounded-xl shadow-2xl text-sm animate-fade-in">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Site Settings</h2>
          <p className="text-muted-foreground text-sm">Configure your BoostHive platform</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {GROUPS.map(g => (
          <button
            key={g.key}
            onClick={() => setActiveGroup(g.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeGroup === g.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        {groupSettings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No settings in this group.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupSettings.map(s => (
              <div key={s.key}>
                <label className="block text-sm font-medium mb-1.5">
                  {s.label || s.key}
                </label>
                {s.type === "boolean" ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setValues(prev => ({ ...prev, [s.key]: prev[s.key] === "true" ? "false" : "true" }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${values[s.key] === "true" ? "bg-primary" : "bg-secondary border border-border"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${values[s.key] === "true" ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-sm text-muted-foreground">{values[s.key] === "true" ? "Enabled" : "Disabled"}</span>
                  </div>
                ) : (
                  <input
                    type={s.type === "number" ? "number" : "text"}
                    value={values[s.key] || ""}
                    onChange={e => setValues(prev => ({ ...prev, [s.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
