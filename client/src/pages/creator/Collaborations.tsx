import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Calendar,
  MessageSquare,
  Upload,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

export function Collaborations() {
  const projects = [
    {
      id: 1,
      brand: "XYZ 브랜드",
      campaign: "신제품 런칭 캠페인",
      status: "제작 중",
      progress: 60,
      deadline: "2026-04-15",
      stage: 2,
      totalStages: 4,
      lastUpdate: "2일 전",
    },
    {
      id: 2,
      brand: "ABC 코스메틱",
      campaign: "봄 시즌 프로모션",
      status: "검수 중",
      progress: 85,
      deadline: "2026-03-30",
      stage: 3,
      totalStages: 4,
      lastUpdate: "5시간 전",
    },
  ];

  const stages = ["제안 수락", "기획", "제작", "검수", "완료"];

  return (
    <DashboardLayout userType="creator">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">
          협업 진행 관리 🤝
        </h1>
        <p className="text-muted-foreground">
          진행 중인 협업 프로젝트를 관리하세요
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">진행 중 ({projects.length})</TabsTrigger>
          <TabsTrigger value="completed">완료됨</TabsTrigger>
          <TabsTrigger value="all">전체</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Project Header */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-foreground">{project.campaign}</h2>
                      <p className="text-sm text-muted-foreground">{project.brand}</p>
                    </div>
                  </div>
                  <Badge>{project.status}</Badge>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">진행률</span>
                    <span className="font-bold text-purple-600">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Stage Indicator */}
                <div className="mt-4 flex items-center gap-2">
                  {stages.map((stage, index) => (
                    <div key={index} className="flex items-center flex-1">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          index < project.stage
                            ? "bg-purple-600 text-white"
                            : index === project.stage
                            ? "bg-purple-200 text-purple-900"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < stages.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-1 ${
                            index < project.stage ? "bg-purple-600" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  {stages.map((stage, index) => (
                    <div key={index} className="flex-1 text-center">
                      {index <= project.stage && <span className="font-semibold">{stage}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">마감일</p>
                      <p className="font-bold text-foreground text-sm">{project.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">마지막 업데이트</p>
                      <p className="font-bold text-foreground text-sm">{project.lastUpdate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">단계</p>
                      <p className="font-bold text-foreground text-sm">
                        {project.stage + 1}/{project.totalStages + 1}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    파일 업로드
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    메시지 보내기
                  </Button>
                  <Button variant="outline">
                    상세 보기
                  </Button>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    최근 활동
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">1차 시안 제출 완료</p>
                        <p className="text-xs text-muted-foreground">2일 전</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">브랜드 피드백 확인</p>
                        <p className="text-xs text-muted-foreground">3일 전</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="completed">
          <div className="bg-card rounded-2xl p-12 border border-border text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">완료된 협업이 없습니다</h3>
            <p className="text-muted-foreground">첫 협업을 완료해보세요!</p>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{project.campaign}</h3>
                      <p className="text-sm text-muted-foreground">{project.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-2">{project.status}</Badge>
                    <p className="text-xs text-muted-foreground">{project.deadline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
