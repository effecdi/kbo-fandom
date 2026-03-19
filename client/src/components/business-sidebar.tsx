import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-user-role";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Target,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Building2,
  LogOut,
  RefreshCw,
} from "lucide-react";
import logoImg from "@assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "대시보드", path: "/", alts: ["/business/dashboard"] },
  { icon: Sparkles, label: "마스코트 생성", path: "/business/mascot", alts: ["/business/mascot/result"] },
  { icon: FileText, label: "콘텐츠 제작", path: "/story" },
  { icon: Target, label: "캠페인 관리", path: "/ad-match" },
  { icon: Users, label: "작가 탐색", path: "/feed" },
  { icon: MessageSquare, label: "제안 관리", path: "/media-kit" },
  { icon: BarChart3, label: "리포트", path: "/dashboard" },
  { icon: Settings, label: "설정", path: "/pricing" },
];

export function BusinessSidebar() {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { clearRole } = useUserRole();

  const isActive = (item: typeof navItems[0]) =>
    location === item.path || item.alts?.includes(location);

  return (
    <aside className="w-60 bg-card border-r flex flex-col fixed h-screen z-20">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-3">
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
            <Link key={item.path} href={item.path}>
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
            <p className="text-[13px] text-muted-foreground">기업 모드</p>
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
  );
}
