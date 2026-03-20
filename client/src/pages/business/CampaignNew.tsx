import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function CampaignNew() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const steps = [
    "기본 정보",
    "타겟/조건",
    "예산/일정",
    "요청 산출물",
    "검토/완료",
  ];

  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    description: "",
    targetAge: "",
    targetGender: "",
    genre: "",
    tone: "",
    budget: "",
    startDate: "",
    deadline: "",
    contentCount: "",
  });

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/business/campaigns")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            캠페인 목록으로
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              새 캠페인 만들기 🚀
            </h1>
            <p className="text-muted-foreground">
              협업 캠페인 정보를 단계별로 입력하세요
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3">
            {/* Stepper */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          index + 1 === currentStep
                            ? "bg-blue-600 text-white scale-110"
                            : index + 1 < currentStep
                            ? "bg-green-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`text-xs mt-2 font-semibold ${
                          index + 1 === currentStep
                            ? "text-blue-600"
                            : index + 1 < currentStep
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-2 -mt-6 transition-all ${
                          index + 1 < currentStep ? "bg-green-600" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-card rounded-2xl p-8 border border-border">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-foreground mb-6">기본 정보</h2>
                  </div>
                  <div>
                    <Label htmlFor="name">캠페인명 *</Label>
                    <Input
                      id="name"
                      placeholder="예: 봄 신제품 런칭 캠페인"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purpose">캠페인 목적</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">브랜드 인지도</SelectItem>
                        <SelectItem value="engagement">참여 유도</SelectItem>
                        <SelectItem value="conversion">전환 증대</SelectItem>
                        <SelectItem value="loyalty">고객 충성도</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">제품/서비스 설명</Label>
                    <Textarea
                      id="description"
                      placeholder="제품이나 서비스에 대해 설명해주세요"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      className="mt-2 resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-foreground mb-6">타겟 & 조건</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>타겟 연령</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teens">10대</SelectItem>
                          <SelectItem value="20s">20대</SelectItem>
                          <SelectItem value="30s">30대</SelectItem>
                          <SelectItem value="40s">40대 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>타겟 성별</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체</SelectItem>
                          <SelectItem value="female">여성</SelectItem>
                          <SelectItem value="male">남성</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>선호 장르</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["일상", "로맨스", "코미디", "판타지", "드라마"].map((genre) => (
                        <Badge
                          key={genre}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>콘텐츠 톤</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bright">밝고 경쾌함</SelectItem>
                        <SelectItem value="warm">따뜻하고 감성적</SelectItem>
                        <SelectItem value="fun">재미있고 유쾌함</SelectItem>
                        <SelectItem value="serious">진지하고 전문적</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-foreground mb-6">예산 & 일정</h2>
                  </div>
                  <div>
                    <Label htmlFor="budget">예산 범위</Label>
                    <Input
                      id="budget"
                      placeholder="예: ₩500,000 - ₩700,000"
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">시작일</Label>
                      <Input
                        id="startDate"
                        type="date"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">마감일</Label>
                      <Input
                        id="deadline"
                        type="date"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>납기 조건</Label>
                    <Textarea
                      placeholder="납품 일정 및 조건을 설명해주세요"
                      rows={3}
                      className="mt-2 resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-foreground mb-6">요청 산출물</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>툰 수량</Label>
                      <Input
                        placeholder="예: 3편"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>컷 수</Label>
                      <Input
                        placeholder="예: 각 10컷"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>게시 채널</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["인스타그램", "페이스북", "블로그", "홈페이지"].map((channel) => (
                        <Badge
                          key={channel}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>추가 요청사항</Label>
                    <Textarea
                      placeholder="특별히 요청하고 싶은 내용이 있다면 작성해주세요"
                      rows={4}
                      className="mt-2 resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-foreground mb-6">최종 검토</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">캠페인명</p>
                      <p className="text-foreground">{formData.name || "입력 필요"}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">설명</p>
                      <p className="text-foreground">{formData.description || "입력 필요"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                        <p className="text-sm font-semibold text-blue-900 mb-1">예산</p>
                        <p className="text-blue-700">{formData.budget || "미정"}</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                        <p className="text-sm font-semibold text-green-900 mb-1">마감일</p>
                        <p className="text-green-700">{formData.deadline || "미정"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  이전
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    임시 저장
                  </Button>
                  {currentStep < totalSteps ? (
                    <Button onClick={nextStep} className="bg-blue-600 text-white">
                      다음
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      캠페인 발행
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-8">
              <h3 className="font-black text-foreground mb-4">요약</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">진행 단계</p>
                  <Badge>{currentStep}/{totalSteps} 단계</Badge>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-muted-foreground mb-2">입력된 정보</p>
                  <div className="space-y-2">
                    {formData.name && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-foreground">캠페인명</span>
                      </div>
                    )}
                    {formData.description && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-foreground">설명</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
