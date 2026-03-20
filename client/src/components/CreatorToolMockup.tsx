import { motion } from "motion/react";
import { Sparkles, Image, Type, Palette, Wand2 } from "lucide-react";

interface CreatorToolMockupProps {
  theme: string;
}

export function CreatorToolMockup({ theme }: CreatorToolMockupProps) {
  return (
    <div className="rounded-[2rem] p-10 border-2 backdrop-blur-xl relative overflow-hidden bg-gradient-to-br from-muted/80 to-card/80 border-border/50 shadow-2xl dark:shadow-none">
      <div className="aspect-square rounded-2xl bg-card">
        <div className="w-full h-full p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5cc] to-cyan-400 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">
                캐릭터 생성
              </span>
            </div>
            <motion.button
              className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-100 dark:bg-[#00e5cc]/20 text-teal-700 dark:text-[#00e5cc]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              생성하기
            </motion.button>
          </div>

          {/* Prompt Input */}
          <div
            className="p-4 rounded-xl border bg-muted border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground">
                프롬프트
              </span>
            </div>
            <p className="text-sm text-foreground">
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
                    ? "border-teal-500 dark:border-[#00e5cc] bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-[#00e5cc]/20 dark:to-cyan-400/10"
                    : "border-border bg-muted"
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
                      : "text-muted-foreground"
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
                    : "bg-muted text-muted-foreground"
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
            <Palette className="w-4 h-4 text-muted-foreground" />
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