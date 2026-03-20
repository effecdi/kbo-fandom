import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Sparkles, Zap, Crown, Building2, Wand2, ChevronDown, Star, Rocket, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/theme-provider";

export function Pricing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<"creator" | "business">("creator");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const creatorPlans = [
    {
      name: "Free",
      price: "₩0",
      period: "/월",
      icon: Sparkles,
      description: "인스타툰 제작을 시작해보세요",
      features: [
        "캐릭터 생성 월 5회",
        "기본 스토리 에디터",
        "기본 템플릿 라이브러리",
        "저장 공간 1GB",
        "커뮤니티 지원",
        "OLLI 워터마크 포함",
      ],
      cta: "무료 시작",
    },
    {
      name: "Pro",
      price: "₩29,000",
      period: "/월",
      popular: true,
      icon: Zap,
      description: "전문 작가를 위한 모든 기능",
      highlight: "월 500 크레딧",
      features: [
        "AI 크레딧 월 500개",
        "캐릭터 생성 무제한",
        "모든 AI 도구 이용",
        "고급 스토리 에디터",
        "저장 공간 10GB",
        "워터마크 제거",
        "프리미엄 템플릿 라이브러리",
        "Ad Match AI (광고 매칭)",
        "미디어키트 기능",
        "우선 지원",
      ],
      cta: "Pro 시작하기",
    },
    {
      name: "Premium",
      price: "₩99,000",
      period: "/월",
      icon: Crown,
      description: "최고급 기능과 전담 지원",
      highlight: "월 2000 크레딧",
      features: [
        "AI 크레딧 월 2000개",
        "Pro 기능 전체",
        "저장 공간 50GB",
        "고급 AI 스타일 (프리미엄 모델)",
        "AI 자동 스토리 생성",
        "고급 분석 대시보드",
        "협업 관리 툴",
        "프리미엄 광고 매칭 우선권",
        "브랜드 협업 우선 추천",
        "1:1 전담 매니저",
        "API 접근 권한",
      ],
      cta: "Premium 시작하기",
    },
  ];

  const businessPlans = [
    {
      name: "Starter",
      price: "₩29,000",
      period: "/월",
      icon: Rocket,
      description: "소규모 팀을 위한 시작",
      highlight: "월 500 크레딧",
      features: [
        "AI 크레딧 월 500개",
        "마스코트 생성 월 10회",
        "작가 탐색 기능",
        "캠페인 관리 3개",
        "기본 분석 리포트",
        "팀 멤버 2명",
        "저장 공간 5GB",
        "이메일 지원",
      ],
      cta: "시작하기",
    },
    {
      name: "Business",
      price: "₩99,000",
      period: "/월",
      popular: true,
      icon: Building2,
      description: "중소기업 및 공공기관용",
      highlight: "무제한 생성",
      features: [
        "마스코트 생성 무제한",
        "고급 작가 매칭 AI",
        "캠페인 관리 무제한",
        "상세 분석 리포트",
        "팀 협업 (최대 10명)",
        "저장 공간 50GB",
        "브랜드 자산 관리",
        "승인 워크플로우",
        "버전 관리 시스템",
        "검토 및 내부 승인 기능",
        "일관된 자산 라이브러리",
        "우선 지원",
      ],
      cta: "시작하기",
    },
    {
      name: "Enterprise",
      price: "맞춤 견적",
      period: "",
      icon: Shield,
      description: "대기업 및 대형 공공기관용",
      highlight: "완전한 맞춤 솔루션",
      features: [
        "Business 기능 전체",
        "전용 계정 매니저",
        "팀 협업 무제한",
        "무제한 저장 공간",
        "API 접근 및 통합",
        "맞춤형 AI 모델 학습",
        "고급 승인 워크플로우",
        "SSO/SAML 인증",
        "계약서 맞춤 작성",
        "규정 준수 지원",
        "온프레미스 배포 옵션",
        "24/7 프리미엄 전화 지원",
      ],
      cta: "문의하기",
    },
  ];

  const plans = selectedType === "creator" ? creatorPlans : businessPlans;

  const faqs = [
    { 
      q: "무료 체험이 가능한가요?", 
      a: "네, Free 플랜으로 언제든지 시작하실 수 있습니다. 신용카드 등록 없이 바로 이용 가능하며, 필요할 때 언제든지 유료 플랜으로 업그레이드할 수 있습니다." 
    },
    { 
      q: "크레딧은 무엇인가요?", 
      a: "크레딧은 AI 기능(캐릭터 생성, 이미지 생성, 스타일 변환 등)을 사용할 때 소모되는 단위입니다. Pro는 월 500크레딧, Premium은 월 2000크레딧이 제공되며, 사용하지 않은 크레딧은 다음 달로 이월되지 않습니다." 
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
      q: "Enterprise 플랜은 어떻게 신청하나요?", 
      a: "Enterprise 플랜은 조직의 규모와 요구사항에 따라 맞춤형 견적으로 제공됩니다. '문의하기' 버튼을 클릭하여 영업팀에 연락주시면 1영업일 내 상담해드립니다." 
    },
    { 
      q: "공공기관도 이용할 수 있나요?", 
      a: "네, 관공서, 공공기관, 비영리단체 모두 Business 또는 Enterprise 플랜을 이용하실 수 있습니다. 특히 승인 워크플로우, 버전 관리, 검토 프로세스 등 공공 업무에 필요한 기능이 포함되어 있습니다." 
    },
  ];

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-muted"}`}>
      {/* Header */}
      <div className={`border-b ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-card border-border"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className={theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-700" : ""}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00e5cc]/20 to-[#00b3a6]/20 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-[#00e5cc]" />
          <span className={`text-sm font-bold ${theme === "dark" ? "text-[#00e5cc]" : "text-teal-600"}`}>
            모든 규모에 맞는 요금제
          </span>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black mb-4 ${theme === "dark" ? "text-white" : "text-foreground"}`}>
          성장에 맞춘 유연한 가격
        </h1>
        <p className={`text-lg md:text-xl mb-8 ${theme === "dark" ? "text-gray-300" : "text-foreground"}`}>
          무료로 시작하고, 필요할 때 업그레이드하세요
        </p>

        {/* Type Toggle */}
        <div className={`inline-flex p-1.5 rounded-2xl mb-12 ${
          theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-card border border-border shadow-sm"
        }`}>
          <button
            onClick={() => setSelectedType("creator")}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              selectedType === "creator"
                ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white shadow-lg"
                : theme === "dark"
                ? "text-gray-400 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            작가 요금제
          </button>
          <button
            onClick={() => setSelectedType("business")}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              selectedType === "business"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                : theme === "dark"
                ? "text-gray-400 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4" />
            기업/기관 요금제
          </button>
        </div>
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
                    ? selectedType === "creator"
                      ? theme === "dark"
                        ? "border-[#00e5cc] bg-gray-800 shadow-2xl shadow-[#00e5cc]/20 scale-105"
                        : "border-teal-500 bg-card shadow-2xl scale-105"
                      : theme === "dark"
                      ? "border-blue-500 bg-gray-800 shadow-2xl shadow-blue-500/20 scale-105"
                      : "border-blue-500 bg-card shadow-2xl scale-105"
                    : theme === "dark"
                    ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                    : "border-border bg-card hover:border-border hover:shadow-lg"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mr-1 -mt-1">
                    <div className={`${
                      selectedType === "creator"
                        ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6]"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500"
                    } text-white px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl font-bold text-xs shadow-lg flex items-center gap-1`}>
                      <Star className="w-3 h-3" />
                      인기
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.popular
                    ? selectedType === "creator"
                      ? "bg-gradient-to-br from-[#00e5cc] to-[#00b3a6]"
                      : "bg-gradient-to-br from-blue-500 to-indigo-500"
                    : theme === "dark"
                    ? "bg-gray-700"
                    : "bg-muted"
                }`}>
                  <Icon className={`w-7 h-7 ${
                    plan.popular ? "text-white" : theme === "dark" ? "text-muted-foreground" : "text-muted-foreground"
                  }`} />
                </div>

                {/* Plan Name */}
                <h3 className={`text-2xl font-black mb-2 ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                  {plan.name}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-2">
                  <span className={`text-4xl md:text-5xl font-black ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>

                {/* Highlight */}
                {plan.highlight && (
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-6 ${
                    selectedType === "creator"
                      ? theme === "dark"
                        ? "bg-[#00e5cc]/20 text-[#00e5cc]"
                        : "bg-teal-100 text-teal-700"
                      : theme === "dark"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    {plan.highlight}
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.popular
                          ? selectedType === "creator"
                            ? "bg-[#00e5cc]/20"
                            : "bg-blue-500/20"
                          : theme === "dark"
                          ? "bg-gray-700"
                          : "bg-muted"
                      }`}>
                        <Check className={`w-3 h-3 ${
                          plan.popular
                            ? selectedType === "creator"
                              ? "text-[#00e5cc]"
                              : "text-blue-500"
                            : theme === "dark"
                            ? "text-muted-foreground"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full h-12 font-bold ${
                    plan.popular
                      ? selectedType === "creator"
                        ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white hover:shadow-xl"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl"
                      : theme === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    if (plan.name === "Enterprise") {
                      // Navigate to contact page
                      navigate("/contact");
                    } else {
                      navigate("/signup");
                    }
                  }}
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
        <div className={`rounded-2xl p-8 border text-center ${
          theme === "dark" 
            ? "bg-gray-800 border-gray-700" 
            : "bg-card border-border"
        }`}>
          <h3 className={`font-bold mb-3 ${theme === "dark" ? "text-white" : "text-foreground"}`}>
            모든 플랜에 포함된 기본 기능
          </h3>
          <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
            모든 플랜에는 기본 보안, 정기 업데이트, 커뮤니티 접근이 포함됩니다.
          </p>
          {selectedType === "business" && (
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
              💼 기업 플랜은 <strong>관공서, 공공기관, 비영리단체</strong>도 이용 가능하며,<br />
              <strong>승인 프로세스, 버전 관리, 검토 기능</strong>이 포함되어 안전한 업무 환경을 제공합니다.
            </p>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className={`py-16 ${theme === "dark" ? "bg-gray-800/50" : "bg-muted"}`}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className={`text-3xl md:text-4xl font-black mb-2 text-center ${
            theme === "dark" ? "text-white" : "text-foreground"
          }`}>
            자주 묻는 질문
          </h2>
          <p className={`text-center mb-12 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
            궁금하신 점이 있으신가요?
          </p>
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div
                key={index}
                className={`rounded-2xl border overflow-hidden ${
                  theme === "dark" 
                    ? "bg-gray-800 border-gray-700" 
                    : "bg-card border-border"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left transition-colors hover:bg-opacity-50"
                >
                  <h3 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                    {item.q}
                  </h3>
                  <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ml-4 ${
                    openFaq === index ? "rotate-180" : ""
                  } ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`} />
                </button>
                {openFaq === index && (
                  <div className={`px-6 pb-6 ${theme === "dark" ? "text-gray-300" : "text-foreground"}`}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={`py-20 ${
        selectedType === "creator"
          ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6]"
          : "bg-gradient-to-r from-blue-500 to-indigo-500"
      }`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            {selectedType === "creator" 
              ? "무료로 시작하고 AI 인스타툰의 세계를 경험하세요"
              : "브랜드 마스코트를 생성하고 작가와 협업하세요"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white hover:bg-muted font-bold h-14 px-8"
              style={{ color: selectedType === "creator" ? "#00b3a6" : "#4f46e5" }}
              onClick={() => navigate("/signup")}
            >
              무료로 시작하기
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-2 border-white hover:bg-white/10 font-bold h-14 px-8"
              onClick={() => navigate(selectedType === "creator" ? "/creator" : "/business")}
            >
              더 알아보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
