import { motion } from "motion/react";
import { Shield, CheckCircle2, Clock, Users, FileText, ChevronRight } from "lucide-react";

interface EnterpriseSystemMockupProps {
  theme: string;
}

export function EnterpriseSystemMockup({ theme }: EnterpriseSystemMockupProps) {
  return (
    <div className={`rounded-[2rem] p-10 border-2 backdrop-blur-xl relative overflow-hidden ${
      theme === "dark"
        ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-800/50"
        : "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-200/50 shadow-2xl"
    }`}>
      <div className={`aspect-square rounded-2xl ${
        theme === "dark" ? "bg-blue-950/50" : "bg-white"
      }`}>
        <div className="w-full h-full p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                승인 대시보드
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
            }`}>
              3개 대기중
            </div>
          </div>

          {/* Workflow Status */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "검토중", count: 5, color: "from-orange-500 to-amber-500" },
              { label: "승인됨", count: 12, color: "from-green-500 to-emerald-500" },
              { label: "반려됨", count: 2, color: "from-red-500 to-pink-500" },
            ].map((status, i) => (
              <motion.div
                key={status.label}
                className={`p-3 rounded-xl border ${
                  theme === "dark"
                    ? "bg-gray-800/30 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
                whileHover={{ y: -5, scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {status.label}
                </div>
                <div className={`text-2xl font-black bg-gradient-to-r ${status.color} bg-clip-text text-transparent`}>
                  {status.count}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Approval Items */}
          <div className="space-y-2">
            {[
              { title: "봄 캠페인 마스코트", status: "pending", user: "김디자이너" },
              { title: "여름 이벤트 툰", status: "approved", user: "이작가" },
              { title: "공공캠페인 캐릭터", status: "review", user: "박크리에이터" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  theme === "dark"
                    ? "bg-gray-800/30 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
                whileHover={{ x: 5 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                  } flex items-center justify-center`}>
                    <FileText className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className={`w-3 h-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                        {item.user}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "approved" && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === "pending" && (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )}
                  {item.status === "review" && (
                    <motion.div
                      className="w-5 h-5 rounded-full bg-blue-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <ChevronRight className={`w-4 h-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Version Control */}
          <div
            className={`p-4 rounded-xl border ${
              theme === "dark"
                ? "bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-800/50"
                : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>
                버전 관리
              </span>
              <span className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                v3.2.1
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((v) => (
                <motion.div
                  key={v}
                  className={`flex-1 h-2 rounded-full ${
                    v <= 3
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : theme === "dark"
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: v * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}