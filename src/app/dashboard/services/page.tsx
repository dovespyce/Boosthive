// src/app/dashboard/services/page.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, Star, Clock, TrendingUp, Loader2, CheckCircle2, Heart } from "lucide-react";
import { formatCurrency, calculateOrderCost } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description?: string;
  pricePerThousand: number;
  minQuantity: number;
  maxQuantity: number;
  averageTime?: string;
  successRate: number;
  totalOrders: number;
  isFeatured: boolean;
  category: { name: string; slug: string; icon?: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  // Order form state
  const [form, setForm] = useState({ link: "", quantity: "", couponCode: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then(r => r.json())
      .then(d => {
        setServices(d.services || []);
        setCategories(d.categories || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchCat = selectedCategory === "all" || s.category.slug === selectedCategory;
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, search]);

  const cost = selectedService && form.quantity
    ? calculateOrderCost(parseInt(form.quantity) || 0, selectedService.pricePerThousand)
    : 0;

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setForm({ link: "", quantity: service.minQuantity.toString(), couponCode: "" });
    setOrderError("");
    setOrderSuccess(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setSubmitting(true);
    setOrderError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          link: form.link,
          quantity: parseInt(form.quantity),
          couponCode: form.couponCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error || "Order failed");
      } else {
        setOrderSuccess(true);
        setTimeout(() => {
          router.push("/dashboard/orders");
        }, 2000);
      }
    } catch {
      setOrderError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          All Services
        </button>
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Services list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No services found.</p>
            </div>
          ) : (
            filtered.map(service => (
              <button
                key={service.id}
                onClick={() => handleSelectService(service)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:border-primary/50 ${
                  selectedService?.id === service.id
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card hover:bg-secondary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{service.name}</span>
                      {service.isFeatured && (
                        <span className="px-1.5 py-0.5 bg-primary/15 text-primary rounded-full text-[10px] font-semibold">POPULAR</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {service.successRate}% success
                      </span>
                      {service.averageTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.averageTime}
                        </span>
                      )}
                      <span>Min: {service.minQuantity.toLocaleString()}</span>
                      <span>Max: {service.maxQuantity.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-bold text-sm text-primary">
                      {formatCurrency(service.pricePerThousand)}
                    </div>
                    <div className="text-xs text-muted-foreground">per 1000</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Order form */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 sticky top-24">
            {orderSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">Order Placed!</h3>
                <p className="text-muted-foreground text-sm">Redirecting to your orders...</p>
              </div>
            ) : selectedService ? (
              <>
                <h3 className="font-display text-lg font-semibold mb-1">Place Order</h3>
                <p className="text-muted-foreground text-sm mb-5 line-clamp-2">{selectedService.name}</p>

                {orderError && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                    {orderError}
                  </div>
                )}

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Social Media Link</label>
                    <input
                      type="url"
                      value={form.link}
                      onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Quantity
                      <span className="text-muted-foreground font-normal ml-1">
                        ({selectedService.minQuantity.toLocaleString()} – {selectedService.maxQuantity.toLocaleString()})
                      </span>
                    </label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                      min={selectedService.minQuantity}
                      max={selectedService.maxQuantity}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Coupon Code <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={form.couponCode}
                      onChange={e => setForm(p => ({ ...p, couponCode: e.target.value.toUpperCase() }))}
                      placeholder="WELCOME20"
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm uppercase"
                    />
                  </div>

                  {/* Price summary */}
                  <div className="p-3 bg-secondary/60 rounded-xl space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Rate</span>
                      <span>{formatCurrency(selectedService.pricePerThousand)} / 1000</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Quantity</span>
                      <span>{(parseInt(form.quantity) || 0).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(cost)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !form.link || !form.quantity}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Placing Order..." : `Pay ${formatCurrency(cost)}`}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground text-sm">Select a service to place an order</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
