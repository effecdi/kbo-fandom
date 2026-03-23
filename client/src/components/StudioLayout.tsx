import { useState, ReactNode } from "react";
import {
  LayoutDashboard,
  Wand2,
  Users,
  FolderOpen,
  DollarSign,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Building2,
  Sparkles,
  Target,
  BarChart3,
  MessageSquare,
  SwitchCamera,
  CreditCard,
  Image,
  Rss,
  HelpCircle,
  Moon,
  Sun,
  ChevronRight,
  Plus,
  Palette,
  FileText,
  ShoppingBag,
  PieChart,
  UserCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
const olliLogo = "/favicon.png";
import { useTheme } from "@/components/theme-provider";

interface NavChild {
  label: string;
  path: string;
  roles?: ("creator" | "business")[];
}

interface NavSection {
  title: string;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path?: string;
    roles?: ("creator" | "business")[];
    children?: NavChild[];
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
    "스튜디오": true,
  });

  // Persist role in localStorage so it survives navigation
  const ROLE_KEY = "olli_user_role";
  const [userRole, setUserRoleState] = useState<"creator" | "business">(() => {
    const stored = localStorage.getItem(ROLE_KEY) as "creator" | "business" | null;
    if (stored) return stored;
    // Fallback: detect from URL on first visit
    const isBiz = location.pathname.startsWith("/business") || location.pathname.startsWith("/market") || location.pathname.startsWith("/assets/brand");
    return isBiz ? "business" : "creator";
  });
  const setUserRole = (role: "creator" | "business") => {
    setUserRoleState(role);
    localStorage.setItem(ROLE_KEY, role);
  };

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const navSections: NavSection[] = [
    {
      title: "스튜디오",
      items: [
        {
          icon: FolderOpen,
          label: "프로젝트",
          path: "/studio",
        },
        {
          icon: Plus,
          label: "새 프로젝트",
          path: "/studio/new",
        },
      ],
    },
    {
      title: "에셋",
      items: [
        {
          icon: Image,
          label: "캐릭터",
          path: "/assets/characters",
        },
        {
          icon: Palette,
          label: "배경",
          path: "/assets",
        },
        {
          icon: FolderOpen,
          label: "브랜드 자산",
          path: "/assets/brand",
          roles: ["business"],
        },
      ],
    },
    {
      title: "갤러리",
      items: [
        {
          icon: Sparkles,
          label: "인기작품",
          path: "/gallery",
        },
        {
          icon: FolderOpen,
          label: "내 갤러리",
          path: "/gallery/mine",
        },
        {
          icon: Rss,
          label: "피드",
          path: "/gallery/feed",
        },
      ],
    },
    {
      title: "마켓",
      items: [
        {
          icon: Target,
          label: "캠페인",
          path: "/market/campaigns",
        },
        {
          icon: Users,
          label: "크리에이터 찾기",
          path: "/market/creators",
          roles: ["business"],
        },
        {
          icon: MessageSquare,
          label: "협업 관리",
          path: "/market/collaborations",
        },
      ],
    },
    {
      title: "대시보드",
      items: [
        {
          icon: PieChart,
          label: "분석",
          path: "/dashboard/analytics",
        },
        {
          icon: DollarSign,
          label: userRole === "creator" ? "수익" : "리포트",
          path: userRole === "creator" ? "/dashboard/revenue" : "/dashboard/reports",
        },
        {
          icon: UserCircle,
          label: "미디어킷",
          path: "/dashboard/media-kit",
          roles: ["creator"],
        },
      ],
    },
    {
      title: "설정",
      items: [
        {
          icon: Settings,
          label: "설정",
          path: "/settings",
        },
        {
          icon: User,
          label: "프로필",
          path: "/settings/profile",
        },
      ],
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path + "/"));

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Sidebar */}
      <aside className="w-60 border-r flex flex-col fixed h-screen bg-card border-border">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={olliLogo} alt="OLLI" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black text-[#00e5cc]">OLLI</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {navSections.map((section) => {
              const visibleItems = section.items.filter(
                (item) => !item.roles || item.roles.includes(userRole)
              );
              if (visibleItems.length === 0) return null;

              const isSectionExpanded = expandedSections[section.title] !== false;

              return (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>{section.title}</span>
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${isSectionExpanded ? "rotate-90" : ""}`}
                    />
                  </button>
                  {isSectionExpanded && (
                    <div className="mt-1 space-y-0.5">
                      {visibleItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path!}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                            isActive(item.path!)
                              ? "bg-[#00e5cc]/10 text-[#00e5cc] font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
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
        <div className="p-4 border-t relative border-border">
          <button
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all hover:bg-muted"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center">
              {userRole === "creator" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Building2 className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">사용자</p>
              <p className="text-xs text-muted-foreground">
                {userRole === "creator" ? "작가 모드" : "기업 모드"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {userMenuOpen && (
            <div className="absolute left-4 right-4 bottom-20 rounded-xl shadow-xl overflow-hidden z-50 bg-card border border-border">
              <div className="py-2">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>대시보드</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/gallery/mine");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Image className="w-4 h-4" />
                  <span>내 갤러리</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/payments");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>결제 내역</span>
                </button>
                <div className="border-t my-1 border-border" />
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setUserRole(userRole === "creator" ? "business" : "creator");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <SwitchCamera className="w-4 h-4" />
                  <span>역할 변경 ({userRole === "creator" ? "기업" : "작가"})</span>
                </button>
                <div className="border-t my-1 border-border" />
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
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
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground"
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
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00e5cc] rounded-full" />
              </button>

              <div className="relative">
                <button
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {userRole === "creator" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Building2 className="w-5 h-5 text-white" />
                  )}
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl shadow-xl overflow-hidden z-50 bg-card border border-border">
                    <div className="py-2">
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/dashboard"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>대시보드</span>
                      </button>
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/settings"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Settings className="w-4 h-4" />
                        <span>설정</span>
                      </button>
                      <div className="border-t my-1 border-border" />
                      <button
                        onClick={() => { setProfileMenuOpen(false); navigate("/"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
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
