import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Sparkles,
  Smile,
  User,
  Image as ImageIcon,
  FileText,
  Download,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

export function CharacterDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const character = {
    name: "민지",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop",
    style: "Modern Cute",
    gender: "여성",
    mood: "밝고 활발함",
    target: "20-30대 여성",
    createdAt: "2026-03-01",
    description: "밝고 긍정적인 성격의 캐릭터로, 일상 툰과 브랜드 협업에 적합합니다.",
    features: ["큰 눈", "긴 머리", "캐주얼 스타일"],
    tags: ["일상", "로맨스", "힐링"],
  };

  const relatedProjects = [
    { title: "일상툰 시리즈 #12", date: "2일 전", status: "완료" },
    { title: "브랜드 협업 - ABC", date: "1주 전", status: "진행 중" },
    { title: "캐릭터 소개툰", date: "2주 전", status: "완료" },
  ];

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/creator/character")}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            캐릭터 목록으로
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground mb-2">
                {character.name}
              </h1>
              <p className="text-muted-foreground">{character.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-5 h-5 mr-2" />
                수정
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-5 h-5 mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Character Image */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-8">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">스타일</p>
                    <Badge variant="secondary">{character.style}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">생성일</p>
                    <p className="text-sm text-foreground">{character.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">태그</p>
                    <div className="flex flex-wrap gap-2">
                      {character.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Download className="w-5 h-5 mr-2" />
                  다운로드
                </Button>
              </div>
            </div>
          </div>

          {/* Right - Details & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-4">빠른 작업</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-6 flex-col">
                  <Smile className="w-8 h-8 mb-2 text-purple-600" />
                  <span className="font-bold text-sm">포즈 만들기</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex-col">
                  <Sparkles className="w-8 h-8 mb-2 text-pink-600" />
                  <span className="font-bold text-sm">표정 만들기</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex-col">
                  <ImageIcon className="w-8 h-8 mb-2 text-blue-600" />
                  <span className="font-bold text-sm">배경 연결</span>
                </Button>
                <Button variant="outline" className="h-auto py-6 flex-col">
                  <FileText className="w-8 h-8 mb-2 text-green-600" />
                  <span className="font-bold text-sm">스토리 작업</span>
                </Button>
              </div>
            </div>

            {/* Character Info Tabs */}
            <div className="bg-card rounded-2xl border border-border">
              <Tabs defaultValue="info" className="p-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">캐릭터 정보</TabsTrigger>
                  <TabsTrigger value="projects">연결된 작업물</TabsTrigger>
                  <TabsTrigger value="variations">변형 버전</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-foreground mb-3">기본 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">성별</p>
                        <p className="font-semibold text-foreground">{character.gender}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">무드</p>
                        <p className="font-semibold text-foreground">{character.mood}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-xl col-span-2">
                        <p className="text-sm text-muted-foreground mb-1">타겟 독자</p>
                        <p className="font-semibold text-foreground">{character.target}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-3">외형 특징</h3>
                    <div className="flex flex-wrap gap-2">
                      {character.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-3">캐릭터 설명</h3>
                    <p className="text-foreground leading-relaxed">
                      {character.description}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="mt-6">
                  <div className="space-y-3">
                    {relatedProjects.map((project, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.date}</p>
                        </div>
                        <Badge variant={project.status === "완료" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="variations" className="mt-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-muted rounded-xl overflow-hidden group cursor-pointer">
                        <img
                          src={`https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&sig=${i}`}
                          alt={`Variation ${i}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
