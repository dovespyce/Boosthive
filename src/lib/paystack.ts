// src/lib/paystack.ts
import axios from "axios";
import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackAxios = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export async function initializeTransaction(
  email: string,
  amount: number, // in kobo (NGN * 100)
  reference: string,
  metadata?: Record<string, any>
) {
  const response = await paystackAxios.post("/transaction/initialize", {
    email,
    amount,
    reference,
    metadata,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/paystack`,
  });
  return response.data.data;
}

export async function verifyTransaction(reference: string) {
  const response = await paystackAxios.get(`/transaction/verify/${reference}`);
  return response.data.data;
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function getTransactionHistory(page = 1, perPage = 50) {
  const response = await paystackAxios.get(
    `/transaction?page=${page}&perPage=${perPage}`
  );
  return response.data.data;
}
