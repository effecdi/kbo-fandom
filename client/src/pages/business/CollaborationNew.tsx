import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  FileText,
  Calendar,
  DollarSign,
  Target,
  Users,
  Info,
  ArrowRight,
  Building2,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function CollaborationNew() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Form state
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [contentType, setContentType] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [targetGenre, setTargetGenre] = useState<string[]>([]);

  const contentTypes = [
    { id: "instatoon", label: "인스타툰", emoji: "📱" },
    { id: "campaign", label: "캠페인 콘텐츠", emoji: "📢" },
    { id: "event", label: "행사/이벤트", emoji: "🎉" },
    { id: "policy", label: "정책 홍보", emoji: "📋" },
    { id: "news", label: "카드뉴스", emoji: "📰" },
    { id: "story", label: "스토리텔링", emoji: "✨" },
  ];

  const genres = [
    "일상툰", "정보툰", "에세이툰", "개그툰", 
    "공감툰", "교육툰", "비즈니스툰", "공공홍보툰"
  ];

  const toggleContentType = (type: string) => {
    if (contentType.includes(type)) {
      setContentType(contentType.filter(t => t !== type));
    } else {
      setContentType([...contentType, type]);
    }
  };

  const toggleGenre = (genre: string) => {
    if (targetGenre.includes(genre)) {
      setTargetGenre(targetGenre.filter(g => g !== genre));
    } else {
      setTargetGenre([...targetGenre, genre]);
    }
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            작가 협업 프로젝트 만들기
          </h1>
          <p className="text-muted-foreground">
            프로젝트 요구사항을 작성하면 AI가 최적의 작가를 추천해드립니다
          </p>
        </div>

        {/* Steps */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "프로젝트 정보" },
              { num: 2, label: "예산 & 일정" },
              { num: 3, label: "작가 매칭" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s.num
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`font-semibold ${
                      step >= s.num ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      step > s.num ? "bg-purple-600" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Project Info */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Info Notice */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">관공서·기관 프로젝트 안내</p>
                  <p>
                    구체적인 요구사항을 작성할수록 더 적합한 작가를 매칭할 수 있습니다. 
                    내부 검토 및 승인 프로세스를 고려하여 일정을 설정해주세요.
                  </p>
                </div>
              </div>
            </div>

            {/* Project Title */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <label className="block text-sm font-bold text-foreground mb-2">
                프로젝트 제목 *
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="예: 2024 봄 축제 홍보 인스타툰 제작"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Content Type */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <label className="block text-sm font-bold text-foreground mb-4">
                콘텐츠 유형 * (복수 선택 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleContentType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      contentType.includes(type.id)
                        ? "border-purple-600"
                        : "border-border hover:border-purple-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.emoji}</div>
                    <div className="text-sm font-semibold text-foreground">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <label className="block text-sm font-bold text-foreground mb-2">
                프로젝트 상세 설명 *
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="프로젝트의 목적, 타겟 대상, 원하는 톤앤매너, 핵심 메시지 등을 구체적으로 작성해주세요.&#10;&#10;예시:&#10;- 목적: 지역 봄 축제 홍보 및 참여 유도&#10;- 대상: 20-40대 지역 주민 및 관광객&#10;- 톤앤매너: 친근하고 따뜻한 느낌&#10;- 핵심 메시지: 가족 단위 방문 환영, 다양한 체험 프로그램 강조"
                rows={10}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
              <p className="text-sm text-muted-foreground mt-2">
                목적, 타겟, 톤앤매너, 핵심 메시지를 포함하면 더 정확한 매칭이 가능합니다
              </p>
            </div>

            {/* Target Genre */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <label className="block text-sm font-bold text-foreground mb-4">
                선호하는 작가 장르 (선택)
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      targetGenre.includes(genre)
                        ? "bg-purple-600 text-white"
                        : "bg-muted text-foreground hover:bg-muted"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8"
                onClick={() => setStep(2)}
                disabled={!projectTitle || !projectDescription || contentType.length === 0}
              >
                다음 단계
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Schedule */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Info Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">예산 및 일정 안내</p>
                  <p>
                    관공서·기관의 경우 내부 결재 및 검토 기간을 고려하여 
                    넉넉한 일정을 설정하시는 것을 권장합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <label className="block text-sm font-bold text-foreground mb-4">
                예산 범위 *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: "100-300", label: "100만원 - 300만원", desc: "소규모 프로젝트" },
                  { value: "300-500", label: "300만원 - 500만원", desc: "중규모 프로젝트" },
                  { value: "500-1000", label: "500만원 - 1,000만원", desc: "대규모 프로젝트" },
                  { value: "1000+", label: "1,000만원 이상", desc: "대형 캠페인" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBudget(option.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      budget === option.value
                        ? "border-purple-600"
                        : "border-border hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <DollarSign className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        budget === option.value ? "text-purple-600" : "text-muted-foreground"
                      }`} />
                      <div>
                        <div className="font-bold text-foreground mb-1">
                          {option.label}
                        </div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <label className="block text-sm font-bold text-foreground mb-4">
                희망 완료 시기 *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {[
                  { value: "urgent", label: "긴급 (2주 이내)", icon: "🚀" },
                  { value: "normal", label: "보통 (1개월 이내)", icon: "📅" },
                  { value: "flexible", label: "여유 (2개월 이상)", icon: "🌱" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDeadline(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      deadline === option.value
                        ? "border-purple-600"
                        : "border-border hover:border-purple-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-semibold text-foreground">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  구체적인 마감일 (선택)
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <label className="block text-sm font-bold text-foreground mb-2">
                추가 요구사항 (선택)
              </label>
              <textarea
                placeholder="기타 협업 시 고려해야 할 사항이 있다면 작성해주세요.&#10;&#10;예시:&#10;- 내부 검토 및 승인 프로세스 2회 예정&#10;- 수정 요청 최대 3회까지 가능&#10;- 저작권 및 2차 사용 권리 협의 필요"
                rows={6}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
              >
                이전
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8"
                onClick={() => navigate("/business/collaboration/matching")}
                disabled={!budget || !deadline}
              >
                작가 매칭 시작
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
