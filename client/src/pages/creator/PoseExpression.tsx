import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, RefreshCw, Download, Loader2, Upload, X } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import type { Generation } from "@shared/schema";

const MAX_CHARACTERS = 4;

export function PoseExpression() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPose, setSelectedPose] = useState("standing");
  const [selectedExpression, setSelectedExpression] = useState("happy");
  const [selectedAngle, setSelectedAngle] = useState("정면");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [poseResultImage, setPoseResultImage] = useState<string | null>(null);

  // Character selection from URL or user pick
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>(() => {
    const charId = searchParams.get("characterId");
    return charId && !isNaN(parseInt(charId)) ? [parseInt(charId)] : [];
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();

  const { data: usage } = useQuery<{ tier: string; credits: number }>({ queryKey: ["/api/usage"] });
  const isPro = usage?.tier === "pro" || usage?.tier === "premium";
  const isOutOfCredits = !isPro && (usage?.credits ?? 0) <= 0;

  // Fetch gallery characters
  const { data: galleryItems, isLoading: galleryLoading } = useQuery<Generation[]>({
    queryKey: ["/api/gallery"],
    select: (data: any[]) => data.filter((g) => g.type === "character" && g.resultImageUrl),
    staleTime: 0,
  });

  // Fetch pose history
  const { data: poseHistory } = useQuery<Generation[]>({
    queryKey: ["/api/gallery"],
    select: (data: any[]) => data.filter((g) => g.type === "pose" && g.resultImageUrl).slice(0, 5),
  });

  const poses = [
    { value: "standing", label: "서 있는 포즈" },
    { value: "sitting", label: "앉은 포즈" },
    { value: "walking", label: "걷는 포즈" },
    { value: "running", label: "뛰는 포즈" },
    { value: "jumping", label: "점프 포즈" },
  ];

  const expressions = [
    { value: "happy", label: "기쁨", emoji: "😊" },
    { value: "sad", label: "슬픔", emoji: "😢" },
    { value: "angry", label: "화남", emoji: "😠" },
    { value: "surprised", label: "놀람", emoji: "😲" },
    { value: "thinking", label: "생각", emoji: "🤔" },
    { value: "love", label: "사랑", emoji: "😍" },
  ];

  const angles = ["정면", "측면", "3/4 각도", "뒷모습"];
  const emotions = ["즐거움", "설렘", "긴장", "편안함", "자신감"];

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const toggleCharacter = (characterId: number) => {
    setSelectedCharacterIds((prev) => {
      if (prev.includes(characterId)) return prev.filter((id) => id !== characterId);
      if (prev.length >= MAX_CHARACTERS) {
        toast({ title: "최대 선택 초과", description: `캐릭터는 최대 ${MAX_CHARACTERS}개까지 선택할 수 있습니다.`, variant: "destructive" });
        return prev;
      }
      return [...prev, characterId];
    });
  };

  const selectedGenerations = useMemo(() => {
    return galleryItems?.filter((g) => g.characterId && selectedCharacterIds.includes(g.characterId)) || [];
  }, [galleryItems, selectedCharacterIds]);

  const handleReferenceUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "파일이 너무 커요", description: "10MB 이하 이미지를 선택해주세요.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setReferenceImage(reader.result as string);
    reader.readAsDataURL(file);
  }, [toast]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (selectedCharacterIds.length === 0) throw new Error("캐릭터를 먼저 선택해주세요.");
      const poseLabel = poses.find((p) => p.value === selectedPose)?.label || selectedPose;
      const exprLabel = expressions.find((e) => e.value === selectedExpression)?.label || selectedExpression;
      const emotionStr = selectedEmotions.length > 0 ? `, ${selectedEmotions.join(", ")}` : "";
      const prompt = `${poseLabel}, ${exprLabel} 표정, ${selectedAngle}${emotionStr}`;
      const res = await apiRequest("POST", "/api/generate-pose", {
        characterIds: selectedCharacterIds,
        prompt,
        referenceImageData: referenceImage || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setPoseResultImage(data.imageUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "포즈 생성 완료!", description: "캐릭터 포즈가 완성되었어요." });
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
    a.download = `pose-${Date.now()}.png`;
    a.click();
  };

  const canGenerate = selectedCharacterIds.length > 0 && !generateMutation.isPending && !isOutOfCredits;

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
              포즈 & 표정 생성
            </h1>
            <p className="text-muted-foreground">
              캐릭터의 다양한 포즈와 표정을 만들어보세요
            </p>
          </div>
          <div className="flex gap-3">
            {poseResultImage && (
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={() => downloadImage(poseResultImage)}
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* Character Selection */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="font-black text-foreground mb-4">
              기준 캐릭터 <span className="text-sm font-normal text-muted-foreground">({selectedCharacterIds.length}/{MAX_CHARACTERS})</span>
            </h2>

            {/* Selected characters preview */}
            {selectedGenerations.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {selectedGenerations.map((gen, idx) => (
                  <div key={gen.id} className="relative flex-shrink-0 w-14 h-14">
                    <img
                      src={gen.resultImageUrl!}
                      alt={gen.prompt}
                      className="w-full h-full object-cover rounded-lg border-2 border-purple-600"
                    />
                    <button
                      onClick={() => toggleCharacter(gen.characterId!)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery grid for character selection */}
            {galleryLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : galleryItems && galleryItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {galleryItems.map((item) => {
                  const isSelected = selectedCharacterIds.includes(item.characterId!);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleCharacter(item.characterId!)}
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
            ) : (
              <p className="text-sm text-muted-foreground">
                생성된 캐릭터가 없습니다. 먼저 캐릭터를 만들어주세요.
              </p>
            )}
          </div>

          {/* Pose & Expression Settings */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <Tabs defaultValue="pose">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pose">포즈</TabsTrigger>
                <TabsTrigger value="expression">표정</TabsTrigger>
              </TabsList>

              <TabsContent value="pose" className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2">포즈 선택</Label>
                  <Select value={selectedPose} onValueChange={setSelectedPose}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {poses.map((pose) => (
                        <SelectItem key={pose.value} value={pose.value}>
                          {pose.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">카메라 앵글</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {angles.map((angle) => (
                      <Button
                        key={angle}
                        variant={selectedAngle === angle ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedAngle(angle)}
                      >
                        {angle}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">손 동작</Label>
                  <Select defaultValue="neutral">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">자연스럽게</SelectItem>
                      <SelectItem value="wave">손 흔들기</SelectItem>
                      <SelectItem value="point">가리키기</SelectItem>
                      <SelectItem value="peace">브이</SelectItem>
                      <SelectItem value="thumbs">엄지척</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="expression" className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2">표정 선택</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {expressions.map((expr) => (
                      <Button
                        key={expr.value}
                        variant={selectedExpression === expr.value ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-3 flex-col"
                        onClick={() => setSelectedExpression(expr.value)}
                      >
                        <span className="text-2xl mb-1">{expr.emoji}</span>
                        <span className="text-xs">{expr.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">감정 태그</Label>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emotion) => (
                      <Badge
                        key={emotion}
                        variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30"
                        onClick={() => toggleEmotion(emotion)}
                      >
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Reference image upload */}
            <div className="mt-4">
              <Label className="text-sm font-semibold mb-2">참고 이미지 (선택)</Label>
              {referenceImage ? (
                <div className="relative mt-2">
                  <img src={referenceImage} alt="Reference" className="w-full rounded-lg border object-contain max-h-[150px]" />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="mt-2 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:border-purple-400 transition-colors"
                  onClick={() => document.getElementById("pose-ref-input")?.click()}
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">클릭하여 업로드</span>
                  <input
                    id="pose-ref-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleReferenceUpload}
                  />
                </div>
              )}
            </div>

            <Button
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              disabled={!canGenerate}
              onClick={() => guard(() => generateMutation.mutate())}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  생성하기
                </>
              )}
            </Button>
            {!isPro && (
              <p className="text-xs text-muted-foreground text-center mt-2">1회 생성 시 5 크레딧 소모</p>
            )}
            {!isPro && isOutOfCredits && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">크레딧이 부족합니다.</p>
                <Button size="sm" variant="outline" asChild>
                  <a href="/pricing">충전</a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl p-6 border border-border h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-foreground">미리보기</h2>
              {poseResultImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPoseResultImage(null);
                    guard(() => generateMutation.mutate());
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 생성
                </Button>
              )}
            </div>
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
              {generateMutation.isPending ? (
                <div className="flex flex-col items-center gap-4 w-full p-8">
                  <Skeleton className="w-full aspect-square rounded-lg" />
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    <p className="text-sm text-muted-foreground">포즈와 표정을 생성하는 중...</p>
                  </div>
                </div>
              ) : poseResultImage ? (
                <div className="w-full h-full p-4">
                  <img
                    src={poseResultImage}
                    alt="Pose result"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    왼쪽에서 캐릭터를 선택하고 옵션을 설정한 후 생성 버튼을 눌러주세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - History */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl p-6 border border-border sticky top-8">
            <h2 className="font-black text-foreground mb-4">생성 히스토리</h2>
            <div className="space-y-3">
              {poseHistory && poseHistory.length > 0 ? (
                poseHistory.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square bg-muted rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-600 transition-all"
                    onClick={() => setPoseResultImage(item.resultImageUrl!)}
                  >
                    <img
                      src={item.resultImageUrl!}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 생성 기록이 없어요
                </p>
              )}
            </div>
            {poseHistory && poseHistory.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/creator/contents")}
              >
                전체 히스토리 보기
              </Button>
            )}
          </div>
        </div>
      </div>
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </DashboardLayout>
  );
}
