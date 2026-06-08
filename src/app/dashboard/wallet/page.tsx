// src/app/dashboard/wallet/page.tsx
"use client";
import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Loader2, TrendingUp, CreditCard } from "lucide-react";

const txTypeIcon: Record<string, any> = {
  DEPOSIT: ArrowDownLeft,
  ORDER_PAYMENT: ArrowUpRight,
  REFUND: ArrowDownLeft,
  REFERRAL_BONUS: ArrowDownLeft,
  ADMIN_CREDIT: ArrowDownLeft,
  ADMIN_DEBIT: ArrowUpRight,
  COUPON_DISCOUNT: ArrowDownLeft,
};
const txTypeColor: Record<string, string> = {
  DEPOSIT: "text-green-500",
  ORDER_PAYMENT: "text-red-400",
  REFUND: "text-blue-400",
  REFERRAL_BONUS: "text-green-500",
  ADMIN_CREDIT: "text-green-500",
  ADMIN_DEBIT: "text-red-400",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState("");

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  useEffect(() => {
    fetch("/api/wallet")
      .then(r => r.json())
      .then(d => {
        setWallet(d.wallet);
        setTransactions(d.transactions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setFunding(true);
    setFundError("");
    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseInt(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFundError(data.error || "Payment initialization failed");
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch {
      setFundError("Something went wrong.");
    } finally {
      setFunding(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wallet cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3 glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Available Balance</span>
              </div>
              <div className="font-display text-4xl font-bold">{formatCurrency(wallet?.walletBalance || 0)}</div>
            </div>
            <button
              onClick={() => setShowFund(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Fund Wallet
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Total Deposited</span>
          </div>
          <div className="font-display text-2xl font-bold text-green-400">{formatCurrency(wallet?.totalDeposited || 0)}</div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm">Total Spent</span>
          </div>
          <div className="font-display text-2xl font-bold text-red-400">{formatCurrency(wallet?.totalSpent || 0)}</div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Transactions</span>
          </div>
          <div className="font-display text-2xl font-bold">{transactions.length}</div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold mb-5">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => {
              const Icon = txTypeIcon[tx.type] || ArrowUpRight;
              const isCredit = ["DEPOSIT", "REFUND", "REFERRAL_BONUS", "ADMIN_CREDIT", "COUPON_DISCOUNT"].includes(tx.type);
              return (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/40 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    <Icon className={`w-4 h-4 ${isCredit ? "text-green-500" : "text-red-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{tx.description || tx.type.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(tx.createdAt)}</div>
                  </div>
                  <div className={`font-semibold text-sm flex-shrink-0 ${isCredit ? "text-green-500" : "text-red-400"}`}>
                    {isCredit ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                    tx.status === "COMPLETED" ? "bg-green-500/10 text-green-500" :
                    tx.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-red-500/10 text-red-500"
                  }`}>
                    {tx.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fund modal */}
      {showFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFund(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <h3 className="font-display text-xl font-bold mb-1">Fund Wallet</h3>
            <p className="text-muted-foreground text-sm mb-6">Add money to your wallet via Paystack</p>

            {fundError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{fundError}</div>
            )}

            <form onSubmit={handleFund} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (NGN)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={500}
                  max={1000000}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-semibold"
                  required
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick amounts:</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(a.toString())}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        amount === a.toString() ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"
                      }`}
                    >
                      ₦{a.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFund(false)}
                  className="flex-1 py-3 bg-secondary rounded-xl font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={funding || !amount}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {funding && <Loader2 className="w-4 h-4 animate-spin" />}
                  {funding ? "Initializing..." : "Pay Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
