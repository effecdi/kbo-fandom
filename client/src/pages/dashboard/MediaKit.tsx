import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Download,
  Share2,
  Users,
  Eye,
  TrendingUp,
  Palette,
  Globe,
  Edit3,
  Image,
  DollarSign,
  FileText,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type UserProfile,
  type ProjectRecord,
  type RevenueRecord,
  type Collaboration,
} from "@/lib/local-store";

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `\u20A9${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `\u20A9${(amount / 1_000).toFixed(0)}K`;
  }
  return `\u20A9${amount.toLocaleString()}`;
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    name: "",
    email: "",
    bio: "",
    avatar: "",
    genres: [],
    socialLinks: [],
  };
}

function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORE_KEYS.PROFILE, JSON.stringify(profile));
}

// Platform icon mapping
function getPlatformIcon(platform: string) {
  const lower = platform.toLowerCase();
  if (lower.includes("instagram")) return Globe;
  if (lower.includes("twitter") || lower.includes("x")) return Globe;
  if (lower.includes("youtube")) return Globe;
  return Globe;
}

const gradientColors = [
  "from-cyan-500 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-violet-500",
];

export function MediaKitPage() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editGenres, setEditGenres] = useState("");
  const [editSocialLinks, setEditSocialLinks] = useState<{ platform: string; url: string }[]>([]);

  useEffect(() => {
    seedIfEmpty();
    const p = loadProfile();
    setProfile(p);
    setProjects(listItems<ProjectRecord>(STORE_KEYS.PROJECTS));
    setRevenue(listItems<RevenueRecord>(STORE_KEYS.REVENUE));
    setCollaborations(listItems<Collaboration>(STORE_KEYS.COLLABORATIONS));
  }, []);

  // Computed stats from real data
  const totalCompletedRevenue = revenue
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.status === "published").length;
  const completedCollabs = collaborations.filter((c) => c.status === "completed").length;

  const stats = [
    { label: "총 프로젝트", value: totalProjects.toString(), icon: FileText },
    { label: "발행 작품", value: publishedProjects.toString(), icon: Eye },
    { label: "총 수익", value: formatCurrency(totalCompletedRevenue), icon: DollarSign },
    { label: "완료 협업", value: completedCollabs.toString(), icon: Users },
  ];

  // Portfolio from real projects
  const portfolioProjects = projects.slice(0, 6);

  function startEditing() {
    setEditName(profile.name);
    setEditBio(profile.bio);
    setEditEmail(profile.email);
    setEditGenres(profile.genres.join(", "));
    setEditSocialLinks(profile.socialLinks.map((sl) => ({ ...sl })));
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function handleSave() {
    const updatedProfile: UserProfile = {
      ...profile,
      name: editName.trim(),
      bio: editBio.trim(),
      email: editEmail.trim(),
      genres: editGenres.split(",").map((g) => g.trim()).filter(Boolean),
      socialLinks: editSocialLinks.filter((sl) => sl.platform.trim() && sl.url.trim()),
    };
    saveProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsEditing(false);
  }

  function addSocialLink() {
    setEditSocialLinks([...editSocialLinks, { platform: "", url: "" }]);
  }

  function removeSocialLink(index: number) {
    setEditSocialLinks(editSocialLinks.filter((_, i) => i !== index));
  }

  function updateSocialLink(index: number, field: "platform" | "url", value: string) {
    const updated = [...editSocialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setEditSocialLinks(updated);
  }

  // Generate initials from profile name
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "OC";

  return (
    <StudioLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">미디어킷</h1>
            <p className="text-muted-foreground mt-1">나만의 미디어킷을 만들고 공유하세요</p>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={startEditing}>
              <Edit3 className="w-4 h-4" />
              편집
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={cancelEditing}>
                <X className="w-4 h-4" />
                취소
              </Button>
              <Button size="sm" className="gap-2 bg-[#00e5cc] text-black hover:bg-[#00e5cc]/90" onClick={handleSave}>
                <Save className="w-4 h-4" />
                저장
              </Button>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-8">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-black text-white">{initials}</span>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">이름</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">이메일</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">소개</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">장르 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={editGenres}
                      onChange={(e) => setEditGenres(e.target.value)}
                      placeholder="캐릭터 디자인, 일러스트, 브랜드 마스코트"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">소셜 링크</label>
                  <button
                    onClick={addSocialLink}
                    className="text-xs text-[#00e5cc] hover:text-[#00e5cc]/80 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    추가
                  </button>
                </div>
                <div className="space-y-2">
                  {editSocialLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.platform}
                        onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
                        placeholder="플랫폼 (예: Instagram)"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                        placeholder="URL"
                        className="flex-[2] px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                      />
                      <button
                        onClick={() => removeSocialLink(i)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editSocialLinks.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">소셜 링크가 없습니다. 추가 버튼을 눌러 추가하세요.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-black text-white">{initials}</span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-xl font-black text-foreground mb-1">{profile.name || "이름 없음"}</h2>
                {profile.email && (
                  <p className="text-xs text-muted-foreground mb-2">{profile.email}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {profile.bio || "소개를 작성해 주세요"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#00e5cc]/10 text-[#00e5cc] border border-[#00e5cc]/20"
                    >
                      {genre}
                    </span>
                  ))}
                  {profile.genres.length === 0 && (
                    <span className="text-xs text-muted-foreground">장르를 추가해 주세요</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-2xl p-5 border bg-card border-border text-center hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Portfolio Highlights */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">포트폴리오 하이라이트</h2>
            <Link to="/assets/characters">
              <Button variant="ghost" size="sm" className="text-[#00e5cc] hover:text-[#00e5cc]/80 gap-1">
                <Image className="w-4 h-4" />
                전체 보기
              </Button>
            </Link>
          </div>
          {portfolioProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">프로젝트가 없습니다</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolioProjects.map((project, idx) => {
                const colorClass = gradientColors[idx % gradientColors.length];
                const statusLabel = project.status === "published" ? "발행" : project.status === "draft" ? "초안" : "검토";
                return (
                  <div key={project.id} className="group relative">
                    <div className={`aspect-square rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center cursor-pointer group-hover:scale-[1.02] transition-transform`}>
                      <Palette className="w-8 h-8 text-white/60" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mt-2 text-center">{project.title}</p>
                    <p className="text-[10px] text-muted-foreground/60 text-center">{statusLabel} · {project.panels}컷</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">소셜 링크</h2>
          {profile.socialLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">소셜 링크가 없습니다. 편집 버튼을 눌러 추가하세요.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.socialLinks.map((link, i) => {
                const LinkIcon = getPlatformIcon(link.platform);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{link.platform}</p>
                      <p className="text-xs text-muted-foreground">{link.url}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 gap-2 bg-[#00e5cc] text-black hover:bg-[#00e5cc]/90 font-bold py-6 text-base">
            <Download className="w-5 h-5" />
            미디어킷 다운로드
          </Button>
          <Button variant="outline" className="flex-1 gap-2 font-bold py-6 text-base">
            <Share2 className="w-5 h-5" />
            미디어킷 공유
          </Button>
        </div>
      </div>
    </StudioLayout>
  );
}
