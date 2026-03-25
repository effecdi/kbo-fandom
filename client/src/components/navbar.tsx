import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import {
  Sparkles, Image, LayoutGrid, CreditCard, Moon, Sun, LogOut, Home,
  Wand2, ChevronDown, Rss,
  Heart, Trophy, Users, Palette, Pen, MessageCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useQuery } from "@tanstack/react-query";
import logoImg from "@assets/logo.png";

interface NavGroup {
  label: string;
  icon: any;
  paths: string[];
  items: { path: string; label: string; icon: any }[];
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation().pathname;
  const { toast } = useToast();

  const { data: credits } = useQuery<{ credits: number; dailyBonusCredits: number; tier: string }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  const navGroups: NavGroup[] = [
    {
      label: "팬덤",
      icon: Heart,
      paths: ["/fandom", "/fandom/feed", "/fandom/groups", "/fandom/events", "/fandom/create", "/fandom/talk", "/fandom/messages"],
      items: [
        { path: "/fandom", label: "팬덤 홈", icon: Heart },
        { path: "/fandom/feed", label: "팬덤 피드", icon: Rss },
        { path: "/fandom/talk", label: "팬 토크", icon: MessageCircle },
        { path: "/fandom/groups", label: "아이돌 그룹", icon: Users },
        { path: "/fandom/events", label: "이벤트/챌린지", icon: Trophy },
        { path: "/fandom/create", label: "팬아트 만들기", icon: Palette },
      ],
    },
    {
      label: "에디터",
      icon: Pen,
      paths: ["/editor"],
      items: [
        { path: "/editor/new", label: "새 에디터", icon: Pen },
        { path: "/gallery/mine", label: "내 작품", icon: LayoutGrid },
      ],
    },
    {
      label: "Create",
      icon: Wand2,
      paths: ["/create", "/gallery", "/background"],
      items: [
        { path: "/create", label: "New Character", icon: Wand2 },
        { path: "/pose", label: "Expression/Pose", icon: Image },
        { path: "/gallery", label: "Gallery", icon: LayoutGrid },
      ],
    },
  ];

  const isGroupActive = (group: NavGroup) => group.paths.some((p) => location.startsWith(p));

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link to="/" data-testid="link-home">
          <div className="flex items-center gap-2 cursor-pointer shrink-0">
            <img src={logoImg} alt="OLLI" className="h-8 w-8 rounded-md object-cover" />
            <span className="text-lg font-semibold tracking-tight hidden sm:inline">OLLI</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 ml-2 overflow-x-auto scrollbar-hide">
            {navGroups.map((group) => (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 ${isGroupActive(group) ? "bg-primary/10 text-primary" : ""}`}
                    data-testid={`menu-${group.label.toLowerCase()}`}
                  >
                    <group.icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{group.label}</span>
                    <ChevronDown className="h-5 w-5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link
                        to={item.path}
                        className="cursor-pointer"
                        data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            <Link to="/feed">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 ${location === "/feed" ? "bg-primary/10 text-primary" : ""}`}
                data-testid="link-feed"
              >
                <Rss className="h-5 w-5" />
                <span className="hidden sm:inline">Feed</span>
              </Button>
            </Link>

            <Link to="/pricing">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 ${location === "/pricing" ? "bg-primary/10 text-primary" : ""}`}
                data-testid="link-pricing"
              >
                <CreditCard className="h-5 w-5" />
                <span className="hidden sm:inline">Pricing</span>
              </Button>
            </Link>
          </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {isAuthenticated && credits && (
            <Badge variant="secondary" data-testid="badge-credits" className="gap-1 bg-primary/10 text-primary border-primary/20 cursor-pointer">
              <Sparkles className="h-5 w-5" />
              {`${(credits.credits ?? 0) + (credits.dailyBonusCredits ?? 0)} credits`}
            </Badge>
          )}

          <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                    <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[13px] text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/fandom" className="cursor-pointer" data-testid="menu-fandom">
                    <Home className="mr-2 h-5 w-5" />
                    팬덤 홈
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/gallery" className="cursor-pointer">
                    <Image className="mr-2 h-5 w-5" />
                    My Gallery
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/payments" className="cursor-pointer">
                    <CreditCard className="mr-2 h-5 w-5" />
                    결제 내역
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  data-testid="button-logout"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild data-testid="button-login">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
