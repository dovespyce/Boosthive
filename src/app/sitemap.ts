// src/app/sitemap.ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://boosthive.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
