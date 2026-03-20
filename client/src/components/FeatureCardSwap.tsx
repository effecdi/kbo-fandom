import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  Zap,
  Palette,
  Instagram,
  Target,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 캐릭터 생성",
    description: "텍스트 한 줄로 독창적인 캐릭터가 탄생합니다. 일관된 스타일과 표정을 자동으로 생성합니다.",
    gradient: "from-[#00e5cc] to-teal-600",
    color: "#00e5cc",
  },
  {
    icon: Zap,
    title: "초고속 처리",
    description: "단 5초만에 프로급 웹툰 한 컷이 완성됩니다. 업계 최고 수준의 처리 속도를 경험하세요.",
    gradient: "from-yellow-500 to-orange-600",
    color: "#f59e0b",
  },
  {
    icon: Palette,
    title: "자동 스토리보드",
    description: "AI가 텍스트를 분석해 장면을 자동 구성합니다. 컷 분할부터 연출까지 한 번에 완성됩니다.",
    gradient: "from-purple-500 to-pink-600",
    color: "#a855f7",
  },
  {
    icon: Instagram,
    title: "원클릭 퍼블리싱",
    description: "인스타그램에 직접 연동하여 한 번의 클릭으로 작품을 발행합니다. 최적 사이즈 자동 변환.",
    gradient: "from-pink-500 to-rose-600",
    color: "#ec4899",
  },
  {
    icon: Target,
    title: "브랜드 마스코트",
    description: "기업 맞춤형 AI 학습으로 브랜드 고유의 캐릭터를 생성하고 관리합니다.",
    gradient: "from-blue-500 to-indigo-600",
    color: "#3b82f6",
  },
  {
    icon: BarChart3,
    title: "실시간 분석",
    description: "데이터 기반 인사이트로 콘텐츠 성과를 실시간 분석합니다. 최적의 발행 전략을 제안합니다.",
    gradient: "from-green-500 to-emerald-600",
    color: "#22c55e",
  },
  {
    icon: Shield,
    title: "엔터프라이즈 보안",
    description: "SOC 2 인증 완료. 기업과 공공기관을 위한 엔터프라이즈급 보안 체계를 갖추고 있습니다.",
    gradient: "from-gray-500 to-gray-700",
    color: "#6b7280",
  },
];

interface FeatureCardSwapProps {
  theme: string;
}

export function FeatureCardSwap({ theme }: FeatureCardSwapProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, []);

  // Auto-rotate every 3.5s
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  const current = features[currentIndex];
  const Icon = current.icon;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        {/* Left: Stacked Card */}
        <div
          className="relative w-full max-w-md flex-shrink-0"
          style={{ height: 420, perspective: 1200 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background stack cards */}
          {[2, 1].map((offset) => {
            const idx = (currentIndex + offset) % features.length;
            return (
              <motion.div
                key={`stack-${offset}`}
                className={`absolute inset-0 rounded-3xl border-2 ${
                  theme === "dark"
                    ? "bg-gray-800/60 border-gray-700/40"
                    : "bg-white/60 border-gray-200/60"
                }`}
                animate={{
                  y: offset * 16,
                  scale: 1 - offset * 0.04,
                  opacity: 1 - offset * 0.25,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  zIndex: -offset,
                  borderTopColor: features[idx].color + "40",
                }}
              />
            );
          })}

          {/* Active card */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ rotateX: -15, y: -60, opacity: 0, scale: 0.95 }}
              animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
              exit={{ rotateX: 15, y: 80, opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 25,
              }}
              className={`absolute inset-0 rounded-3xl p-10 border-2 shadow-2xl overflow-hidden cursor-pointer ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
              style={{ transformStyle: "preserve-3d", zIndex: 1 }}
              onClick={next}
            >
              {/* Color accent top bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${current.gradient}`}
              />

              {/* Gradient bg glow */}
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: current.color }}
              />

              <div className="relative z-10 h-full flex flex-col">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.gradient} flex items-center justify-center mb-8 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3
                  className={`text-3xl md:text-4xl font-black mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {current.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-lg md:text-xl leading-relaxed flex-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {current.description}
                </p>

                {/* Counter */}
                <div className="flex items-center justify-between pt-6 mt-auto border-t border-gray-200/20">
                  <span
                    className={`text-sm font-bold ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {String(currentIndex + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    클릭하여 넘기기
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Feature list indicators */}
        <div className="flex-1 w-full">
          <div className="flex flex-col gap-3">
            {features.map((feature, i) => {
              const FIcon = feature.icon;
              const isActive = i === currentIndex;
              return (
                <motion.button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl text-left transition-all border-2 ${
                    isActive
                      ? theme === "dark"
                        ? "bg-white/10 border-white/20 shadow-lg"
                        : "bg-white border-gray-200 shadow-lg"
                      : theme === "dark"
                      ? "bg-transparent border-transparent hover:bg-white/5"
                      : "bg-transparent border-transparent hover:bg-gray-50"
                  }`}
                  animate={isActive ? { x: 4 } : { x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Active color bar */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                      style={{ background: feature.color }}
                      layoutId="featureActiveBar"
                    />
                  )}

                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                      isActive
                        ? `bg-gradient-to-br ${feature.gradient}`
                        : theme === "dark"
                        ? "bg-white/10"
                        : "bg-gray-100"
                    }`}
                  >
                    <FIcon
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-white"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-base font-bold truncate ${
                        isActive
                          ? theme === "dark"
                            ? "text-white"
                            : "text-gray-900"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {feature.title}
                    </div>
                  </div>

                  {/* Progress bar for active */}
                  {isActive && !isPaused && (
                    <motion.div
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full origin-left"
                      style={{ background: feature.color }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 3.5, ease: "linear" }}
                      key={`progress-${currentIndex}`}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
