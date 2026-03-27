import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  Heart,
  Users,
  Sparkles,
  Trophy,
  Music,
  Star,
  ArrowRight,
  Moon,
  Sun,
  Palette,
  MessageCircle,
  Flame,
  Calendar,
  MapPin,
  BarChart3,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type KboTeam,
} from "@/lib/local-store";

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [groups, setGroups] = useState<KboTeam[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setGroups(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
  }, []);

  const totalFanart = groups.reduce((sum, g) => sum + g.fanartCount, 0);
  const totalFollowers = groups.reduce((sum, g) => sum + g.followers, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all hover:scale-110 bg-muted/50 border-border"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 bg-red-500 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-20 bg-orange-500 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 bg-amber-500" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-6 py-2 mb-8">
            <Flame className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold text-red-500">2026 KBO 시즌 개막!</span>
          </div>

          {/* Title */}
          <h1 className="mb-8">
            <div className="text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              KBO FANDOM
            </div>
            <div className="text-3xl md:text-5xl font-black text-foreground">
              나만의 야구 팬덤 세계
            </div>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-muted-foreground">
            경기 일정, 응원가, 직관 가이드, 팬아트까지
            <br />
            <span className="font-bold text-foreground">KBO 10개 구단 팬을 위한 올인원 플랫폼</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={() => navigate("/login")}
              className="px-10 py-7 text-lg font-black bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl hover:scale-105 transition-all shadow-lg hover:shadow-xl hover:shadow-red-500/25"
            >
              <Flame className="w-6 h-6 mr-2" />
              팬덤 시작하기
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="px-10 py-7 text-lg font-black rounded-2xl border-2 hover:scale-105 transition-all"
            >
              <ArrowRight className="w-6 h-6 mr-2" />
              로그인
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="animate-bounce">
            <div className="w-1 h-16 mx-auto rounded-full bg-gradient-to-b from-red-500 to-transparent" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: "활성 팬", value: totalFollowers.toLocaleString(), color: "text-red-500" },
              { icon: Heart, label: "팬아트", value: totalFanart.toLocaleString(), color: "text-rose-500" },
              { icon: Star, label: "KBO 구단", value: String(groups.length), color: "text-orange-500" },
              { icon: Calendar, label: "2026 경기", value: "720", color: "text-amber-500" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card border border-border">
                <stat.icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
                <p className="text-3xl font-black text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full text-sm font-bold mb-6 bg-red-500/10 text-red-500 border border-red-500/20">
              핵심 기능
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground">
              왜 <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">KBO FANDOM</span>인가?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calendar,
                title: "경기 일정 & 직관",
                desc: "내 팀 경기 일정 확인, 직관 예정 관리까지 한 곳에서",
                color: "#EF4444",
              },
              {
                icon: Music,
                title: "응원가 & 직관 가이드",
                desc: "구단별 응원가 가사, 구장 정보, 맛집, 교통편 총정리",
                color: "#F97316",
              },
              {
                icon: Palette,
                title: "팬아트 & 포토카드",
                desc: "AI 팬아트 제작, 포토카드 컬렉션과 트레이딩",
                color: "#F59E0B",
              },
              {
                icon: MessageCircle,
                title: "팬덤 커뮤니티",
                desc: "같은 팀 팬들과 소통, 굿즈 교환, 랭킹 경쟁",
                color: "#10B981",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border bg-card border-border hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Groups Carousel */}
      <section className="py-24 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full text-sm font-bold mb-6 bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <Flame className="w-4 h-4 inline mr-1" />
              KBO 10개 구단
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground">
              내 <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">팀</span>을 선택하세요
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {groups.slice(0, 10).map((group) => (
              <div
                key={group.id}
                className="group p-6 rounded-2xl border bg-card border-border hover:shadow-xl transition-all hover:-translate-y-1 text-center cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform"
                  style={{ background: group.coverColor }}
                >
                  {group.name.charAt(0)}
                </div>
                <h3 className="font-bold text-foreground">{group.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{group.nameKo}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" />
                  <span>{group.followers.toLocaleString()} 팬</span>
                </div>
                <div
                  className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: group.coverColor }}
                >
                  {group.fandomName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-foreground mb-6">
            2026 시즌,<br/>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">야구</span>와 함께하세요
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            내 팀을 선택하고, 경기 일정부터 응원가, 직관 가이드까지 모든 팬덤 활동을 한 곳에서
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="px-12 py-7 text-xl font-black bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl hover:scale-105 transition-all shadow-xl hover:shadow-2xl hover:shadow-red-500/25"
          >
            <Flame className="w-6 h-6 mr-2" />
            팬덤 시작하기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-6 border-border bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  KBO FANDOM
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                KBO 야구 팬을 위한 올인원 플랫폼
              </p>
            </div>
            {[
              { title: "서비스", links: ["경기 일정", "응원가", "직관 가이드"] },
              { title: "팬덤", links: ["KBO 구단", "팬아트", "포토카드"] },
              { title: "법적 고지", links: [{ label: "이용약관", path: "/legal/terms" }, { label: "개인정보", path: "/legal/privacy" }, { label: "환불정책", path: "/legal/refund" }] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-bold mb-4 text-foreground">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => {
                    const isObj = typeof link === "object";
                    return (
                      <li key={isObj ? link.label : link}>
                        {isObj ? (
                          <Link to={link.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {link.label}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">{link}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 KBO FANDOM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
