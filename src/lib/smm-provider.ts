// src/lib/smm-provider.ts
import axios from "axios";
import { prisma } from "./prisma";

export interface SMMService {
  service: string;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  category: string;
}

export interface SMMOrderResult {
  order?: string;
  error?: string;
}

export interface SMMOrderStatus {
  charge?: string;
  start_count?: string;
  status?: string;
  remains?: string;
  currency?: string;
  error?: string;
}

export class SMMProvider {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  private async post(data: Record<string, string>) {
    try {
      const response = await axios.post(
        this.apiUrl,
        new URLSearchParams({ key: this.apiKey, ...data }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 30000,
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Provider API error");
    }
  }

  async getServices(): Promise<SMMService[]> {
    const result = await this.post({ action: "services" });
    return Array.isArray(result) ? result : [];
  }

  async createOrder(
    serviceId: string,
    link: string,
    quantity: number
  ): Promise<SMMOrderResult> {
    return await this.post({
      action: "add",
      service: serviceId,
      link,
      quantity: quantity.toString(),
    });
  }

  async getOrderStatus(orderId: string): Promise<SMMOrderStatus> {
    return await this.post({
      action: "status",
      order: orderId,
    });
  }

  async getMultipleOrderStatus(orderIds: string[]): Promise<Record<string, SMMOrderStatus>> {
    return await this.post({
      action: "status",
      orders: orderIds.join(","),
    });
  }

  async getBalance(): Promise<{ balance: string; currency: string }> {
    return await this.post({ action: "balance" });
  }

  async cancelOrder(orderId: string) {
    return await this.post({ action: "cancel", orders: orderId });
  }

  async refillOrder(orderId: string) {
    return await this.post({ action: "refill", order: orderId });
  }
}

export async function getProviderInstance(providerId: string): Promise<SMMProvider | null> {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId, isActive: true },
  });
  if (!provider) return null;
  return new SMMProvider(provider.apiUrl, provider.apiKey);
}

export async function submitOrderToProvider(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { service: true, provider: true },
    });

    if (!order || !order.service.providerServiceId) {
      return { success: false, error: "Order or service not found" };
    }

    const provider = new SMMProvider(order.provider.apiUrl, order.provider.apiKey);
    const result = await provider.createOrder(
      order.service.providerServiceId,
      order.link,
      order.quantity
    );

    if (result.error) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          providerResponse: result as any,
          notes: result.error,
        },
      });
      return { success: false, error: result.error };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        providerOrderId: result.order?.toString(),
        providerResponse: result as any,
      },
    });

    return { success: true };
  } catch (error: any) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", notes: error.message },
    });
    return { success: false, error: error.message };
  }
}

export async function syncOrderStatuses(): Promise<void> {
  const processingOrders = await prisma.order.findMany({
    where: {
      status: "PROCESSING",
      providerOrderId: { not: null },
    },
    include: { provider: true },
    take: 100,
  });

  if (processingOrders.length === 0) return;

  // Group by provider
  const byProvider: Record<string, typeof processingOrders> = {};
  for (const order of processingOrders) {
    if (!byProvider[order.providerId]) byProvider[order.providerId] = [];
    byProvider[order.providerId].push(order);
  }

  for (const [, orders] of Object.entries(byProvider)) {
    const firstOrder = orders[0];
    const provider = new SMMProvider(firstOrder.provider.apiUrl, firstOrder.provider.apiKey);

    for (const order of orders) {
      if (!order.providerOrderId) continue;
      try {
        const status = await provider.getOrderStatus(order.providerOrderId);

        let newStatus = order.status;
        if (status.status === "Completed") newStatus = "COMPLETED";
        else if (status.status === "Processing") newStatus = "PROCESSING";
        else if (status.status === "Partial") newStatus = "PARTIAL";
        else if (status.status === "Canceled") newStatus = "CANCELLED";
        else if (status.status === "In progress") newStatus = "PROCESSING";

        if (newStatus !== order.status) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus as any,
              startCount: status.start_count ? parseInt(status.start_count) : undefined,
              remains: status.remains ? parseInt(status.remains) : undefined,
            },
          });

          // Notify user on completion
          if (newStatus === "COMPLETED" || newStatus === "PARTIAL") {
            await prisma.notification.create({
              data: {
                userId: order.userId,
                type: newStatus === "COMPLETED" ? "ORDER_COMPLETED" : "ORDER_PARTIAL" as any,
                title: `Order ${newStatus === "COMPLETED" ? "Completed" : "Partially Completed"}`,
                message: `Your order #${order.orderNumber} has been ${newStatus === "COMPLETED" ? "completed" : "partially completed"}.`,
                data: { orderId: order.id },
              },
            });
          }

          if (newStatus === "CANCELLED") {
            // Refund user
            const user = await prisma.user.findUnique({ where: { id: order.userId } });
            if (user) {
              await prisma.$transaction([
                prisma.user.update({
                  where: { id: order.userId },
                  data: { walletBalance: { increment: order.charge } },
                }),
                prisma.transaction.create({
                  data: {
                    userId: order.userId,
                    type: "REFUND",
                    status: "COMPLETED",
                    amount: order.charge,
                    balanceBefore: user.walletBalance,
                    balanceAfter: user.walletBalance + order.charge,
                    description: `Refund for cancelled order #${order.orderNumber}`,
                  },
                }),
                prisma.order.update({
                  where: { id: order.id },
                  data: { refundAmount: order.charge },
                }),
              ]);
            }
          }
        }
      } catch (e) {
        console.error(`Failed to sync order ${order.id}:`, e);
      }
    }
  }
}
