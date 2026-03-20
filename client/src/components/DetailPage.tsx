import {
  Sparkles,
  Star,
  Heart,
  Wand2,
  Zap,
  Users,
  TrendingUp,
  CheckCircle2,
  Instagram,
  Clock,
  Palette,
  MessageCircle,
  Award,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";
const olliMascot = "/favicon.png";

export function DetailPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={olliMascot}
                alt="OLLI"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black text-foreground">OLLI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-purple-600 font-semibold">
              기능
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-purple-600 font-semibold">
              사용방법
            </a>
            <Link to="/business" className="text-muted-foreground hover:text-indigo-600 font-semibold">
              광고주
            </Link>
            <a href="#pricing" className="text-muted-foreground hover:text-purple-600 font-semibold">
              요금제
            </a>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              무료로 시작하기
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-yellow-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300 font-semibold text-sm">
                  AI 기반 웹툰 제작 플랫폼
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 text-foreground leading-tight">
                그림 실력 제로,
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  스토리는 무한대
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                AI가 당신의 아이디어를 프로급 인스타툰으로 변환합니다.
                <br />
                1분 만에 작가 데뷔, 지금 바로 시작하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-8 py-6 hover:shadow-xl transition-all"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  무료로 시작하기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 text-lg px-8 py-6 hover:bg-purple-50"
                >
                  작품 둘러보기
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground font-semibold">
                    10,000+ 작가님
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-muted-foreground font-semibold ml-2">
                    4.9/5.0
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Character Showcase */}
            <div className="relative">
              <div className="relative bg-card rounded-3xl shadow-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "행복", emoji: "😊", bg: "from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30" },
                    { label: "놀람", emoji: "😲", bg: "from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30" },
                    { label: "달리기", emoji: "🏃", bg: "from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30" },
                    { label: "생각", emoji: "🤔", bg: "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`bg-gradient-to-br ${item.bg} rounded-2xl p-6 flex flex-col items-center justify-center`}
                    >
                      <div className="w-24 h-24 flex items-center justify-center mb-3">
                        <img
                          src={olliMascot}
                          alt={item.label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-2xl mb-1">{item.emoji}</p>
                      <p className="text-sm font-bold text-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold">AI 생성</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground">
              왜 OLLI인가요?
            </h2>
            <p className="text-xl text-muted-foreground">
              전문가 수준의 툰을 누구나 쉽게 만들 수 있어요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wand2,
                title: "AI 자동 생성",
                description: "간단한 스케치나 텍스트만으로 프로급 캐릭터와 장면을 생성합니다.",
                color: "purple",
              },
              {
                icon: Clock,
                title: "1분 만에 완성",
                description: "복잡한 그리기 과정 없이 빠르게 4컷 툰을 완성할 수 있습니다.",
                color: "blue",
              },
              {
                icon: Palette,
                title: "무한한 커스터마이징",
                description: "표정, 포즈, 스타일을 자유롭게 조절하여 나만의 캐릭터를 만드세요.",
                color: "pink",
              },
              {
                icon: Instagram,
                title: "인스타 최적화",
                description: "인스타그램에 바로 업로드 가능한 완벽한 사이즈와 포맷을 제공합니다.",
                color: "orange",
              },
              {
                icon: TrendingUp,
                title: "자동 미디어킷",
                description: "AI가 분석한 통계와 성과를 바탕으로 전문 미디어킷을 생성합니다.",
                color: "green",
              },
              {
                icon: Award,
                title: "브랜드 매칭",
                description: "당신의 콘텐츠와 잘 맞는 광고주를 AI가 자동으로 추천합니다.",
                color: "yellow",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-muted to-muted rounded-2xl p-8 hover:shadow-xl transition-all group"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground">
              3단계로 완성하는 웹툰
            </h2>
            <p className="text-xl text-muted-foreground">
              복잡한 과정 없이 누구나 쉽게 시작할 수 있어요
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "아이디어 입력",
                description: "간단한 스케치나 텍스트로 스토리를 설명하세요. 막대인간 그림도 OK!",
                icon: MessageCircle,
              },
              {
                step: "02",
                title: "AI가 마법처럼",
                description: "올리가 당신의 아이디어를 프로급 캐릭터와 장면으로 변환합니다.",
                icon: Wand2,
              },
              {
                step: "03",
                title: "완성 & 공유",
                description: "4컷 툰을 확인하고 인스타그램에 바로 업로드하세요!",
                icon: Instagram,
              },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-card rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all">
                  <div className="text-6xl font-black text-purple-100 mb-4">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-purple-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Gallery */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground">
              올리와 함께한 작품들
            </h2>
            <p className="text-xl text-muted-foreground">
              실제 유저들이 만든 인스타툰을 확인해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="bg-card rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((panel) => (
                      <div
                        key={panel}
                        className="aspect-square bg-gradient-to-br from-muted to-muted rounded-lg flex items-center justify-center"
                      >
                        <div className="w-16 h-16 flex items-center justify-center">
                          <img
                            src={olliMascot}
                            alt={`Panel ${panel}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
                    <span className="font-semibold text-foreground">
                      작가{item}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {(Math.random() * 10 + 2).toFixed(1)}K
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              더 많은 작품 보기
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-muted to-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground">
              모두를 위한 요금제
            </h2>
            <p className="text-xl text-muted-foreground">
              무료로 시작해서 필요할 때 업그레이드하세요
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "무료",
                price: "₩0",
                period: "영원히",
                features: [
                  "월 10개 툰 생성",
                  "기본 캐릭터 라이브러리",
                  "4컷 포맷",
                  "워터마크 포함",
                ],
                cta: "무료로 시작하기",
                popular: false,
              },
              {
                name: "프로",
                price: "₩9,900",
                period: "월",
                features: [
                  "무제한 툰 생성",
                  "프리미엄 캐릭터 & 스타일",
                  "워터마크 제거",
                  "고해상도 다운로드",
                  "우선 AI 처리",
                ],
                cta: "프로 시작하기",
                popular: true,
              },
              {
                name: "비즈니스",
                price: "₩29,900",
                period: "월",
                features: [
                  "프로의 모든 기능",
                  "자동 미디어킷 생성",
                  "브랜드 매칭 서비스",
                  "분석 대시보드",
                  "전담 고객지원",
                ],
                cta: "비즈니스 시작하기",
                popular: false,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-card rounded-3xl p-8 ${
                  plan.popular
                    ? "ring-4 ring-purple-600 shadow-2xl scale-105"
                    : "shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    가장 인기있는
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-5xl font-black text-foreground">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-muted-foreground">/{plan.period}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full py-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-muted text-foreground hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 flex items-center justify-center">
              <img
                src={olliMascot}
                alt="OLLI"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
            지금 바로 웹툰 작가가 되어보세요!
          </h2>
          <p className="text-xl text-white/90 mb-8">
            그림 실력이 없어도 괜찮아요. 올리가 함께 합니다.
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-600 hover:bg-muted text-xl px-12 py-8 shadow-2xl"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            무료로 시작하기
          </Button>
          <p className="text-white/80 mt-4">신용카드 불필요 • 언제든 업그레이드</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src={olliMascot}
                    alt="OLLI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-black text-white">OLLI</span>
              </div>
              <p className="text-sm text-gray-400">
                AI 기반 인스타툰 제작 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">제품</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    기능
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    요금제
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    사례
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">지원</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    도움말
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    문의하기
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">회사</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    블로그
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    채용
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2026 OLLI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}