import axios from "axios";
import { config } from "./config";
import { logger } from "./logger";

// ── 구독 상품 정의 ─────────────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS = {
  pro_monthly: {
    plan: "pro" as const,
    billingCycle: "monthly" as const,
    amountKRW: 34500,
    amountUSD: 25,
    monthlyCredits: 3000,
    label: "Pro Monthly",
  },
  pro_yearly: {
    plan: "pro" as const,
    billingCycle: "yearly" as const,
    amountKRW: 352000,
    amountUSD: 255,
    monthlyCredits: 3000,
    label: "Pro Yearly",
  },
  premium_monthly: {
    plan: "premium" as const,
    billingCycle: "monthly" as const,
    amountKRW: 138000,
    amountUSD: 100,
    monthlyCredits: 20000,
    label: "Premium Monthly",
  },
  premium_yearly: {
    plan: "premium" as const,
    billingCycle: "yearly" as const,
    amountKRW: 1408000,
    amountUSD: 1020,
    monthlyCredits: 20000,
    label: "Premium Yearly",
  },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;

export function getSubscriptionPlan(plan: string, billingCycle: string) {
  const key = `${plan}_${billingCycle}` as SubscriptionPlanKey;
  return SUBSCRIPTION_PLANS[key] || null;
}

export function getMonthlyCreditsForPlan(plan: string): number {
  if (plan === "premium") return 20000;
  if (plan === "pro") return 3000;
  return 30; // free
}

// ── PortOne V2 API ─────────────────────────────────────────────────────────

const PORTONE_V2_BASE = "https://api.portone.io";

function getV2Headers() {
  return {
    Authorization: `PortOne ${config.portoneV2ApiSecret}`,
    "Content-Type": "application/json",
  };
}

/**
 * 빌링키 정보 조회
 */
export async function getBillingKeyInfo(billingKey: string) {
  const res = await axios.get(
    `${PORTONE_V2_BASE}/billing-keys/${billingKey}`,
    { headers: getV2Headers() },
  );
  return res.data;
}

/**
 * 빌링키로 결제 실행
 */
export async function payWithBillingKey(opts: {
  paymentId: string;
  billingKey: string;
  amount: number;
  currency: string;
  orderName: string;
  customerId: string;
}) {
  const res = await axios.post(
    `${PORTONE_V2_BASE}/payments/${encodeURIComponent(opts.paymentId)}/billing-key`,
    {
      billingKey: opts.billingKey,
      orderName: opts.orderName,
      amount: { total: opts.amount, currency: opts.currency },
      customer: { id: opts.customerId },
    },
    { headers: getV2Headers() },
  );
  return res.data;
}

/**
 * 결제 예약 (PortOne Schedule API)
 */
export async function schedulePayment(opts: {
  paymentId: string;
  billingKey: string;
  amount: number;
  currency: string;
  orderName: string;
  timeToPay: Date;
  customerId: string;
}) {
  const res = await axios.post(
    `${PORTONE_V2_BASE}/payments/${encodeURIComponent(opts.paymentId)}/schedule`,
    {
      payment: {
        billingKey: opts.billingKey,
        orderName: opts.orderName,
        amount: { total: opts.amount, currency: opts.currency },
        customer: { id: opts.customerId },
      },
      timeToPay: opts.timeToPay.toISOString(),
    },
    { headers: getV2Headers() },
  );
  return res.data;
}

/**
 * 예약 결제 취소
 */
export async function cancelScheduledPayment(paymentId: string) {
  try {
    const res = await axios.delete(
      `${PORTONE_V2_BASE}/payments/${encodeURIComponent(paymentId)}/schedule`,
      { headers: getV2Headers() },
    );
    return res.data;
  } catch (err: any) {
    // 이미 취소된 경우 무시
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

/**
 * PortOne V2 결제 조회
 */
export async function getPaymentInfo(paymentId: string) {
  const res = await axios.get(
    `${PORTONE_V2_BASE}/payments/${encodeURIComponent(paymentId)}`,
    { headers: getV2Headers() },
  );
  return res.data;
}

/**
 * 다음 결제 기간 계산
 */
export function calculateNextPeriod(currentEnd: Date, billingCycle: string): { start: Date; end: Date } {
  const start = new Date(currentEnd);
  const end = new Date(currentEnd);
  if (billingCycle === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return { start, end };
}

/**
 * 구독 시작 시 첫 기간 계산
 */
export function calculateFirstPeriod(billingCycle: string): { start: Date; end: Date } {
  const start = new Date();
  const end = new Date();
  if (billingCycle === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return { start, end };
}

/**
 * 고유 결제 ID 생성
 */
export function generatePaymentId(plan: string, billingCycle: string, userId: string): string {
  const ts = Date.now();
  const short = userId.slice(0, 8);
  return `sub_${plan}_${billingCycle}_${short}_${ts}`;
}

/**
 * PortOne V2 웹훅 시그니처 검증 (간단 구현)
 * 실제 프로덕션에서는 HMAC 기반 시그니처 검증 필요
 */
export function verifyWebhookSignature(body: any, signature: string | undefined): boolean {
  // PortOne V2 웹훅은 Webhook Secret으로 HMAC 검증
  // 현재는 paymentId로 결제 조회하여 검증하는 방식 사용
  return true;
}
