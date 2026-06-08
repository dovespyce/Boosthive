// src/components/ui/toaster.tsx
"use client";
import { useEffect, useState } from "react";

// Simple global toast system
type Toast = { id: string; message: string; type: "success" | "error" | "info" };

let toastListeners: ((t: Toast) => void)[] = [];

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach(fn => fn({ id, message, type }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-slide-up border ${
            t.type === "success" ? "bg-green-500/15 border-green-500/30 text-green-400" :
            t.type === "error" ? "bg-destructive/15 border-destructive/30 text-destructive" :
            "bg-card border-border text-foreground"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
