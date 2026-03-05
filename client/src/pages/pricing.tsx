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
import { Check, Sparkles, Zap, X, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";

declare global {
  interface Window {
    IMP?: {
      init: (merchantId: string) => void;
      request_pay: (params: any, callback: (response: any) => void) => void;
    };
  }
}

type PGMethod = "kakaopay" | "tosspayments";

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [pgDialogOpen, setPgDialogOpen] = useState(false);
  const [pendingProductType, setPendingProductType] = useState<"pro" | "credits" | null>(null);

  const { data: credits } = useQuery<{ credits: number; dailyBonusCredits: number; tier: string }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!document.getElementById("iamport-sdk")) {
      const script = document.createElement("script");
      script.id = "iamport-sdk";
      script.src = "https://cdn.iamport.kr/v1/iamport.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const initiatePayment = useCallback((productType: "pro" | "credits") => {
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

    if (!window.IMP) {
      toast({ title: "결제 모듈 로딩 중", description: "잠시 후 다시 시도해주세요.", variant: "destructive" });
      return;
    }

    const productType = pendingProductType;
    const merchantUid = `${productType}_${Date.now()}`;
    const amount = productType === "pro" ? 19900 : 4900;
    const name = productType === "pro" ? "OLLI Pro 멤버십 (월간)" : "OLLI 크레딧 50개";

    window.IMP.init(import.meta.env.VITE_PORTONE_MERCHANT_ID || "imp00000000");

    setIsProcessing(true);

    window.IMP.request_pay(
      {
        pg: pgMethod,
        pay_method: "card",
        merchant_uid: merchantUid,
        name,
        amount,
        buyer_email: user?.email || "",
        buyer_name: user?.firstName || "",
      },
      async (response: any) => {
        if (response.success) {
          try {
            const res = await apiRequest("POST", "/api/payment/complete", {
              imp_uid: response.imp_uid,
              merchant_uid: merchantUid,
              product_type: productType,
            });
            const data = await res.json();
            queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
            queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
            toast({
              title: "결제 완료!",
              description: productType === "pro"
                ? "Pro 멤버가 되었습니다!"
                : `${data.creditsAdded}개의 크레딧이 추가되었습니다.`,
            });
          } catch (error: any) {
            toast({ title: "결제 검증 실패", description: error.message || "관리자에게 문의하세요.", variant: "destructive" });
          }
        } else {
          toast({ title: "결제 취소", description: response.error_msg || "결제가 취소되었습니다.", variant: "destructive" });
        }
        setIsProcessing(false);
        setPendingProductType(null);
      }
    );
  }, [pendingProductType, isAuthenticated, user, toast]);

  const handleCancelPro = useCallback(async () => {
    setIsCancelling(true);
    try {
      await apiRequest("POST", "/api/cancel-pro", {});
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      toast({ title: "멤버십 해지 완료", description: "무료 플랜으로 전환되었습니다. 10 크레딧이 지급되었습니다." });
    } catch (error: any) {
      toast({ title: "해지 실패", description: error.message || "관리자에게 문의하세요.", variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  }, [toast]);

  const plans = [
    {
      name: "무료",
      price: "₩0",
      period: "영구 무료",
      description: "가입 시 50 크레딧 + 매월 10 크레딧 + 매일 출석 5 크레딧",
      icon: Sparkles,
      features: [
        { text: "가입 시 50 크레딧 즉시 지급", included: true },
        { text: "매월 10 크레딧 자동 충전", included: true },
        { text: "매일 출석 보너스 5 크레딧", included: true },
        { text: "3가지 스타일 (심플 라인)", included: true },
        { text: "기본 및 일부 무료 폰트 제공", included: true },
        { text: "포즈 & 배경 생성", included: true },
        { text: "말풍선 편집기", included: true },
        { text: "스토리 에디터", included: true },
        { text: "프리미엄 스타일", included: false },
        { text: "워터마크 제거", included: false },
        { text: "상업적 이용", included: false },
      ],
      tier: "free",
    },
    {
      name: "Pro",
      price: "₩19,900",
      period: "/월",
      description: "본격적인 크리에이터를 위한 플랜",
      icon: Zap,
      features: [
        { text: "매월 200 크레딧 제공", included: true },
        { text: "모든 스타일 사용 가능", included: true },
        { text: "모든 폰트 제공", included: true },
        { text: "포즈 & 배경 무제한 생성", included: true },
        { text: "말풍선 & 스토리 에디터 무제한", included: true },
        { text: "워터마크 제거", included: true },
        { text: "갤러리 전체 이용", included: true },
        { text: "상업적 이용 가능", included: true },
        { text: "우선 지원", included: true },
      ],
      tier: "pro",
      highlighted: true,
    },
  ];

  const getButtonText = (tier: string) => {
    if (!isAuthenticated) return "로그인";
    if (tier === "free") return credits?.tier === "free" ? "현재 플랜" : "무료 플랜";
    if (tier === "pro") return credits?.tier === "pro" ? "현재 플랜" : "Pro 업그레이드";
    return "";
  };

  const handlePlanAction = (tier: string) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (tier === "pro" && credits?.tier !== "pro") {
      initiatePayment("pro");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-sans text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-pricing-title">
          심플하고 투명한 요금제
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          나에게 맞는 플랜을 선택하세요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative h-full overflow-hidden rounded-3xl border px-8 py-9 ${
              plan.highlighted
                ? "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border-primary/80 dark:border-primary/30 shadow-[0_22px_70px_rgba(15,23,42,0.3)] dark:shadow-[0_22px_70px_rgba(15,23,42,0.85)]"
                : "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 border-slate-200 dark:border-slate-800 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_22px_70px_rgba(15,23,42,0.85)]"
            }`}
            data-testid={`card-plan-${plan.tier}`}
          >
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between mb-6">
                {plan.highlighted ? (
                  <>
                    <Badge className="bg-primary-foreground/15 text-primary-foreground text-[11px] px-3 py-1 border border-primary-foreground/20">Pro</Badge>
                    <span className="text-[11px] text-primary-foreground/70">{plan.period}</span>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-sm uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400">Free</h3>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400">{plan.period}</span>
                  </>
                )}
              </div>
              <div className="mb-2">
                {plan.highlighted ? (
                  <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70 mb-1">크리에이터 추천</p>
                ) : null}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                  <span className={plan.highlighted ? "text-sm text-primary-foreground/70" : "text-sm text-slate-400"}>/월</span>
                </div>
                <p
                  className={
                    plan.highlighted ? "mt-2 text-xs text-primary-foreground/80" : "mt-2 text-xs text-slate-500 dark:text-slate-400"
                  }
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2.5 text-sm mb-7 mt-2">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-2.5">
                    {feature.included ? (
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          plan.highlighted ? "text-primary-foreground" : "text-emerald-500 dark:text-teal-300"
                        }`}
                      />
                    ) : (
                      <X
                        className={`h-4 w-4 shrink-0 ${
                          plan.highlighted ? "text-primary-foreground/25" : "text-slate-300 dark:text-slate-500/60"
                        }`}
                      />
                    )}
                    <span
                      className={
                        feature.included
                          ? plan.highlighted
                            ? "text-primary-foreground/95"
                            : "text-slate-700 dark:text-slate-200"
                          : plan.highlighted
                            ? "text-primary-foreground/50"
                            : "text-slate-400 dark:text-slate-400"
                      }
                    >
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
                    : "border-slate-300 dark:border-slate-500/70 text-slate-700 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                }`}
                disabled={
                  (plan.tier === "free" && credits?.tier === "free") ||
                  (plan.tier === "pro" && credits?.tier === "pro") ||
                  isProcessing
                }
                onClick={() => handlePlanAction(plan.tier)}
                data-testid={`button-plan-${plan.tier}`}
              >
                {isProcessing && plan.tier === "pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {getButtonText(plan.tier)}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Credit Top-Up Card */}
      <div className="max-w-3xl mx-auto mt-8">
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
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">크레딧 충전</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">50 크레딧으로 더 많은 작품을 만들어보세요</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-primary">₩4,900</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">50 크레딧</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pro Cancel */}
      {isAuthenticated && credits?.tier === "pro" && (
        <div className="max-w-3xl mx-auto mt-8 text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-muted-foreground" disabled={isCancelling}>
                {isCancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Pro 멤버십 해지
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Pro 멤버십을 해지하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  해지하면 무료 플랜으로 전환되며, 무제한 생성 등 Pro 혜택을 더 이상 이용할 수 없습니다.
                  무료 플랜 전환 시 10 크레딧이 지급됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelPro} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  해지하기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>무료 플랜은 가입 시 50 크레딧 + 매월 10 크레딧 + 매일 출석 보너스 5 크레딧을 제공합니다.</p>
        <p className="mt-1">
          Pro 멤버십은 포즈/배경 생성, 말풍선·스토리 에디터, 채팅 이미지 메이커, AI 광고주 매칭 등을 포함합니다.
        </p>
      </div>

      {/* PG Method Selection Dialog */}
      <AlertDialog open={pgDialogOpen} onOpenChange={setPgDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>결제 수단 선택</AlertDialogTitle>
            <AlertDialogDescription>
              원하시는 결제 수단을 선택해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => executePayment("kakaopay")}
              disabled={isProcessing}
            >
              <CreditCard className="h-6 w-6 text-yellow-500" />
              <span className="text-sm font-medium">카카오페이</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => executePayment("tosspayments")}
              disabled={isProcessing}
            >
              <CreditCard className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">카드 / Google Pay</span>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingProductType(null)}>취소</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
