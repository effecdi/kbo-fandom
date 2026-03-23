import { useState } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Star,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  MessageSquare,
  Zap,
  BadgeCheck,
  Flame,
  ExternalLink,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockCreator = {
  id: "creator-1",
  name: "김작가",
  bio: "감성적인 웹툰 작가입니다. 로맨스와 일상 장르를 주로 그리며, 여러 브랜드와의 콜라보 경험이 있습니다. 섬세한 감정 표현과 따뜻한 색감이 장점입니다.",
  genres: ["웹툰", "로맨스", "일상"],
  followers: "15.2K",
  engagement: 8.5,
  responseRate: 96,
  avgPrice: "200만원",
  rating: 4.8,
  reviewCount: 23,
  tags: ["검증된 작가", "빠른 응답"],
  joinDate: "2022-06",
  completedProjects: 18,
};

const tagConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "빠른 응답": { color: "text-green-500 bg-green-500/10", icon: Zap },
  "검증된 작가": { color: "text-blue-500 bg-blue-500/10", icon: BadgeCheck },
  "인기 크리에이터": { color: "text-orange-500 bg-orange-500/10", icon: Flame },
};

const mockPortfolio = [
  { id: "p1", title: "봄날의 이야기", type: "웹툰", likes: 342 },
  { id: "p2", title: "커피 한 잔의 여유", type: "일러스트", likes: 218 },
  { id: "p3", title: "네이처 콜라보", type: "브랜드 콜라보", likes: 567 },
  { id: "p4", title: "일상 스케치", type: "웹툰", likes: 189 },
  { id: "p5", title: "감성 일러스트 시리즈", type: "일러스트", likes: 423 },
  { id: "p6", title: "캐릭터 디자인 프로젝트", type: "캐릭터", likes: 301 },
];

const mockHistory = [
  { id: "h1", brand: "네이처리퍼블릭", project: "봄 시즌 웹툰", period: "2024.01 ~ 2024.03", status: "완료", rating: 5.0 },
  { id: "h2", brand: "카카오엔터", project: "캐릭터 콜라보", period: "2023.10 ~ 2023.12", status: "완료", rating: 4.8 },
  { id: "h3", brand: "올리브영", project: "SNS 콘텐츠 시리즈", period: "2023.07 ~ 2023.09", status: "완료", rating: 4.9 },
];

const mockReviews = [
  { id: "r1", author: "네이처리퍼블릭", rating: 5, content: "정말 만족스러운 협업이었습니다. 일정도 잘 지키고 퀄리티도 훌륭했습니다.", date: "2024-03-15" },
  { id: "r2", author: "카카오엔터", rating: 5, content: "캐릭터에 대한 이해도가 높고, 커뮤니케이션이 원활했습니다.", date: "2023-12-20" },
  { id: "r3", author: "올리브영", rating: 4, content: "창의적인 아이디어를 많이 제안해 주셨습니다. 다음에도 함께 하고 싶습니다.", date: "2023-09-10" },
];

export function CreatorDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("portfolio");

  const tabs = [
    { id: "portfolio", label: "포트폴리오" },
    { id: "history", label: "협업 이력" },
    { id: "reviews", label: "리뷰" },
  ];

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/market/creators")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          크리에이터 목록으로
        </button>

        {/* Profile Header */}
        <div className="rounded-2xl border bg-card border-border p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center shrink-0">
              <span className="text-4xl font-bold text-white">
                {mockCreator.name.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-foreground">{mockCreator.name}</h1>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-base font-bold text-foreground">{mockCreator.rating}</span>
                  <span className="text-sm text-muted-foreground">({mockCreator.reviewCount})</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{mockCreator.bio}</p>

              {/* Genre Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {mockCreator.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {mockCreator.tags.map((tag) => {
                  const config = tagConfig[tag];
                  return (
                    <span
                      key={tag}
                      className={`text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-medium ${config.color}`}
                    >
                      <config.icon className="w-3.5 h-3.5" />
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2 shrink-0">
              <MessageSquare className="w-4 h-4" />
              제안 보내기
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">팔로워</span>
              </div>
              <p className="text-lg font-black text-foreground">{mockCreator.followers}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">참여율</span>
              </div>
              <p className="text-lg font-black text-foreground">{mockCreator.engagement}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">응답률</span>
              </div>
              <p className="text-lg font-black text-foreground">{mockCreator.responseRate}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <DollarSign className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">평균 단가</span>
              </div>
              <p className="text-lg font-black text-foreground">{mockCreator.avgPrice}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <BadgeCheck className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">완료 프로젝트</span>
              </div>
              <p className="text-lg font-black text-foreground">{mockCreator.completedProjects}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl bg-muted p-1 border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "portfolio" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockPortfolio.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-card border-border overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Image className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-bold text-foreground group-hover:text-[#00e5cc] transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{item.type}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-muted-foreground">{item.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-3">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-card border-border p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.project}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.brand} · {item.period}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-foreground">{item.rating}</span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full font-medium text-blue-500 bg-blue-500/10">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border bg-card border-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{review.author}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
