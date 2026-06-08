// src/app/register/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", referralCode: ref });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-2">Check your email!</h2>
          <p className="text-muted-foreground mb-6">We've sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.</p>
          <Link href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-secondary/50 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 honeycomb-bg opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative text-center px-12">
          <div className="text-6xl mb-6 animate-float">🚀</div>
          <h2 className="font-display text-4xl font-bold mb-4">Start Growing Today</h2>
          <p className="text-muted-foreground text-lg">Join 50,000+ creators boosting their social presence with BoostHive.</p>
          <ul className="mt-10 space-y-3 text-left">
            {["Free account — no credit card required", "Instant order processing", "Multiple payment methods", "24/7 customer support"].map(i => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">🐝</div>
              <span className="font-display text-xl font-bold">BoostHive</span>
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">Create account</h1>
          <p className="text-muted-foreground mb-8">Start boosting your social presence today</p>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Referral Code <span className="text-muted-foreground">(optional)</span></label>
              <input
                type="text"
                value={form.referralCode}
                onChange={e => setForm(p => ({ ...p, referralCode: e.target.value }))}
                placeholder="Enter referral code"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By creating an account you agree to our{" "}
            <Link href="#" className="hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="#" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
