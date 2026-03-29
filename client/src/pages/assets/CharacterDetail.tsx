import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  User,
  Edit3,
  Download,
  Trash2,
  Calendar,
  Tag,
  Smile,
  UserCircle,
  FolderOpen,
  Image,
  Loader2,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { listItems, STORE_KEYS, type ProjectRecord } from "@/lib/local-store";

type DetailTab = "info" | "poses" | "projects";

interface CharacterData {
  id: number | string;
  name?: string;
  prompt?: string;
  description?: string;
  style?: string;
  gender?: string;
  mood?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PoseItem {
  id: string | number;
  name: string;
  type: string;
  imageUrl?: string;
}

const styleLabels: Record<string, string> = {
  "simple-line": "심플라인",
  "minimal": "미니멀",
  "doodle": "낙서",
  "cute-animal": "귀여운동물",
  "scribble": "스크리블",
  "ink-sketch": "잉크스케치",
};

const mockCharacter: CharacterData = {
  id: "char-1",
  name: "미니",
  description:
    "밝고 귀여운 성격의 캐릭터입니다. 주로 인스타툰과 브랜드 콘텐츠에 활용되며, 다양한 표정과 포즈가 준비되어 있습니다.",
  style: "simple-line",
  gender: "여성",
  mood: "귀여운",
  createdAt: "2024-03-15",
  updatedAt: "2024-03-20",
};

const mockPoses: PoseItem[] = [
  { id: "pose-1", name: "기본 포즈", type: "포즈" },
  { id: "pose-2", name: "인사하는 포즈", type: "포즈" },
  { id: "pose-3", name: "앉아있는 포즈", type: "포즈" },
  { id: "pose-4", name: "웃는 표정", type: "표정" },
  { id: "pose-5", name: "놀란 표정", type: "표정" },
  { id: "pose-6", name: "슬픈 표정", type: "표정" },
];

export function CharacterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const [character, setCharacter] = useState<CharacterData>(mockCharacter);
  const [loading, setLoading] = useState(true);
  const [poses, setPoses] = useState<PoseItem[]>(mockPoses);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  // Pose generation state
  const [posePrompt, setPosePrompt] = useState("");
  const [poseGenerating, setPoseGenerating] = useState(false);
  const [poseError, setPoseError] = useState("");
  const [generatedPoseUrl, setGeneratedPoseUrl] = useState<string | null>(null);

  // Fetch character data
  useEffect(() => {
    let cancelled = false;
    async function fetchCharacter() {
      setLoading(true);
      try {
        // Try fetching from gallery first (individual items)
        const numId = parseInt(String(id));
        if (!isNaN(numId)) {
          const res = await apiRequest("GET", `/api/characters${numId}`);
          const data = await res.json();
          if (!cancelled && data) {
            setCharacter({
              id: data.id,
              name: data.prompt?.split(",")[0]?.trim()?.substring(0, 20) || `캐릭터 ${data.id}`,
              prompt: data.prompt,
              description: data.prompt || "AI로 생성된 캐릭터입니다.",
              style: data.style || "simple-line",
              imageUrl: data.imageUrl,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt || data.createdAt,
            });
          }
        } else {
          // Not a numeric ID, use mock
          setCharacter({ ...mockCharacter, id: id || "char-1" });
        }
      } catch {
        // Fallback to mock
        if (!cancelled) {
          setCharacter({ ...mockCharacter, id: id || "char-1" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCharacter();

    // Load projects from localStorage
    const localProjects = listItems<ProjectRecord>(STORE_KEYS.PROJECTS);
    setProjects(localProjects);

    return () => { cancelled = true; };
  }, [id]);

  const tabs: { id: DetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "info", label: "기본 정보", icon: UserCircle },
    { id: "poses", label: "포즈/표정", icon: Smile },
    { id: "projects", label: "관련 프로젝트", icon: FolderOpen },
  ];

  const handleDelete = () => {
    if (confirm("정말 이 캐릭터를 삭제하시겠습니까?")) {
      navigate("/assets/characters");
    }
  };

  const handleGeneratePose = async () => {
    if (!posePrompt.trim()) return;
    setPoseGenerating(true);
    setPoseError("");
    setGeneratedPoseUrl(null);

    try {
      const numId = parseInt(String(id));
      const characterIds = !isNaN(numId) ? [numId] : [];

      const res = await apiRequest("POST", "/api/generate-pose", {
        characterIds,
        prompt: posePrompt,
      });
      const data = await res.json();

      if (data.imageUrl) {
        setGeneratedPoseUrl(data.imageUrl);
        // Add to poses list
        setPoses((prev) => [
          ...prev,
          {
            id: `generated-${Date.now()}`,
            name: posePrompt,
            type: "생성됨",
            imageUrl: data.imageUrl,
          },
        ]);
      }
    } catch (err: any) {
      const message = err?.message || "포즈 생성에 실패했습니다.";
      if (/403/.test(message)) {
        setPoseError("크레딧이 부족합니다.");
      } else if (/401/.test(message)) {
        setPoseError("로그인이 필요합니다.");
      } else {
        setPoseError(message);
      }
    } finally {
      setPoseGenerating(false);
    }
  };

  const displayStyle = styleLabels[character.style || ""] || character.style || "심플라인";

  if (loading) {
    return (
      <StudioLayout>
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#00e5cc] animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">캐릭터 정보 불러오는 중...</p>
        </div>
      </StudioLayout>
    );
  }

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/assets/characters"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          캐릭터 목록으로 돌아가기
        </Link>

        {/* Character Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Character Image */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name || "캐릭터"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-20 h-20 text-muted-foreground/20" />
              )}
            </div>
          </div>

          {/* Character Info */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-black text-foreground">
                  {character.name || `캐릭터 ${character.id}`}
                </h1>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {character.description || character.prompt || "AI로 생성된 캐릭터입니다."}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-cyan-500/20 text-cyan-400">
                <Tag className="w-5 h-5" />
                {displayStyle}
              </span>
              {character.gender && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-purple-500/20 text-purple-400">
                  <UserCircle className="w-5 h-5" />
                  {character.gender}
                </span>
              )}
              {character.mood && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-pink-500/20 text-pink-400">
                  <Smile className="w-5 h-5" />
                  {character.mood}
                </span>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-6">
              {character.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  생성일: {new Date(character.createdAt).toLocaleDateString("ko-KR")}
                </span>
              )}
              {character.updatedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  수정일: {new Date(character.updatedAt).toLocaleDateString("ko-KR")}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
                <Edit3 className="w-5 h-5" />
                수정
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-5 h-5" />
                다운로드
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
                삭제
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#00e5cc] text-[#00e5cc]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">상세 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">이름</p>
                  <p className="text-sm text-foreground">{character.name || `캐릭터 ${character.id}`}</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">스타일</p>
                  <p className="text-sm text-foreground">{displayStyle}</p>
                </div>
                {character.gender && (
                  <div>
                    <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">성별</p>
                    <p className="text-sm text-foreground">{character.gender}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {character.mood && (
                  <div>
                    <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">분위기</p>
                    <p className="text-sm text-foreground">{character.mood}</p>
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">설명</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {character.description || character.prompt || "설명이 없습니다."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "poses" && (
          <div className="space-y-6">
            {/* Pose Generation */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                <Sparkles className="w-5 h-5 inline mr-2 text-[#00e5cc]" />
                새 포즈/표정 생성
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={posePrompt}
                  onChange={(e) => setPosePrompt(e.target.value)}
                  placeholder="포즈 또는 표정을 설명하세요 (예: 팔짱 끼고 웃는 포즈)"
                  disabled={poseGenerating}
                  className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !poseGenerating) handleGeneratePose();
                  }}
                />
                <Button
                  onClick={handleGeneratePose}
                  disabled={!posePrompt.trim() || poseGenerating}
                  className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2 shrink-0"
                >
                  {poseGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      생성
                    </>
                  )}
                </Button>
              </div>

              {poseError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {poseError}
                </div>
              )}

              {generatedPoseUrl && (
                <div className="mt-4 p-4 rounded-xl border border-[#00e5cc]/30 bg-[#00e5cc]/5">
                  <p className="text-sm font-medium text-[#00e5cc] mb-2">생성 완료!</p>
                  <img
                    src={generatedPoseUrl}
                    alt="생성된 포즈"
                    className="w-48 h-48 object-cover rounded-xl border border-border"
                  />
                </div>
              )}
            </div>

            {/* Existing Poses */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {poses.map((pose) => (
                <div
                  key={pose.id}
                  className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-[#00e5cc]/30 transition-all cursor-pointer"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {pose.imageUrl ? (
                      <img src={pose.imageUrl} alt={pose.name} className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-10 h-10 text-muted-foreground/20" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground truncate">{pose.name}</h3>
                    <span
                      className={`text-[13px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                        pose.type === "포즈"
                          ? "bg-cyan-500/20 text-cyan-400"
                          : pose.type === "표정"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {pose.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-3">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-border bg-card p-4 hover:shadow-lg hover:border-[#00e5cc]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{project.title}</h3>
                        <p className="text-[13px] text-muted-foreground">
                          {new Date(project.updatedAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[13px] px-3 py-1 rounded-full font-medium ${
                        project.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : project.status === "review"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {project.status === "published"
                        ? "발행됨"
                        : project.status === "review"
                        ? "검토중"
                        : "초안"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">관련 프로젝트가 없습니다</p>
                <p className="text-sm text-muted-foreground mt-1">이 캐릭터를 사용한 프로젝트가 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
