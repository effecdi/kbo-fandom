import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Sparkles, Zap, Crown, ChevronDown, Star } from "lucide-react";
import { useNavigate } from "react-router";

export function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "팬 시작",
      price: "₩0",
      period: "/월",
      icon: Sparkles,
      description: "무료로 팬아트 생성을 시작해보세요",
      features: [
        "AI 팬아트 생성 월 5회",
        "기본 팬아트 에디터",
        "그룹 팔로우 3개",
        "팬톡 참여",
        "커뮤니티 피드 이용",
        "워터마크 포함",
      ],
      cta: "무료 시작",
    },
    {
      name: "팬 크리에이터",
      price: "₩29,000",
      period: "/월",
      popular: true,
      icon: Zap,
      description: "AI 팬아트를 무제한으로 만들고 이벤트에 참여하세요",
      highlight: "월 500 크레딧",
      features: [
        "AI 크레딧 월 500개",
        "AI 팬아트 생성 무제한",
        "모든 AI 스타일 이용",
        "그룹 팔로우 무제한",
        "이벤트 참여 및 응모",
        "워터마크 제거",
        "프리미엄 팬아트 템플릿",
        "팬 크리에이터 프로필 배지",
        "우선 지원",
      ],
      cta: "크리에이터 시작하기",
    },
    {
      name: "팬덤 마스터",
      price: "₩99,000",
      period: "/월",
      icon: Crown,
      description: "프리미엄 도구와 우선 노출로 팬덤을 리드하세요",
      highlight: "월 2000 크레딧",
      features: [
        "AI 크레딧 월 2000개",
        "팬 크리에이터 기능 전체",
        "고급 AI 스타일 (프리미엄 모델)",
        "AI 자동 인스타툰 생성",
        "팬아트 피드 우선 노출",
        "팬덤 마스터 배지",
        "이벤트 우선 참여권",
        "고급 활동 분석 대시보드",
        "1:1 전담 지원",
        "API 접근 권한",
      ],
      cta: "마스터 시작하기",
    },
  ];

  const faqs = [
    {
      q: "무료 체험이 가능한가요?",
      a: "네, 팬 시작 플랜으로 언제든지 시작하실 수 있습니다. 신용카드 등록 없이 바로 이용 가능하며, 필요할 때 언제든지 유료 플랜으로 업그레이드할 수 있습니다."
    },
    {
      q: "크레딧은 무엇인가요?",
      a: "크레딧은 AI 기능(팬아트 생성, 이미지 생성, 스타일 변환 등)을 사용할 때 소모되는 단위입니다. 팬 크리에이터는 월 500크레딧, 팬덤 마스터는 월 2000크레딧이 제공되며, 사용하지 않은 크레딧은 다음 달로 이월되지 않습니다."
    },
    {
      q: "플랜은 언제든지 변경할 수 있나요?",
      a: "네, 필요에 따라 언제든지 업그레이드 또는 다운그레이드가 가능합니다. 업그레이드는 즉시 적용되며, 다운그레이드는 다음 결제일부터 적용됩니다. 비용은 일할 계산됩니다."
    },
    {
      q: "환불 정책은 어떻게 되나요?",
      a: "결제 후 7일 이내 100% 환불이 가능합니다. 단, 크레딧을 사용하지 않은 경우에 한하며, 환불 요청 시 즉시 처리됩니다."
    },
    {
      q: "팬아트는 어떤 그룹을 지원하나요?",
      a: "BTS, BLACKPINK, NewJeans, aespa, Stray Kids, SEVENTEEN, IVE, LE SSERAFIM 등 주요 K-POP 그룹을 지원하며, 지속적으로 새로운 그룹이 추가됩니다."
    },
    {
      q: "이벤트는 어떻게 참여하나요?",
      a: "팬 크리에이터 이상 플랜에서 이벤트에 참여할 수 있습니다. 팬아트 챌린지, 밈 콘테스트, 기념일 이벤트 등 다양한 이벤트가 진행되며, 수상 시 공식 굿즈와 포토카드 등을 받을 수 있습니다."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            홈으로
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00e5cc]/20 to-[#00b3a6]/20 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#00e5cc]" />
          <span className="text-sm font-bold text-teal-600 dark:text-[#00e5cc]">
            K-POP 팬덤 요금제
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-foreground">
          팬덤 활동에 맞춘 요금제
        </h1>
        <p className="text-lg md:text-xl mb-12 text-muted-foreground">
          무료로 시작하고, 팬 크리에이터로 성장하세요
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`rounded-3xl p-8 border-2 transition-all relative overflow-hidden ${
                  plan.popular
                    ? "border-teal-500 bg-card shadow-2xl scale-105"
                    : "border-border bg-card hover:border-border hover:shadow-lg"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mr-1 -mt-1">
                    <div className="bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl font-bold text-xs shadow-lg flex items-center gap-1">
                      <Star className="w-5 h-5" />
                      인기
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.popular
                    ? "bg-gradient-to-br from-[#00e5cc] to-[#00b3a6]"
                    : "bg-muted"
                }`}>
                  <Icon className={`w-7 h-7 ${
                    plan.popular ? "text-white" : "text-muted-foreground"
                  }`} />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-black mb-2 text-foreground">
                  {plan.name}
                </h3>

                {/* Description */}
                <p className="text-sm mb-4 text-muted-foreground">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-black text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                {/* Highlight */}
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-6 bg-teal-100 text-teal-700 dark:bg-[#00e5cc]/20 dark:text-[#00e5cc]">
                    <Sparkles className="w-5 h-5" />
                    {plan.highlight}
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular
                          ? "bg-[#00e5cc]/20"
                          : "bg-muted"
                      }`}>
                        <Check className={`w-5 h-5 ${
                          plan.popular
                            ? "text-[#00e5cc]"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full h-12 font-bold ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white hover:shadow-xl"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/signup")}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Note */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-2xl p-8 border text-center bg-card border-border">
          <h3 className="font-bold mb-3 text-foreground">
            모든 플랜에 포함된 기본 기능
          </h3>
          <p className="text-sm text-muted-foreground">
            모든 플랜에는 기본 보안, 정기 업데이트, K-POP 팬덤 커뮤니티 접근이 포함됩니다.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black mb-2 text-center text-foreground">
            자주 묻는 질문
          </h2>
          <p className="text-center mb-12 text-muted-foreground">
            궁금하신 점이 있으신가요?
          </p>
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border overflow-hidden bg-card border-border"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left transition-colors hover:bg-opacity-50"
                >
                  <h3 className="font-bold text-lg text-foreground">
                    {item.q}
                  </h3>
                  <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ml-4 ${
                    openFaq === index ? "rotate-180" : ""
                  } text-muted-foreground`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-gradient-to-r from-[#00e5cc] to-[#00b3a6]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            무료로 시작하고 K-POP 팬아트의 세계를 경험하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white hover:bg-muted font-bold h-14 px-8"
              style={{ color: "#00b3a6" }}
              onClick={() => navigate("/signup")}
            >
              무료로 시작하기
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-2 border-white hover:bg-white/10 font-bold h-14 px-8"
              onClick={() => navigate("/fandom")}
            >
              팬덤 둘러보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
