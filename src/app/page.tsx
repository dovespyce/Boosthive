// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, Zap, Shield, TrendingUp, Star, ChevronRight, Users, BarChart3, Globe } from "lucide-react";

const stats = [
  { value: "2M+", label: "Orders Fulfilled", icon: BarChart3 },
  { value: "50K+", label: "Happy Clients", icon: Users },
  { value: "99.9%", label: "Success Rate", icon: TrendingUp },
  { value: "24/7", label: "Live Support", icon: Globe },
];

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Orders start within minutes. Our automated systems process and deliver your orders at lightning speed.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: Shield,
    title: "100% Safe & Secure",
    desc: "Bank-grade security for every transaction. Your data and account safety is our top priority.",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  {
    icon: TrendingUp,
    title: "Real Engagement",
    desc: "High-quality, authentic-looking engagement that won't put your account at risk.",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    icon: Star,
    title: "Competitive Pricing",
    desc: "Industry-lowest rates with bulk discounts. Get more for your money every single time.",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
];

const platforms = [
  { name: "TikTok", icon: "🎵", services: ["Followers", "Likes", "Views", "Comments"], color: "#ff0050" },
  { name: "Instagram", icon: "📸", services: ["Followers", "Likes", "Views", "Story Views"], color: "#e1306c" },
  { name: "YouTube", icon: "▶️", services: ["Views", "Subscribers", "Likes", "Comments"], color: "#ff0000" },
  { name: "Facebook", icon: "👤", services: ["Page Likes", "Post Likes", "Followers", "Views"], color: "#1877f2" },
  { name: "Twitter/X", icon: "🐦", services: ["Followers", "Likes", "Retweets", "Views"], color: "#1da1f2" },
  { name: "Telegram", icon: "✈️", services: ["Members", "Views", "Reactions", "Shares"], color: "#0088cc" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">🐝</div>
              <span className="font-display text-xl font-bold">BoostHive</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="#platforms" className="hover:text-foreground transition-colors">Services</Link>
              <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
              <Link href="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 honeycomb-bg opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Zap className="w-4 h-4" />
            <span>Trusted by 50,000+ creators worldwide</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-fade-in leading-tight">
            Power Your
            <span className="block text-gradient">Social Growth</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in">
            The fastest, most reliable SMM panel. Buy followers, likes, views and more for all major platforms at unbeatable prices.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link href="/register" className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-8 py-4 bg-secondary text-foreground rounded-xl font-semibold text-lg hover:bg-accent transition-colors border border-border">
              Sign In
            </Link>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-5 animate-fade-in">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold mb-4">Why Choose BoostHive?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to grow your social presence, all in one powerful platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`p-6 rounded-2xl border ${f.bg} hover:scale-105 transition-transform`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold mb-4">All Platforms Covered</h2>
            <p className="text-muted-foreground text-lg">Grow on every major social media platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((p) => (
              <div key={p.name} className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{p.icon}</span>
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.services.map((s) => (
                    <span key={s} className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground">{s}</span>
                  ))}
                </div>
                <Link href="/register" className="flex items-center gap-1 text-primary text-sm mt-4 group-hover:gap-2 transition-all">
                  View Services <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold mb-4">
                Ready to <span className="text-gradient">Boost Your Presence?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">Join thousands of creators and businesses who trust BoostHive for their social growth.</p>
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">🐝</div>
                <span className="font-display text-xl font-bold">BoostHive</span>
              </div>
              <p className="text-muted-foreground text-sm">Powering Your Social Growth</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["TikTok", "Instagram", "YouTube", "Facebook"].map(p => (
                  <li key={p}><Link href="/register" className="hover:text-foreground transition-colors">{p}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[["Register", "/register"], ["Login", "/login"], ["Dashboard", "/dashboard"], ["Support", "/dashboard/support"]].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-foreground transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Terms of Service", "Privacy Policy", "Refund Policy"].map(l => (
                  <li key={l}><Link href="#" className="hover:text-foreground transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} BoostHive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
