import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Wand2,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Type,
  Zap,
  ArrowRight,
  Info,
  Lightbulb,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type CreationMethod = "text" | "image" | "variation";

const FREE_STYLES = ["simple-line", "minimal", "doodle"];

const styles = [
  { value: "simple-line", label: "심플 라인", description: "깔끔한 두꺼운 선, 미니멀 디테일" },
  { value: "minimal", label: "미니멀", description: "극도로 간결한, 점 눈, 기하학적" },
  { value: "doodle", label: "낙서풍", description: "거칠고 자유로운 펜 낙서" },
  { value: "cute-animal", label: "귀여운 동물", description: "동글동글 동물, 파스텔 컬러" },
  { value: "scribble", label: "구불구불", description: "볼펜으로 끄적끄적 스크리블" },
  { value: "ink-sketch", label: "잉크 스케치", description: "붓펜의 강약 조절, 대담한 먹선" },
];

const examplePrompts = [
  { name: "직장인 캐릭터", description: "30대 남성, 정장 착용, 피곤한 표정, 커피 들고 있음", moods: ["진지한", "유머러스"] },
  { name: "동물 캐릭터", description: "귀여운 곰돌이, 파란색 후드티, 큰 눈, 통통한 체형", moods: ["귀여운", "밝은"] },
];

export function CharacterNew() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<CreationMethod>("text");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState<string[]>([]);
  const [style, setStyle] = useState("simple-line");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState<number | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();

  const { data: usage } = useQuery<{ tier: string; credits: number }>({ queryKey: ["/api/usage"] });
  const isPro = usage?.tier === "pro" || usage?.tier === "premium";
  const isOutOfCredits = !isPro && (usage?.credits ?? 0) <= 0;

  const moods = [
    "밝은", "차분한", "유머러스", "진지한",
    "귀여운", "쿨한", "따뜻한", "시크한"
  ];

  const toggleMood = (m: string) => {
    if (mood.includes(m)) {
      setMood(mood.filter(item => item !== m));
    } else {
      setMood([...mood, m]);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "이미지 파일만 업로드 가능합니다", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "파일 크기 초과", description: "10MB 이하의 이미지를 업로드해주세요.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const promptParts = [name];
      if (mood.length > 0) promptParts.push(`성격: ${mood.join(", ")}`);
      if (description) promptParts.push(description);
      const effectivePrompt = promptParts.join(". ") || (sourceImage ? "이 이미지의 캐릭터를 그대로 재현해주세요" : "");
      const body: any = { prompt: effectivePrompt, style };
      if (sourceImage) body.sourceImageData = sourceImage;
      const res = await apiRequest("POST", "/api/generate-character", body);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl);
      setCharacterId(data.characterId);
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "캐릭터 완성!", description: "캐릭터가 성공적으로 생성되었습니다." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "로그인이 필요합니다", variant: "destructive" });
        setTimeout(() => navigate("/login"), 300);
        return;
      }
      if (/^403/.test(error.message)) {
        toast({ title: "크레딧 부족", description: "오늘의 무료 생성을 모두 사용했습니다.", variant: "destructive" });
        return;
      }
      toast({ title: "생성 실패", description: error.message, variant: "destructive" });
    },
  });

  const canGenerate = (name.trim().length > 0 || description.trim().length > 0 || !!sourceImage);

  const applyExample = (example: typeof examplePrompts[0]) => {
    setName(example.name);
    setDescription(example.description);
    setMood(example.moods);
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            새 캐릭터 만들기
          </h1>
          <p className="text-muted-foreground">
            AI가 당신의 아이디어를 멋진 캐릭터로 만들어드립니다
          </p>
        </div>

        {/* Method Selection */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <h2 className="text-xl font-black text-foreground mb-4">
            생성 방식 선택
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setMethod("text")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "text"
                  ? "border-purple-600 bg-purple-50"
                  : "border-border hover:border-purple-300"
              }`}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Type className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-foreground mb-1">텍스트로 시작</h3>
              <p className="text-sm text-muted-foreground">
                설명만으로 생성
              </p>
            </button>

            <button
              onClick={() => setMethod("image")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "image"
                  ? "border-purple-600 bg-purple-50"
                  : "border-border hover:border-purple-300"
              }`}
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-foreground mb-1">이미지 참고</h3>
              <p className="text-sm text-muted-foreground">
                사진 업로드해서 생성
              </p>
            </button>

            <button
              onClick={() => setMethod("variation")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "variation"
                  ? "border-purple-600 bg-purple-50"
                  : "border-border hover:border-purple-300"
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-foreground mb-1">기존 변형</h3>
              <p className="text-sm text-muted-foreground">
                기존 캐릭터 수정
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-6">
                기본 정보
              </h2>

              {/* Character Name */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-foreground mb-2">
                  캐릭터 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 민지, 토리, 뽀로로..."
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              {/* Mood Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-foreground mb-2">
                  성격/무드 (복수 선택 가능)
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMood(m)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        mood.includes(m)
                          ? "bg-purple-600 text-white"
                          : "bg-muted text-foreground hover:bg-muted"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-foreground mb-2">
                  외형 설명
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="캐릭터의 외모, 특징, 스타일을 자유롭게 설명해주세요.&#10;예: 20대 여성, 긴 생머리, 안경 착용, 캐주얼한 옷차림"
                  rows={6}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  상세할수록 더 정확한 결과를 얻을 수 있어요
                </p>
              </div>

              {/* Style Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-foreground mb-2">
                  그림 스타일
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {styles.map((s) => {
                    const isLocked = !isPro && !FREE_STYLES.includes(s.value);
                    return (
                      <button
                        key={s.value}
                        onClick={() => !isLocked && setStyle(s.value)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        } ${
                          style === s.value
                            ? "border-purple-600 bg-purple-50"
                            : "border-border hover:border-purple-300"
                        }`}
                      >
                        <span className="text-sm font-semibold text-foreground">{s.label}</span>
                        {isLocked && <span className="ml-1 text-xs text-purple-600">Pro</span>}
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Upload */}
              {method === "image" && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    참고 이미지 업로드
                  </label>
                  {sourceImage ? (
                    <div className="relative w-full max-w-[200px]">
                      <img
                        src={sourceImage}
                        alt="참고 이미지"
                        className="w-full aspect-square object-cover rounded-xl border border-border"
                      />
                      <button
                        onClick={() => setSourceImage(null)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-purple-400 transition-all cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">
                        클릭하거나 드래그해서 업로드
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG 지원 · 최대 10MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {/* Generate Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                disabled={!canGenerate || generateMutation.isPending || isOutOfCredits}
                onClick={() => guard(() => generateMutation.mutate())}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    그리는 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    캐릭터 생성하기
                  </>
                )}
              </Button>
              {!isPro && (
                <p className="text-sm text-muted-foreground text-center mt-2">1회 생성 시 2 크레딧 소모</p>
              )}
              {!isPro && isOutOfCredits && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">크레딧이 부족합니다.</p>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/pricing">크레딧 충전</a>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right - Guide / Result */}
          <div className="space-y-6">
            {/* Result Area */}
            {generateMutation.isPending ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">생성 중...</h3>
                <Skeleton className="w-full aspect-square rounded-xl" />
                <div className="flex flex-col items-center gap-2 mt-4">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <p className="text-sm text-muted-foreground">캐릭터를 그리고 있어요...</p>
                  <p className="text-xs text-muted-foreground">15~30초 정도 걸려요</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">생성 결과</h3>
                <div
                  className="w-full overflow-hidden rounded-xl border border-border"
                  style={{
                    backgroundImage: "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                >
                  <img
                    src={generatedImage}
                    alt="Generated character"
                    className="w-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    onClick={() => navigate(`/creator/pose-expression?characterId=${characterId}`)}
                  >
                    포즈 만들기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setGeneratedImage(null);
                      setCharacterId(null);
                    }}
                  >
                    다시 생성하기
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Tips */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-foreground">생성 팁</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="text-sm text-foreground">
                        구체적인 설명일수록 더 정확한 결과가 나와요
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="text-sm text-foreground">
                        성격/무드는 캐릭터의 분위기를 결정해요
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span className="text-sm text-foreground">
                        여러 번 생성해서 마음에 드는 것을 선택하세요
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Examples */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-bold text-foreground mb-4">예시 프롬프트</h3>
                  <div className="space-y-3">
                    {examplePrompts.map((example) => (
                      <button
                        key={example.name}
                        className="w-full p-4 bg-muted rounded-xl text-left hover:bg-muted transition-all"
                        onClick={() => applyExample(example)}
                      >
                        <p className="text-sm font-semibold text-foreground mb-1">
                          {example.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {example.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-foreground">안내</h3>
                  </div>
                  <p className="text-sm text-foreground">
                    생성된 캐릭터는 언제든지 수정하고 다시 생성할 수 있습니다.
                    마음에 드는 결과가 나올 때까지 여러 번 시도해보세요!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </DashboardLayout>
  );
}
