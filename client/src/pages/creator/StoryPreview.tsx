import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  Save,
  Share2,
  Download,
  Smartphone,
  Monitor,
  Instagram,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function StoryPreview() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");

  const panels = [
    { id: 1, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop" },
    { id: 2, image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&h=800&fit=crop" },
    { id: 3, image: "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=600&h=800&fit=crop" },
    { id: 4, image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=600&h=800&fit=crop" },
  ];

  const checkpoints = [
    { label: "텍스트 가독성", status: "pass" },
    { label: "이미지 해상도", status: "pass" },
    { label: "말풍선 배치", status: "warning" },
    { label: "색상 대비", status: "pass" },
    { label: "인스타 크기 적합성", status: "pass" },
  ];

  return (
    <DashboardLayout userType="creator">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/creator/story")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          에디터로 돌아가기
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              툰 미리보기 👀
            </h1>
            <p className="text-gray-600">
              발행 전 최종 확인을 해보세요
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/creator/story")}
            >
              <Edit className="w-4 h-4 mr-2" />
              수정하기
            </Button>
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Share2 className="w-4 h-4 mr-2" />
              발행하기
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="font-black text-gray-900 mb-4">미리보기 설정</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-3 block">화면 모드</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={viewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("mobile")}
                    className="h-auto py-3 flex-col"
                  >
                    <Smartphone className="w-5 h-5 mb-1" />
                    <span className="text-xs">모바일</span>
                  </Button>
                  <Button
                    variant={viewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("desktop")}
                    className="h-auto py-3 flex-col"
                  >
                    <Monitor className="w-5 h-5 mb-1" />
                    <span className="text-xs">데스크톱</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Label htmlFor="instagram-preview" className="text-sm">
                  인스타 비율
                </Label>
                <Switch id="instagram-preview" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-grid" className="text-sm">
                  그리드 표시
                </Label>
                <Switch id="show-grid" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="font-black text-gray-900 mb-4">품질 체크</h2>
            <div className="space-y-3">
              {checkpoints.map((checkpoint, index) => (
                <div key={index} className="flex items-center gap-2">
                  {checkpoint.status === "pass" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700">{checkpoint.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="font-black text-gray-900 mb-4">내보내기</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Instagram className="w-4 h-4 mr-2" />
                인스타용 다운로드
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                고해상도 다운로드
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                URL 공유
              </Button>
            </div>
          </div>
        </div>

        {/* Center - Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-gray-900">전체 스크롤 미리보기</h2>
              <div className="flex gap-2">
                <Badge variant="secondary">총 {panels.length}컷</Badge>
                <Badge variant="outline">인스타툰 형식</Badge>
              </div>
            </div>

            {/* Preview Container */}
            <div className={`mx-auto bg-gray-50 rounded-2xl p-8 ${viewMode === "mobile" ? "max-w-md" : "max-w-3xl"}`}>
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Story Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                    <div>
                      <p className="font-bold text-sm">일상툰 시리즈 #12</p>
                      <p className="text-xs text-gray-500">2026년 3월 8일</p>
                    </div>
                  </div>
                </div>

                {/* Panels */}
                <div className="space-y-0">
                  {panels.map((panel, index) => (
                    <div key={panel.id} className="relative group">
                      <img
                        src={panel.image}
                        alt={`Panel ${panel.id}`}
                        className="w-full"
                      />
                      {/* Panel number overlay on hover */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge className="bg-black/70 text-white">
                          컷 {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Story Footer */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>❤️ 좋아요</span>
                    <span>💬 댓글</span>
                    <span>📤 공유</span>
                  </div>
                </div>
              </div>

              {/* Mobile indicator */}
              {viewMode === "mobile" && (
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">모바일 화면 (375px)</p>
                </div>
              )}
            </div>

            {/* Panel Navigation */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">컷별 검토</h3>
              <div className="grid grid-cols-4 gap-4">
                {panels.map((panel, index) => (
                  <button
                    key={panel.id}
                    className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-600 transition-all"
                  >
                    <img
                      src={panel.image}
                      alt={`Panel ${panel.id}`}
                      className="w-full h-full object-cover"
                    />
                    <p className="text-xs font-semibold py-2">컷 {index + 1}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
