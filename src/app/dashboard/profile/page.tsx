// src/app/dashboard/profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Loader2, User, Save, Lock } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [passMsg, setPassMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => {
        setProfile({ name: d.name || "", email: d.email || "", phone: d.phone || "" });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      });
      const data = await res.json();
      if (res.ok) setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      else setProfileMsg({ type: "error", text: data.error || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setPassMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    setChangingPass(true);
    setPassMsg({ type: "", text: "" });
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg({ type: "success", text: "Password changed successfully!" });
        setPasswords({ current: "", newPassword: "", confirm: "" });
      } else {
        setPassMsg({ type: "error", text: data.error || "Failed to change password" });
      }
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Profile Info */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Profile Information</h3>
            <p className="text-sm text-muted-foreground">Update your personal details</p>
          </div>
        </div>

        {profileMsg.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${profileMsg.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-500" : "bg-destructive/10 border border-destructive/30 text-destructive"}`}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              value={profile.email}
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Change Password</h3>
            <p className="text-sm text-muted-foreground">Use a strong, unique password</p>
          </div>
        </div>

        {passMsg.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${passMsg.type === "success" ? "bg-green-500/10 border border-green-500/30 text-green-500" : "bg-destructive/10 border border-destructive/30 text-destructive"}`}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={changePassword} className="space-y-4">
          {[
            { label: "Current Password", key: "current", val: passwords.current },
            { label: "New Password", key: "newPassword", val: passwords.newPassword },
            { label: "Confirm New Password", key: "confirm", val: passwords.confirm },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1.5">{f.label}</label>
              <input
                type="password"
                value={f.val}
                onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                minLength={f.key !== "current" ? 8 : 1}
              />
            </div>
          ))}
          <button type="submit" disabled={changingPass} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
            {changingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {changingPass ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
