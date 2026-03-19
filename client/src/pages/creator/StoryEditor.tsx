import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Share2,
  Download,
  Eye,
  Undo,
  Redo,
  Type,
  Image as ImageIcon,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  X,
  Square,
  Circle,
  Minus,
  Layers,
  Palette,
  Smile,
  Trash2,
  Lock,
  Unlock,
  EyeOff,
  ChevronDown,
  Grid3x3,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/theme-provider";

type TabType = "templates" | "characters" | "text" | "layers";

export function StoryEditor() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [zoom, setZoom] = useState(100);

  // 레이어 목록
  const layers = [
    { id: 1, name: "배경", type: "image", visible: true, locked: false },
    { id: 2, name: "캐릭터 1", type: "character", visible: true, locked: false },
    { id: 3, name: "텍스트 - 대화", type: "text", visible: true, locked: false },
  ];

  return (
    <DashboardLayout userType="creator">
      <div
        className={`fixed inset-0 top-[72px] left-60 flex flex-col ${
          theme === "dark" ? "bg-[#0a0a0a]" : "bg-gray-50"
        }`}
      >
        {/* Top Toolbar */}
        <div
          className={`h-16 border-b flex items-center justify-between px-6 ${
            theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/creator/contents")}
              className={
                theme === "dark"
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </Button>

            <div
              className={`h-6 w-px ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />

            <div>
              <h2
                className={`text-sm font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                봄날의 일상 - 에피소드 1
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>캔버스 1/8</span>
                <span>•</span>
                <span>마지막 저장: 방금 전</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <Redo className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-gray-700" />

            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <Eye className="w-4 h-4 mr-2" />
              미리보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
            <Button
              size="sm"
              className="bg-[#00e5cc] text-black hover:bg-[#00f0ff]"
            >
              <Share2 className="w-4 h-4 mr-2" />
              게시
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Tools */}
          <div className="w-20 bg-[#1a1a1a] border-r border-gray-800 flex flex-col items-center py-6 gap-3">
            <button className="w-12 h-12 rounded-lg bg-[#00e5cc]/10 text-[#00e5cc] hover:bg-[#00e5cc]/20 transition-all flex items-center justify-center">
              <Square className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-lg text-gray-400 hover:bg-gray-800/50 transition-all flex items-center justify-center">
              <Circle className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-lg text-gray-400 hover:bg-gray-800/50 transition-all flex items-center justify-center">
              <Minus className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-lg text-gray-400 hover:bg-gray-800/50 transition-all flex items-center justify-center">
              <Type className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-lg text-gray-400 hover:bg-gray-800/50 transition-all flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <button className="w-12 h-12 rounded-lg text-gray-400 hover:bg-gray-800/50 transition-all flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* Center Canvas Area */}
          <div className="flex-1 bg-[#0f0f0f] overflow-auto relative">
            {/* Canvas */}
            <div className="min-h-full flex items-center justify-center p-12">
              <div className="relative">
                {/* Canvas Number Badge */}
                <div className="absolute -left-16 top-8 w-12 h-12 rounded-full bg-[#00e5cc] flex items-center justify-center text-black font-bold text-lg border-4 border-[#0f0f0f] shadow-xl">
                  1
                </div>

                {/* Canvas Container */}
                <div
                  className="bg-white rounded-lg shadow-2xl"
                  style={{
                    width: `${600 * (zoom / 100)}px`,
                    height: `${800 * (zoom / 100)}px`,
                    border: "4px solid #00e5cc",
                  }}
                >
                  {/* Canvas Content - Placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#00e5cc]" />
                      <p className="text-sm">캔버스 영역</p>
                      <p className="text-xs text-gray-500 mt-1">
                        좌측 도구로 스토리를 만들어보세요
                      </p>
                    </div>
                  </div>
                </div>

                {/* Canvas Info */}
                <div className="absolute -top-8 left-0 text-xs text-gray-500">
                  600 × 800px
                </div>

                {/* Add Canvas Button (below) */}
                <button className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#252525] border border-gray-700 hover:border-[#00e5cc] rounded-lg text-gray-400 hover:text-white transition-all flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" />
                  캔버스 추가
                </button>
              </div>
            </div>

            {/* Zoom Controls - Floating */}
            <div className="absolute bottom-6 right-6 bg-[#1a1a1a] border border-gray-800 rounded-lg p-2 flex items-center gap-2 shadow-xl">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="w-8 h-8 rounded hover:bg-gray-800 transition-all flex items-center justify-center text-gray-400"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-white font-semibold min-w-[50px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="w-8 h-8 rounded hover:bg-gray-800 transition-all flex items-center justify-center text-gray-400"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <button
                onClick={() => setZoom(100)}
                className="w-8 h-8 rounded hover:bg-gray-800 transition-all flex items-center justify-center text-gray-400"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Sidebar - Panels */}
          <div className="w-96 bg-[#1a1a1a] border-l border-gray-800 flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab("templates")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === "templates"
                    ? "bg-[#252525] text-[#00e5cc] border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                템플릿
              </button>
              <button
                onClick={() => setActiveTab("characters")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === "characters"
                    ? "bg-[#252525] text-[#00e5cc] border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                캐릭터
              </button>
              <button
                onClick={() => setActiveTab("text")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === "text"
                    ? "bg-[#252525] text-[#00e5cc] border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                텍스트
              </button>
              <button
                onClick={() => setActiveTab("layers")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === "layers"
                    ? "bg-[#252525] text-[#00e5cc] border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                레이어
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* 템플릿 탭 */}
              {activeTab === "templates" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      스토리 템플릿
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {["일상", "로맨스", "코믹", "드라마"].map(
                        (template) => (
                          <button
                            key={template}
                            className="aspect-square rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all flex items-center justify-center text-sm text-gray-400 hover:text-white"
                          >
                            {template}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      배경 템플릿
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {["실내", "야외", "카페", "학교"].map(
                        (template) => (
                          <button
                            key={template}
                            className="aspect-square rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all flex items-center justify-center text-sm text-gray-400 hover:text-white"
                          >
                            {template}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      말풍선 스타일
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["기본", "생각", "속삭임", "외침", "나레이션", "효과음"].map(
                        (style) => (
                          <button
                            key={style}
                            className="aspect-square rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all text-xs text-gray-400 hover:text-white"
                          >
                            {style}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 캐릭터 탭 */}
              {activeTab === "characters" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      내 캐릭터
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <button
                          key={i}
                          className="aspect-square rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all overflow-hidden"
                        >
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            캐릭터 {i}
                          </div>
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-3 border-gray-700 text-gray-400 hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      캐릭터 추가
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      표정/포즈
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["기본", "웃음", "놀람", "화남", "슬픔", "기쁨", "당황", "사랑", "피곤"].map(
                        (pose) => (
                          <button
                            key={pose}
                            className="aspect-square rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all text-xs text-gray-400 hover:text-white flex items-center justify-center"
                          >
                            <div className="text-center">
                              <Smile className="w-5 h-5 mx-auto mb-1" />
                              <span className="text-[10px]">{pose}</span>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 텍스트 탭 */}
              {activeTab === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-white mb-2 block">
                      텍스트 입력
                    </label>
                    <textarea
                      placeholder="대사나 나레이션을 입력하세요..."
                      rows={4}
                      className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-white mb-2 block">
                      폰트
                    </label>
                    <select className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent">
                      <option>본고딕</option>
                      <option>나눔고딕</option>
                      <option>배민 주아</option>
                      <option>나눔손글씨</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-bold text-white mb-2 block">
                        크기
                      </label>
                      <input
                        type="number"
                        defaultValue={16}
                        className="w-full px-3 py-2 bg-[#252525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-white mb-2 block">
                        색상
                      </label>
                      <input
                        type="color"
                        defaultValue="#000000"
                        className="w-full h-10 bg-[#252525] border border-gray-700 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-white mb-2 block">
                      정렬
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["왼쪽", "가운데", "오른쪽"].map((align) => (
                        <button
                          key={align}
                          className="py-2 rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all text-xs text-gray-400 hover:text-white"
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-white mb-2 block">
                      말풍선 타입
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["대화", "생각", "나레이션", "효과음"].map((type) => (
                        <button
                          key={type}
                          className="py-2 rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all text-xs text-gray-400 hover:text-white"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-[#00e5cc] text-black hover:bg-[#00f0ff]">
                    <Plus className="w-4 h-4 mr-2" />
                    텍스트 추가
                  </Button>
                </div>
              )}

              {/* 레이어 탭 */}
              {activeTab === "layers" && (
                <div className="space-y-4">
                  <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white">
                        레이어 ({layers.length})
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#00e5cc] hover:bg-[#00e5cc]/10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {layers.map((layer) => (
                        <div
                          key={layer.id}
                          className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-700 hover:border-[#00e5cc] transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <button className="text-gray-400 hover:text-white">
                              {layer.visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                            <button className="text-gray-400 hover:text-white">
                              {layer.locked ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium">
                                {layer.name}
                              </p>
                              <p className="text-xs text-gray-500">{layer.type}</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {layers.length === 0 && (
                      <div className="text-center py-8">
                        <Layers className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm text-gray-500">레이어가 없습니다</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      레이어 도구
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 justify-start"
                      >
                        <Grid3x3 className="w-4 h-4 mr-2" />
                        정렬
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 justify-start"
                      >
                        <Layers className="w-4 h-4 mr-2" />
                        그룹화
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 justify-start"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        스타일 복사
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}