import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  Building2,
  Instagram,
  FileText,
  Users,
  BarChart3,
  Shield,
  Moon,
  Sun,
  Zap,
  Brain,
  Target,
  Palette,
  TrendingUp,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const olliLogo = "/favicon.png";
import { useTheme } from "@/components/theme-provider";
import { WebtoonShowcase } from "@/components/WebtoonShowcase";
import { CardSwap } from "@/components/CardSwap";
import { ShuffleText } from "@/components/ShuffleText";
import { ShinyText } from "@/components/ShinyText";
import { GlareHover } from "@/components/GlareHover";
import { TargetCursor } from "@/components/TargetCursor";
import { MagneticCTA } from "@/components/MagneticCTA";
import { InfiniteCharacterGrid } from "@/components/InfiniteCharacterGrid";
import { FeatureCardSwap } from "@/components/FeatureCardSwap";

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="min-h-screen transition-colors duration-500 bg-background text-foreground"
    >
      <TargetCursor />

      {/* Fixed Dark Mode Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={toggleTheme}
          className="group w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-2xl border-2 transition-all duration-300 hover:scale-110 bg-muted/50 border-border hover:border-[#00e5cc]/50"
        >
          {theme === "dark" ? (
            <Sun className="w-7 h-7 text-yellow-400 transition-transform group-hover:rotate-90" />
          ) : (
            <Moon className="w-7 h-7 text-indigo-600 transition-transform group-hover:-rotate-12" />
          )}
        </button>
      </div>

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="parallax-bg absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-[#00e5cc]"
          />
          <div
            className="parallax-bg absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-30 bg-blue-500"
          />
          <div
            className="parallax-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-purple-500"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          {/* Logo with electric border effect */}
          <div className="hero-logo mb-12 inline-block">
            <div className="relative group">
              <div
                className="absolute -inset-1 bg-gradient-to-r from-[#00e5cc] via-blue-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"
              />
              <img
                src={olliLogo}
                alt="OLLI Logo"
                className="relative w-40 h-40 rounded-full"
              />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="hero-title mb-8">
            <div
              className="text-8xl md:text-9xl lg:text-[12rem] font-black leading-none mb-4"
              style={{
                background: `linear-gradient(135deg, #00e5cc 0%, #0891b2 50%, #3b82f6 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <ShuffleText>OLLI</ShuffleText>
            </div>
            <div
              className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground"
            >
              AI 인스타툰 혁명
            </div>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle text-xl md:text-3xl mb-16 max-w-4xl mx-auto text-muted-foreground"
          >
            작가와 기업을 연결하는 차세대 플랫폼
            <br />
            <ShinyText className="font-bold">5초만에 당신의 캐릭터가 살아납니다</ShinyText>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
            <GlareHover>
              <button
                onClick={() => navigate("/signup")}
                className="hero-cta group relative px-14 py-7 bg-gradient-to-r from-[#00e5cc] via-teal-500 to-[#00b3a6] text-white font-black text-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00e5cc]/50"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Sparkles className="w-7 h-7" />
                  작가로 시작하기
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </GlareHover>

            <GlareHover>
              <button
                onClick={() => navigate("/enterprise")}
                className="hero-cta group relative px-14 py-7 font-black text-2xl rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 bg-muted/50 border-blue-500/50 text-blue-500 hover:bg-muted hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/30"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Building2 className="w-7 h-7" />
                  기업으로 시작하기
                </span>
              </button>
            </GlareHover>
          </div>

          {/* Scroll indicator */}
          <div className="animate-bounce">
            <div
              className="w-1 h-16 mx-auto rounded-full bg-gradient-to-b from-[#00e5cc] to-transparent"
            />
          </div>
        </div>
      </section>

      {/* Apple-style Scroll Text Section */}
      <section
        className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-background to-muted"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight text-foreground"
          >
            <span className="scroll-word block mb-4">클릭 한 번으로</span>
            <span className="scroll-word block mb-4 bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent">
              전문가급 웹툰
            </span>
            <span className="scroll-word block">완성</span>
          </h2>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-32 px-6 bg-muted"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Users, label: "활동 작가", target: 10000, suffix: "+" },
              { icon: Building2, label: "기업 고객", target: 500, suffix: "+" },
              { icon: FileText, label: "툰 생성", target: 1000000, suffix: "+" },
            ].map((stat, i) => (
              <GlareHover key={i}>
                <div
                  className="group relative p-12 rounded-3xl text-center backdrop-blur-xl border-2 transition-all duration-300 hover:scale-105 bg-card/80 border-border hover:border-[#00e5cc]/50 shadow-xl"
                >
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#00e5cc] to-blue-500 shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>
                  <div
                    className={`text-6xl font-black mb-4 bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent`}
                  >
                    <span className="stat-number" data-target={stat.target}>
                      0
                    </span>
                    {stat.suffix}
                  </div>
                  <div
                    className="text-xl font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {stat.label}
                  </div>
                </div>
              </GlareHover>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-32 px-6 bg-background"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className="inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 bg-[#00e5cc]/10 text-[#00e5cc] border-2 border-[#00e5cc]/20"
            >
              핵심 기능
            </div>
            <h2
              className="text-6xl md:text-8xl font-black text-foreground"
            >
              왜 <span className="bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent">OLLI</span>인가?
            </h2>
          </div>

          <FeatureCardSwap />
        </div>
      </section>

      {/* Mode Switcher Section */}
      <section
        className="py-32 px-6 bg-gradient-to-b from-background to-muted"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className="inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 bg-[#00e5cc]/10 text-[#00e5cc] border-2 border-[#00e5cc]/20"
            >
              양면 플랫폼
            </div>
            <h2
              className="text-6xl md:text-8xl font-black mb-8 text-foreground"
            >
              당신의 역할은?
            </h2>
          </div>

          <CardSwap />
        </div>
      </section>

      {/* Showcase Gallery */}
      <section
        className="py-32 px-6 bg-muted"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className="inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 bg-[#00e5cc]/10 text-[#00e5cc] border-2 border-[#00e5cc]/20"
            >
              작품 갤러리
            </div>
            <h2
              className="text-6xl md:text-8xl font-black mb-8 text-foreground"
            >
              <span className="bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent">
                놀라운
              </span>{" "}
              작품들
            </h2>
            <p
              className="text-2xl text-muted-foreground"
            >
              OLLI로 만들어진 실제 웹툰을 만나보세요
            </p>
          </div>

          <WebtoonShowcase />
        </div>
      </section>

      {/* Infinite Character Grid - 무한한 캐릭터 가능성 */}
      <section
        className="py-32 px-6 overflow-hidden bg-background"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className="inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 bg-[#00e5cc]/10 text-[#00e5cc] border-2 border-[#00e5cc]/20"
            >
              AI 캐릭터
            </div>
            <h2
              className="text-6xl md:text-8xl font-black mb-8 text-foreground"
            >
              <span className="bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent">
                무한한
              </span>{" "}
              캐릭터 가능성
            </h2>
            <p
              className="text-2xl text-muted-foreground"
            >
              마우스를 움직여 3D 그리드를 탐험하세요
            </p>
          </div>

          <InfiniteCharacterGrid theme={theme} />
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-32 px-6 bg-background"
      >
        <div className="max-w-6xl mx-auto">
          <MagneticCTA onButtonClick={() => navigate("/signup")} />
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-20 px-6 border-border bg-muted"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={olliLogo}
                  alt="OLLI"
                  className="w-16 h-16 rounded-full"
                />
                <span
                  className="text-4xl font-black"
                  style={{
                    background: `linear-gradient(135deg, #00e5cc, #0891b2, #3b82f6)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  OLLI
                </span>
              </div>
              <p
                className="text-lg mb-6 text-muted-foreground"
              >
                차세대 AI 인스타그램 툰 플랫폼
                <br />
                작가와 기업을 연결합니다
              </p>
              <div className="flex gap-4">
                {[Instagram, Globe, TrendingUp].map((Icon, i) => (
                  <button
                    key={i}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-muted hover:bg-[#00e5cc]/20 text-muted-foreground hover:text-[#00e5cc]"
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {[
              {
                title: "제품",
                links: ["기능", "가격", "업데이트", "로드맵"],
              },
              {
                title: "회사",
                links: ["소개", "블로그", "채용", "언론"],
              },
              {
                title: "지원",
                links: ["도움말", "문의", "커뮤니티", "FAQ"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4
                  className="font-black mb-6 text-xl text-foreground"
                >
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-lg transition-colors hover:text-[#00e5cc] text-muted-foreground"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="pt-8 border-t text-center border-border"
          >
            <p
              className="text-lg text-muted-foreground"
            >
              © 2026 OLLI. All rights reserved. Powered by AI.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

