// src/app/dashboard/support/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-400",
  MEDIUM: "bg-blue-500/10 text-blue-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  URGENT: "bg-red-500/10 text-red-400",
};
const statusColors: Record<string, string> = {
  OPEN: "bg-green-500/10 text-green-500",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400",
  RESOLVED: "bg-slate-500/10 text-slate-400",
  CLOSED: "bg-slate-500/10 text-slate-400",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: "", message: "", priority: "MEDIUM" });
  const [submitting, setSubmitting] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const fetchTickets = async () => {
    const res = await fetch("/api/support");
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ subject: "", message: "", priority: "MEDIUM" });
        fetchTickets();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;
    try {
      await fetch(`/api/support/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage }),
      });
      setReplyMessage("");
      fetchTickets();
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header + WhatsApp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Support Center</h2>
          <p className="text-muted-foreground text-sm">We typically respond within 2 hours</p>
        </div>
        <div className="flex gap-3">
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-colors"
          >
            💬 WhatsApp Support
          </a>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <h3 className="font-display text-lg font-semibold mb-4">Create Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  minLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                required
                minLength={10}
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-secondary rounded-xl font-medium hover:bg-accent transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No support tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                className="w-full p-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{ticket.subject}</span>
                    <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status] || ""}`}>{ticket.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority] || ""}`}>{ticket.priority}</span>
                    <span className="text-xs text-muted-foreground">{ticket._count.replies} replies · {formatDateTime(ticket.updatedAt)}</span>
                  </div>
                </div>
                {expandedTicket === ticket.id ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>

              {expandedTicket === ticket.id && (
                <div className="border-t border-border p-5 space-y-3 animate-fade-in">
                  {ticket.replies.map((reply: any) => (
                    <div key={reply.id} className={`flex gap-3 ${reply.isAdmin ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${reply.isAdmin ? "bg-primary/20 text-primary" : "bg-secondary"}`}>
                        {reply.isAdmin ? "🐝" : "U"}
                      </div>
                      <div className={`max-w-[75%] p-3 rounded-xl text-sm ${reply.isAdmin ? "bg-primary/10 border border-primary/20" : "bg-secondary"}`}>
                        <p>{reply.message}</p>
                        <span className="text-xs text-muted-foreground mt-1 block">{formatDateTime(reply.createdAt)}</span>
                      </div>
                    </div>
                  ))}

                  {ticket.status !== "CLOSED" && (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Type a reply..."
                        className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onKeyDown={e => e.key === "Enter" && handleReply(ticket.id)}
                      />
                      <button onClick={() => handleReply(ticket.id)} className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
