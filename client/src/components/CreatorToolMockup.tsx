import { motion } from "motion/react";
import { Sparkles, Image, Type, Palette, Wand2 } from "lucide-react";

interface CreatorToolMockupProps {
  theme: string;
}

export function CreatorToolMockup({ theme }: CreatorToolMockupProps) {
  return (
    <div className={`rounded-[2rem] p-10 border-2 backdrop-blur-xl relative overflow-hidden ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50"
        : "bg-gradient-to-br from-gray-50/80 to-white/80 border-gray-200/50 shadow-2xl"
    }`}>
      <div className={`aspect-square rounded-2xl ${
        theme === "dark" ? "bg-gray-900/50" : "bg-white"
      }`}>
        <div className="w-full h-full p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5cc] to-cyan-400 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                캐릭터 생성
              </span>
            </div>
            <motion.button
              className={`px-4 py-2 rounded-lg text-xs font-bold ${
                theme === "dark"
                  ? "bg-[#00e5cc]/20 text-[#00e5cc]"
                  : "bg-teal-100 text-teal-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              생성하기
            </motion.button>
          </div>

          {/* Prompt Input */}
          <div
            className={`p-4 rounded-xl border ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Type className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <span className={`text-xs font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                프롬프트
              </span>
            </div>
            <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              귀여운 토끼 캐릭터, 파란 옷을 입고, 밝은 표정, 만화 스타일...
            </p>
          </div>

          {/* Character Preview Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`aspect-square rounded-xl border-2 relative overflow-hidden ${
                  i === 1
                    ? theme === "dark"
                      ? "border-[#00e5cc] bg-gradient-to-br from-[#00e5cc]/20 to-cyan-400/10"
                      : "border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50"
                    : theme === "dark"
                    ? "border-gray-700 bg-gray-800/30"
                    : "border-gray-200 bg-gray-50"
                }`}
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className={`w-8 h-8 ${
                    i === 1
                      ? "text-[#00e5cc]"
                      : theme === "dark"
                      ? "text-gray-600"
                      : "text-gray-300"
                  }`} />
                </div>
                {i === 1 && (
                  <div className="absolute top-2 right-2">
                    <motion.div
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00e5cc] to-cyan-400 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Style Options */}
          <div className="flex gap-2">
            {["포즈 1", "포즈 2", "포즈 3"].map((style, i) => (
              <motion.button
                key={style}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold ${
                  i === 0
                    ? "bg-gradient-to-r from-[#00e5cc] to-cyan-400 text-white"
                    : theme === "dark"
                    ? "bg-gray-800 text-gray-400"
                    : "bg-gray-100 text-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {style}
              </motion.button>
            ))}
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-2">
            <Palette className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
            <div className="flex gap-2">
              {["#00e5cc", "#7c3aed", "#3b82f6", "#f59e0b"].map((color) => (
                <motion.div
                  key={color}
                  className="w-8 h-8 rounded-lg border-2"
                  style={{ backgroundColor: color, borderColor: color === "#00e5cc" ? color : "transparent" }}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}