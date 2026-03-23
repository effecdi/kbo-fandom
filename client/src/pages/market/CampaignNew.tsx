import { useState } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Target,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addItem,
  generateId,
  seedIfEmpty,
  STORE_KEYS,
  type Campaign,
} from "@/lib/local-store";

const steps = [
  { id: 1, label: "기본 정보", icon: FileText },
  { id: 2, label: "타겟/조건", icon: Target },
  { id: 3, label: "예산/일정", icon: CalendarDays },
];

const genreOptions = ["웹툰", "일러스트", "캐릭터 디자인", "만화", "애니메이션", "GIF/모션"];
const toneOptions = ["밝은/경쾌", "세련된/모던", "따뜻한/감성적", "유머러스", "진지한/심층적", "귀여운/아기자기"];
const ageOptions = ["10대", "20대", "30대", "40대", "50대 이상", "전체"];

export function CampaignNewPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic Info
  const [campaignName, setCampaignName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Target/Conditions
  const [targetAge, setTargetAge] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);

  // Step 3: Budget/Schedule
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter((v) => v !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const handleSubmit = () => {
    if (!campaignName.trim()) {
      alert("캠페인 이름을 입력해 주세요.");
      return;
    }
    if (!budget.trim()) {
      alert("예산을 입력해 주세요.");
      return;
    }
    if (!endDate) {
      alert("종료일을 입력해 주세요.");
      return;
    }

    seedIfEmpty();

    const budgetNum = parseInt(budget.replace(/[^0-9]/g, ""), 10) || 0;

    const newCampaign: Campaign = {
      id: generateId("camp"),
      title: campaignName.trim(),
      description: description.trim() || `${campaignName} 캠페인`,
      brand: brandName.trim() || "내 브랜드",
      status: "recruiting",
      budget: budgetNum,
      deadline: endDate,
      applicants: 0,
      targetAge,
      genre: selectedGenres,
      tone: selectedTones,
      createdAt: new Date().toISOString().split("T")[0],
    };

    addItem<Campaign>(STORE_KEYS.CAMPAIGNS, newCampaign);
    alert("캠페인이 등록되었습니다!");
    navigate("/market/campaigns");
  };

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/market/campaigns")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            캠페인 목록으로
          </button>
          <h1 className="text-3xl font-black text-foreground">새 캠페인 등록</h1>
          <p className="text-muted-foreground mt-1">캠페인 정보를 입력하고 크리에이터를 모집하세요</p>
        </div>

        {/* Step Indicator */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      currentStep === step.id
                        ? "bg-[#00e5cc] text-black"
                        : currentStep > step.id
                          ? "bg-[#00e5cc]/20 text-[#00e5cc]"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p
                      className={`text-sm font-semibold ${
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-4 ${
                      currentStep > step.id ? "bg-[#00e5cc]" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="rounded-2xl border bg-card border-border p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">기본 정보</h2>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  캠페인 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="캠페인 이름을 입력하세요"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  브랜드명
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="브랜드명을 입력하세요"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  캠페인 설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="캠페인의 목적과 내용을 상세히 설명해 주세요"
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Target/Conditions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">타겟 및 조건</h2>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  타겟 연령대
                </label>
                <div className="flex flex-wrap gap-2">
                  {ageOptions.map((age) => (
                    <button
                      key={age}
                      onClick={() => toggleArrayItem(targetAge, setTargetAge, age)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        targetAge.includes(age)
                          ? "bg-[#00e5cc] text-black"
                          : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  장르
                </label>
                <div className="flex flex-wrap gap-2">
                  {genreOptions.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleArrayItem(selectedGenres, setSelectedGenres, genre)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedGenres.includes(genre)
                          ? "bg-[#00e5cc] text-black"
                          : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  톤 & 무드
                </label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => toggleArrayItem(selectedTones, setSelectedTones, tone)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTones.includes(tone)
                          ? "bg-[#00e5cc] text-black"
                          : "bg-muted text-muted-foreground hover:text-foreground border border-border"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget/Schedule */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground mb-4">예산 및 일정</h2>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  예산 (원) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="예: 5000000"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">VAT 별도 금액을 입력해 주세요</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground"
                  />
                </div>
              </div>

              {/* Summary Preview */}
              <div className="rounded-xl bg-muted p-5 border border-border">
                <h3 className="text-sm font-bold text-foreground mb-3">등록 요약</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">캠페인명</span>
                    <span className="text-foreground font-medium">{campaignName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">브랜드</span>
                    <span className="text-foreground font-medium">{brandName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">장르</span>
                    <span className="text-foreground font-medium">
                      {selectedGenres.length > 0 ? selectedGenres.join(", ") : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예산</span>
                    <span className="text-foreground font-medium">{budget ? `${budget}원` : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">기간</span>
                    <span className="text-foreground font-medium">
                      {startDate && endDate ? `${startDate} ~ ${endDate}` : endDate || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 1) {
                  navigate("/market/campaigns");
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? "취소" : "이전"}
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2"
              >
                다음
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2"
              >
                <Check className="w-4 h-4" />
                캠페인 등록
              </Button>
            )}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
