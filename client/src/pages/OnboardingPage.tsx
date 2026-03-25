import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Wand2,
  Building2,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Palette,
  Target,
  ChevronRight,
  Instagram,
  BarChart3,
  Coffee,
  Laugh,
  BookOpen,
  Star,
  BookMarked,
  HelpCircle,
  Zap,
  Rocket,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Check,
  Globe,
  FileText,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const olliLogo = "/favicon.png";
type UserType = "creator" | "business" | null;
type CreatorPurpose = "daily" | "humor" | "info" | "review" | "story" | "etc";
type BusinessPurpose = "mascot" | "content" | "campaign" | "collab" | "brand" | "etc";
type ExperienceLevel = "beginner" | "intermediate" | "expert";
type BrandSize = "startup" | "small" | "medium" | "enterprise";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [purpose, setPurpose] = useState<string>("");
  const [experience, setExperience] = useState<ExperienceLevel | "">("");
  const [brandSize, setBrandSize] = useState<BrandSize | "">("");

  const totalSteps = userType === "creator" ? 4 : 4;

  const handleUserTypeSelect = (type: "creator" | "business") => {
    setUserType(type);
    setStep(2);
  };

  const handleComplete = () => {
    if (userType === "creator") {
      navigate("/creator/dashboard");
    } else if (userType === "business") {
      navigate("/business/dashboard");
    }
  };

  const handleSkip = () => {
    if (userType === "creator") {
      navigate("/creator/dashboard");
    } else if (userType === "business") {
      navigate("/business/dashboard");
    } else {
      navigate("/creator/dashboard");
    }
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden bg-muted">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header with Logo & Progress */}
        <div className="mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={olliLogo}
                  alt="OLLI"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-transparent bg-clip-text">
                OLLI
              </span>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                  index + 1 < step
                    ? userType === "creator"
                      ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : index + 1 === step
                    ? userType === "creator"
                      ? "bg-teal-100 dark:bg-[#00e5cc]/20 text-teal-600 dark:text-[#00e5cc] border-2 border-teal-500 dark:border-[#00e5cc]"
                      : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-2 border-blue-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {index + 1 < step ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-12 h-1 mx-1 rounded-full transition-all ${
                    index + 1 < step
                      ? userType === "creator"
                        ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6]"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Progress Info */}
          <div className="flex items-center justify-between max-w-md mx-auto px-4">
            <p className="text-sm font-semibold text-muted-foreground">
              {step}/{totalSteps} 단계
            </p>
            <button
              onClick={handleSkip}
              className="text-sm font-semibold transition-colors text-muted-foreground hover:text-foreground"
            >
              건너뛰기 →
            </button>
          </div>
        </div>

        {/* Step 1: User Type Selection */}
        {step === 1 && (
          <div className="rounded-3xl shadow-xl p-8 md:p-12 border bg-card border-border">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-black mb-3 text-foreground">
                OLLI에 오신 것을 환영합니다! 👋
              </h1>
              <p className="text-lg text-foreground">
                어떤 목적으로 사용하시나요?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Creator Card */}
              <button
                onClick={() => handleUserTypeSelect("creator")}
                className="group relative rounded-2xl p-8 transition-all border-2 text-left overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-500 hover:shadow-2xl dark:from-transparent dark:to-transparent dark:bg-card dark:border-border dark:hover:border-[#00e5cc] dark:hover:shadow-[#00e5cc]/20"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00e5cc]/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-foreground">
                    작가 / 크리에이터
                  </h3>
                  <p className="mb-6 leading-relaxed text-foreground">
                    AI로 인스타툰을 쉽게 만들고,
                    <br />
                    광고 협업으로 수익을 창출하세요
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400">
                      <Palette className="w-5 h-5" />
                      캐릭터 생성
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                      <Instagram className="w-5 h-5" />
                      툰 제작
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400">
                      <TrendingUp className="w-5 h-5" />
                      수익화
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#00e5cc] font-bold text-sm group-hover:translate-x-2 transition-transform">
                    시작하기 <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Business Card */}
              <button
                onClick={() => handleUserTypeSelect("business")}
                className="group relative rounded-2xl p-8 transition-all border-2 text-left overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-500 hover:shadow-2xl dark:from-transparent dark:to-transparent dark:bg-card dark:border-border dark:hover:shadow-blue-500/20"
              >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 text-foreground">
                    기업 / 기관
                  </h3>
                  <p className="mb-6 leading-relaxed text-foreground">
                    브랜드 마스코트를 생성하고,
                    <br />
                    작가와 협업하여 콘텐츠를 제작하세요
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                      <Sparkles className="w-5 h-5" />
                      마스코트
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                      <Palette className="w-5 h-5" />
                      콘텐츠
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                      <Users className="w-5 h-5" />
                      협업
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 font-bold text-sm group-hover:translate-x-2 transition-transform">
                    시작하기 <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Purpose Selection - Creator */}
        {step === 2 && userType === "creator" && (
          <div className="rounded-3xl shadow-xl p-8 md:p-12 border bg-card border-border">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-foreground">
                어떤 콘텐츠를 만들고 싶으세요?
              </h2>
              <p className="text-lg text-foreground">
                주로 만들 콘텐츠 유형을 선택해주세요
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { id: "daily", label: "일상 / 에세이툰", desc: "일상적인 이야기", icon: Coffee, color: "amber" },
                { id: "humor", label: "개그 / 유머툰", desc: "재미있는 콘텐츠", icon: Laugh, color: "yellow" },
                { id: "info", label: "정보 / 지식툰", desc: "유용한 정보 전달", icon: BookOpen, color: "blue" },
                { id: "review", label: "리뷰 / 후기툰", desc: "제품 및 서비스 리뷰", icon: Star, color: "purple" },
                { id: "story", label: "스토리 / 연재툰", desc: "연속성 있는 이야기", icon: BookMarked, color: "pink" },
                { id: "etc", label: "기타 / 아직 모르겠어요", desc: "탐색 중입니다", icon: HelpCircle, color: "gray" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPurpose(item.id);
                    setStep(3);
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all text-left group ${
                    purpose === item.id
                      ? "border-teal-500 dark:border-[#00e5cc] bg-teal-50 dark:bg-[#00e5cc]/10 shadow-lg dark:shadow-[#00e5cc]/20"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      purpose === item.id
                        ? "bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] scale-105 shadow-lg"
                        : "bg-muted group-hover:bg-teal-100 dark:group-hover:bg-muted/80"
                    }`}>
                      <item.icon className={`w-7 h-7 ${
                        purpose === item.id
                          ? "text-white"
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 text-foreground">
                        {item.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    {purpose === item.id && (
                      <CheckCircle2 className="w-6 h-6 text-[#00e5cc] flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className=""
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!purpose}
                className="bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Purpose Selection - Business */}
        {step === 2 && userType === "business" && (
          <div className="rounded-3xl shadow-xl p-8 md:p-12 border bg-card border-border">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-foreground">
                주요 활용 목적은 무엇인가요?
              </h2>
              <p className="text-lg text-foreground">
                OLLI를 어떻게 활용하실 계획인가요?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { id: "mascot", label: "브랜드 마스코트 생성", desc: "AI로 마스코트 제작", icon: Palette },
                { id: "content", label: "브랜드 콘텐츠 제작", desc: "SNS 콘텐츠 생산", icon: Sparkles },
                { id: "campaign", label: "마케팅 캠페인 운영", desc: "캠페인 관리", icon: Target },
                { id: "collab", label: "작가 협업 관리", desc: "크리에이터와 협업", icon: Users },
                { id: "brand", label: "브랜드 자산 구축", desc: "일관된 자산 관리", icon: Shield },
                { id: "etc", label: "기타 / 탐색 중", desc: "다양한 용도 검토", icon: HelpCircle },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPurpose(item.id);
                    setStep(3);
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all text-left group ${
                    purpose === item.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-lg dark:shadow-blue-500/20"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      purpose === item.id
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 scale-105 shadow-lg"
                        : "bg-muted group-hover:bg-blue-100 dark:group-hover:bg-muted/80"
                    }`}>
                      <item.icon className={`w-7 h-7 ${
                        purpose === item.id
                          ? "text-white"
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 text-foreground">
                        {item.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    {purpose === item.id && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className=""
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!purpose}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Experience Level - Creator */}
        {step === 3 && userType === "creator" && (
          <div className="rounded-3xl shadow-xl p-8 md:p-12 border bg-card border-border">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-foreground">
                경험 수준을 알려주세요
              </h2>
              <p className="text-lg text-foreground">
                맞춤형 가이드를 제공해드릴게요
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { id: "beginner", label: "초보자", desc: "처음 시작합니다", detail: "기본부터 차근차근", icon: Zap },
                { id: "intermediate", label: "중급자", desc: "어느정도 해봤어요", detail: "실전 팁 위주로", icon: TrendingUp },
                { id: "expert", label: "전문가", desc: "경험이 많습니다", detail: "고급 기능 중심", icon: Star },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setExperience(item.id as ExperienceLevel);
                    setStep(4);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all text-center group ${
                    experience === item.id
                      ? "border-teal-500 dark:border-[#00e5cc] bg-teal-50 dark:bg-[#00e5cc]/10 shadow-lg dark:shadow-[#00e5cc]/20"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${
                    experience === item.id
                      ? "bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] scale-110 shadow-lg"
                      : "bg-muted group-hover:bg-teal-100 dark:group-hover:bg-muted/80"
                  }`}>
                    <item.icon className={`w-8 h-8 ${
                      experience === item.id
                        ? "text-white"
                        : "text-muted-foreground"
                    }`} />
                  </div>
                  <h3 className="text-xl font-black mb-2 text-foreground">
                    {item.label}
                  </h3>
                  <p className="text-sm mb-2 text-foreground">
                    {item.desc}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.detail}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className=""
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!experience}
                className="bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Brand Size - Business */}
        {step === 3 && userType === "business" && (
          <div className="rounded-3xl shadow-xl p-8 md:p-12 border bg-card border-border">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3 text-foreground">
                조직 규모를 알려주세요
              </h2>
              <p className="text-lg text-foreground">
                최적의 플랜과 기능을 추천해드릴게요
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { id: "startup", label: "스타트업", desc: "10명 미만", icon: Rocket },
                { id: "small", label: "소기업", desc: "10-50명", icon: Building2 },
                { id: "medium", label: "중기업", desc: "50-500명", icon: BarChart3 },
                { id: "enterprise", label: "대기업/공공기관", desc: "500명 이상", icon: Shield },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setBrandSize(item.id as BrandSize);
                    setStep(4);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left group ${
                    brandSize === item.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-lg dark:shadow-blue-500/20"
                      : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      brandSize === item.id
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 scale-105 shadow-lg"
                        : "bg-muted group-hover:bg-blue-100 dark:group-hover:bg-muted/80"
                    }`}>
                      <item.icon className={`w-7 h-7 ${
                        brandSize === item.id
                          ? "text-white"
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1 text-foreground">
                        {item.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    {brandSize === item.id && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className=""
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                이전
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!brandSize}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <div className="rounded-3xl shadow-xl p-8 md:p-12 text-center border bg-card border-border">
            {/* Success Animation */}
            <div className="mb-8 flex justify-center">
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
                userType === "creator"
                  ? "bg-gradient-to-br from-[#00e5cc]/20 to-[#00b3a6]/20"
                  : "bg-gradient-to-br from-blue-500/20 to-indigo-500/20"
              }`}>
                {/* Pulse effect */}
                <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                  userType === "creator"
                    ? "bg-[#00e5cc]"
                    : "bg-blue-500"
                }`} />
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${
                  userType === "creator"
                    ? "bg-gradient-to-br from-[#00e5cc] to-[#00b3a6]"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500"
                }`}>
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-foreground">
                모든 준비가 완료되었습니다! 🎉
              </h2>
              <p className="text-lg mb-6 text-foreground">
                {userType === "creator"
                  ? "이제 AI와 함께 멋진 인스타툰을 만들어보세요"
                  : "이제 브랜드 마스코트를 생성하고 작가와 협업할 수 있습니다"}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="rounded-2xl p-6 mb-8 text-left bg-muted border border-border">
              <h3 className="text-sm font-bold mb-4 text-muted-foreground">
                선택하신 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl p-4 bg-card">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    계정 유형
                  </p>
                  <p className="font-bold text-foreground">
                    {userType === "creator" ? "작가 / 크리에이터" : "기업 / 기관"}
                  </p>
                </div>
                <div className="rounded-xl p-4 bg-card">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    {userType === "creator" ? "콘텐츠 유형" : "활용 목적"}
                  </p>
                  <p className="font-bold text-foreground">
                    {purpose === "daily" && "일상 / 에세이툰"}
                    {purpose === "humor" && "개그 / 유머툰"}
                    {purpose === "info" && "정보 / 지식툰"}
                    {purpose === "review" && "리뷰 / 후기툰"}
                    {purpose === "story" && "스토리 / 연재툰"}
                    {purpose === "mascot" && "마스코트 생성"}
                    {purpose === "content" && "콘텐츠 제작"}
                    {purpose === "campaign" && "캠페인 운영"}
                    {purpose === "collab" && "작가 협업"}
                    {purpose === "brand" && "브랜드 자산"}
                    {purpose === "etc" && "기타"}
                  </p>
                </div>
                <div className="rounded-xl p-4 bg-card">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    {userType === "creator" ? "경험 수준" : "조직 규모"}
                  </p>
                  <p className="font-bold text-foreground">
                    {experience === "beginner" && "초보자"}
                    {experience === "intermediate" && "중급자"}
                    {experience === "expert" && "전문가"}
                    {brandSize === "startup" && "스타트업"}
                    {brandSize === "small" && "소기업"}
                    {brandSize === "medium" && "중기업"}
                    {brandSize === "enterprise" && "대기업/공공기관"}
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                다음 단계
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                {userType === "creator" ? (
                  <>
                    <div className="rounded-xl p-4 border bg-muted border-border">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-teal-100 dark:bg-teal-500/20">
                        <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h4 className="font-bold mb-1 text-foreground">
                        캐릭터 생성
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        AI로 나만의 캐릭터 만들기
                      </p>
                    </div>
                    <div className="rounded-xl p-4 border bg-muted border-border">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-teal-100 dark:bg-teal-500/20">
                        <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h4 className="font-bold mb-1 text-foreground">
                        스토리 제작
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        툰 에디터로 작품 완성
                      </p>
                    </div>
                    <div className="rounded-xl p-4 border bg-muted border-border">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-teal-100 dark:bg-teal-500/20">
                        <DollarSign className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h4 className="font-bold mb-1 text-foreground">
                        수익 창출
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        광고 협업 기회 탐색
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl p-4 border bg-muted border-border">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-100 dark:bg-blue-500/20">
                        <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold mb-1 text-foreground">
                        마스코트 생성
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        브랜드 마스코트 AI 생성
                      </p>
                    </div>
                    <div className="rounded-xl p-4 border bg-muted border-border">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-100 dark:bg-blue-500/20">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold mb-1 text-foreground">
                        작가 탐색
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        최적의 크리에이터 발굴
                      </p>
                    </div>
                    <div className="rounded-xl p-4 border bg-muted border-border">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-blue-100 dark:bg-blue-500/20">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold mb-1 text-foreground">
                        캠페인 시작
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        마케팅 캠페인 관리
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleComplete}
              className={`w-full h-14 text-lg font-bold shadow-xl ${
                userType === "creator"
                  ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6]"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
              } text-white`}
            >
              <Rocket className="w-5 h-5 mr-2" />
              대시보드로 이동
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
