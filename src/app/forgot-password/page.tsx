// src/app/forgot-password/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
          <Mail className="w-6 h-6 text-primary" />
        </div>

        {sent ? (
          <>
            <h1 className="font-display text-3xl font-bold mb-2">Check your inbox</h1>
            <p className="text-muted-foreground mb-6">
              We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
            </p>
            <Link href="/login" className="block text-center py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold mb-2">Forgot password?</h1>
            <p className="text-muted-foreground mb-8">Enter your email and we'll send you a reset link.</p>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
