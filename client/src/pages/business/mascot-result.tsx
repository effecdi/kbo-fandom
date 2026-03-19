import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  Download,
} from "lucide-react";

const workflowSteps = [
  { label: "AI 생성", icon: Sparkles, description: "마스코트 이미지 생성 완료" },
  { label: "시안 저장", icon: Download, description: "갤러리에 시안 저장" },
  { label: "내부 검토", icon: Eye, description: "팀 내부 피드백 수집" },
  { label: "승인 대기", icon: Clock, description: "최종 승인 대기 중" },
  { label: "확정본", icon: CheckCircle2, description: "브랜드 마스코트 확정" },
];

export default function BusinessMascotResultPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  // URL에서 characterId 가져오기
  const params = new URLSearchParams(window.location.search);
  const characterId = params.get("characterId");

  const { data: character } = useQuery<{
    id: number;
    imageUrl: string;
    prompt: string;
    style: string;
  }>({
    queryKey: [`/api/gallery/${characterId}`],
    enabled: !!characterId,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/business/mascot")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          마스코트 생성으로 돌아가기
        </button>
        <h1 className="text-2xl font-bold tracking-tight">마스코트 생성 결과</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          생성된 마스코트를 확인하고 워크플로우를 진행하세요
        </p>
      </div>

      {/* Workflow Tracker */}
      <div className="bg-card rounded-2xl border p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-6">워크플로우 진행 상황</h2>
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    index <= currentStep
                      ? "bg-indigo-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <p className={`text-[13px] font-semibold ${
                  index <= currentStep ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
                <p className="text-[13px] text-muted-foreground mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
              {index < workflowSteps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  index < currentStep ? "bg-indigo-600" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Generated Mascot */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">생성된 마스코트</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Main result */}
              <div className="relative group">
                <div className="aspect-square bg-muted/50 rounded-xl overflow-hidden">
                  {character?.imageUrl ? (
                    <img
                      src={character.imageUrl}
                      alt="생성된 마스코트"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[13px] font-semibold rounded-full">
                    메인
                  </span>
                </div>
              </div>

              {/* Additional generation slots */}
              {[1, 2, 3].map((slot) => (
                <div
                  key={slot}
                  onClick={() => navigate("/business/mascot")}
                  className="aspect-square bg-muted/30 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-muted/50 transition-all"
                >
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[13px] text-muted-foreground">추가 생성</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          {/* Mascot Info */}
          {character && (
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="text-sm font-bold text-foreground mb-4">마스코트 정보</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[13px] text-muted-foreground">프롬프트</p>
                  <p className="text-sm text-foreground mt-1">{character.prompt}</p>
                </div>
                <div>
                  <p className="text-[13px] text-muted-foreground">스타일</p>
                  <p className="text-sm text-foreground mt-1">{character.style}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">액션</h3>
            <div className="space-y-3">
              {currentStep < workflowSteps.length - 1 && (
                <Button
                  onClick={() => setCurrentStep((s) => Math.min(s + 1, workflowSteps.length - 1))}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                >
                  다음 단계로
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate("/business/mascot")}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 생성하기
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                대시보드로 이동
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
