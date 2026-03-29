import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wand2, Building2, Brain, TrendingUp, Zap, Shield, Sparkles, ChevronRight } from "lucide-react";

const cards = [
  {
    id: 1,
    icon: Wand2,
    title: "작가를 위한 AI 크리에이터",
    subtitle: "창작 시간 90% 단축",
    description: "일관된 캐릭터 생성부터 자동 스토리 구성까지, AI가 모든 반복 작업을 처리합니다. 작가는 오직 창작에만 집중하세요.",
    gradient: "from-[#00e5cc] to-cyan-400",
    features: [
      "일관된 캐릭터 무한 생성",
      "자동 스토리 구성 AI",
      "50+ 프리미엄 스타일",
      "실시간 렌더링"
    ],
    stats: { label: "활성 작가", value: "10K+" },
  },
  {
    id: 2,
    icon: Building2,
    title: "기업/기관용 브랜드 솔루션",
    subtitle: "안전한 승인 워크플로우",
    description: "관공서, 공공기관, 기업을 위한 엔터프라이즈급 마스코트 관리. 승인 프로세스와 버전 관리로 완벽한 거버넌스를 보장합니다.",
    gradient: "from-blue-500 to-blue-600",
    features: [
      "다단계 승인 워크플로우",
      "무제한 버전 관리",
      "브랜드 가이드 자동화",
      "규정 준수 지원"
    ],
    stats: { label: "브랜드 파트너", value: "500+" },
  },
  {
    id: 3,
    icon: Brain,
    title: "차세대 AI 엔진",
    subtitle: "Google AI 통합",
    description: "업계 최고 수준의 Google AI 모델을 통합하여 프로 수준의 결과물을 보장합니다. 맞춤형 학습으로 브랜드 고유의 스타일을 학습합니다.",
    gradient: "from-[#00e5cc] to-blue-500",
    features: [
      "Gemini 스토리 엔진",
      "Imagen 3 이미지 생성",
      "실시간 스타일 변환",
      "브랜드별 맞춤 학습"
    ],
    stats: { label: "생성된 콘텐츠", value: "1M+" },
  },
  {
    id: 4,
    icon: TrendingUp,
    title: "Ad Match AI 2.0",
    subtitle: "자동 광고 매칭 & 수익화",
    description: "AI가 작품 스타일을 분석하여 최적의 브랜드를 자동 매칭합니다. 작가는 창작만 하고, 수익은 자동으로 발생합니다.",
    gradient: "from-cyan-400 to-blue-600",
    features: [
      "AI 기반 브랜드 매칭",
      "자동 계약 생성",
      "실시간 수익 대시보드",
      "글로벌 광고 네트워크"
    ],
    stats: { label: "평균 월 수익", value: "₩500K+" },
  },
];

export function CardSwap() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentIndex];
  const Icon = currentCard.icon;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
      scale: 0.8,
    }),
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Card Stack */}
        <div className="relative h-[600px] flex items-center justify-center" style={{ perspective: "2000px" }}>
          {/* Background stacked cards */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`bg-${i}`}
              className="absolute w-full max-w-md h-[500px] rounded-[2rem] border-2 backdrop-blur-xl bg-card/60 border-border/60"
              style={{
                zIndex: -i,
              }}
              animate={{
                y: (i + 1) * 20,
                scale: 1 - (i + 1) * 0.05,
                opacity: 1 - (i + 1) * 0.3,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}

          {/* Active card */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentCard.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                rotateY: { duration: 0.4 },
                scale: { duration: 0.3 },
              }}
              className="absolute w-full max-w-md h-[500px] rounded-[2rem] p-10 border-2 backdrop-blur-2xl shadow-2xl overflow-hidden bg-card/95 border-border/80"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${currentCard.gradient} opacity-10 pointer-events-none`}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Icon */}
                <motion.div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentCard.gradient} flex items-center justify-center mb-6 shadow-2xl`}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-3xl font-black mb-3 text-foreground">
                  {currentCard.title}
                </h3>

                {/* Subtitle */}
                <div className={`text-sm font-bold mb-6 bg-gradient-to-r ${currentCard.gradient} bg-clip-text text-transparent`}>
                  {currentCard.subtitle}
                </div>

                {/* Description */}
                <p className="text-base leading-relaxed mb-6 text-muted-foreground">
                  {currentCard.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6 flex-1">
                  {currentCard.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${currentCard.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-foreground">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="p-4 rounded-xl backdrop-blur-xl border bg-muted/50 border-border/50">
                  <div className="text-[13px] font-semibold mb-1 text-muted-foreground">
                    {currentCard.stats.label}
                  </div>
                  <div className={`text-3xl font-black bg-gradient-to-r ${currentCard.gradient} bg-clip-text text-transparent`}>
                    {currentCard.stats.value}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <motion.button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 backdrop-blur-xl border-2 bg-card/95 border-border/80 hover:bg-muted/95"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-8 h-8 rotate-180 text-foreground" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 backdrop-blur-xl border-2 bg-card/95 border-border/80 hover:bg-muted/95"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-8 h-8 text-foreground" />
          </motion.button>
        </div>

        {/* Right: Info */}
        <div>
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-xl mb-8 shadow-lg bg-[#00e5cc]/10 border-[#00e5cc]/30"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Zap className="w-5 h-5 text-[#00e5cc]" />
            <span className="text-sm font-bold text-foreground">
              핵심 기능 소개
            </span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-6xl font-black mb-6 leading-tight text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            OLLI가<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5cc] via-cyan-300 to-blue-300">
              특별한 이유
            </span>
          </motion.h2>

          <motion.p
            className="text-xl leading-relaxed mb-10 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            단순한 AI 도구가 아닙니다. OLLI는 작가와 기업 모두를 위한 완전한 크리에이터 경제 플랫폼입니다.
          </motion.p>

          {/* Card indicators */}
          <div className="flex flex-col gap-3 mb-10">
            {cards.map((card, index) => {
              const CardIcon = card.icon;
              const isActive = index === currentIndex;
              return (
                <motion.button
                  key={card.id}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`group relative p-5 rounded-2xl transition-all backdrop-blur-xl border-2 text-left overflow-hidden ${
                    isActive
                      ? "bg-card/95 border-[#00e5cc] shadow-xl shadow-[#00e5cc]/10"
                      : "bg-card/80 border-border hover:border-[#00e5cc]/50 hover:bg-card/95 hover:shadow-lg"
                  }`}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient overlay for active state */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-5 pointer-events-none`} />
                  )}

                  <div className="relative z-10 flex items-center gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                      isActive
                        ? `bg-gradient-to-br ${card.gradient}`
                        : "bg-muted"
                    }`}>
                      <CardIcon className={`w-7 h-7 ${
                        isActive
                          ? "text-white"
                          : "text-muted-foreground"
                      }`} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold mb-1 text-foreground">
                        {card.title}
                      </div>
                      <div className={`text-[13px] font-semibold ${
                        isActive
                          ? `bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`
                          : "text-muted-foreground"
                      }`}>
                        {card.subtitle}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <ChevronRight className={`flex-shrink-0 w-5 h-5 transition-all ${
                      isActive
                        ? "text-[#00e5cc] translate-x-1"
                        : "text-muted-foreground group-hover:text-[#00e5cc]"
                    }`} />
                  </div>

                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${card.gradient} rounded-r-full`}
                      layoutId="activeBar"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Key highlights */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, label: "엔터프라이즈 보안", value: "SOC 2 인증" },
              { icon: Zap, label: "처리 속도", value: "< 5초" },
              { icon: Brain, label: "AI 정확도", value: "98.5%" },
              { icon: TrendingUp, label: "작가 만족도", value: "4.9/5" },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="p-5 rounded-xl backdrop-blur-xl border shadow-lg bg-card/90 border-border"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                >
                  <ItemIcon className="w-6 h-6 mb-3 text-[#00e5cc]" />
                  <div className="text-[13px] font-semibold mb-1 text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="text-lg font-black text-foreground">
                    {item.value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
