import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Star,
  TrendingUp,
  Users,
  Eye,
  Heart,
  CheckCircle,
  Send,
  Filter,
  Sparkles,
  Award,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

export function CollaborationMatching() {
  const navigate = useNavigate();
  const [selectedCreators, setSelectedCreators] = useState<number[]>([]);

  const creators = [
    {
      id: 1,
      name: "작가 김민지",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      genre: "정보툰",
      matchScore: 98,
      followers: "125K",
      avgViews: "45K",
      completedProjects: 24,
      rating: 4.9,
      price: "300-500만원",
      description: "공공기관 정책 홍보 전문. 복잡한 정보를 쉽고 재미있게 전달합니다.",
      tags: ["정책홍보", "공공캠페인", "정보전달"],
      portfolioCount: 48,
    },
    {
      id: 2,
      name: "작가 이서준",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      genre: "일상툰",
      matchScore: 95,
      followers: "89K",
      avgViews: "32K",
      completedProjects: 18,
      rating: 4.8,
      price: "200-400만원",
      description: "따뜻하고 공감 가는 스토리텔링. 지역 행사 및 축제 홍보 경험 다수.",
      tags: ["지역행사", "축제홍보", "공감스토리"],
      portfolioCount: 36,
    },
    {
      id: 3,
      name: "작가 박지현",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      genre: "캠페인툰",
      matchScore: 93,
      followers: "156K",
      avgViews: "58K",
      completedProjects: 32,
      rating: 5.0,
      price: "500-800만원",
      description: "대규모 공공 캠페인 전문. 관공서 협업 프로젝트 20개 이상.",
      tags: ["대형캠페인", "관공서협업", "브랜딩"],
      portfolioCount: 62,
    },
    {
      id: 4,
      name: "작가 최유진",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      genre: "교육툰",
      matchScore: 90,
      followers: "67K",
      avgViews: "28K",
      completedProjects: 15,
      rating: 4.7,
      price: "150-300만원",
      description: "교육 및 안내 콘텐츠 특화. 시민 대상 정보 전달에 강점.",
      tags: ["교육콘텐츠", "시민안내", "정보툰"],
      portfolioCount: 29,
    },
  ];

  const toggleCreator = (id: number) => {
    if (selectedCreators.includes(id)) {
      setSelectedCreators(selectedCreators.filter(cId => cId !== id));
    } else {
      setSelectedCreators([...selectedCreators, id]);
    }
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            AI 추천 작가 매칭 결과 ✨
          </h1>
          <p className="text-muted-foreground">
            프로젝트에 최적화된 작가를 매칭했습니다. 미디어킷을 확인하고 협업 제안을 보내세요
          </p>
        </div>

        {/* Project Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-black text-foreground text-lg mb-2">
                📋 프로젝트: 2024 봄 축제 홍보 인스타툰 제작
              </h3>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>예산: 300-500만원</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>기한: 1개월 이내</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>유형: 인스타툰, 행사/이벤트</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              프로젝트 수정
            </Button>
          </div>
        </div>

        {/* Matching Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-3xl font-black text-purple-600 mb-1">
              {creators.length}
            </div>
            <div className="text-sm text-muted-foreground">매칭된 작가</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-3xl font-black text-blue-600 mb-1">98%</div>
            <div className="text-sm text-muted-foreground">최고 매칭률</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-3xl font-black text-green-600 mb-1">4.9</div>
            <div className="text-sm text-muted-foreground">평균 평점</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-3xl font-black text-orange-600 mb-1">24</div>
            <div className="text-sm text-muted-foreground">평균 경험</div>
          </div>
        </div>

        {/* Selected Count */}
        {selectedCreators.length > 0 && (
          <div className="bg-purple-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">
                {selectedCreators.length}명의 작가를 선택했습니다
              </span>
            </div>
            <Button
              className="bg-white text-purple-600 hover:bg-purple-50"
              onClick={() => navigate("/business/proposals/new")}
            >
              <Send className="w-4 h-4 mr-2" />
              협업 제안 보내기
            </Button>
          </div>
        )}

        {/* Creators List */}
        <div className="space-y-6">
          {creators.map((creator) => (
            <div
              key={creator.id}
              className={`bg-card rounded-2xl border-2 overflow-hidden transition-all ${
                selectedCreators.includes(creator.id)
                  ? "border-purple-600 shadow-lg"
                  : "border-border hover:shadow-lg"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Profile Image */}
                  <div className="relative">
                    <img
                      src={creator.profileImage}
                      alt={creator.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-sm shadow-lg">
                      {creator.matchScore}%
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-black text-foreground">
                            {creator.name}
                          </h3>
                          <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                            {creator.genre}
                          </Badge>
                          {creator.rating >= 4.9 && (
                            <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                              <Award className="w-3 h-3 mr-1" />
                              Top Rated
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {creator.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {creator.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/20 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"
                            >
                              <Sparkles className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          <span className="font-black text-foreground">
                            {creator.rating}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">평점</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-black text-foreground">
                            {creator.followers}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">팔로워</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="w-4 h-4 text-purple-600" />
                          <span className="font-black text-foreground">
                            {creator.avgViews}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">평균 조회</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-black text-foreground">
                            {creator.completedProjects}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">완료</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <ThumbsUp className="w-4 h-4 text-indigo-600" />
                          <span className="font-black text-foreground">
                            {creator.portfolioCount}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">포트폴리오</div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          예상 비용
                        </div>
                        <div className="text-lg font-black text-foreground">
                          {creator.price}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/business/creators/${creator.id}`)}
                        >
                          미디어킷 보기
                        </Button>
                        <Button
                          className={
                            selectedCreators.includes(creator.id)
                              ? "bg-purple-600 text-white"
                              : "bg-muted text-foreground hover:bg-muted"
                          }
                          onClick={() => toggleCreator(creator.id)}
                        >
                          {selectedCreators.includes(creator.id) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              선택됨
                            </>
                          ) : (
                            "선택하기"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-between bg-card rounded-2xl p-6 border border-border">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              더 많은 작가를 보고 싶으신가요?
            </p>
            <Button variant="outline" size="sm">
              전체 작가 탐색
            </Button>
          </div>
          {selectedCreators.length > 0 && (
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8"
              onClick={() => navigate("/business/proposals/new")}
            >
              <Send className="w-5 h-5 mr-2" />
              {selectedCreators.length}명에게 협업 제안하기
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
