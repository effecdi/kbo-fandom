import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Music,
  Star,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  generateId,
  verifyFandomAnswers,
  setFandomProfile,
  type KboTeam,
  type KboPlayer,
  type FandomUserProfile,
} from "@/lib/local-store";

const TOTAL_STEPS = 10;

export function FandomOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [groups, setGroups] = useState<KboTeam[]>([]);
  const [members, setMembers] = useState<KboPlayer[]>([]);
  const [error, setError] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    passed: boolean;
    score: number;
    wrongKeys: string[];
  } | null>(null);

  // Answers
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [fandomNameInput, setFandomNameInput] = useState("");
  const [debutYearAnswer, setDebutYearAnswer] = useState("");
  const [companyAnswer, setCompanyAnswer] = useState("");
  const [memberCountInput, setMemberCountInput] = useState("");
  const [leaderAnswer, setLeaderAnswer] = useState("");
  const [favoritePlayerId, setFavoritePlayerId] = useState("");
  const [secondPlayerId, setSecondPlayerId] = useState("");
  const [favoriteSong, setFavoriteSong] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    seedIfEmpty();
    setGroups(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
  }, []);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;
  const groupMembers = members.filter((m) => m.groupId === selectedGroupId);

  useEffect(() => {
    if (selectedGroupId) {
      setMembers(listItems<KboPlayer>(STORE_KEYS.KBO_PLAYERS));
    }
  }, [selectedGroupId]);

  // Generate 4 choices for founded year (3 wrong + 1 correct)
  const foundedYearChoices = selectedGroup
    ? [
        selectedGroup.foundedYear,
        selectedGroup.foundedYear - 1,
        selectedGroup.foundedYear + 1,
        selectedGroup.foundedYear - 2,
      ].sort()
    : [];

  // Generate 4 choices for city
  const allCities = Array.from(new Set(groups.map((g) => g.city)));
  const cityChoices = selectedGroup
    ? [
        selectedGroup.city,
        ...allCities.filter((c) => c !== selectedGroup.city).slice(0, 3),
      ].sort()
    : [];

  const canNext = () => {
    switch (step) {
      case 1: return !!selectedGroupId;
      case 2: return fandomNameInput.trim().length > 0;
      case 3: return !!debutYearAnswer;
      case 4: return !!companyAnswer;
      case 5: return memberCountInput.trim().length > 0;
      case 6: return !!leaderAnswer;
      case 7: return !!favoritePlayerId;
      case 8: return !!secondPlayerId;
      case 9: return favoriteSong.trim().length > 0;
      case 10: return nickname.trim().length >= 2;
      default: return false;
    }
  };

  const handleNext = () => {
    setError("");
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // Final step — verify
      const answers = {
        fandomName: fandomNameInput,
        foundedYear: debutYearAnswer,
        city: companyAnswer,
        stadium: memberCountInput,
        captain: leaderAnswer,
      };
      const result = verifyFandomAnswers(selectedGroupId, answers);
      setVerifyResult(result);

      if (result.passed) {
        const favoriteMember = groupMembers.find((m) => m.id === favoritePlayerId);
        const secondMember = groupMembers.find((m) => m.id === secondPlayerId);
        const profile: FandomUserProfile = {
          id: generateId("fan"),
          nickname,
          groupId: selectedGroupId,
          groupName: selectedGroup?.name || "",
          fandomName: fandomNameInput,
          favoritePlayer: favoriteMember?.name || "",
          secondPlayer: secondMember?.name || "",
          answers: {
            ...answers,
            favoritePlayer: favoriteMember?.name || "",
            secondPlayer: secondMember?.name || "",
            favoriteScene: favoriteSong,
          },
          verified: true,
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setFandomProfile(profile);
        setTimeout(() => navigate("/fandom"), 1500);
      }
    }
  };

  const handleRetry = () => {
    setVerifyResult(null);
    setStep(2);
    setFandomNameInput("");
    setDebutYearAnswer("");
    setCompanyAnswer("");
    setMemberCountInput("");
    setLeaderAnswer("");
  };

  const progressPct = (step / TOTAL_STEPS) * 100;
  const themeColor = selectedGroup?.coverColor || "#7B2FF7";

  // Verification result screen
  if (verifyResult && !verifyResult.passed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: `${themeColor}20` }}
          >
            <AlertTriangle className="w-10 h-10" style={{ color: themeColor }} />
          </div>
          <h1 className="text-2xl font-black text-foreground">
            아직 진정한 팬이 되기엔...
          </h1>
          <p className="text-muted-foreground">
            {verifyResult.score}/5 정답! 4개 이상 맞혀야 통과합니다.
            <br />
            {selectedGroup?.name}에 대해 더 알아보고 다시 도전해주세요!
          </p>
          <Button
            onClick={handleRetry}
            className="text-white font-bold"
            style={{ background: themeColor }}
          >
            다시 도전하기
          </Button>
        </div>
      </div>
    );
  }

  if (verifyResult && verifyResult.passed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center animate-bounce"
            style={{ background: `${themeColor}20` }}
          >
            <Heart className="w-12 h-12" style={{ color: themeColor }} />
          </div>
          <h1 className="text-3xl font-black text-foreground">
            축하합니다! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            <span className="font-bold" style={{ color: themeColor }}>
              {selectedGroup?.name}
            </span>{" "}
            팬덤 인증 완료!
          </p>
          <p className="text-sm text-muted-foreground">잠시 후 팬덤 홈으로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-muted">
        <div
          className="h-full transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${progressPct}%`, background: themeColor }}
        />
      </div>

      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        {step > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setStep(step - 1); setError(""); }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {step} / {TOTAL_STEPS}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground"
        >
          나중에 하기
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Step 1: Group select */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Star className="w-10 h-10 mx-auto mb-3 text-violet-500" />
                <h1 className="text-2xl font-black text-foreground">
                  당신의 KBO 구단은?
                </h1>
                <p className="text-muted-foreground mt-1">
                  좋아하는 구단을 선택하세요
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroupId(g.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-center ${
                      selectedGroupId === g.id
                        ? "border-current shadow-lg scale-[1.02]"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                    style={
                      selectedGroupId === g.id
                        ? { borderColor: g.coverColor, background: `${g.coverColor}10` }
                        : {}
                    }
                  >
                    <div
                      className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-lg"
                      style={{ background: g.coverColor }}
                    >
                      {g.name.charAt(0)}
                    </div>
                    <p className="font-bold text-sm text-foreground">{g.name}</p>
                    <p className="text-[13px] text-muted-foreground">{g.nameKo}</p>
                    {selectedGroupId === g.id && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: g.coverColor }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Team Korean name */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              <Star className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
              <h1 className="text-2xl font-black text-foreground">
                우리 구단의 정식 이름은?
              </h1>
              <p className="text-muted-foreground">구단의 한글 정식 명칭을 입력하세요</p>
              <Input
                className="max-w-sm mx-auto text-center text-lg h-14"
                placeholder={selectedGroup ? `예: ${selectedGroup.nameKo}` : "예: 한화 이글스, LG 트윈스..."}
                value={fandomNameInput}
                onChange={(e) => setFandomNameInput(e.target.value)}
              />
            </div>
          )}

          {/* Step 3: Debut year */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
              <h1 className="text-2xl font-black text-foreground">
                {selectedGroup?.name}의 창단 연도는?
              </h1>
              <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
                {foundedYearChoices.map((y) => (
                  <button
                    key={y}
                    onClick={() => setDebutYearAnswer(String(y))}
                    className={`px-6 py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                      debutYearAnswer === String(y)
                        ? "text-white shadow-lg"
                        : "border-border text-foreground hover:border-muted-foreground/30"
                    }`}
                    style={
                      debutYearAnswer === String(y)
                        ? { background: themeColor, borderColor: themeColor }
                        : {}
                    }
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Company */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
              <h1 className="text-2xl font-black text-foreground">
                {selectedGroup?.name}의 연고지는?
              </h1>
              <div className="flex flex-wrap gap-4 justify-center">
                {cityChoices.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCompanyAnswer(c)}
                    className={`px-8 py-4 rounded-xl border-2 font-bold transition-all ${
                      companyAnswer === c
                        ? "text-white shadow-lg"
                        : "border-border text-foreground hover:border-muted-foreground/30"
                    }`}
                    style={
                      companyAnswer === c
                        ? { background: themeColor, borderColor: themeColor }
                        : {}
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Stadium */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
              <h1 className="text-2xl font-black text-foreground">
                {selectedGroup?.name}의 홈구장은?
              </h1>
              <p className="text-muted-foreground">홈구장 이름을 입력하세요</p>
              <Input
                className="max-w-sm mx-auto text-center text-lg h-14"
                placeholder="예: 잠실야구장, 고척스카이돔..."
                value={memberCountInput}
                onChange={(e) => setMemberCountInput(e.target.value)}
              />
            </div>
          )}

          {/* Step 6: Ace pitcher */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
              <h1 className="text-2xl font-black text-foreground">
                {selectedGroup?.name}의 에이스는?
              </h1>
              <p className="text-muted-foreground">구단 대표 선수를 선택하세요</p>
              <div className="flex flex-wrap gap-3 justify-center max-w-xl mx-auto">
                {groupMembers
                  .filter((m) => m.role === "에이스" || m.role === "4번타자" || m.role === "3번타자" || m.role === "마감" || m.role === "핵심")
                  .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setLeaderAnswer(m.name)}
                    className={`px-5 py-3 rounded-xl border-2 font-semibold transition-all flex items-center gap-2 ${
                      leaderAnswer === m.name
                        ? "text-white shadow-lg"
                        : "border-border text-foreground hover:border-muted-foreground/30"
                    }`}
                    style={
                      leaderAnswer === m.name
                        ? { background: m.color, borderColor: m.color }
                        : {}
                    }
                  >
                    <span>{m.name}</span>
                    <span className="text-[13px] opacity-80">{m.position}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Favorite Player */}
          {step === 7 && (
            <div className="space-y-6 text-center">
              <Heart className="w-10 h-10 mx-auto text-rose-500" />
              <h1 className="text-2xl font-black text-foreground">
                당신의 최애 선수는?
              </h1>
              <p className="text-muted-foreground">가장 좋아하는 선수를 선택하세요</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
                {groupMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFavoritePlayerId(m.id)}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      favoritePlayerId === m.id
                        ? "shadow-lg scale-[1.02]"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                    style={
                      favoritePlayerId === m.id
                        ? { borderColor: m.color, background: `${m.color}15` }
                        : {}
                    }
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: m.color }}
                    >
                      {m.jerseyNumber}
                    </div>
                    <p className="text-sm font-bold text-foreground">{m.name}</p>
                    <p className="text-[13px] text-muted-foreground">{m.position}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Second Player */}
          {step === 8 && (
            <div className="space-y-6 text-center">
              <Heart className="w-10 h-10 mx-auto text-pink-500" />
              <h1 className="text-2xl font-black text-foreground">
                차애 선수는?
              </h1>
              <p className="text-muted-foreground">최애 다음으로 좋아하는 선수!</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
                {groupMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSecondPlayerId(m.id)}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      secondPlayerId === m.id
                        ? "shadow-lg scale-[1.02]"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                    style={
                      secondPlayerId === m.id
                        ? { borderColor: m.color, background: `${m.color}15` }
                        : {}
                    }
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: m.color }}
                    >
                      {m.jerseyNumber}
                    </div>
                    <p className="text-sm font-bold text-foreground">{m.name}</p>
                    <p className="text-[13px] text-muted-foreground">{m.position}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Favorite song */}
          {step === 9 && (
            <div className="space-y-6 text-center">
              <Star className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
              <h1 className="text-2xl font-black text-foreground">
                {selectedGroup?.name}의 최고의 명장면은?
              </h1>
              <p className="text-muted-foreground">가장 기억에 남는 명장면을 알려주세요</p>
              <Input
                className="max-w-sm mx-auto text-center text-lg h-14"
                placeholder="예: 2024 한국시리즈 우승..."
                value={favoriteSong}
                onChange={(e) => setFavoriteSong(e.target.value)}
              />
            </div>
          )}

          {/* Step 10: Nickname */}
          {step === 10 && (
            <div className="space-y-6 text-center">
              <Sparkles className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
              <h1 className="text-2xl font-black text-foreground">
                팬 닉네임을 설정하세요
              </h1>
              <p className="text-muted-foreground">
                팬덤에서 사용할 닉네임을 입력하세요 (2자 이상)
              </p>
              <Input
                className="max-w-sm mx-auto text-center text-lg h-14"
                placeholder="닉네임 입력"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-red-500 mt-4">{error}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 flex justify-center">
        <Button
          disabled={!canNext()}
          onClick={handleNext}
          className="min-w-[200px] h-14 text-base font-bold text-white gap-2"
          style={{ background: canNext() ? themeColor : undefined }}
        >
          {step === TOTAL_STEPS ? (
            <>
              <Check className="w-5 h-5" />
              팬덤 인증하기
            </>
          ) : (
            <>
              다음
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
