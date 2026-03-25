import { useState, ReactNode } from "react";
import {
  LayoutDashboard,
  Wand2,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Sparkles,
  CreditCard,
  Home,
  Image,
  Rss,
  HelpCircle,
  Moon,
  Sun,
  ChevronRight,
  FolderOpen,
  Heart,
  Pen,
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
  noPadding?: boolean;
}

export function DashboardLayout({ children, noPadding }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      icon: Heart,
      label: "팬덤 홈",
      path: "/fandom",
      type: "single",
    },
    {
      icon: Pen,
      label: "에디터",
      path: "/editor/new",
      type: "single",
    },
    {
      icon: Wand2,
      label: "Create",
      type: "dropdown",
      isOpen: createMenuOpen,
      toggle: () => setCreateMenuOpen(!createMenuOpen),
      children: [
        { label: "New Character", path: "/create" },
        { label: "Expression/Pose", path: "/pose" },
        { label: "Gallery", path: "/gallery" },
      ]
    },
    {
      icon: Rss,
      label: "Feed",
      path: "/feed",
      type: "single"
    },
    {
      icon: CreditCard,
      label: "Pricing",
      path: "/pricing",
      type: "single"
    },
  ];

  return (
    <div className={`min-h-screen flex bg-background`}>
      {/* Left Sidebar */}
      <aside className={`w-60 border-r flex flex-col fixed h-screen bg-card border-border`}>
        {/* Logo */}
        <div className={`p-6 border-b border-border`}>
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
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-muted-foreground hover:bg-muted hover:text-foreground`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-5 h-5 transition-transform ${item.isOpen ? 'rotate-90' : ''}`} />
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
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
        <div className={`p-4 border-t relative border-border`}>
          <button
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all hover:bg-muted`}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold text-foreground`}>사용자</p>
            </div>
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </button>
          {userMenuOpen && (
            <div className={`absolute left-4 right-4 bottom-20 rounded-xl shadow-xl overflow-hidden z-50 bg-card border border-border`}>
              <div className="py-2">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/fandom");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>팬덤 홈</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/gallery");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
                >
                  <Image className="w-5 h-5" />
                  <span>My Gallery</span>
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/payments");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>결제 내역</span>
                </button>
                <div className={`border-t my-1 border-border`}></div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
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
        <header className={`h-18 border-b fixed top-0 right-0 left-60 z-10 bg-card border-border`}>
          <div className="h-full px-8 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="검색..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground`}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => navigate("/pose")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00e5cc] text-black text-sm font-bold hover:bg-[#00f0ff] transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Credits: 150</span>
                <ChevronDown className="w-5 h-5" />
              </button>

              <button
                className={`p-2 rounded-lg transition-all hover:bg-muted`}
                title="사용 가이드"
              >
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </button>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all hover:bg-muted`}
                title="다크모드 전환"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              <button className={`relative p-2 rounded-lg transition-all hover:bg-muted`}>
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00e5cc] rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                >
                  <User className="w-5 h-5 text-white" />
                </button>
                {profileMenuOpen && (
                  <div className={`absolute right-0 top-12 w-56 rounded-xl shadow-xl overflow-hidden z-50 bg-card border border-border`}>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/fandom");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>팬덤 홈</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/gallery");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
                      >
                        <Image className="w-5 h-5" />
                        <span>My Gallery</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/payments");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>결제 내역</span>
                      </button>
                      <div className={`border-t my-1 border-border`}></div>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
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
