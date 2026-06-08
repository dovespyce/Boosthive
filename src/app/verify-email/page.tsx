// src/app/verify-email/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setStatus("error"); setMessage(d.error); }
        else { setStatus("success"); setMessage(d.message); }
      })
      .catch(() => { setStatus("error"); setMessage("Verification failed. Please try again."); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold">Verifying your email...</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link href="/login" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Sign In Now
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link href="/login" className="px-6 py-3 bg-secondary rounded-xl font-semibold hover:bg-accent transition-colors">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
