import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Loader2,
  UploadCloud,
  X,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";

const toneOptions = [
  { value: "friendly", label: "친근한" },
  { value: "professional", label: "전문적" },
  { value: "playful", label: "유쾌한" },
  { value: "warm", label: "따뜻한" },
  { value: "modern", label: "모던한" },
  { value: "cute", label: "귀여운" },
];

const purposeOptions = [
  { value: "sns", label: "SNS 콘텐츠" },
  { value: "ad", label: "광고/캠페인" },
  { value: "packaging", label: "패키징" },
  { value: "character-goods", label: "캐릭터 굿즈" },
  { value: "internal", label: "사내 커뮤니케이션" },
  { value: "event", label: "이벤트/프로모션" },
];

const styleOptions = [
  { value: "simple-line", label: "심플 라인", description: "깔끔한 두꺼운 선, 미니멀 디테일" },
  { value: "minimal", label: "미니멀", description: "극도로 간결한, 점 눈, 기하학적" },
  { value: "cute-animal", label: "귀여운 동물", description: "동글동글 동물 캐릭터, 파스텔 컬러" },
  { value: "doodle", label: "낙서풍", description: "자유로운 펜 낙서, 날것의 매력" },
];

export default function BusinessMascotNewPage() {
  const [brandName, setBrandName] = useState("");
  const [concept, setConcept] = useState("");
  const [tones, setTones] = useState<string[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  const [style, setStyle] = useState("simple-line");
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleSelection = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
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
      setSourceImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const canGenerate = brandName.trim().length > 0 && concept.trim().length > 0;

  const generateMutation = useMutation({
    mutationFn: async () => {
      const toneStr = tones.length > 0 ? `톤앤매너: ${tones.map(t => toneOptions.find(o => o.value === t)?.label).join(", ")}. ` : "";
      const purposeStr = purposes.length > 0 ? `활용목적: ${purposes.map(p => purposeOptions.find(o => o.value === p)?.label).join(", ")}. ` : "";
      const prompt = `브랜드명: ${brandName}. 컨셉: ${concept}. ${toneStr}${purposeStr}이 브랜드의 마스코트 캐릭터를 만들어주세요.`;

      const body: any = { prompt, style };
      if (sourceImage) body.sourceImageData = sourceImage;
      const res = await apiRequest("POST", "/api/generate-character", body);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "마스코트 생성 완료!", description: "마스코트가 성공적으로 생성되었습니다." });
      navigate(`/business/mascot/result?characterId=${data.characterId}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "로그인이 필요합니다", description: "로그인 후 다시 시도해주세요.", variant: "destructive" });
        setTimeout(() => navigate("/login"), 300);
        return;
      }
      if (/^403/.test(error.message)) {
        toast({ title: "크레딧 부족", description: "오늘의 무료 생성을 모두 사용했습니다.", variant: "destructive" });
        return;
      }
      toast({ title: "생성 실패", description: error.message || "잠시 후 다시 시도해주세요.", variant: "destructive" });
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </button>
        <h1 className="text-2xl font-bold tracking-tight">브랜드 마스코트 만들기</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">AI로 브랜드에 맞는 마스코트를 생성하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Brand Name */}
          <div>
            <Label className="text-sm font-semibold">브랜드명 *</Label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="예: 올리, 카카오, 라인프렌즈"
              className="mt-2 w-full px-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-foreground"
            />
          </div>

          {/* Concept */}
          <div>
            <Label className="text-sm font-semibold">컨셉 설명 *</Label>
            <Textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="예: 친근한 강아지 캐릭터, 우리 브랜드의 따뜻하고 신뢰감 있는 이미지를 표현"
              className="mt-2 min-h-[100px] rounded-xl"
            />
          </div>

          {/* Tone */}
          <div>
            <Label className="text-sm font-semibold">톤앤매너 (복수 선택 가능)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {toneOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleSelection(opt.value, tones, setTones)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border ${
                    tones.includes(opt.value)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-background text-muted-foreground border-border hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <Label className="text-sm font-semibold">활용 목적 (복수 선택 가능)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {purposeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleSelection(opt.value, purposes, setPurposes)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border ${
                    purposes.includes(opt.value)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-background text-muted-foreground border-border hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <Label className="text-sm font-semibold">스타일</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {styleOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={`p-4 rounded-xl text-left transition-all border-2 ${
                    style === opt.value
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
                      : "border-border hover:border-indigo-400"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  <p className="text-[13px] text-muted-foreground mt-1">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Image Upload + Generate */}
        <div className="space-y-6">
          {/* Reference Image Upload */}
          <div>
            <Label className="text-sm font-semibold">참고 이미지 (선택)</Label>
            <div
              className="mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {sourceImage ? (
                <div className="relative">
                  <img src={sourceImage} alt="참고 이미지" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <p className="text-[13px] text-muted-foreground mt-2">{sourceImageName}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSourceImage(null);
                      setSourceImageName("");
                    }}
                    className="absolute top-0 right-0 p-1 bg-background rounded-full shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">클릭 또는 드래그하여 업로드</p>
                    <p className="text-[13px] text-muted-foreground mt-1">PNG, JPG, WEBP (10MB 이하)</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!canGenerate || generateMutation.isPending}
            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-base font-bold rounded-xl"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                마스코트 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                마스코트 생성하기
              </>
            )}
          </Button>

          {/* Preview placeholder */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">미리보기</h3>
            <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">마스코트를 생성하면 여기에 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
