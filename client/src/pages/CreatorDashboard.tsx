import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Wand2,
  ArrowRight,
  Paintbrush,
  TrendingUp,
  Heart,
  Layers,
  BookOpen,
  Eye,
  Trees,
  MessageCircle,
  Target,
  Gift,
  Trophy,
  Star,
  Users,
  Sparkles,
  CreditCard,
  Image,
  FileText,
  Palette,
  CheckCircle2,
  Clock,
  HelpCircle,
  X,
} from "lucide-react";
import type { Generation, PopularCreator } from "@shared/schema";
import { InstagramConnect } from "@/components/instagram-connect";

interface UsageData {
  credits: number;
  dailyBonusCredits: number;
  tier: string;
  authorName: string | null;
  genre: string | null;
  totalGenerations: number;
  creatorTier: number;
  dailyFreeCredits: number;
  maxStoryPanels: number;
}

const TIERS = [
  { name: "입문 작가", icon: Paintbrush, minGen: 0, maxGen: 4, color: "text-muted-foreground", badge: "시작", dailyCredits: 3, maxPanels: 3 },
  { name: "신인 작가", icon: Wand2, minGen: 5, maxGen: 14, color: "text-blue-500", badge: "5회+", dailyCredits: 3, maxPanels: 5 },
  { name: "인기 작가", icon: Star, minGen: 15, maxGen: 29, color: "text-amber-500", badge: "15회+", dailyCredits: 3, maxPanels: 8 },
  { name: "프로 연재러", icon: Trophy, minGen: 30, maxGen: Infinity, color: "text-primary", badge: "30회+", dailyCredits: 3, maxPanels: 10 },
] as const;

function getTier(totalGenerations: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalGenerations >= TIERS[i].minGen) return { ...TIERS[i], index: i };
  }
  return { ...TIERS[0], index: 0 };
}

function getXpProgress(totalGenerations: number) {
  const tier = getTier(totalGenerations);
  if (tier.index >= TIERS.length - 1) return { progress: 100, remaining: 0, nextTier: null as string | null };
  const nextTier = TIERS[tier.index + 1];
  const progressInTier = totalGenerations - tier.minGen;
  const tierRange = nextTier.minGen - tier.minGen;
  const remaining = nextTier.minGen - totalGenerations;
  return { progress: Math.min(100, (progressInTier / tierRange) * 100), remaining, nextTier: nextTier.name };
}

const GENRES = [
  { value: "daily", label: "일상" },
  { value: "gag", label: "개그" },
  { value: "romance", label: "로맨스" },
  { value: "fantasy", label: "판타지" },
] as const;

export function CreatorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const [showTourBanner, setShowTourBanner] = useState(false);

  const { data: usage } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });
  const { data: recentGenerations } = useQuery<Generation[]>({
    queryKey: ["/api/gallery"],
    enabled: isAuthenticated,
  });
  const { data: popularCreators } = useQuery<PopularCreator[]>({
    queryKey: ["/api/popular-creators"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    try {
      if (!localStorage.getItem("olli_tour_completed")) {
        setShowTourBanner(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("instagram_connected") === "true") {
      toast({ title: "Instagram 연결 완료!", description: "Instagram 계정이 성공적으로 연결되었습니다." });
      window.history.replaceState({}, "", "/creator/dashboard");
    }
    const igError = params.get("instagram_error");
    if (igError) {
      toast({ title: "Instagram 연결 실패", description: decodeURIComponent(igError), variant: "destructive" });
      window.history.replaceState({}, "", "/creator/dashboard");
    }
  }, [search, toast]);

  const totalGen = usage?.totalGenerations || 0;
  const tier = getTier(totalGen);
  const xp = getXpProgress(totalGen);
  const TierIcon = tier.icon;
  const genreLabel = GENRES.find((g) => g.value === usage?.genre)?.label;
  const totalCredits = (usage?.credits ?? 0) + (usage?.dailyBonusCredits ?? 0);
  const topCreators = (popularCreators || []).slice(0, 5);
  const recent = recentGenerations?.slice(0, 4) || [];

  return (
    <DashboardLayout userType="creator">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 text-foreground">
          안녕하세요, {usage?.authorName || user?.firstName || "Creator"}님! 👋
        </h1>
        <p className="text-muted-foreground">
          오늘도 멋진 인스타툰을 만들어볼까요?
        </p>
      </div>

      {/* Tour Banner */}
      {showTourBanner && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border p-5 mb-8 bg-[#00e5cc]/5 border-[#00e5cc]/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00e5cc]/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-[#00e5cc]" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">처음이신가요?</p>
              <p className="text-sm text-muted-foreground">사용 가이드를 통해 주요 기능을 빠르게 둘러보세요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="bg-[#00e5cc] text-black hover:bg-[#00f0ff]" onClick={() => { setShowTourBanner(false); navigate("/story"); }}>
              가이드 시작
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowTourBanner(false); try { localStorage.setItem("olli_tour_completed", "true"); } catch {} }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl p-6 border hover:shadow-lg transition-shadow bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#00e5cc]/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#00e5cc]" />
            </div>
            <span className="text-2xl font-black text-foreground">{totalCredits}</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">보유 크레딧</p>
          <p className="text-xs mt-1 text-muted-foreground">일일 보너스 {usage?.dailyBonusCredits ?? 0}개 포함</p>
        </div>

        <div className="rounded-2xl p-6 border hover:shadow-lg transition-shadow bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <TierIcon className={`w-6 h-6 ${tier.color}`} />
            </div>
            <Badge variant="outline" className="text-sm font-bold">{tier.badge}</Badge>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">{tier.name}</p>
          <p className="text-xs mt-1 text-muted-foreground">{genreLabel ? `${genreLabel} 장르` : "장르 미설정"}</p>
        </div>

        <div className="rounded-2xl p-6 border hover:shadow-lg transition-shadow bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-black text-foreground">{totalGen}</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">총 작품 수</p>
          <p className="text-xs mt-1 text-muted-foreground">스토리 패널 최대 {tier.maxPanels}개</p>
        </div>

        <div className="rounded-2xl p-6 border hover:shadow-lg transition-shadow bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-foreground">{Math.round(xp.progress)}%</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">경험치</p>
          <p className="text-xs mt-1 text-muted-foreground">
            {xp.nextTier ? `${xp.nextTier}까지 ${xp.remaining}개` : "최고 등급 달성!"}
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="rounded-2xl p-6 border mb-8 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <TierIcon className={`w-5 h-5 ${tier.color}`} />
            <span className="font-bold text-foreground">{tier.name}</span>
            {xp.nextTier && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
            {xp.nextTier && <span className="text-sm text-muted-foreground">{xp.nextTier}</span>}
          </div>
          <span className="text-sm font-bold text-[#00e5cc]">{Math.round(xp.progress)}%</span>
        </div>
        <Progress value={xp.progress} className="h-3" />
        {xp.nextTier && xp.remaining > 0 && (
          <div className="flex items-start gap-2 mt-3 rounded-lg bg-[#00e5cc]/5 p-3">
            <Gift className="h-4 w-4 text-[#00e5cc] shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-[#00e5cc]">{xp.remaining}개</span> 더 생성하면 다음 등급으로 업그레이드!
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="rounded-2xl p-6 border bg-card border-border">
            <h2 className="text-xl font-black mb-6 text-foreground">빠른 시작</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/create" className="p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-300 dark:from-violet-900/30 dark:to-purple-900/30 dark:hover:border-violet-600">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-1 text-foreground">캐릭터 생성</h3>
                <p className="text-sm text-muted-foreground">텍스트로 AI 캐릭터 만들기</p>
              </Link>

              <Link to="/pose" className="p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-300 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:border-blue-600">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-1 text-foreground">포즈 / 표정</h3>
                <p className="text-sm text-muted-foreground">다양한 포즈 & 표정 생성</p>
              </Link>

              <Link to="/story" className="p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent bg-gradient-to-br from-teal-50 to-cyan-50 hover:border-teal-300 dark:from-teal-900/30 dark:to-cyan-900/30 dark:hover:border-teal-600">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-1 text-foreground">스토리 에디터</h3>
                <p className="text-sm text-muted-foreground">멀티패널 인스타툰 제작</p>
              </Link>

              <Link to="/background" className="p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent bg-gradient-to-br from-emerald-50 to-green-50 hover:border-emerald-300 dark:from-emerald-900/30 dark:to-green-900/30 dark:hover:border-emerald-600">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <Trees className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-1 text-foreground">배경 / 아이템</h3>
                <p className="text-sm text-muted-foreground">배경과 소품 추가</p>
              </Link>
            </div>
          </div>

          {/* Recent Works */}
          {recent.length > 0 && (
            <div className="rounded-2xl p-6 border bg-card border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-foreground">최근 작품</h2>
                <Link to="/gallery">
                  <Button variant="ghost" size="sm">
                    전체 보기 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recent.map((gen) => (
                  <div key={gen.id} className="relative group cursor-pointer">
                    <div className="aspect-square rounded-xl overflow-hidden">
                      <img src={gen.resultImageUrl} alt={gen.prompt} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 truncate">{gen.prompt}</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg shadow-lg bg-card">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools Grid */}
          <div className="rounded-2xl p-6 border bg-card border-border">
            <h2 className="text-xl font-black mb-6 text-foreground">편집 도구</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { href: "/bubble", icon: Paintbrush, title: "말풍선 편집", desc: "손글씨 폰트 말풍선", gradient: "from-pink-500 to-rose-600" },
                { href: "/effects", icon: Eye, title: "블러 효과", desc: "가우시안 / 모션 / 방사형", gradient: "from-cyan-500 to-sky-600" },
                { href: "/chat", icon: MessageCircle, title: "채팅 이미지", desc: "카카오톡 스타일", gradient: "from-amber-500 to-orange-600" },
                { href: "/ad-match", icon: Target, title: "광고주 매칭", desc: "AI 맞춤 추천", gradient: "from-rose-500 to-red-600" },
                { href: "/media-kit", icon: FileText, title: "미디어킷", desc: "포트폴리오 제작", gradient: "from-orange-500 to-amber-600" },
                { href: "/create-instatoon", icon: Sparkles, title: "인스타툰", desc: "자동 생성", gradient: "from-indigo-500 to-purple-600" },
              ].map((tool) => (
                <Link key={tool.href} to={tool.href} className="p-4 rounded-xl hover:shadow-lg transition-all border border-transparent hover:border-border">
                  <div className={`w-10 h-10 bg-gradient-to-br ${tool.gradient} rounded-lg flex items-center justify-center mb-3`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-foreground">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Popular Creators */}
          <div className="rounded-2xl p-6 border bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground">인기 크리에이터</h2>
              <span className="text-xs font-semibold text-[#00e5cc]">TODAY</span>
            </div>
            {topCreators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">아직 랭킹 데이터가 없어요</p>
            ) : (
              <div className="space-y-3">
                {topCreators.map((creator, idx) => (
                  <div key={creator.id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-muted/50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] text-white text-sm font-black shrink-0">
                      {idx + 1}
                    </div>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-sm">
                        {(creator.authorName || creator.firstName || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {creator.authorName || creator.firstName || "유저"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{creator.followerCount}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{creator.totalLikes}</span>
                      </div>
                    </div>
                    {idx === 0 && <Trophy className="w-5 h-5 text-amber-500" />}
                    {idx === 1 && <Star className="w-5 h-5 text-muted-foreground" />}
                    {idx === 2 && <Star className="w-5 h-5 text-amber-700 dark:text-amber-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instagram Connect */}
          <InstagramConnect />

          {/* Membership Status */}
          <div className="rounded-2xl p-6 border bg-card border-border">
            <h2 className="text-xl font-black mb-6 text-foreground">멤버십</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#00e5cc]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#00e5cc]/20">
                    <CreditCard className="w-5 h-5 text-[#00e5cc]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">현재 플랜</p>
                    <p className="text-xs text-muted-foreground">
                      {(usage?.tier === "pro" || usage?.tier === "premium") ? (usage?.tier === "premium" ? "Premium" : "Pro") : "Free"}
                    </p>
                  </div>
                </div>
                <Badge variant={(usage?.tier === "pro" || usage?.tier === "premium") ? "default" : "secondary"}>
                  {(usage?.tier === "pro" || usage?.tier === "premium") ? "Active" : "Free"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-200 dark:bg-blue-800/50">
                    <Sparkles className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">일일 무료 생성</p>
                    <p className="text-xs text-muted-foreground">{usage?.dailyFreeCredits ?? 3}회</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {(usage?.tier !== "pro" && usage?.tier !== "premium") && (
              <Link to="/pricing">
                <Button className="w-full mt-6 bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-black font-bold hover:opacity-90">
                  Pro로 업그레이드
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
