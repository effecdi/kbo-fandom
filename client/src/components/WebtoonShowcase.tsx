import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Bookmark, Sparkles } from "lucide-react";

interface WebtoonShowcaseProps {
  theme: string;
}

export function WebtoonShowcase({ theme }: WebtoonShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const webtoons = [
    {
      title: "오늘의 일상",
      author: "토끼작가",
      likes: "2.4K",
      comments: "156",
      style: "귀여운 일상툰",
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "회사생활백서",
      author: "직장인툰",
      likes: "5.2K",
      comments: "328",
      style: "공감 코믹",
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "우리집 고양이",
      author: "냥집사",
      likes: "3.8K",
      comments: "241",
      style: "반려동물툰",
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "요리왕 도전기",
      author: "쿡방작가",
      likes: "4.1K",
      comments: "193",
      style: "라이프스타일",
      color: "from-green-500 to-emerald-500",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % webtoons.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [webtoons.length]);

  const current = webtoons[currentIndex];

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="relative w-full max-w-md">
        {/* Instagram-style Frame */}
        <div
          className={`rounded-3xl overflow-hidden border-2 ${
            theme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          } shadow-2xl`}
        >
          {/* Header */}
          <div className={`px-4 py-3 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {current.author}
                </div>
                <div className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                  {current.style}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="aspect-square relative"
            >
              {/* Webtoon Canvas */}
              <div
                className={`w-full h-full flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <div className="text-center p-8">
                  {/* Simulated Comic Panels */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[1, 2, 3, 4].map((panel) => (
                      <motion.div
                        key={panel}
                        className={`aspect-square rounded-xl bg-gradient-to-br ${current.color} opacity-30`}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: panel * 0.1, type: "spring" }}
                      />
                    ))}
                  </div>
                  <motion.div
                    className={`text-lg font-black mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {current.title}
                  </motion.div>
                  <motion.div
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    AI로 5분만에 제작
                  </motion.div>
                </div>
              </div>

              {/* AI Badge */}
              <div className="absolute top-4 right-4">
                <motion.div
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00e5cc] to-cyan-400 text-white text-xs font-black shadow-lg flex items-center gap-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3" />
                  AI 생성
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Engagement Bar */}
          <div className={`px-4 py-3 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-6 h-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <MessageCircle className={`w-6 h-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Share2 className={`w-6 h-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </motion.button>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Bookmark className={`w-6 h-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-4 py-3">
            <div className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              좋아요 {current.likes}개
            </div>
            <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              댓글 {current.comments}개 모두 보기
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <motion.button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + webtoons.length) % webtoons.length)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 rounded-full flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-white hover:bg-gray-100"
          } shadow-xl`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`} />
        </motion.button>

        <motion.button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % webtoons.length)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 rounded-full flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-white hover:bg-gray-100"
          } shadow-xl`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`} />
        </motion.button>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {webtoons.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-gradient-to-r from-[#00e5cc] to-cyan-400"
                  : theme === "dark"
                  ? "w-2 bg-gray-700"
                  : "w-2 bg-gray-300"
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
