import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  Plus,
  X,
  Check,
  AlertCircle,
  Globe,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedIfEmpty } from "@/lib/local-store";

const PROFILE_KEY = "olli-fandom-profile";

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  genres: string[];
  socialLinks: { platform: string; url: string }[];
}

const availableGenres = [
  "캐릭터 디자인",
  "일러스트",
  "브랜드 마스코트",
  "이모티콘",
  "웹툰",
  "인스타툰",
  "로고 디자인",
  "패키지 디자인",
  "영상 콘텐츠",
  "포스터",
  "UI/UX",
  "모션 그래픽",
];

const platformOptions = [
  "Instagram",
  "Twitter",
  "YouTube",
  "TikTok",
  "Behance",
  "Dribbble",
  "LinkedIn",
  "기타",
];

export function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Load profile on mount
  useEffect(() => {
    seedIfEmpty();
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const profile: UserProfile = JSON.parse(raw);
        setName(profile.name || "");
        setEmail(profile.email || "");
        setBio(profile.bio || "");
        setAvatar(profile.avatar || "");
        setGenres(profile.genres || []);
        setSocialLinks(profile.socialLinks || []);
      }
    } catch {
      // ignore parse error
    }
    setLoaded(true);
  }, []);

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "Instagram", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: "platform" | "url", value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const handleSave = () => {
    if (!name.trim()) {
      showFeedback("이름을 입력해주세요.", "error");
      return;
    }
    if (!email.trim()) {
      showFeedback("이메일을 입력해주세요.", "error");
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatar,
      genres,
      socialLinks: socialLinks.filter((link) => link.url.trim() !== ""),
    };

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      showFeedback("프로필이 성공적으로 저장되었습니다.");
    } catch {
      showFeedback("저장에 실패했습니다. 다시 시도해주세요.", "error");
    }
  };

  if (!loaded) return null;

  return (
    <StudioLayout>
      <div className="max-w-2xl mx-auto">
        {/* Feedback Toast */}
        {feedback && (
          <div
            className={`fixed top-20 right-8 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {feedback.message}
          </div>
        )}

        {/* Back Link */}
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          설정으로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">프로필 설정</h1>
          <p className="text-muted-foreground mt-1">프로필 정보를 수정하세요</p>
        </div>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">프로필 사진</p>
                <p className="text-[13px] text-muted-foreground">JPG, PNG. 최대 2MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="rounded-2xl border bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  이름 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 py-2.5 rounded-lg border bg-muted border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  이메일 <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="w-full px-4 py-2.5 rounded-lg border bg-muted border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] placeholder-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">소개</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="간단한 자기소개를 입력하세요"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border bg-muted border-border text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#00e5cc] placeholder-muted-foreground"
                />
                <p className="text-[13px] text-muted-foreground mt-1">
                  {bio.length}/200자
                </p>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-[#00e5cc]" />
              <h2 className="text-lg font-bold text-foreground">전문 분야</h2>
            </div>
            <p className="text-[13px] text-muted-foreground mb-4">
              해당하는 분야를 선택하세요 (복수 선택 가능)
            </p>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    genres.includes(genre)
                      ? "border-[#00e5cc] bg-[#00e5cc]/10 text-[#00e5cc]"
                      : "border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {genres.includes(genre) && (
                    <Check className="w-5 h-5 inline mr-1" />
                  )}
                  {genre}
                </button>
              ))}
            </div>
            {genres.length > 0 && (
              <p className="text-[13px] text-[#00e5cc] mt-3">
                {genres.length}개 선택됨
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00e5cc]" />
                <h2 className="text-lg font-bold text-foreground">소셜 링크</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addSocialLink}
                className="gap-1.5 text-[13px]"
              >
                <Plus className="w-5 h-5" />
                추가
              </Button>
            </div>

            {socialLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                소셜 링크가 없습니다. "추가" 버튼을 눌러 추가하세요.
              </p>
            ) : (
              <div className="space-y-3">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                      className="w-36 px-3 py-2 rounded-lg border bg-muted border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] appearance-none cursor-pointer shrink-0"
                    >
                      {platformOptions.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                      placeholder="URL을 입력하세요"
                      className="flex-1 px-3 py-2 rounded-lg border bg-muted border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] placeholder-muted-foreground"
                    />
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Link to="/settings">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-5 h-5" />
                취소
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2 px-8"
            >
              <Save className="w-5 h-5" />
              저장
            </Button>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
