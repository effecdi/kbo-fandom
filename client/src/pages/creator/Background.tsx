import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Save, Download, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Background() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const styles = ["리얼", "애니메이션", "미니멀", "일러스트", "판타지"];
  const presets = [
    { name: "카페 내부", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop" },
    { name: "거실", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop" },
    { name: "공원", image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&h=200&fit=crop" },
    { name: "도시 풍경", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=200&fit=crop" },
    { name: "해변", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop" },
    { name: "학교 교실", image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&h=200&fit=crop" },
  ];

  return (
    <DashboardLayout userType="creator">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/creator/character")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              배경 생성 🖼️
            </h1>
            <p className="text-gray-600">
              인스타툰에 어울리는 배경을 만들어보세요
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">직접 생성</TabsTrigger>
                <TabsTrigger value="preset">프리셋</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    배경 설명
                  </label>
                  <Textarea
                    placeholder="원하는 배경을 설명해주세요. 예: 따뜻한 햇살이 들어오는 아늑한 카페 내부"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    스타일 선택
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-100 hover:border-purple-600"
                      >
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    시간대
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["아침", "낮", "저녁", "밤"].map((time, index) => (
                      <Button key={index} variant="outline" size="sm">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    날씨
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["맑음 ☀️", "흐림 ☁️", "비 🌧️", "눈 ❄️"].map((weather, index) => (
                      <Button key={index} variant="outline" size="sm">
                        {weather}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  배경 생성하기
                </Button>
              </TabsContent>

              <TabsContent value="preset" className="mt-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="프리셋 검색..."
                    className="pl-10"
                  />
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {presets.map((preset, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer rounded-xl overflow-hidden border border-gray-200 hover:border-purple-600 transition-all hover:shadow-lg"
                    >
                      <img
                        src={preset.image}
                        alt={preset.name}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-3 bg-white">
                        <p className="font-semibold text-sm text-gray-900">{preset.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Center & Right - Results */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-gray-900">생성 결과</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  1:1
                </Button>
                <Button variant="outline" size="sm">
                  16:9
                </Button>
                <Button variant="outline" size="sm">
                  9:16
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group cursor-pointer hover:ring-2 hover:ring-purple-600 transition-all"
                >
                  <img
                    src={`https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&sig=${i}`}
                    alt={`Generated background ${i}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>

            {/* Additional Options */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">추가 옵션</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <span className="font-bold text-sm">블러 효과</span>
                  <span className="text-xs text-gray-500 mt-1">배경 흐리게</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <span className="font-bold text-sm">색상 조정</span>
                  <span className="text-xs text-gray-500 mt-1">톤 변경</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <span className="font-bold text-sm">프레임 추가</span>
                  <span className="text-xs text-gray-500 mt-1">테두리 효과</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
