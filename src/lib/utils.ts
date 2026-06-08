// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "NGN",
  symbol = "₦"
): string {
  return `${symbol}${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BH-${timestamp}-${random}`;
}

export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `TKT-${timestamp}`;
}

export function calculateOrderCost(
  quantity: number,
  pricePerThousand: number
): number {
  return (quantity / 1000) * pricePerThousand;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "status-pending",
    PROCESSING: "status-processing",
    COMPLETED: "status-completed",
    PARTIAL: "status-partial",
    CANCELLED: "status-cancelled",
    REFUNDED: "status-refunded",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const masked = local.slice(0, 2) + "*".repeat(local.length - 2);
  return `${masked}@${domain}`;
}

export function parseBoolean(value: string): boolean {
  return value === "true" || value === "1";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
