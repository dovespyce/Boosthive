// src/app/dashboard/referral/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReferralClient from "./referral-client";

export default async function ReferralPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: {
      referralCode: true,
      referralEarnings: true,
      referralClicks: true,
      _count: { select: { referrals: true } },
    },
  });

  const earnings = await prisma.referralPayment.findMany({
    where: { referrerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const commissionSetting = await prisma.setting.findUnique({ where: { key: "referral_commission" } });
  const commission = parseFloat(commissionSetting?.value || "5");

  return (
    <ReferralClient
      user={user!}
      earnings={earnings}
      commission={commission}
    />
  );
}
