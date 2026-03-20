import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Sparkles,
  Upload,
  Building2,
  Target,
  Palette,
  Lightbulb,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MascotNew() {
  const [brandName, setBrandName] = useState("");
  const [concept, setConcept] = useState("");
  const [tone, setTone] = useState<string[]>([]);
  const [purpose, setPurpose] = useState<string[]>([]);

  const tones = [
    "친근한", "전문적인", "혁신적인", "따뜻한",
    "활기찬", "신뢰감있는", "재미있는", "세련된"
  ];

  const purposes = [
    "SNS 마케팅", "제품 홍보", "브랜드 인지도", 
    "고객 소통", "이벤트", "캠페인"
  ];

  const toggleTone = (t: string) => {
    if (tone.includes(t)) {
      setTone(tone.filter(item => item !== t));
    } else {
      setTone([...tone, t]);
    }
  };

  const togglePurpose = (p: string) => {
    if (purpose.includes(p)) {
      setPurpose(purpose.filter(item => item !== p));
    } else {
      setPurpose([...purpose, p]);
    }
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            브랜드/공공 마스코트 생성
          </h1>
          <p className="text-muted-foreground">
            AI로 초안을 만든 후 검토·수정·승인 과정을 거쳐 확정본을 완성하세요
          </p>
          <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">관공서·기관을 위한 안전한 프로세스</p>
                <p>AI 생성 → 시안 저장 → 내부 검토 → 수정 → 승인 대기 → 확정본 완성</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brand Info */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-6">
                브랜드 정보
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-foreground mb-2">
                  브랜드명
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="예: 올리, ABC 브랜드..."
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-foreground mb-2">
                  마스코트 컨셉 설명
                </label>
                <textarea
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="어떤 마스코트를 만들고 싶으신가요?&#10;예: 귀여운 곰돌이 캐릭터, 활기찬 느낌, 파란색 계열, 친근하고 다가가기 쉬운 이미지"
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  외형, 색상, 느낌을 구체적으로 설명할수록 좋아요
                </p>
              </div>
            </div>

            {/* Tone & Manner */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-6">
                톤앤매너 (복수 선택 가능)
              </h2>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTone(t)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      tone.includes(t)
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-6">
                활용 목적 (복수 선택 가능)
              </h2>
              <div className="flex flex-wrap gap-2">
                {purposes.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePurpose(p)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      purpose.includes(p)
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-6">
                참고 이미지 (선택사항)
              </h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">
                  브랜드 로고나 참고 이미지 업로드
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG 지원 · 최대 10MB
                </p>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
              disabled={!brandName || !concept}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              마스코트 생성하기
            </Button>
          </div>

          {/* Right - Guide */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-foreground">생성 팁</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span className="text-sm text-foreground">
                    브랜드 정체성과 일치하는 컨셉을 선택하세요
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span className="text-sm text-foreground">
                    타겟 고객층의 취향을 고려해보세요
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span className="text-sm text-foreground">
                    여러 번 생성해서 최적의 결과를 찾으세요
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span className="text-sm text-foreground">
                    생성 후 전문 작가에게 협업 의뢰 가능
                  </span>
                </li>
              </ul>
            </div>

            {/* Examples */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-bold text-foreground mb-4">예시 컨셉</h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-muted rounded-xl text-left hover:bg-muted transition-all">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    🐻 식품 브랜드
                  </p>
                  <p className="text-xs text-muted-foreground">
                    귀여운 곰돌이, 따뜻한 느낌, 갈색 계열
                  </p>
                </button>
                <button className="w-full p-4 bg-muted rounded-xl text-left hover:bg-muted transition-all">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    🚀 IT 스타트업
                  </p>
                  <p className="text-xs text-muted-foreground">
                    미래적인 로봇, 혁신적인 느낌, 파란색
                  </p>
                </button>
                <button className="w-full p-4 bg-muted rounded-xl text-left hover:bg-muted transition-all">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    🌿 친환경 브랜드
                  </p>
                  <p className="text-xs text-muted-foreground">
                    자연 친화적 동물, 부드러운 느낌, 녹색
                  </p>
                </button>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-bold text-foreground mb-4">마스코트의 가치</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      브랜드 자산
                    </p>
                    <p className="text-xs text-muted-foreground">
                      장기적으로 활용 가능한 브랜드 IP
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      고객 친밀감
                    </p>
                    <p className="text-xs text-muted-foreground">
                      친근한 이미지로 고객과 소통
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Palette className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      다양한 활용
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SNS, 제품, 이벤트 등 다방면 사용
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-foreground">다음 단계</h3>
              </div>
              <p className="text-sm text-foreground mb-4">
                마스코트 생성 후 직접 콘텐츠를 제작하거나, 전문 작가와 협업하여 더 풍부한 스토리로 확장할 수 있습니다.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                작가 협업 알아보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
