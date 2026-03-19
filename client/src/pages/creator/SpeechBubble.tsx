import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { 
  Download, 
  Undo, 
  Redo, 
  Save, 
  Share2, 
  Type,
  Image as ImageIcon,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpeechBubble() {
  const [selectedTab, setSelectedTab] = useState("발풍선");

  return (
    <DashboardLayout userType="creator">
      <div className="h-[calc(100vh-120px)]">
        {/* Top Toolbar */}
        <div className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                말풍선 편집기
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">
                  Pro
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-all" title="다운로드">
                <Download className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-all" title="전체 다운로드">
                <Save className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-all" title="새로 이미지">
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </button>
              <button className="px-4 py-2 bg-[#00e5cc] text-black font-bold rounded-lg hover:bg-[#00f0ff] transition-all flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                저장 · 공유
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-full gap-4 px-6">
          {/* Left Sidebar - Tools */}
          <div className="w-16 bg-[#1a1a1a] rounded-2xl border border-gray-800 p-2 flex flex-col items-center gap-2">
            <button className="w-12 h-12 rounded-lg bg-[#00e5cc]/10 text-[#00e5cc] flex items-center justify-center hover:bg-[#00e5cc]/20 transition-all">
              <Type className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-lg hover:bg-gray-800/50 text-gray-400 flex items-center justify-center transition-all">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-lg hover:bg-gray-800/50 text-gray-400 flex items-center justify-center transition-all">
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* Center Canvas */}
          <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-[3/4] bg-white rounded-lg border-4 border-[#00e5cc] shadow-2xl">
              {/* Canvas Content */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">오른쪽 선택하세요</p>
                </div>
              </div>

              {/* Canvas Number Badge */}
              <div className="absolute -left-8 top-4 w-10 h-10 rounded-full bg-[#00e5cc] flex items-center justify-center text-black font-bold border-4 border-[#1a1a1a]">
                1
              </div>
            </div>
          </div>

          {/* Right Sidebar - Settings */}
          <div className="w-80 bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setSelectedTab("발풍선")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  selectedTab === "발풍선"
                    ? "bg-[#252525] text-white border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                발풍선
              </button>
              <button
                onClick={() => setSelectedTab("캐릭터")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  selectedTab === "캐릭터"
                    ? "bg-[#252525] text-white border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                캐릭터
              </button>
              <button
                onClick={() => setSelectedTab("텍스트")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  selectedTab === "텍스트"
                    ? "bg-[#252525] text-white border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                텍스트
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <Layers className="w-4 h-4" />
                <span className="text-sm">레이어 (0)</span>
              </div>

              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">레이어가 없습니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-gray-700 rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl">
          <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-all">
            <Undo className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-all">
            <Redo className="w-5 h-5 text-gray-400" />
          </button>
          <div className="w-px h-6 bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
              -
            </button>
            <span className="text-sm font-semibold text-white w-16 text-center">100%</span>
            <button className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
              +
            </button>
          </div>
          <div className="w-px h-6 bg-gray-700"></div>
          <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-all">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
