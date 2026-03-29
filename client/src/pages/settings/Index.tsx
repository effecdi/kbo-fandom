import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link, useNavigate } from "react-router";
import {
  User, Bell, Shield, CreditCard, Palette, Globe, ArrowRight,
  Mail, Tag, Heart, Star, Users, Eye, EyeOff, Lock, Trash2,
  Moon, Sun, MessageCircle, Send, Check, AlertCircle, RefreshCw,
  ChevronRight, Sparkles, Crown, Volume2, VolumeX,
} from "lucide-react";
import {
  STORE_KEYS, type FandomUserProfile, seedIfEmpty,
  getFandomProfile, setFandomProfile, type FanCreator, listItems,
} from "@/lib/local-store";

const PROFILE_KEY = "olli-fandom-profile";

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  genres: string[];
  socialLinks: { platform: string; url: string }[];
}
import { useTheme } from "@/components/theme-provider";

type SettingsTab = "profile" | "fandom" | "notifications" | "privacy" | "theme";

export function SettingsIndex() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fandom, setFandom] = useState<FandomUserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fandom edit fields
  const [editBias, setEditBias] = useState("");
  const [editBiasWrecker, setEditBiasWrecker] = useState("");
  const [editNickname, setEditNickname] = useState("");

  // Notification settings
  const [notifFollower, setNotifFollower] = useState(true);
  const [notifLike, setNotifLike] = useState(true);
  const [notifComment, setNotifComment] = useState(true);
  const [notifDM, setNotifDM] = useState(true);
  const [notifEvent, setNotifEvent] = useState(true);

  // Privacy settings
  const [profilePublic, setProfilePublic] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);
  const [allowDM, setAllowDM] = useState<"everyone" | "followers" | "none">("everyone");

  const themeColor = "var(--fandom-primary, #7B2FF7)";

  useEffect(() => {
    seedIfEmpty();
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
    const fp = getFandomProfile();
    if (fp) {
      setFandom(fp);
      setEditBias(fp.favoritePlayer);
      setEditBiasWrecker(fp.secondPlayer);
      setEditNickname(fp.nickname);
    }

    // Load notification prefs
    try {
      const raw = localStorage.getItem("olli-fandom-notif-prefs");
      if (raw) {
        const prefs = JSON.parse(raw);
        setNotifFollower(prefs.follower ?? true);
        setNotifLike(prefs.like ?? true);
        setNotifComment(prefs.comment ?? true);
        setNotifDM(prefs.dm ?? true);
        setNotifEvent(prefs.event ?? true);
      }
    } catch {}

    // Load privacy prefs
    try {
      const raw = localStorage.getItem("olli-fandom-privacy-prefs");
      if (raw) {
        const prefs = JSON.parse(raw);
        setProfilePublic(prefs.profilePublic ?? true);
        setShowFollowers(prefs.showFollowers ?? true);
        setAllowDM(prefs.allowDM ?? "everyone");
      }
    } catch {}
  }, []);

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveFandom = () => {
    if (!fandom) return;
    const updated: FandomUserProfile = {
      ...fandom,
      favoritePlayer: editBias,
      secondPlayer: editBiasWrecker,
      nickname: editNickname,
    };
    setFandomProfile(updated);
    setFandom(updated);
    showFeedback("팬덤 프로필이 저장되었습니다.");
  };

  const handleSaveNotifications = () => {
    const prefs = {
      follower: notifFollower,
      like: notifLike,
      comment: notifComment,
      dm: notifDM,
      event: notifEvent,
    };
    localStorage.setItem("olli-fandom-notif-prefs", JSON.stringify(prefs));
    showFeedback("알림 설정이 저장되었습니다.");
  };

  const handleSavePrivacy = () => {
    const prefs = {
      profilePublic,
      showFollowers,
      allowDM,
    };
    localStorage.setItem("olli-fandom-privacy-prefs", JSON.stringify(prefs));
    showFeedback("개인정보 설정이 저장되었습니다.");
  };

  const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "프로필", icon: User },
    { id: "fandom", label: "팬덤", icon: Heart },
    { id: "notifications", label: "알림", icon: Bell },
    { id: "privacy", label: "개인정보", icon: Shield },
    { id: "theme", label: "테마", icon: Palette },
  ];

  const myCreator = fandom
    ? listItems<FanCreator>(STORE_KEYS.FAN_CREATORS).find((c) => c.nickname === fandom.nickname)
    : null;

  return (
    <StudioLayout>
      <div className="max-w-4xl mx-auto">
        {/* Feedback */}
        {feedback && (
          <div
            className={`fixed top-20 right-8 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {feedback.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {feedback.message}
          </div>
        )}

        <h1 className="text-2xl font-black text-foreground mb-6">설정</h1>

        <div className="flex gap-6">
          {/* Left Tabs */}
          <div className="w-52 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-2 space-y-1 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    activeTab === tab.id
                      ? "font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  style={
                    activeTab === tab.id
                      ? { background: `color-mix(in srgb, ${themeColor} 12%, transparent)`, color: themeColor }
                      : {}
                  }
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* ──── Profile Tab ──── */}
            {activeTab === "profile" && (
              <>
                {/* Profile Card */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-5 mb-5">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
                      style={{ background: themeColor }}
                    >
                      {fandom?.nickname?.charAt(0) || profile?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        {fandom?.nickname || profile?.name || "사용자"}
                      </h2>
                      <p className="text-sm text-muted-foreground">{profile?.email || ""}</p>
                      {fandom && (
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-[13px] px-2 py-0.5 rounded-full text-white font-semibold"
                            style={{ background: themeColor }}
                          >
                            {fandom.groupName}
                          </span>
                          <span className="text-[13px] text-muted-foreground">{fandom.fandomName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/settings/profile"
                    className="flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all"
                  >
                    <span className="text-sm font-medium text-foreground">프로필 상세 편집</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>

                {/* Stats */}
                {myCreator && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                      내 활동
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "팬아트", value: myCreator.fanartCount },
                        { label: "팔로워", value: myCreator.followerCount },
                        { label: "팔로잉", value: myCreator.followingCount },
                        { label: "총 좋아요", value: myCreator.totalLikes },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-3 bg-muted rounded-xl">
                          <p className="text-lg font-black text-foreground">{s.value.toLocaleString()}</p>
                          <p className="text-[13px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Links */}
                <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
                  {[
                    { icon: CreditCard, label: "결제 내역", path: "/payments" },
                    { icon: RefreshCw, label: "팬덤 재인증", path: "/fandom/onboarding" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* ──── Fandom Tab ──── */}
            {activeTab === "fandom" && fandom && (
              <>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4" style={{ color: themeColor }} />
                    팬덤 프로필
                  </h3>

                  <div className="space-y-4">
                    {/* Group (read-only) */}
                    <div>
                      <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">내 그룹</label>
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted rounded-lg">
                        <span
                          className="text-[13px] px-2 py-0.5 rounded-full text-white font-semibold"
                          style={{ background: themeColor }}
                        >
                          {fandom.groupName}
                        </span>
                        <span className="text-sm text-muted-foreground">({fandom.fandomName})</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-1">그룹 변경은 "팬덤 재인증"으로 가능합니다</p>
                    </div>

                    {/* Nickname */}
                    <div>
                      <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">닉네임</label>
                      <input
                        type="text"
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 border-0"
                        style={{ "--tw-ring-color": themeColor } as any}
                      />
                    </div>

                    {/* Bias */}
                    <div>
                      <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">최애 멤버</label>
                      <input
                        type="text"
                        value={editBias}
                        onChange={(e) => setEditBias(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 border-0"
                        style={{ "--tw-ring-color": themeColor } as any}
                      />
                    </div>

                    {/* Bias Wrecker */}
                    <div>
                      <label className="text-[13px] font-medium text-muted-foreground block mb-1.5">차애 멤버</label>
                      <input
                        type="text"
                        value={editBiasWrecker}
                        onChange={(e) => setEditBiasWrecker(e.target.value)}
                        className="w-full px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 border-0"
                        style={{ "--tw-ring-color": themeColor } as any}
                      />
                    </div>

                    {/* Verified badge */}
                    <div className="flex items-center gap-2 pt-2">
                      {fandom.verified ? (
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400">
                          <Check className="w-4 h-4" />
                          인증완료 ({new Date(fandom.verifiedAt).toLocaleDateString("ko-KR")})
                        </span>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">미인증</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFandom}
                    className="mt-5 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: themeColor }}
                  >
                    저장
                  </button>
                </div>
              </>
            )}

            {activeTab === "fandom" && !fandom && (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground mb-4">팬덤 인증이 필요합니다</p>
                <Link
                  to="/fandom/onboarding"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: themeColor }}
                >
                  <Sparkles className="w-4 h-4" />
                  팬덤 인증하기
                </Link>
              </div>
            )}

            {/* ──── Notifications Tab ──── */}
            {activeTab === "notifications" && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: themeColor }} />
                  알림 설정
                </h3>
                <div className="space-y-4">
                  {[
                    { key: "follower", label: "새 팔로워", desc: "누군가 나를 팔로우할 때", icon: Users, value: notifFollower, set: setNotifFollower },
                    { key: "like", label: "좋아요", desc: "내 게시물에 좋아요를 받을 때", icon: Heart, value: notifLike, set: setNotifLike },
                    { key: "comment", label: "댓글 / 답글", desc: "내 게시물에 댓글이 달릴 때", icon: MessageCircle, value: notifComment, set: setNotifComment },
                    { key: "dm", label: "다이렉트 메시지", desc: "새 DM을 받을 때", icon: Send, value: notifDM, set: setNotifDM },
                    { key: "event", label: "이벤트 / 챌린지", desc: "참여 중인 이벤트 소식", icon: Crown, value: notifEvent, set: setNotifEvent },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-[13px] text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={`w-11 h-6 rounded-full transition-all relative ${
                          item.value ? "" : "bg-muted"
                        }`}
                        style={item.value ? { background: themeColor } : {}}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                            item.value ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveNotifications}
                  className="mt-5 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: themeColor }}
                >
                  저장
                </button>
              </div>
            )}

            {/* ──── Privacy Tab ──── */}
            {activeTab === "privacy" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: themeColor }} />
                    공개 범위
                  </h3>
                  <div className="space-y-4">
                    {/* Public profile */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          {profilePublic ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">프로필 공개</p>
                          <p className="text-[13px] text-muted-foreground">다른 팬들이 내 프로필을 볼 수 있습니다</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setProfilePublic(!profilePublic)}
                        className={`w-11 h-6 rounded-full transition-all relative ${profilePublic ? "" : "bg-muted"}`}
                        style={profilePublic ? { background: themeColor } : {}}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${profilePublic ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>

                    {/* Show followers */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">팔로워 목록 공개</p>
                          <p className="text-[13px] text-muted-foreground">팔로워/팔로잉 숫자와 목록을 표시합니다</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFollowers(!showFollowers)}
                        className={`w-11 h-6 rounded-full transition-all relative ${showFollowers ? "" : "bg-muted"}`}
                        style={showFollowers ? { background: themeColor } : {}}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${showFollowers ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* DM Privacy */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4" style={{ color: themeColor }} />
                    DM 수신 설정
                  </h3>
                  <div className="space-y-2">
                    {([
                      { value: "everyone" as const, label: "모든 사람", desc: "누구나 DM을 보낼 수 있습니다" },
                      { value: "followers" as const, label: "팔로워만", desc: "나를 팔로우하는 사람만 DM을 보낼 수 있습니다" },
                      { value: "none" as const, label: "받지 않음", desc: "DM을 받지 않습니다" },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAllowDM(opt.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          allowDM === opt.value ? "border" : "hover:bg-muted"
                        }`}
                        style={
                          allowDM === opt.value
                            ? { borderColor: themeColor, background: `color-mix(in srgb, ${themeColor} 8%, transparent)` }
                            : {}
                        }
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            allowDM === opt.value ? "" : "border-muted-foreground"
                          }`}
                          style={allowDM === opt.value ? { borderColor: themeColor } : {}}
                        >
                          {allowDM === opt.value && (
                            <div className="w-2 h-2 rounded-full" style={{ background: themeColor }} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{opt.label}</p>
                          <p className="text-[13px] text-muted-foreground">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSavePrivacy}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: themeColor }}
                >
                  저장
                </button>
              </div>
            )}

            {/* ──── Theme Tab ──── */}
            {activeTab === "theme" && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                  <Palette className="w-4 h-4" style={{ color: themeColor }} />
                  테마 설정
                </h3>

                {/* Dark Mode */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                    <div>
                      <p className="text-sm font-medium text-foreground">다크 모드</p>
                      <p className="text-[13px] text-muted-foreground">현재: {theme === "dark" ? "다크" : "라이트"} 모드</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w-11 h-6 rounded-full transition-all relative ${theme === "dark" ? "" : "bg-muted"}`}
                    style={theme === "dark" ? { background: themeColor } : {}}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${theme === "dark" ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">언어</p>
                      <p className="text-[13px] text-muted-foreground">앱 표시 언어를 선택합니다</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-lg">한국어</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
