import { useState, ReactNode } from "react";
import {
  LayoutDashboard,
  Wand2,
  Users,
  FileText,
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
  Home,
  Image,
  Briefcase,
  Rss,
  HelpCircle,
  Moon,
  Sun,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
const olliLogo = "/favicon.png";
import { useTheme } from "@/components/theme-provider";

interface NavItemSingle {
  type: "single";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface NavItemDropdown {
  type: "dropdown";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  isOpen: boolean;
  toggle: () => void;
  children: { label: string; path: string }[];
}

type NavItem = NavItemSingle | NavItemDropdown;

interface DashboardLayoutProps {
  children: ReactNode;
  userType: "creator" | "business";
  noPadding?: boolean;
}

export function DashboardLayout({ children, userType, noPadding }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [businessMenuOpen, setBusinessMenuOpen] = useState(false);

  // 작가 모드는 원래 네비게이션 구조 사용
  const creatorNavItems: NavItem[] = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/creator/dashboard",
      type: "single"
    },
    { 
      icon: Wand2, 
      label: "Create", 
      type: "dropdown",
      isOpen: createMenuOpen,
      toggle: () => setCreateMenuOpen(!createMenuOpen),
      children: [
        { label: "New Character", path: "/creator/character/new" },
        { label: "Expression/Pose", path: "/creator/pose-expression" },
        { label: "Background / Items", path: "/creator/background" },
        { label: "Gallery", path: "/creator/character" },
      ]
    },
    { 
      icon: Sparkles, 
      label: "Tools", 
      badge: "Pro",
      type: "dropdown",
      isOpen: toolsMenuOpen,
      toggle: () => setToolsMenuOpen(!toolsMenuOpen),
      children: [
        { label: "Story Editor", path: "/creator/story" },
        { label: "Chat Maker", path: "/creator/chat-maker" },
        { label: "Speech Bubble", path: "/creator/speech-bubble" },
        { label: "Blur Effects", path: "/creator/blur-effects" },
        { label: "My Edits", path: "/creator/contents" },
      ]
    },
    { 
      icon: Briefcase, 
      label: "Business", 
      badge: "Pro",
      type: "dropdown",
      isOpen: businessMenuOpen,
      toggle: () => setBusinessMenuOpen(!businessMenuOpen),
      children: [
        { label: "Ad Match AI", path: "/creator/campaigns" },
        { label: "Projects", path: "/creator/projects" },
        { label: "Profile", path: "/creator/profile" },
      ]
    },
    { 
      icon: Rss, 
      label: "Feed", 
      path: "/creator/feed",
      type: "single"
    },
    { 
      icon: DollarSign, 
      label: "Pricing", 
      path: "/pricing",
      type: "single"
    },
  ];

  const businessNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: "대시보드", path: "/business/dashboard", type: "single" },
    { icon: Sparkles, label: "마스코트 생성", path: "/business/mascot", type: "single" },
    { icon: FolderOpen, label: "브랜드 자산", path: "/business/brand-assets", type: "single" },
    { icon: FileText, label: "콘텐츠 제작", path: "/business/content", type: "single" },
    { icon: Target, label: "캠페인 관리", path: "/business/campaigns", type: "single" },
    { icon: Users, label: "작가 탐색", path: "/business/creators", type: "single" },
    { icon: MessageSquare, label: "제안 관리", path: "/business/proposals", type: "single" },
    { icon: BarChart3, label: "리포트", path: "/business/reports", type: "single" },
    { icon: Settings, label: "설정", path: "/business/settings", type: "single" },
  ];

  const navItems = userType === "creator" ? creatorNavItems : businessNavItems;

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
      {/* Left Sidebar */}
      <aside className={`w-60 border-r flex flex-col fixed h-screen ${
        theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={olliLogo}
                alt="OLLI"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black text-[#00e5cc]">
              OLLI
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item, index) => {
              if (item.type === "single") {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path || index}
                    to={item.path!}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#00e5cc]/10 text-[#00e5cc] font-semibold"
                        : theme === "dark"
                        ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              } else if (item.type === "dropdown") {
                return (
                  <div key={index}>
                    <button
                      onClick={item.toggle}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full ${
                        theme === "dark"
                          ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform ${item.isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {item.isOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const isActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                                isActive
                                  ? "bg-[#00e5cc]/10 text-[#00e5cc] font-semibold"
                                  : theme === "dark"
                                  ? "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </nav>

        {/* User Menu */}
        <div className={`p-4 border-t relative ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
          <button
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
              theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
            }`}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center">
              {userType === "creator" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Building2 className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>사용자</p>
              <p className="text-xs text-gray-500">
                {userType === "creator" ? "작가 모드" : "기업 모드"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {userMenuOpen && (
            <div className={`absolute left-4 right-4 bottom-20 rounded-xl shadow-xl overflow-hidden z-50 ${
              theme === "dark" ? "bg-[#252525] border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <div className="py-2">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(userType === "creator" ? "/creator/dashboard" : "/business/dashboard");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    theme === "dark" 
                      ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>대시보드</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(userType === "creator" ? "/creator/character" : "/business/mascots");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    theme === "dark" 
                      ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>My Gallery</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/payments");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    theme === "dark" 
                      ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>결제 내역</span>
                </button>
                <div className={`border-t my-1 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}></div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    theme === "dark" 
                      ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <SwitchCamera className="w-4 h-4" />
                  <span>역할 변경</span>
                </button>
                <div className={`border-t my-1 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}></div>
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
        <header className={`h-18 border-b fixed top-0 right-0 left-60 z-10 ${
          theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"
        }`}>
          <div className="h-full px-8 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="검색..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent ${
                    theme === "dark"
                      ? "bg-[#252525] border-gray-700 text-white placeholder-gray-500"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 relative">
              {/* Credits Badge (Creator only) */}
              {userType === "creator" && (
                <button
                  onClick={() => navigate("/creator/pose-expression")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00e5cc] text-black text-sm font-bold hover:bg-[#00f0ff] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Credits: 150</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}

              {/* Help/Guide */}
              <button
                className={`p-2 rounded-lg transition-all ${
                  theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
                }`}
                title="사용 가이드"
              >
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
                }`}
                title="다크모드 전환"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <button className={`relative p-2 rounded-lg transition-all ${
                theme === "dark" ? "hover:bg-gray-800/50" : "hover:bg-gray-100"
              }`}>
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00e5cc] rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <button
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  {userType === "creator" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Building2 className="w-5 h-5 text-white" />
                  )}
                </button>
                {profileMenuOpen && (
                  <div className={`absolute right-0 top-12 w-56 rounded-xl shadow-xl overflow-hidden z-50 ${
                    theme === "dark" ? "bg-[#252525] border border-gray-700" : "bg-white border border-gray-200"
                  }`}>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate(userType === "creator" ? "/creator/dashboard" : "/business/dashboard");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          theme === "dark" 
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>대시보드</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate(userType === "creator" ? "/creator/character" : "/business/mascots");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          theme === "dark" 
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Image className="w-4 h-4" />
                        <span>My Gallery</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/payments");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          theme === "dark" 
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>결제 내역</span>
                      </button>
                      <div className={`border-t my-1 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}></div>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          theme === "dark" 
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <SwitchCamera className="w-4 h-4" />
                        <span>역할 변경</span>
                      </button>
                      <div className={`border-t my-1 ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}></div>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
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
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={`pt-18 ${noPadding ? "" : "p-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}