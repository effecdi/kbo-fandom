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
  Clock,
  CheckCircle,
  Users,
  History,
  Send,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Wand2,
  Layout,
  Palette,
  FileText,
  Smile,
  Grid3x3,
  MessageSquare,
  Square,
  Circle,
  Minus,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/theme-provider";

type ApprovalStatus = "draft" | "review" | "approved";
type TabType = "templates" | "mascots" | "text" | "approval";

export function ContentEditor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [zoom, setZoom] = useState(100);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("draft");
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // 버전 히스토리
  const versions = [
    {
      id: 1,
      version: "v1.3",
      date: "2024-03-11 14:30",
      author: "김담당자",
      status: "approved",
      comment: "최종 승인 완료",
    },
    {
      id: 2,
      version: "v1.2",
      date: "2024-03-11 11:20",
      author: "박과장",
      status: "review",
      comment: "문구 수정 필요",
    },
    {
      id: 3,
      version: "v1.1",
      date: "2024-03-10 16:45",
      author: "김담당자",
      status: "draft",
      comment: "초안 작성",
    },
  ];

  // 승인 프로세스
  const approvalSteps = [
    { id: 1, name: "담당자 작성", status: "completed", user: "김담당자" },
    { id: 2, name: "팀장 검토", status: "current", user: "박팀장" },
    { id: 3, name: "부서장 승인", status: "pending", user: "이부서장" },
    { id: 4, name: "최종 승인", status: "pending", user: "정국장" },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: "작성 중", className: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
      review: { label: "검토 중", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      approved: { label: "승인 완료", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      completed: { label: "완료", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      current: { label: "진행 중", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      pending: { label: "대기", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
    };
    const config = statusMap[status] || statusMap.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout userType="business">
      <div className="fixed inset-0 top-[72px] left-60 bg-[#0a0a0a] flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/business/content")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </Button>

            <div className="h-6 w-px bg-gray-700" />

            <div>
              <h2 className="text-sm font-bold text-white">2024 봄 축제 안내 포스터</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>v1.3</span>
                <span>•</span>
                <span>마지막 저장: 2분 전</span>
                {getStatusBadge(approvalStatus)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              <History className="w-4 h-4 mr-2" />
              버전 히스토리
            </Button>

            <div className="h-6 w-px bg-gray-700" />

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
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
            <Button
              size="sm"
              className="bg-[#00e5cc] text-black hover:bg-[#00f0ff]"
            >
              <Send className="w-4 h-4 mr-2" />
              검토 요청
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
                {/* Canvas Container */}
                <div
                  className="bg-white rounded-lg shadow-2xl"
                  style={{
                    width: `${600 * (zoom / 100)}px`,
                    height: `${800 * (zoom / 100)}px`,
                    border: "2px solid #00e5cc",
                  }}
                >
                  {/* Canvas Content - Placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#00e5cc]" />
                      <p className="text-sm">캔버스 영역</p>
                      <p className="text-xs text-gray-500 mt-1">
                        좌측 도구로 콘텐츠를 제작하세요
                      </p>
                    </div>
                  </div>
                </div>

                {/* Canvas Info */}
                <div className="absolute -top-8 left-0 text-xs text-gray-500">
                  600 × 800px
                </div>
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
                onClick={() => setActiveTab("mascots")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === "mascots"
                    ? "bg-[#252525] text-[#00e5cc] border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                마스코트
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
                onClick={() => setActiveTab("approval")}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === "approval"
                    ? "bg-[#252525] text-[#00e5cc] border-b-2 border-[#00e5cc]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                승인
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* 템플릿 탭 */}
              {activeTab === "templates" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      공공기관 템플릿
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {["행사 안내", "정책 홍보", "공지사항", "안전 수칙"].map(
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
                      SNS 템플릿
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {["인스타 스토리", "피드 포스트", "카드뉴스", "이벤트"].map(
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
                </div>
              )}

              {/* 마스코트 탭 */}
              {activeTab === "mascots" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      내 마스코트
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <button
                          key={i}
                          className="aspect-square rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all overflow-hidden"
                        >
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            마스코트 {i}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      표정/포즈
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["기본", "웃음", "놀람", "화남", "슬픔", "기쁨"].map(
                        (pose) => (
                          <button
                            key={pose}
                            className="aspect-square rounded-lg bg-[#252525] border border-gray-700 hover:border-[#00e5cc] transition-all text-xs text-gray-400 hover:text-white"
                          >
                            {pose}
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
                      placeholder="내용을 입력하세요..."
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

                  <Button className="w-full bg-[#00e5cc] text-black hover:bg-[#00f0ff]">
                    <Plus className="w-4 h-4 mr-2" />
                    텍스트 추가
                  </Button>
                </div>
              )}

              {/* 승인 탭 ⭐ 관공서 특화 */}
              {activeTab === "approval" && (
                <div className="space-y-4">
                  {/* 승인 진행 상태 */}
                  <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-bold text-white mb-4">
                      승인 프로세스
                    </h3>
                    <div className="space-y-3">
                      {approvalSteps.map((step, idx) => (
                        <div key={step.id}>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.status === "completed"
                                  ? "bg-green-500/20 text-green-400"
                                  : step.status === "current"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-gray-700 text-gray-400"
                              }`}
                            >
                              {step.status === "completed" ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : step.status === "current" ? (
                                <Clock className="w-5 h-5" />
                              ) : (
                                <span className="text-sm">{idx + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-white">
                                  {step.name}
                                </p>
                                {getStatusBadge(step.status)}
                              </div>
                              <p className="text-xs text-gray-400">{step.user}</p>
                            </div>
                          </div>
                          {idx < approvalSteps.length - 1 && (
                            <div className="ml-4 pl-[10px] border-l-2 border-gray-700 h-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 코멘트 섹션 */}
                  <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                    <h3 className="text-sm font-bold text-white mb-3">
                      검토 의견
                    </h3>
                    <div className="space-y-3 mb-3 max-h-[200px] overflow-auto">
                      <div className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-300">
                            박팀장
                          </span>
                          <span className="text-gray-500">2시간 전</span>
                        </div>
                        <p className="text-gray-400">
                          축제 날짜 정보를 더 크게 표시해주세요.
                        </p>
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-300">
                            김담당자
                          </span>
                          <span className="text-gray-500">5시간 전</span>
                        </div>
                        <p className="text-gray-400">초안 작성 완료했습니다.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="의견을 입력하세요..."
                        className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent text-sm"
                      />
                      <Button
                        size="sm"
                        className="bg-[#00e5cc] text-black hover:bg-[#00f0ff]"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="space-y-2">
                    <Button className="w-full bg-[#00e5cc] text-black hover:bg-[#00f0ff]">
                      <Send className="w-4 h-4 mr-2" />
                      다음 단계로 검토 요청
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      임시 저장
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className="fixed right-0 top-[136px] bottom-0 w-80 bg-[#1a1a1a] border-l border-gray-800 shadow-2xl z-50">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h3 className="font-bold text-white">버전 히스토리</h3>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="bg-[#252525] rounded-lg p-4 border border-gray-700 hover:border-[#00e5cc] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">
                            {version.version}
                          </span>
                          {getStatusBadge(version.status)}
                        </div>
                        <p className="text-xs text-gray-400">{version.date}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#00e5cc] hover:bg-[#00e5cc]/10"
                      >
                        복원
                      </Button>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {version.comment}
                    </p>
                    <p className="text-xs text-gray-500">작성자: {version.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}