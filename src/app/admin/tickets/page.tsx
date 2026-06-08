// src/app/admin/tickets/page.tsx
"use client";
import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { Loader2, MessageSquare, Send, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

const statusColors: Record<string, string> = {
  OPEN: "bg-green-500/10 text-green-500",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400",
  RESOLVED: "bg-slate-500/10 text-slate-400",
  CLOSED: "bg-slate-500/10 text-slate-400",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = async () => {
    const res = await fetch("/api/support");
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const sendReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/support/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText }),
      });
      setReplyText("");
      fetchTickets();
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    await fetch(`/api/support/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTickets();
  };

  if (loading) return <div className="flex items-center justify-center min-h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground text-sm">{tickets.filter(t => t.status === "OPEN").length} open tickets</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No support tickets.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                className="w-full p-5 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{ticket.subject}</span>
                    <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status] || ""}`}>{ticket.status}</span>
                    <span className="text-xs text-muted-foreground">{ticket.user?.name} · {ticket.user?.email}</span>
                    <span className="text-xs text-muted-foreground">{ticket._count.replies} replies</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(ticket.updatedAt)}</span>
                  </div>
                </div>
                {expandedId === ticket.id ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>

              {expandedId === ticket.id && (
                <div className="border-t border-border p-5 space-y-4 animate-fade-in">
                  {/* Status controls */}
                  <div className="flex gap-2 flex-wrap">
                    {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(ticket.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${ticket.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  {/* Replies */}
                  <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                    {ticket.replies.map((reply: any) => (
                      <div key={reply.id} className={`flex gap-3 ${reply.isAdmin ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${reply.isAdmin ? "bg-primary/20 text-primary" : "bg-secondary"}`}>
                          {reply.isAdmin ? "🐝" : "U"}
                        </div>
                        <div className={`max-w-[70%] p-3 rounded-xl text-sm ${reply.isAdmin ? "bg-primary/10 border border-primary/20" : "bg-secondary"}`}>
                          <p>{reply.message}</p>
                          <span className="text-xs text-muted-foreground mt-1 block">{formatDateTime(reply.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply box */}
                  {ticket.status !== "CLOSED" && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type admin reply..."
                        className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onKeyDown={e => e.key === "Enter" && !sending && sendReply(ticket.id)}
                      />
                      <button
                        onClick={() => sendReply(ticket.id)}
                        disabled={sending || !replyText.trim()}
                        className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
