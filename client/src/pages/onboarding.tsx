import { useState } from "react";
import { useLocation } from "wouter";
import {
  Wand2,
  Building2,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp,
  Palette,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/use-user-role";
import logoImg from "@assets/logo.png";

type UserType = "creator" | "business" | null;

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { setRole, setOnboardingData } = useUserRole();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [purpose, setPurpose] = useState("");
  const [experience, setExperience] = useState("");
  const [brandSize, setBrandSize] = useState("");

  const totalSteps = 4;
  const progressPercentage = (step / totalSteps) * 100;

  const handleUserTypeSelect = (type: "creator" | "business") => {
    setUserType(type);
    setStep(2);
  };

  const handleComplete = () => {
    if (userType) {
      setRole(userType);
      setOnboardingData({
        purpose,
        ...(userType === "creator" ? { experience } : { brandSize }),
      });
      if (userType === "creator") {
        navigate("/");
      } else {
        navigate("/business/dashboard");
      }
    }
  };

  const handleSkip = () => {
    setRole("creator");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </div>

      <div className="max-w-5xl w-full relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative h-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 px-1">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {step} / {totalSteps} 단계
            </p>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold transition-colors"
            >
              건너뛰기 →
            </button>
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-lg">
            <img src={logoImg} alt="OLLI" className="w-16 h-16 object-contain rounded-md" />
            <span className="text-4xl font-black text-primary">
              OLLI
            </span>
          </div>
        </div>

        {/* Step 1: User Type Selection */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white">
                반갑습니다! 👋
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                어떤 목적으로 OLLI를 사용하시나요?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Creator Card */}
              <button
                onClick={() => handleUserTypeSelect("creator")}
                className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-2xl p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-600 text-left"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  작가 / 크리에이터
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  AI로 인스타툰을 쉽게 만들고,<br />
                  광고 협업 기회까지 연결하고 싶어요
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                    <Palette className="w-3 h-3" /> 캐릭터 생성
                  </span>
                  <span className="inline-flex items-center gap-1 bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full text-sm font-semibold">
                    <Sparkles className="w-3 h-3" /> 툰 제작
                  </span>
                  <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
                    <TrendingUp className="w-3 h-3" /> 수익화
                  </span>
                </div>
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-purple-600" />
                </div>
              </button>

              {/* Business Card */}
              <button
                onClick={() => handleUserTypeSelect("business")}
                className="group relative bg-primary/5 rounded-2xl p-8 hover:shadow-2xl transition-all border-2 border-transparent hover:border-primary text-left"
              >
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  기업 / 브랜드
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  브랜드 마스코트를 만들고,<br />
                  필요시 인스타툰 작가와 협업하고 싶어요
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    <Sparkles className="w-3 h-3" /> 마스코트 생성
                  </span>
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    <Palette className="w-3 h-3" /> 콘텐츠 제작
                  </span>
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    <Users className="w-3 h-3" /> 작가 협업
                  </span>
                </div>
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Creator Purpose */}
        {step === 2 && userType === "creator" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white">
                어떤 툰을 만들고 싶으세요?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                가장 관심있는 분야를 선택해주세요
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { id: "daily", label: "일상 / 에세이툰", emoji: "☕" },
                { id: "humor", label: "개그 / 유머툰", emoji: "😂" },
                { id: "info", label: "정보 / 지식툰", emoji: "📚" },
                { id: "review", label: "리뷰 / 후기툰", emoji: "⭐" },
                { id: "story", label: "스토리 / 연재툰", emoji: "📖" },
                { id: "etc", label: "기타 / 아직 모르겠어요", emoji: "🤔" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setPurpose(item.id); setStep(3); }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left hover:border-purple-600 hover:shadow-lg ${
                    purpose === item.id ? "border-purple-600 bg-purple-50 dark:bg-purple-950/50" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="border-2">이전</Button>
              <Button onClick={() => setStep(3)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                다음 <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Business Purpose */}
        {step === 2 && userType === "business" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white">
                어떤 용도로 사용하시나요?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                주요 활용 목적을 선택해주세요
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { id: "mascot", label: "브랜드 마스코트 생성", emoji: "🎨" },
                { id: "content", label: "브랜드 콘텐츠 제작", emoji: "✨" },
                { id: "campaign", label: "마케팅 캠페인 운영", emoji: "📢" },
                { id: "collab", label: "작가 협업 관리", emoji: "🤝" },
                { id: "brand", label: "브랜드 자산 구축", emoji: "🏆" },
                { id: "etc", label: "기타 / 탐색 중", emoji: "🤔" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setPurpose(item.id); setStep(3); }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left hover:border-primary hover:shadow-lg ${
                    purpose === item.id ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="border-2">이전</Button>
              <Button onClick={() => setStep(3)}>
                다음 <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Creator Experience */}
        {step === 3 && userType === "creator" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white">
                경험 수준은 어느 정도인가요?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                당신의 경험 수준을 선택해주세요
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { id: "beginner", label: "초보자", emoji: "👶" },
                { id: "intermediate", label: "중급자", emoji: "🎓" },
                { id: "expert", label: "전문가", emoji: "🏆" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setExperience(item.id); setStep(4); }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left hover:border-purple-600 hover:shadow-lg ${
                    experience === item.id ? "border-purple-600 bg-purple-50 dark:bg-purple-950/50" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="border-2">이전</Button>
              <Button onClick={() => setStep(4)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                다음 <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Business Budget */}
        {step === 3 && userType === "business" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white">
                예산은 어느 정도인가요?
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                예산 범위를 선택해주세요
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                { id: "small", label: "작은 예산", emoji: "💸" },
                { id: "medium", label: "중간 예산", emoji: "💰" },
                { id: "large", label: "큰 예산", emoji: "💎" },
                { id: "custom", label: "커스텀 예산", emoji: "🔧" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setBrandSize(item.id); setStep(4); }}
                  className={`p-6 rounded-2xl border-2 transition-all text-left hover:border-primary hover:shadow-lg ${
                    brandSize === item.id ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{item.emoji}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="border-2">이전</Button>
              <Button onClick={() => setStep(4)}>
                다음 <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <img src={logoImg} alt="OLLI" className="w-24 h-24 object-contain rounded-md" />
              </div>
            </div>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/50 rounded-full px-6 py-3 mb-6">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-bold">준비 완료!</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white">
                {userType === "creator"
                  ? "멋진 작품을 만들 준비가 되었어요!"
                  : "브랜드 자산을 만들 준비가 되었어요!"}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
                {userType === "creator"
                  ? "이제 AI와 함께 당신의 이야기를 인스타툰으로 만들어보세요"
                  : "마스코트 생성부터 작가 협업까지, AI가 도와드릴게요"}
              </p>
            </div>

            {userType === "creator" && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-50 dark:bg-purple-950/50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">AI 생성</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1분만에 캐릭터 완성</p>
                </div>
                <div className="bg-pink-50 dark:bg-pink-950/50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">인스타 최적화</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">바로 업로드 가능</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">수익화</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">광고 협업 연결</p>
                </div>
              </div>
            )}

            {userType === "business" && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-primary/5 rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">마스코트 생성</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1분만에 브랜드 자산 완성</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">콘텐츠 제작</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">직접 만들고 관리</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">작가 협업</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">확장 시 전문가 매칭</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                onClick={handleComplete}
                className={`${
                  userType === "creator"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : ""
                } text-white text-lg px-12 py-6`}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                시작하기
              </Button>
              <button
                onClick={() => setStep(2)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold text-sm"
              >
                이전으로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
