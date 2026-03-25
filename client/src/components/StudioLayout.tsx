import { useState, ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Heart,
  Moon,
  Sun,
  ChevronRight,
  Rss,
  Sparkles,
  Trophy,
  Palette,
  Image,
  FolderOpen,
  RefreshCw,
  MessageCircle,
  Star,
  TrendingUp,
  Flame,
  Crown,
  Pen,
  Send,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTheme } from "@/components/theme-provider";
import { getFandomProfile, clearFandomProfile } from "@/lib/local-store";

interface NavSection {
  title: string;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
  }[];
}

interface StudioLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

export function StudioLayout({ children, noPadding }: StudioLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "내 팬덤": true,
    "창작": true,
    "커뮤니티": true,
  });

  const fandomProfile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const navSections: NavSection[] = [
    {
      title: "내 팬덤",
      items: [
        { icon: Heart, label: "팬덤 홈", path: "/fandom" },
        ...(fandomProfile?.groupId
          ? [{ icon: Star, label: "내 그룹", path: `/fandom/groups/${fandomProfile.groupId}` }]
          : []),
        { icon: Rss, label: "팬덤 피드", path: "/fandom/feed" },
      ],
    },
    {
      title: "창작",
      items: [
        { icon: Pen, label: "에디터", path: "/editor/new" },
        { icon: Sparkles, label: "팬아트 만들기", path: "/fandom/create" },
        { icon: FolderOpen, label: "내 작품", path: "/studio" },
      ],
    },
    {
      title: "커뮤니티",
      items: [
        { icon: Users, label: "아이돌 그룹", path: "/fandom/groups" },
        { icon: Crown, label: "크리에이터", path: "/fandom/fans" },
        { icon: Trophy, label: "이벤트 / 챌린지", path: "/fandom/events" },
        { icon: TrendingUp, label: "팬아트 랭킹", path: "/fandom/feed" },
        { icon: MessageCircle, label: "팬 토크", path: "/fandom/talk" },
        { icon: Send, label: "다이렉트 메시지", path: "/fandom/messages" },
      ],
    },
    {
      title: "설정",
      items: [
        { icon: Settings, label: "프로필 설정", path: "/settings" },
        { icon: RefreshCw, label: "팬덤 재인증", path: "/fandom/onboarding" },
      ],
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path + "/"));

  const handleLogout = () => {
    clearFandomProfile();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Sidebar */}
      <aside className="w-60 border-r flex flex-col fixed h-screen bg-card border-border">
        {/* Logo / Group Badge */}
        <div className="p-5 border-b border-border">
          <Link to="/fandom" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
              style={{ background: themeColor }}
            >
              {fandomProfile?.groupName?.charAt(0) || <Heart className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-lg font-black block truncate" style={{ color: themeColor }}>
                {fandomProfile ? `${fandomProfile.groupName}` : "MY FANDOM"}
              </span>
              {fandomProfile && (
                <span className="text-xs text-muted-foreground truncate block">
                  {fandomProfile.fandomName}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Profile Card */}
        {fandomProfile && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: themeColor }}
              >
                {fandomProfile.nickname.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{fandomProfile.nickname}</p>
                <p className="text-xs text-muted-foreground truncate">
                  최애: {fandomProfile.bias}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 min-h-0 p-4 overflow-y-auto">
          <div className="space-y-4">
            {navSections.map((section) => {
              const isSectionExpanded = expandedSections[section.title] !== false;
              return (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>{section.title}</span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${isSectionExpanded ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isSectionExpanded && (
                    <div className="mt-1 space-y-0.5">
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                            isActive(item.path)
                              ? "font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          style={
                            isActive(item.path)
                              ? { background: `color-mix(in srgb, ${themeColor} 10%, transparent)`, color: themeColor }
                              : {}
                          }
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t relative border-border shrink-0">
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all hover:bg-muted"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: themeColor }}
            >
              {fandomProfile?.nickname?.charAt(0) || "?"}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">{fandomProfile?.nickname || "게스트"}</p>
              <p className="text-xs text-muted-foreground">
                {fandomProfile?.groupName || "팬덤 미인증"}
              </p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
          {userMenuOpen && (
            <div className="absolute left-4 right-4 bottom-20 rounded-xl shadow-xl overflow-hidden z-50 bg-card border border-border">
              <div className="py-2">
                <button
                  onClick={() => { setUserMenuOpen(false); navigate("/settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Settings className="w-5 h-5" />
                  <span>설정</span>
                </button>
                <div className="border-t my-1 border-border" />
                <button
                  onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* Top Header */}
        <header className="h-16 border-b fixed top-0 right-0 left-60 z-10 bg-card border-border">
          <div className="h-full px-8 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="팬아트, 그룹, 이벤트 검색..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground"
                  style={{ "--tw-ring-color": themeColor } as any}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 relative">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all hover:bg-muted"
                title="다크모드 전환"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              <button className="relative p-2 rounded-lg transition-all hover:bg-muted">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: themeColor }}
                />
              </button>

              <div className="relative">
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: themeColor }}
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {fandomProfile?.nickname?.charAt(0) || "?"}
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl shadow-xl overflow-hidden z-50 bg-card border border-border">
                    <div className="py-2">
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/fandom"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>팬덤 홈</span>
                      </button>
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/settings"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Settings className="w-5 h-5" />
                        <span>설정</span>
                      </button>
                      <div className="border-t my-1 border-border" />
                      <button
                        onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={`pt-24 ${noPadding ? "" : "px-8 pb-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
