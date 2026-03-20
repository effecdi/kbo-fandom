import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, Download, Search, Loader2, Upload, X, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import type { Generation } from "@shared/schema";

const MAX_SOURCES = 4;

const bgPresets = [
  { name: "카페 내부", bg: "cozy cafe interior, warm lighting, coffee cups", items: "coffee cup, pastry on table" },
  { name: "거실", bg: "cozy living room with sofa and window", items: "pillow, lamp, books" },
  { name: "공원", bg: "sunny park with green trees, blue sky", items: "bench, flowers, butterfly" },
  { name: "도시 풍경", bg: "city skyline, urban street, buildings", items: "street lamp, car" },
  { name: "해변", bg: "sandy beach with ocean waves, sunset sky", items: "beach umbrella, surfboard" },
  { name: "학교 교실", bg: "classroom with desks and blackboard", items: "backpack, notebook, pencil" },
];

interface SourceEntry {
  url: string;
  characterId: number | null;
}

export function Background() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [itemsPrompt, setItemsPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [bgResultImage, setBgResultImage] = useState<string | null>(null);
  const [sourceImages, setSourceImages] = useState<SourceEntry[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();

  const { data: usage } = useQuery<{ tier: string; credits: number }>({ queryKey: ["/api/usage"] });
  const isPro = usage?.tier === "pro" || usage?.tier === "premium";
  const isOutOfCredits = !isPro && (usage?.credits ?? 0) <= 0;

  // Gallery items for source selection
  const { data: galleryItems, isLoading: galleryLoading } = useQuery<Generation[]>({
    queryKey: ["/api/gallery"],
    select: (data: any[]) => data.filter((g) => g.resultImageUrl),
  });

  const characterItems = galleryItems?.filter((g) => g.type === "character") || [];

  const styles = ["리얼", "애니메이션", "미니멀", "일러스트", "판타지"];

  const toggleStyle = (s: string) => {
    setSelectedStyle((prev) => (prev === s ? null : s));
  };
  const toggleTime = (t: string) => {
    setSelectedTime((prev) => (prev === t ? null : t));
  };
  const toggleWeather = (w: string) => {
    setSelectedWeather((prev) => (prev === w ? null : w));
  };

  const toggleGalleryItem = (item: Generation) => {
    setSourceImages((prev) => {
      const existingIdx = prev.findIndex((s) => s.characterId === item.characterId);
      if (existingIdx !== -1) return prev.filter((_, i) => i !== existingIdx);
      if (prev.length >= MAX_SOURCES) {
        toast({ title: "최대 선택 초과", description: `이미지는 최대 ${MAX_SOURCES}개까지 선택할 수 있습니다.`, variant: "destructive" });
        return prev;
      }
      return [...prev, { url: item.resultImageUrl!, characterId: item.characterId }];
    });
  };

  const removeSource = (index: number) => {
    setSourceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "파일이 너무 커요", description: "10MB 이하 이미지를 선택해주세요.", variant: "destructive" });
      return;
    }
    if (sourceImages.length >= MAX_SOURCES) {
      toast({ title: "최대 선택 초과", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImages((prev) => [...prev, { url: reader.result as string, characterId: null }]);
    };
    reader.readAsDataURL(file);
  }, [toast, sourceImages.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (sourceImages.length >= MAX_SOURCES) {
      toast({ title: "최대 선택 초과", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImages((prev) => [...prev, { url: reader.result as string, characterId: null }]);
    };
    reader.readAsDataURL(file);
  }, [toast, sourceImages.length]);

  const bgMutation = useMutation({
    mutationFn: async () => {
      if (sourceImages.length === 0) throw new Error("이미지를 먼저 선택해주세요.");
      const sourceImageDataList = sourceImages.map((s) => s.url);
      const characterIds = sourceImages
        .map((s) => s.characterId)
        .filter((id): id is number => id !== null);

      const promptParts = [prompt];
      if (selectedStyle) promptParts.push(`${selectedStyle} 스타일`);
      if (selectedTime) promptParts.push(selectedTime);
      if (selectedWeather) promptParts.push(selectedWeather);
      const backgroundPrompt = promptParts.filter(Boolean).join(", ");

      const res = await apiRequest("POST", "/api/generate-background", {
        sourceImageDataList,
        backgroundPrompt,
        itemsPrompt: itemsPrompt || undefined,
        characterIds: characterIds.length > 0 ? characterIds : undefined,
        aspectRatio: selectedAspectRatio,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setBgResultImage(data.imageUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "배경 생성 완료!", description: "캐릭터에 배경과 아이템이 추가되었어요." });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "로그인이 필요합니다", variant: "destructive" });
        setTimeout(() => navigate("/login"), 300);
        return;
      }
      if (/^403/.test(error.message)) {
        toast({ title: "크레딧 부족", variant: "destructive" });
        return;
      }
      toast({ title: "생성 실패", description: error.message, variant: "destructive" });
    },
  });

  const downloadImage = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `background-${Date.now()}.png`;
    a.click();
  };

  const resetAll = () => {
    setBgResultImage(null);
    setPrompt("");
    setItemsPrompt("");
  };

  const applyPreset = (preset: typeof bgPresets[0]) => {
    setPrompt(preset.bg);
    setItemsPrompt(preset.items);
  };

  const canGenerate = sourceImages.length > 0 && prompt.trim().length > 0 && !bgMutation.isPending && !isOutOfCredits;

  return (
    <DashboardLayout userType="creator">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/creator/character")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              배경 생성
            </h1>
            <p className="text-muted-foreground">
              인스타툰에 어울리는 배경을 만들어보세요
            </p>
          </div>
          <div className="flex gap-3">
            {bgResultImage && (
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={() => downloadImage(bgResultImage)}
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Source Image Selection */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-black text-foreground mb-4">
              원본 이미지 <span className="text-sm font-normal text-muted-foreground">({sourceImages.length}/{MAX_SOURCES})</span>
            </h2>

            {/* Selected sources preview */}
            {sourceImages.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {sourceImages.map((src, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-16 h-16">
                    <img
                      src={src.url}
                      alt={`Source ${idx + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-purple-600"
                    />
                    <button
                      onClick={() => removeSource(idx)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            {sourceImages.length < MAX_SOURCES && (
              <div
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 cursor-pointer hover:border-purple-400 transition-all mb-3"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("bg-file-input")?.click()}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center">클릭 또는 드래그로 업로드</p>
                <input
                  id="bg-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            )}

            {/* Gallery character selection */}
            {characterItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">내 캐릭터에서 선택</p>
                <div className="grid grid-cols-3 gap-2 max-h-[150px] overflow-y-auto">
                  {characterItems.map((item) => {
                    const isSelected = sourceImages.some((s) => s.characterId === item.characterId);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleGalleryItem(item)}
                        className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                          isSelected ? "border-purple-600 ring-2 ring-purple-200" : "border-border hover:border-purple-300"
                        }`}
                      >
                        <img
                          src={item.resultImageUrl!}
                          alt={item.prompt}
                          className="w-full aspect-square object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Create / Preset Tabs */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">직접 생성</TabsTrigger>
                <TabsTrigger value="preset">프리셋</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    배경 설명
                  </label>
                  <Textarea
                    placeholder="원하는 배경을 설명해주세요. 예: 따뜻한 햇살이 들어오는 아늑한 카페 내부"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    아이템 (선택)
                  </label>
                  <Input
                    placeholder="예: 커피잔, 꽃다발, 우산..."
                    value={itemsPrompt}
                    onChange={(e) => setItemsPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    스타일 선택
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((s) => (
                      <Badge
                        key={s}
                        variant={selectedStyle === s ? "default" : "outline"}
                        className="cursor-pointer hover:bg-purple-100 hover:border-purple-600"
                        onClick={() => toggleStyle(s)}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    시간대
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["아침", "낮", "저녁", "밤"].map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">
                    날씨
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "맑음", value: "맑음" },
                      { label: "흐림", value: "흐림" },
                      { label: "비", value: "비" },
                      { label: "눈", value: "눈" },
                    ].map((weather) => (
                      <Button
                        key={weather.value}
                        variant={selectedWeather === weather.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleWeather(weather.value)}
                      >
                        {weather.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  disabled={!canGenerate}
                  onClick={() => guard(() => bgMutation.mutate())}
                >
                  {bgMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      배경 생성하기
                    </>
                  )}
                </Button>
                {!isPro && (
                  <p className="text-xs text-muted-foreground text-center">1회 생성 시 5 크레딧 소모</p>
                )}
                {!isPro && isOutOfCredits && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">크레딧이 부족합니다.</p>
                    <Button size="sm" variant="outline" asChild>
                      <a href="/pricing">충전</a>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preset" className="mt-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="프리셋 검색..."
                    className="pl-10"
                  />
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {bgPresets.map((preset, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer rounded-xl overflow-hidden border border-border hover:border-purple-600 transition-all hover:shadow-lg"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="p-3 bg-card">
                        <p className="font-semibold text-sm text-foreground">{preset.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{preset.bg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Center & Right - Results */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-foreground">생성 결과</h2>
              <div className="flex gap-2">
                {["1:1", "16:9", "9:16"].map((ratio) => (
                  <Button
                    key={ratio}
                    variant={selectedAspectRatio === ratio ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAspectRatio(ratio)}
                  >
                    {ratio}
                  </Button>
                ))}
              </div>
            </div>

            {bgMutation.isPending ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <Skeleton className="w-full aspect-video rounded-xl" />
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <p className="text-sm text-muted-foreground">배경과 아이템을 추가하는 중...</p>
                </div>
              </div>
            ) : bgResultImage ? (
              <div>
                <div className="overflow-hidden rounded-xl border border-border mb-4">
                  <img
                    src={bgResultImage}
                    alt="Generated background"
                    className="w-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => downloadImage(bgResultImage)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={resetAll}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    다시 만들기
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">결과가 여기에 표시돼요</h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  이미지를 선택하고 배경을 설명한 후 생성 버튼을 눌러주세요
                </p>
              </div>
            )}

            {/* Additional Options */}
            {!bgResultImage && !bgMutation.isPending && (
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="font-bold text-foreground mb-4">추가 옵션</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <span className="font-bold text-sm">블러 효과</span>
                    <span className="text-xs text-muted-foreground mt-1">배경 흐리게</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <span className="font-bold text-sm">색상 조정</span>
                    <span className="text-xs text-muted-foreground mt-1">톤 변경</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <span className="font-bold text-sm">프레임 추가</span>
                    <span className="text-xs text-muted-foreground mt-1">테두리 효과</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </DashboardLayout>
  );
}
