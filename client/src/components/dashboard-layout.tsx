import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-user-role";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Target,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  Building2,
  Moon,
  Sun,
  LogOut,
  RefreshCw,
} from "lucide-react";
import logoImg from "@assets/logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "대시보드", path: "/", alts: ["/business/dashboard"] },
  { icon: Sparkles, label: "마스코트 생성", path: "/create" },
  { icon: FileText, label: "콘텐츠 제작", path: "/story" },
  { icon: Target, label: "캠페인 관리", path: "/ad-match" },
  { icon: Users, label: "작가 탐색", path: "/feed" },
  { icon: MessageSquare, label: "제안 관리", path: "/media-kit" },
  { icon: BarChart3, label: "리포트", path: "/dashboard" },
  { icon: Settings, label: "설정", path: "/pricing" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { clearRole } = useUserRole();
  const { theme, toggleTheme } = useTheme();

  const isActive = (item: typeof navItems[0]) =>
    location === item.path || item.alts?.includes(location);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="w-60 bg-card border-r flex flex-col fixed h-screen z-20">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="OLLI" className="w-10 h-10 object-contain rounded-md" />
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 text-transparent bg-clip-text">
              OLLI
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    isActive(item)
                      ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.firstName || "사용자"}
              </p>
              <p className="text-[13px] text-muted-foreground">팬덤 모드</p>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => { clearRole(); navigate("/onboarding"); }}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              역할 변경
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-all"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* Top Header */}
        <header className="h-16 bg-card border-b fixed top-0 right-0 left-60 z-10">
          <div className="h-full px-8 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-foreground"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[13px] font-semibold">
                팬덤 모드
              </div>

              <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-lg transition-all">
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              <button className="relative p-2 hover:bg-muted rounded-lg transition-all">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="pt-16 p-8">{children}</main>
      </div>
    </div>
  );
}
