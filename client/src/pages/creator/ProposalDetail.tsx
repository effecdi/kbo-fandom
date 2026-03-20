import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Download,
  MessageSquare,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

export function ProposalDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [response, setResponse] = useState("");

  const proposal = {
    id: id || "1",
    brandName: "XYZ 브랜드",
    brandLogo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop",
    campaignTitle: "신제품 런칭 캠페인",
    status: "신규",
    budget: "₩500,000 - ₩700,000",
    deadline: "2026-04-15",
    receivedDate: "2026-03-05",
    targetAudience: "20-30대 여성",
    deliverables: [
      "인스타툰 3편 (각 10컷)",
      "스토리 콘텐츠 5개",
      "브랜드 협업 게시물 2개",
    ],
    requirements: "밝고 긍정적인 톤으로 신제품의 장점을 자연스럽게 녹여낸 일상툰 형식을 원합니다.",
    attachments: [
      { name: "브랜드 가이드.pdf", size: "2.3 MB" },
      { name: "제품 이미지.zip", size: "15.8 MB" },
    ],
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/creator/proposals")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            제안함으로 돌아가기
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-foreground">
                  {proposal.campaignTitle}
                </h1>
                <Badge variant="secondary">{proposal.status}</Badge>
              </div>
              <p className="text-muted-foreground">
                {proposal.brandName}에서 받은 협업 제안입니다
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Brand Info */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden">
                  <img
                    src={proposal.brandLogo}
                    alt={proposal.brandName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground">{proposal.brandName}</h2>
                  <p className="text-sm text-muted-foreground">뷰티 & 라이프스타일</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                  <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">예산</p>
                  <p className="font-bold text-foreground text-sm">{proposal.budget}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">마감일</p>
                  <p className="font-bold text-foreground text-sm">{proposal.deadline}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                  <FileText className="w-5 h-5 text-green-600 mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">타겟</p>
                  <p className="font-bold text-foreground text-sm">{proposal.targetAudience}</p>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="bg-card rounded-2xl border border-border">
              <Tabs defaultValue="details" className="p-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">상세 내용</TabsTrigger>
                  <TabsTrigger value="deliverables">산출물</TabsTrigger>
                  <TabsTrigger value="attachments">첨부 파일</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-foreground mb-2">캠페인 설명</h3>
                      <p className="text-foreground leading-relaxed">
                        {proposal.requirements}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">타겟 독자</h3>
                      <p className="text-foreground">{proposal.targetAudience}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">제안 받은 날짜</h3>
                      <p className="text-foreground">{proposal.receivedDate}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="deliverables" className="mt-6">
                  <div className="space-y-3">
                    {proposal.deliverables.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-muted rounded-xl"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="mt-6">
                  <div className="space-y-3">
                    {proposal.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Response Section */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-black text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                답변 작성
              </h2>
              <Textarea
                placeholder="협업 제안에 대한 답변이나 문의사항을 작성하세요..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Right Sidebar - Action Panel */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-8 space-y-4">
              <h2 className="font-black text-foreground mb-4">답변 하기</h2>
              
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white h-12">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                제안 수락
              </Button>

              <Button variant="outline" className="w-full h-12">
                <MessageSquare className="w-4 h-4 mr-2" />
                협의 요청
              </Button>

              <Button variant="outline" className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50">
                <X className="w-4 h-4 mr-2" />
                거절하기
              </Button>

              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">안내</p>
                    <p className="text-xs text-blue-700">
                      답변은 48시간 이내에 해주시는 것을 권장합니다
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-bold text-foreground text-sm mb-3">제안 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">제안 번호</span>
                    <span className="font-semibold text-foreground">#{proposal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">받은 날짜</span>
                    <span className="font-semibold text-foreground">{proposal.receivedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">상태</span>
                    <Badge variant="secondary">{proposal.status}</Badge>
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
