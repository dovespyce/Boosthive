// src/app/dashboard/referral/referral-client.tsx
"use client";
import { useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Copy, Check, Gift, Users, MousePointerClick, DollarSign, Share2 } from "lucide-react";

export default function ReferralClient({ user, earnings, commission }: {
  user: { referralCode: string; referralEarnings: number; referralClicks: number; _count: { referrals: number } };
  earnings: any[];
  commission: number;
}) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user.referralCode}`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Total Earnings", value: formatCurrency(user.referralEarnings), icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Referrals", value: user._count.referrals.toString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Link Clicks", value: user.referralClicks.toString(), icon: MousePointerClick, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Commission Rate", value: `${commission}%`, icon: Gift, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="font-display text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold mb-4">How It Works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Share Your Link", desc: "Share your unique referral link with friends and followers." },
            { step: "2", title: "They Sign Up", desc: "When they register using your link and place orders." },
            { step: "3", title: "Earn Commission", desc: `You earn ${commission}% commission on every order they place.` },
          ].map(item => (
            <div key={item.step} className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral link */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Your Referral Link</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-sm font-mono truncate"
          />
          <button
            onClick={() => copy(referralLink)}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded-xl">
          <p className="text-xs text-muted-foreground">Your referral code: <span className="font-mono font-bold text-foreground">{user.referralCode}</span></p>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <a
            href={`https://wa.me/?text=Join BoostHive and get the best SMM services! Use my link: ${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share on WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=Grow your social media fast with BoostHive! Use my link: ${encodeURIComponent(referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-400/10 text-blue-400 border border-blue-400/20 rounded-xl text-sm font-medium hover:bg-blue-400/20 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share on Twitter
          </a>
        </div>
      </div>

      {/* Earnings history */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Earnings History</h3>
        {earnings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No earnings yet. Start sharing your link!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {earnings.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
                <div>
                  <div className="text-sm font-medium">Referral Commission</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</div>
                </div>
                <div className="font-semibold text-green-500">+{formatCurrency(e.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
