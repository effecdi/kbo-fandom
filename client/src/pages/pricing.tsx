import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Sparkles, Zap, Crown, X, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";
import { CREDIT_COSTS } from "@/lib/tier";

declare global {
  interface Window {
    PortOne?: {
      requestPayment: (params: any) => Promise<any>;
      requestIssueBillingKey: (params: any) => Promise<any>;
    };
  }
}

type PGMethod = "inicis" | "toss";
type BillingCycle = "monthly" | "yearly";

interface PricingPlanData {
  monthlyCredits: number;
  dailyBonus: number;
  priceUSD: { monthly: number; yearly: number };
  priceKRW: { monthly: number; yearly: number };
}

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  // Legacy one-time payment
  const [pgDialogOpen, setPgDialogOpen] = useState(false);
  const [pendingProductType, setPendingProductType] = useState<"credits" | null>(null);

  const { data: credits } = useQuery<{
    credits: number;
    dailyBonusCredits: number;
    tier: string;
    subscription?: {
      plan: string;
      billingCycle: string;
      status: string;
      currentPeriodEnd: string;
      cancelledAt: string | null;
    } | null;
  }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  const { data: pricingData } = useQuery<{
    products: { pro: { amount: number; name: string }; credits: { amount: number; name: string } };
    plans: { free: PricingPlanData; pro: PricingPlanData; premium: PricingPlanData };
    portoneV2StoreId: string;
    portoneV2ChannelKeyInicis: string;
    portoneV2ChannelKeyToss: string;
  }>({
    queryKey: ["/api/pricing"],
  });

  // PortOne V2 SDK
  useEffect(() => {
    if (!document.getElementById("portone-v2-sdk")) {
      const script = document.createElement("script");
      script.id = "portone-v2-sdk";
      script.src = "https://cdn.portone.io/v2/browser-sdk.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const isPaid = credits?.tier === "pro" || credits?.tier === "premium";

  // 구독 시작 (빌링키 발급 → 서버로 전송)
  const handleSubscribe = useCallback(async (plan: "pro" | "premium") => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!window.PortOne) {
      toast({ title: "결제 모듈 로딩 중", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
      return;
    }
    if (!pricingData?.portoneV2StoreId || !pricingData?.portoneV2ChannelKeyToss) {
      toast({ title: "결제 설정 오류", description: "관리자에게 문의하세요.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // 빌링키 발급 (정기결제는 토스페이먼츠 채널 사용)
      const issueResponse = await window.PortOne.requestIssueBillingKey({
        storeId: pricingData.portoneV2StoreId,
        channelKey: pricingData.portoneV2ChannelKeyToss,
        billingKeyMethod: "CARD",
        issueId: `issue_${plan}_${billingCycle}_${Date.now()}`,
        issueName: `OLLI ${plan === "premium" ? "Premium" : "Pro"} 정기구독`,
        customer: {
          email: user?.email || undefined,
          fullName: user?.firstName || undefined,
        },
      });

      if (issueResponse.code) {
        // 사용자 취소 또는 에러
        if (issueResponse.code !== "USER_CANCEL") {
          toast({ title: "빌링키 발급 실패", description: issueResponse.message || "다시 시도해주세요.", variant: "destructive" });
        }
        return;
      }

      const billingKey = issueResponse.billingKey;
      if (!billingKey) {
        toast({ title: "빌링키 발급 실패", description: "카드 등록에 실패했습니다.", variant: "destructive" });
        return;
      }

      // 서버로 빌링키 전송 → 첫 결제 + 구독 생성
      const res = await apiRequest("POST", "/api/subscription/billing-key", {
        billingKey,
        plan,
        billingCycle,
      });
      const data = await res.json();

      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });

      toast({
        title: "구독 시작!",
        description: `${plan === "premium" ? "Premium" : "Pro"} 멤버가 되었습니다! ${data.credits?.toLocaleString()} 크레딧이 지급되었습니다.`,
      });
    } catch (error: any) {
      toast({ title: "구독 실패", description: error.message || "관리자에게 문의하세요.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [isAuthenticated, billingCycle, user, toast, pricingData]);

  // 구독 취소
  const handleCancelSubscription = useCallback(async () => {
    setIsCancelling(true);
    try {
      const res = await apiRequest("POST", "/api/subscription/cancel", {});
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      toast({ title: "구독 취소 완료", description: data.message });
    } catch (error: any) {
      toast({ title: "취소 실패", description: error.message || "관리자에게 문의하세요.", variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  }, [toast]);

  // 크레딧 일회성 충전 (V2 SDK)
  const initiatePayment = useCallback((productType: "credits") => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setPendingProductType(productType);
    setPgDialogOpen(true);
  }, [isAuthenticated]);

  const executePayment = useCallback(async (pgMethod: PGMethod) => {
    setPgDialogOpen(false);
    if (!pendingProductType) return;

    if (!window.PortOne) {
      toast({ title: "결제 모듈 로딩 중", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
      return;
    }

    const product = pricingData?.products?.credits;
    if (!product || !pricingData?.portoneV2StoreId) {
      toast({ title: "가격 정보 로딩 중", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
      return;
    }

    const channelKey = pgMethod === "inicis"
      ? pricingData.portoneV2ChannelKeyInicis
      : pricingData.portoneV2ChannelKeyToss;

    if (!channelKey) {
      toast({ title: "결제 채널 미설정", description: "관리자에게 문의하세요.", variant: "destructive" });
      return;
    }

    const paymentId = `credits_${Date.now()}`;
    setIsProcessing(true);

    try {
      const response = await window.PortOne.requestPayment({
        storeId: pricingData.portoneV2StoreId,
        channelKey,
        paymentId,
        orderName: product.name,
        totalAmount: product.amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customer: {
          email: user?.email || undefined,
          fullName: user?.firstName || undefined,
        },
      });

      if (response.code) {
        if (response.code !== "USER_CANCEL") {
          toast({ title: "결제 실패", description: response.message || "다시 시도해주세요.", variant: "destructive" });
        }
        return;
      }

      // 서버에서 결제 검증
      const res = await apiRequest("POST", "/api/payment/complete", {
        paymentId,
        product_type: "credits",
      });
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      toast({ title: "충전 완료!", description: `${data.creditsAdded}개의 크레딧이 추가되었습니다.` });
    } catch (error: any) {
      toast({ title: "결제 검증 실패", description: error.message || "관리자에게 문의하세요.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setPendingProductType(null);
    }
  }, [pendingProductType, user, toast, pricingData]);

  const getPrice = (plan: "pro" | "premium") => {
    const planData = pricingData?.plans?.[plan];
    if (!planData) return { usd: 0, krw: 0 };
    return {
      usd: billingCycle === "yearly" ? planData.priceUSD.yearly : planData.priceUSD.monthly,
      krw: billingCycle === "yearly" ? planData.priceKRW.yearly : planData.priceKRW.monthly,
    };
  };

  const getMonthlyEquivalent = (plan: "pro" | "premium") => {
    const planData = pricingData?.plans?.[plan];
    if (!planData || billingCycle !== "yearly") return null;
    return Math.round((planData.priceUSD.yearly / 12) * 100) / 100;
  };

  const plans = [
    {
      name: "Free",
      tier: "free" as const,
      icon: Sparkles,
      priceLabel: "$0",
      period: "",
      description: "30 credits/mo + 5 daily bonus",
      features: [
        { text: "30 credits per month", included: true },
        { text: "5 daily bonus credits", included: true },
        { text: "3 free styles", included: true },
        { text: "Watermark on exports", included: true },
        { text: "All premium styles", included: false },
        { text: "No watermark", included: false },
        { text: "Commercial use", included: false },
      ],
    },
    {
      name: "Pro",
      tier: "pro" as const,
      icon: Zap,
      priceLabel: `$${getPrice("pro").usd}`,
      period: billingCycle === "yearly" ? "/yr" : "/mo",
      monthlyEq: getMonthlyEquivalent("pro"),
      description: "3,000 credits/mo",
      features: [
        { text: "3,000 credits per month", included: true },
        { text: "All styles unlocked", included: true },
        { text: "No watermark", included: true },
        { text: "Commercial use", included: true },
        { text: "Unlimited editors", included: true },
        { text: "Priority support", included: true },
      ],
      highlighted: true,
    },
    {
      name: "Premium",
      tier: "premium" as const,
      icon: Crown,
      priceLabel: `$${getPrice("premium").usd}`,
      period: billingCycle === "yearly" ? "/yr" : "/mo",
      monthlyEq: getMonthlyEquivalent("premium"),
      description: "20,000 credits/mo",
      features: [
        { text: "20,000 credits per month", included: true },
        { text: "Everything in Pro", included: true },
        { text: "AI Ad Matching", included: true },
        { text: "Bulk generation", included: true },
        { text: "API access (coming soon)", included: true },
        { text: "Dedicated support", included: true },
      ],
    },
  ];

  const isCurrentPlan = (tier: string) => {
    if (!credits) return false;
    return credits.tier === tier;
  };

  const getButtonConfig = (tier: string) => {
    if (!isAuthenticated) return { text: "Get Started", disabled: false, action: () => { window.location.href = "/login"; } };
    if (tier === "free") {
      return { text: isCurrentPlan("free") ? "Current Plan" : "Free Plan", disabled: isCurrentPlan("free"), action: () => {} };
    }
    if (isCurrentPlan(tier)) {
      return { text: "Current Plan", disabled: true, action: () => {} };
    }
    const sub = credits?.subscription;
    if (sub?.status === "cancelled" && credits?.tier === tier) {
      return { text: "Cancelled", disabled: true, action: () => {} };
    }
    return {
      text: isPaid ? "Change Plan" : `Upgrade to ${tier === "premium" ? "Premium" : "Pro"}`,
      disabled: isProcessing,
      action: () => handleSubscribe(tier as "pro" | "premium"),
    };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-sans text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-pricing-title">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Pick the plan that fits your creative workflow
        </p>

        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === "yearly"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0 text-[13px] px-1.5">Save 15%</Badge>
          </button>
        </div>
      </div>

      {/* 3-Column Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const btn = getButtonConfig(plan.tier);
          return (
            <Card
              key={plan.name}
              className={`relative h-full overflow-hidden rounded-3xl border px-7 py-8 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-primary/80 dark:border-primary/30 shadow-[0_22px_70px_rgba(15,23,42,0.3)] dark:shadow-[0_22px_70px_rgba(15,23,42,0.85)] scale-[1.02]"
                  : "bg-card text-card-foreground border-border shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_22px_70px_rgba(15,23,42,0.85)]"
              }`}
              data-testid={`card-plan-${plan.tier}`}
            >
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between mb-5">
                  {plan.highlighted ? (
                    <>
                      <Badge className="bg-primary-foreground/15 text-primary-foreground text-[13px] px-3 py-1 border border-primary-foreground/20">Recommended</Badge>
                    </>
                  ) : (
                    <h3 className={`font-semibold text-sm uppercase tracking-[0.18em] ${plan.tier === "premium" ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}`}>
                      {plan.name}
                    </h3>
                  )}
                </div>

                <div className="mb-4">
                  {plan.highlighted && (
                    <p className="text-[13px] uppercase tracking-[0.22em] text-primary-foreground/70 mb-1">Pro</p>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{plan.priceLabel}</span>
                    {plan.period && (
                      <span className={plan.highlighted ? "text-sm text-primary-foreground/70" : "text-sm text-muted-foreground"}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.monthlyEq && (
                    <p className={`text-[13px] mt-1 ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      ${plan.monthlyEq}/mo equivalent
                    </p>
                  )}
                  {plan.tier !== "free" && (
                    <p className={`text-[13px] mt-0.5 ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                      ~{getPrice(plan.tier as "pro" | "premium").krw.toLocaleString("ko-KR")} KRW
                    </p>
                  )}
                  <p className={`mt-2 text-[13px] ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2 text-sm mb-6 mt-1">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2.5">
                      {feature.included ? (
                        <Check className={`h-5 w-5 shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-emerald-500 dark:text-teal-300"}`} />
                      ) : (
                        <X className={`h-5 w-5 shrink-0 ${plan.highlighted ? "text-primary-foreground/25" : "text-slate-300 dark:text-slate-500/60"}`} />
                      )}
                      <span className={
                        feature.included
                          ? plan.highlighted ? "text-primary-foreground/95" : "text-foreground"
                          : plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground"
                      }>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className={`mt-auto w-full h-11 rounded-full ${
                    plan.highlighted
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0"
                      : plan.tier === "premium"
                        ? "border-amber-400 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                        : "border-border text-foreground hover:bg-muted"
                  }`}
                  disabled={btn.disabled}
                  onClick={btn.action}
                  data-testid={`button-plan-${plan.tier}`}
                >
                  {isProcessing && (plan.tier === "pro" || plan.tier === "premium") ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : null}
                  {btn.text}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Subscription Management */}
      {isAuthenticated && credits?.subscription && credits.subscription.status === "active" && (
        <div className="max-w-5xl mx-auto mt-8">
          <Card className="rounded-2xl border px-8 py-6 bg-card border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Active Subscription: {credits.subscription.plan === "premium" ? "Premium" : "Pro"} ({credits.subscription.billingCycle === "yearly" ? "Annual" : "Monthly"})
                </h3>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Next billing: {new Date(credits.subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-muted-foreground" disabled={isCancelling}>
                    {isCancelling ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your benefits will remain until {new Date(credits.subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}.
                      After that, you'll be switched to the free plan with 30 credits/month.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>
      )}

      {/* Cancelled but still active */}
      {isAuthenticated && credits?.subscription?.status === "cancelled" && (
        <div className="max-w-5xl mx-auto mt-8">
          <Card className="rounded-2xl border px-8 py-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Your subscription has been cancelled. Benefits remain until {new Date(credits.subscription.currentPeriodEnd).toLocaleDateString("ko-KR")}.
            </p>
          </Card>
        </div>
      )}

      {/* Credit Top-Up Card */}
      <div className="max-w-5xl mx-auto mt-8">
        <Card
          className="relative overflow-hidden rounded-2xl border px-8 py-7 cursor-pointer hover:scale-[1.01] transition-transform bg-gradient-to-br from-primary/5 via-primary/8 to-primary/10 dark:from-primary/10 dark:via-primary/15 dark:to-primary/20 border-primary/20 dark:border-primary/30 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
          onClick={() => initiatePayment("credits")}
          data-testid="card-credit-topup"
        >
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Credit Top-Up</h3>
                <p className="text-sm text-muted-foreground mt-0.5">One-time purchase of 50 credits</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-primary">{pricingData ? `₩${pricingData.products.credits.amount.toLocaleString("ko-KR")}` : "₩4,900"}</div>
              <div className="text-[13px] text-muted-foreground">50 credits</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Credit Cost Table */}
      <div className="max-w-5xl mx-auto mt-12">
        <Card className="rounded-2xl border px-8 py-7 bg-card border-border shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          <h3 className="font-bold text-lg mb-4 text-foreground">Credits per action</h3>
          <div className="space-y-2.5 text-sm">
            {[
              { label: "Character generation", cost: CREDIT_COSTS.character },
              { label: "Pose / Expression", cost: CREDIT_COSTS.pose },
              { label: "Background / Item", cost: CREDIT_COSTS.background },
              { label: "Upscale / Effects", cost: CREDIT_COSTS.effect },
              { label: "Basic (Bubble, etc.)", cost: CREDIT_COSTS.basic },
              { label: "Story auto-generation", cost: CREDIT_COSTS.storyAuto },
              { label: "Story prompt generation", cost: CREDIT_COSTS.storyPrompt },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-2 ${i < arr.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="text-foreground">{item.label}</span>
                <Badge variant="secondary" className="text-[13px]">{item.cost} credits</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-10 text-center text-sm text-muted-foreground">
        <p>Free plan: 30 credits/month + 5 daily bonus credits.</p>
        <p className="mt-1">All paid plans include full style library, no watermark, and commercial use rights.</p>
      </div>

      {/* PG Method Selection Dialog (크레딧 충전용) */}
      <AlertDialog open={pgDialogOpen} onOpenChange={setPgDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Method</AlertDialogTitle>
            <AlertDialogDescription>Choose your preferred payment method.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => executePayment("inicis")} disabled={isProcessing}>
              <CreditCard className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">KG이니시스</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => executePayment("toss")} disabled={isProcessing}>
              <CreditCard className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">토스페이먼츠</span>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingProductType(null)}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
