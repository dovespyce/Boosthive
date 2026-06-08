// src/app/dashboard/notifications/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const typeIcon: Record<string, string> = {
  PAYMENT_SUCCESS: "💰",
  PAYMENT_FAILED: "❌",
  ORDER_COMPLETED: "✅",
  ORDER_FAILED: "⚠️",
  ORDER_PARTIAL: "📊",
  REFERRAL_BONUS: "🎁",
  SYSTEM: "🔔",
  BROADCAST: "📢",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Notifications</h2>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(n => (
              <div key={n.id} className={`flex gap-4 p-4 transition-colors ${n.isRead ? "opacity-70" : "bg-primary/3 hover:bg-secondary/30"}`}>
                <div className="text-2xl flex-shrink-0 mt-0.5">{typeIcon[n.type] || "🔔"}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`font-medium text-sm ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</div>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
