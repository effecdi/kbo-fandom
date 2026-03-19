import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  Rocket,
  Building2,
  Instagram,
  FileText,
  Users,
  BarChart3,
  Shield,
  CheckCircle2,
  Star,
  Moon,
  Sun,
  Zap,
  ArrowRight,
  Brain,
  Target,
  Palette,
  TrendingUp,
  Globe,
  Award,
  Layers,
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
import { DomeGallery } from "@/components/DomeGallery";
import { CharacterGrid } from "@/components/CharacterGrid";
import { MagneticCTA } from "@/components/MagneticCTA";
import { InfiniteCharacterGrid } from "@/components/InfiniteCharacterGrid";

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Refs for animations
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero entrance animation
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-logo", {
      scale: 0,
      rotation: 180,
      opacity: 0,
      duration: 1.2,
      ease: "back.out(1.7)",
    })
      .from(".hero-title", { y: 100, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".hero-subtitle", { y: 60, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".hero-cta", { y: 40, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.2");

    // Apple-style scroll text animation
    if (scrollTextRef.current) {
      gsap.to(scrollTextRef.current, {
        scrollTrigger: {
          trigger: scrollTextRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
          pinSpacing: true,
        },
      });

      const words = scrollTextRef.current.querySelectorAll(".scroll-word");
      words.forEach((word, i) => {
        gsap.fromTo(
          word,
          {
            opacity: 0.3,
            scale: 0.95,
            y: 50,
          },
          {
            scrollTrigger: {
              trigger: scrollTextRef.current,
              start: "top top",
              end: "+=150%",
              scrub: 1,
            },
            opacity: 1,
            scale: 1,
            y: 0,
            ease: "power2.out",
          }
        );
      });
    }

    // Stats counter animation
    if (statsRef.current) {
      const stats = statsRef.current.querySelectorAll(".stat-number");
      stats.forEach((stat) => {
        const target = parseInt(stat.getAttribute("data-target") || "0");
        gsap.from(stat, {
          scrollTrigger: {
            trigger: stat,
            start: "top center+=100",
            toggleActions: "play none none reverse",
          },
          innerText: 0,
          duration: 2,
          snap: { innerText: 1 },
          onUpdate: function () {
            stat.textContent = Math.ceil(this.targets()[0].innerText);
          },
        });
      });
    }

    // Feature cards stagger animation
    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll(".feature-card");
      gsap.from(cards, {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top center+=100",
          toggleActions: "play none none none",
        },
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)",
      });
    }

    // Showcase zoom effect
    if (showcaseRef.current) {
      gsap.from(showcaseRef.current, {
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        },
        scale: 0.8,
        opacity: 0,
      });
    }

    // Final CTA magnetic effect
    if (ctaRef.current) {
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse",
        },
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)",
      });
    }

    // Parallax backgrounds
    gsap.utils.toArray(".parallax-bg").forEach((bg: any) => {
      gsap.to(bg, {
        scrollTrigger: {
          trigger: bg,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        y: -100,
      });
    });
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === "dark"
          ? "bg-black text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <TargetCursor />

      {/* Fixed Dark Mode Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <button
          onClick={toggleTheme}
          className={`group w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-2xl border-2 transition-all duration-300 hover:scale-110 ${
            theme === "dark"
              ? "bg-white/5 border-white/10 hover:border-[#00e5cc]/50"
              : "bg-gray-900/5 border-gray-900/10 hover:border-[#00e5cc]/50"
          }`}
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
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`parallax-bg absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-30 ${
              theme === "dark" ? "bg-[#00e5cc]" : "bg-[#00e5cc]"
            }`}
          />
          <div
            className={`parallax-bg absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-30 ${
              theme === "dark" ? "bg-blue-500" : "bg-blue-400"
            }`}
          />
          <div
            className={`parallax-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 ${
              theme === "dark" ? "bg-purple-600" : "bg-purple-400"
            }`}
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
              className={`text-4xl md:text-6xl lg:text-7xl font-black ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              AI 인스타툰 혁명
            </div>
          </h1>

          {/* Subtitle */}
          <p
            className={`hero-subtitle text-xl md:text-3xl mb-16 max-w-4xl mx-auto ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
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
                className={`hero-cta group relative px-14 py-7 font-black text-2xl rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
                  theme === "dark"
                    ? "bg-white/5 border-blue-500/50 text-blue-400 hover:bg-white/10 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/30"
                    : "bg-gray-900/5 border-blue-600 text-blue-600 hover:bg-gray-900/10 hover:shadow-2xl hover:shadow-blue-500/30"
                }`}
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
              className={`w-1 h-16 mx-auto rounded-full ${
                theme === "dark"
                  ? "bg-gradient-to-b from-[#00e5cc] to-transparent"
                  : "bg-gradient-to-b from-[#00b3a6] to-transparent"
              }`}
            />
          </div>
        </div>
      </section>

      {/* Apple-style Scroll Text Section */}
      <section
        ref={scrollTextRef}
        className={`min-h-screen flex items-center justify-center px-6 ${
          theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-gradient-to-b from-white to-gray-50"
        }`}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className={`text-5xl md:text-7xl lg:text-8xl font-black leading-tight ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
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
        ref={statsRef}
        className={`py-32 px-6 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
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
                  className={`group relative p-12 rounded-3xl text-center backdrop-blur-xl border-2 transition-all duration-300 hover:scale-105 ${
                    theme === "dark"
                      ? "bg-gray-800/50 border-gray-700/50 hover:border-[#00e5cc]/50"
                      : "bg-white/80 border-gray-200 hover:border-[#00e5cc]/50 shadow-xl"
                  }`}
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
                    className={`text-xl font-bold uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
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
        ref={featuresRef}
        className={`py-32 px-6 ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className={`inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 ${
                theme === "dark"
                  ? "bg-[#00e5cc]/20 text-[#00e5cc] border-2 border-[#00e5cc]/30"
                  : "bg-[#00e5cc]/10 text-[#00b3a6] border-2 border-[#00e5cc]/20"
              }`}
            >
              핵심 기능
            </div>
            <h2
              className={`text-6xl md:text-8xl font-black mb-8 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              왜 <span className="bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent">OLLI</span>인가?
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Brain}
              title="AI 캐릭터 생성"
              description="텍스트 한 줄로 독창적인 캐릭터 탄생"
              theme={theme}
              gradient="from-[#00e5cc] to-teal-600"
              className="lg:col-span-2"
            />
            <FeatureCard
              icon={Zap}
              title="초고속 처리"
              description="5초만에 완성"
              theme={theme}
              gradient="from-yellow-500 to-orange-600"
            />
            <FeatureCard
              icon={Palette}
              title="자동 스토리보드"
              description="AI가 스토리를 시각화"
              theme={theme}
              gradient="from-purple-500 to-pink-600"
            />
            <FeatureCard
              icon={Instagram}
              title="원클릭 퍼블리싱"
              description="인스타그램 직접 연동"
              theme={theme}
              gradient="from-pink-500 to-rose-600"
              className="lg:col-span-2"
            />
            <FeatureCard
              icon={Target}
              title="브랜드 마스코트"
              description="기업 맞춤 AI 학습"
              theme={theme}
              gradient="from-blue-500 to-indigo-600"
            />
            <FeatureCard
              icon={BarChart3}
              title="실시간 분석"
              description="데이터 기반 인사이트"
              theme={theme}
              gradient="from-green-500 to-emerald-600"
            />
            <FeatureCard
              icon={Shield}
              title="엔터프라이즈 보안"
              description="SOC 2 인증 완료"
              theme={theme}
              gradient="from-gray-600 to-gray-800"
            />
          </div>
        </div>
      </section>

      {/* Mode Switcher Section */}
      <section
        className={`py-32 px-6 ${
          theme === "dark" ? "bg-gradient-to-b from-black to-gray-900" : "bg-gradient-to-b from-white to-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className={`inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 ${
                theme === "dark"
                  ? "bg-[#00e5cc]/20 text-[#00e5cc] border-2 border-[#00e5cc]/30"
                  : "bg-[#00e5cc]/10 text-[#00b3a6] border-2 border-[#00e5cc]/20"
              }`}
            >
              양면 플랫폼
            </div>
            <h2
              className={`text-6xl md:text-8xl font-black mb-8 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              당신의 역할은?
            </h2>
          </div>

          <CardSwap theme={theme} />
        </div>
      </section>

      {/* Showcase Gallery */}
      <section
        ref={showcaseRef}
        className={`py-32 px-6 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className={`inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 ${
                theme === "dark"
                  ? "bg-[#00e5cc]/20 text-[#00e5cc] border-2 border-[#00e5cc]/30"
                  : "bg-[#00e5cc]/10 text-[#00b3a6] border-2 border-[#00e5cc]/20"
              }`}
            >
              작품 갤러리
            </div>
            <h2
              className={`text-6xl md:text-8xl font-black mb-8 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent">
                놀라운
              </span>{" "}
              작품들
            </h2>
            <p
              className={`text-2xl ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              OLLI로 만들어진 실제 웹툰을 만나보세요
            </p>
          </div>

          <WebtoonShowcase />
        </div>
      </section>

      {/* Infinite Character Grid - 무한한 캐릭터 가능성 */}
      <section
        className={`py-32 px-6 overflow-hidden ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div
              className={`inline-block px-8 py-3 rounded-full text-sm font-black uppercase tracking-wider mb-8 ${
                theme === "dark"
                  ? "bg-[#00e5cc]/20 text-[#00e5cc] border-2 border-[#00e5cc]/30"
                  : "bg-[#00e5cc]/10 text-[#00b3a6] border-2 border-[#00e5cc]/20"
              }`}
            >
              AI 캐릭터
            </div>
            <h2
              className={`text-6xl md:text-8xl font-black mb-8 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="bg-gradient-to-r from-[#00e5cc] to-blue-500 bg-clip-text text-transparent">
                무한한
              </span>{" "}
              캐릭터 가능성
            </h2>
            <p
              className={`text-2xl ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              마우스를 움직여 3D 그리드를 탐험하세요
            </p>
          </div>

          <InfiniteCharacterGrid theme={theme} />
        </div>
      </section>

      {/* Final CTA */}
      <section
        ref={ctaRef}
        className={`py-32 px-6 ${
          theme === "dark" ? "bg-black" : "bg-white"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <MagneticCTA theme={theme} onButtonClick={() => navigate("/signup")} />
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-20 px-6 ${
          theme === "dark"
            ? "border-gray-800 bg-black"
            : "border-gray-200 bg-gray-50"
        }`}
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
                className={`text-lg mb-6 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-600"
                }`}
              >
                차세대 AI 인스타그램 툰 플랫폼
                <br />
                작가와 기업을 연결합니다
              </p>
              <div className="flex gap-4">
                {[Instagram, Globe, TrendingUp].map((Icon, i) => (
                  <button
                    key={i}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-[#00e5cc]/20 text-gray-400 hover:text-[#00e5cc]"
                        : "bg-gray-200 hover:bg-[#00e5cc]/20 text-gray-600 hover:text-[#00e5cc]"
                    }`}
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
                  className={`font-black mb-6 text-xl ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className={`text-lg transition-colors hover:text-[#00e5cc] ${
                          theme === "dark" ? "text-gray-500" : "text-gray-600"
                        }`}
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
            className={`pt-8 border-t text-center ${
              theme === "dark" ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <p
              className={`text-lg ${
                theme === "dark" ? "text-gray-500" : "text-gray-600"
              }`}
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

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  theme: string;
  gradient: string;
  className?: string;
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  theme,
  gradient,
  className = "",
}: FeatureCardProps) {
  return (
    <GlareHover>
      <div
        className={`feature-card group relative p-10 rounded-3xl backdrop-blur-xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
          theme === "dark"
            ? "bg-gray-900/50 border-gray-800 hover:border-[#00e5cc]/50"
            : "bg-white/90 border-gray-200 hover:border-[#00e5cc]/50 shadow-xl"
        } ${className}`}
      >
        {/* Icon */}
        <div
          className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Content */}
        <h3
          className={`text-4xl font-black mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-xl ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </p>

        {/* Hover gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />
      </div>
    </GlareHover>
  );
}