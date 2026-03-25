import { useState } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Sparkles, Check, Loader2, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface StyleOption {
  id: string;
  label: string;
  description: string;
}

const styleOptions: StyleOption[] = [
  { id: "simple-line", label: "심플라인", description: "깔끔한 선으로 표현된 캐릭터" },
  { id: "minimal", label: "미니멀", description: "최소한의 요소로 표현된 캐릭터" },
  { id: "doodle", label: "낙서", description: "자유로운 낙서 스타일 캐릭터" },
  { id: "cute-animal", label: "귀여운동물", description: "귀여운 동물 캐릭터" },
  { id: "scribble", label: "스크리블", description: "스크리블 느낌의 캐릭터" },
  { id: "ink-sketch", label: "잉크스케치", description: "잉크 스케치 풍 캐릭터" },
];

const moodOptions = [
  { value: "cute", label: "귀여운" },
  { value: "elegant", label: "세련된" },
  { value: "friendly", label: "친근한" },
  { value: "intense", label: "강렬한" },
];

type GenerationStatus = "idle" | "loading" | "success" | "error";

export function CharacterNewPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "neutral">("neutral");
  const [mood, setMood] = useState("cute");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // Generation state
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isFormValid = name.trim() !== "" && selectedStyle !== null;

  const handleGenerate = async () => {
    if (!isFormValid) return;
    setStatus("loading");
    setErrorMessage("");
    setGeneratedImageUrl(null);
    setCharacterId(null);

    try {
      const genderLabel = gender === "male" ? "남성" : gender === "female" ? "여성" : "중성";
      const moodLabel = moodOptions.find((m) => m.value === mood)?.label || mood;

      const promptParts = [name];
      promptParts.push(`성격: ${moodLabel}`);
      promptParts.push(`성별: ${genderLabel}`);
      if (description) promptParts.push(description);

      const source = (localStorage.getItem("olli_user_role") as string) || "creator";
      const body = {
        prompt: promptParts.join(". "),
        style: selectedStyle,
        source,
      };

      const res = await apiRequest("POST", "/api/generate-character", body);
      const data = await res.json();

      setGeneratedImageUrl(data.imageUrl);
      setCharacterId(data.characterId);
      setStatus("success");
    } catch (err: any) {
      const message = err?.message || "캐릭터 생성에 실패했습니다.";
      if (/403/.test(message)) {
        setErrorMessage("크레딧이 부족합니다. 크레딧을 충전한 후 다시 시도해주세요.");
      } else if (/401/.test(message)) {
        setErrorMessage("로그인이 필요합니다.");
      } else {
        setErrorMessage(message);
      }
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage("");
    setGeneratedImageUrl(null);
    setCharacterId(null);
  };

  const handleNewCharacter = () => {
    setName("");
    setDescription("");
    setGender("neutral");
    setMood("cute");
    setSelectedStyle(null);
    handleRetry();
  };

  return (
    <StudioLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/assets/characters"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          캐릭터 목록으로 돌아가기
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">새 캐릭터 만들기</h1>
          <p className="text-muted-foreground mt-1">AI로 나만의 캐릭터를 생성하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">기본 정보</h2>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    이름 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="캐릭터 이름을 입력하세요"
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground disabled:opacity-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="캐릭터의 특징이나 설명을 입력하세요 (외모, 의상, 악세서리 등)"
                    rows={4}
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground resize-none disabled:opacity-50"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">성별</label>
                  <div className="flex gap-3">
                    {[
                      { value: "male" as const, label: "남성" },
                      { value: "female" as const, label: "여성" },
                      { value: "neutral" as const, label: "중성" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setGender(option.value)}
                        disabled={status === "loading"}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${
                          gender === option.value
                            ? "border-[#00e5cc] bg-[#00e5cc]/10 text-[#00e5cc]"
                            : "border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">분위기</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground appearance-none cursor-pointer disabled:opacity-50"
                  >
                    {moodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Style Selector */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                스타일 선택 <span className="text-red-400">*</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {styleOptions.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    disabled={status === "loading"}
                    className={`relative rounded-2xl border p-5 text-left transition-all disabled:opacity-50 ${
                      selectedStyle === style.id
                        ? "border-[#00e5cc] bg-[#00e5cc]/5 shadow-lg shadow-[#00e5cc]/10"
                        : "border-border bg-muted hover:border-foreground/20 hover:bg-muted/80"
                    }`}
                  >
                    {selectedStyle === style.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#00e5cc] flex items-center justify-center">
                        <Check className="w-5 h-5 text-black" />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center mb-3">
                      <Sparkles className={`w-5 h-5 ${selectedStyle === style.id ? "text-[#00e5cc]" : "text-muted-foreground"}`} />
                    </div>
                    <h3 className={`text-sm font-bold mb-1 ${selectedStyle === style.id ? "text-[#00e5cc]" : "text-foreground"}`}>
                      {style.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <Link to="/assets/characters">
                <Button variant="outline" className="gap-2" disabled={status === "loading"}>
                  <ArrowLeft className="w-5 h-5" />
                  취소
                </Button>
              </Link>
              {status === "success" ? (
                <Button
                  onClick={handleNewCharacter}
                  className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2 px-8 py-3"
                >
                  <Sparkles className="w-5 h-5" />
                  새 캐릭터 만들기
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  disabled={!isFormValid || status === "loading"}
                  className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2 px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      AI 캐릭터 생성
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right - Result / Status Panel */}
          <div className="space-y-6">
            {status === "loading" && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-bold text-foreground mb-4">생성 중...</h3>
                <div className="aspect-square bg-muted rounded-xl flex flex-col items-center justify-center animate-pulse">
                  <Loader2 className="w-10 h-10 text-[#00e5cc] animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">캐릭터를 그리고 있어요...</p>
                  <p className="text-xs text-muted-foreground mt-1">15~30초 정도 걸려요</p>
                </div>
              </div>
            )}

            {status === "success" && generatedImageUrl && (
              <div className="rounded-2xl border border-[#00e5cc]/30 bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-[#00e5cc]" />
                  <h3 className="font-bold text-foreground">생성 완료!</h3>
                </div>
                <div
                  className="w-full overflow-hidden rounded-xl border border-border"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  }}
                >
                  <img
                    src={generatedImageUrl}
                    alt={name}
                    className="w-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {characterId && (
                    <Button
                      className="w-full bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2"
                      onClick={() => navigate(`/assets/characters/${characterId}`)}
                    >
                      캐릭터 상세보기
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="w-5 h-5" />
                    다시 생성하기
                  </Button>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-2xl border border-red-500/30 bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-red-400">생성 실패</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleRetry}
                >
                  <RefreshCw className="w-5 h-5" />
                  다시 시도
                </Button>
              </div>
            )}

            {status === "idle" && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-bold text-foreground mb-3">생성 팁</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5cc] mt-1">1.</span>
                    <span className="text-sm text-muted-foreground">
                      이름과 설명을 자세히 작성할수록 더 정확한 캐릭터가 생성됩니다
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5cc] mt-1">2.</span>
                    <span className="text-sm text-muted-foreground">
                      외모 특징 (머리색, 눈 크기, 체형 등)을 설명에 포함하세요
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5cc] mt-1">3.</span>
                    <span className="text-sm text-muted-foreground">
                      스타일에 따라 캐릭터 분위기가 크게 달라집니다
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00e5cc] mt-1">4.</span>
                    <span className="text-sm text-muted-foreground">
                      마음에 들지 않으면 여러 번 생성해보세요
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
