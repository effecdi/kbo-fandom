import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, RefreshCw, Save, Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function PoseExpression() {
  const navigate = useNavigate();
  const [selectedPose, setSelectedPose] = useState("standing");
  const [selectedExpression, setSelectedExpression] = useState("happy");

  const poses = [
    { value: "standing", label: "서 있는 포즈" },
    { value: "sitting", label: "앉은 포즈" },
    { value: "walking", label: "걷는 포즈" },
    { value: "running", label: "뛰는 포즈" },
    { value: "jumping", label: "점프 포즈" },
  ];

  const expressions = [
    { value: "happy", label: "기쁨", emoji: "😊" },
    { value: "sad", label: "슬픔", emoji: "😢" },
    { value: "angry", label: "화남", emoji: "😠" },
    { value: "surprised", label: "놀람", emoji: "😲" },
    { value: "thinking", label: "생각", emoji: "🤔" },
    { value: "love", label: "사랑", emoji: "😍" },
  ];

  const angles = ["정면", "측면", "3/4 각도", "뒷모습"];
  const emotions = ["즐거움", "설렘", "긴장", "편안함", "자신감"];

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
              포즈 & 표정 생성 🎭
            </h1>
            <p className="text-gray-600">
              캐릭터의 다양한 포즈와 표정을 만들어보세요
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h2 className="font-black text-gray-900 mb-4">기준 캐릭터</h2>
            <Select defaultValue="character1">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="character1">민지</SelectItem>
                <SelectItem value="character2">준호</SelectItem>
                <SelectItem value="character3">수지</SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-4 aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop"
                alt="Selected character"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <Tabs defaultValue="pose">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pose">포즈</TabsTrigger>
                <TabsTrigger value="expression">표정</TabsTrigger>
              </TabsList>

              <TabsContent value="pose" className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2">포즈 선택</Label>
                  <Select value={selectedPose} onValueChange={setSelectedPose}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {poses.map((pose) => (
                        <SelectItem key={pose.value} value={pose.value}>
                          {pose.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">카메라 앵글</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {angles.map((angle, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {angle}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">손 동작</Label>
                  <Select defaultValue="neutral">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">자연스럽게</SelectItem>
                      <SelectItem value="wave">손 흔들기</SelectItem>
                      <SelectItem value="point">가리키기</SelectItem>
                      <SelectItem value="peace">브이</SelectItem>
                      <SelectItem value="thumbs">엄지척</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="expression" className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2">표정 선택</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {expressions.map((expr) => (
                      <Button
                        key={expr.value}
                        variant={selectedExpression === expr.value ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-3 flex-col"
                        onClick={() => setSelectedExpression(expr.value)}
                      >
                        <span className="text-2xl mb-1">{expr.emoji}</span>
                        <span className="text-xs">{expr.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2">감정 태그</Label>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emotion, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-purple-100">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              생성하기
            </Button>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900">미리보기</h2>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 생성
              </Button>
            </div>
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-full max-w-md mx-auto mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop"
                    alt="Preview"
                    className="w-full rounded-xl shadow-2xl"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  왼쪽에서 옵션을 선택하고 생성 버튼을 눌러주세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-8">
            <h2 className="font-black text-gray-900 mb-4">생성 히스토리</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-600 transition-all"
                >
                  <img
                    src={`https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&sig=${i}`}
                    alt={`History ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              전체 히스토리 보기
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
