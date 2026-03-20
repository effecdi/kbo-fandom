import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Globe,
  Download,
  Share2,
  FileText,
  BarChart3,
  Award,
  Sparkles,
  Plus,
  Eye,
  Copy,
  Trash2,
  Edit,
  Image as ImageIcon,
} from "lucide-react";

type TabType = "basic" | "mediakit" | "portfolio";

export function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  // 미디어킷 버전들
  const mediakitVersions = [
    {
      id: 1,
      name: "공공기관용 미디어킷",
      type: "공공",
      createdDate: "2024-03-10",
      views: 45,
      isDefault: true,
    },
    {
      id: 2,
      name: "브랜드 협업용",
      type: "브랜드",
      createdDate: "2024-03-08",
      views: 32,
      isDefault: false,
    },
    {
      id: 3,
      name: "영어 버전 (Global)",
      type: "글로벌",
      createdDate: "2024-03-05",
      views: 18,
      isDefault: false,
    },
  ];

  // 포트폴리오
  const portfolioItems = [
    {
      id: 1,
      title: "푸드테크 브랜드 캠페인",
      thumbnail: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      category: "브랜드",
      date: "2024-02",
      views: 1200,
      likes: 89,
    },
    {
      id: 2,
      title: "환경 보호 공익 캠페인",
      thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
      category: "공익",
      date: "2024-01",
      views: 2100,
      likes: 156,
    },
    {
      id: 3,
      title: "교육 플랫폼 시리즈",
      thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
      category: "교육",
      date: "2023-12",
      views: 980,
      likes: 72,
    },
    {
      id: 4,
      title: "패션 브랜드 SS 룩북",
      thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
      category: "패션",
      date: "2023-11",
      views: 1500,
      likes: 110,
    },
  ];

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">프로필 & 미디어킷 👤</h1>
          <p className="text-muted-foreground">
            작가 정보를 관리하고 기업에게 보낼 미디어킷을 만드세요
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-black">
              O
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-1">올리 작가</h2>
                  <p className="text-muted-foreground mb-3">@olli_creator</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      olli@example.com
                    </span>
                    <span className="flex items-center gap-1">
                      <Instagram className="w-4 h-4" />
                      50K 팔로워
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  프로필 편집
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-black text-foreground mb-1">12</div>
                  <div className="text-xs text-muted-foreground">완료 프로젝트</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-black text-[#00e5cc] mb-1">4.9</div>
                  <div className="text-xs text-muted-foreground">평균 평점</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-black text-foreground mb-1">95</div>
                  <div className="text-xs text-muted-foreground">미디어킷 조회</div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-2xl font-black text-foreground mb-1">8</div>
                  <div className="text-xs text-muted-foreground">진행 중 제안</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("basic")}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "basic"
                  ? "bg-muted text-[#00e5cc] border-b-2 border-[#00e5cc]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              기본 정보
            </button>
            <button
              onClick={() => setActiveTab("mediakit")}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "mediakit"
                  ? "bg-muted text-[#00e5cc] border-b-2 border-[#00e5cc]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              미디어킷
              <span className="ml-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full font-bold">
                {mediakitVersions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "portfolio"
                  ? "bg-muted text-[#00e5cc] border-b-2 border-[#00e5cc]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-4 h-4" />
              포트폴리오
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* 기본 정보 */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-6">
                {/* 프로필 정보 */}
                <div className="space-y-6">
                  <div className="bg-background rounded-xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">프로필 정보</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">작가명</label>
                        <input
                          type="text"
                          defaultValue="올리 작가"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          인스타그램 핸들
                        </label>
                        <input
                          type="text"
                          defaultValue="@olli_creator"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">카테고리</label>
                        <select className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent">
                          <option>라이프스타일</option>
                          <option>음식</option>
                          <option>패션</option>
                          <option>교육</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm text-muted-foreground">자기 소개</label>
                          <button className="flex items-center gap-1 text-xs text-[#00e5cc] hover:text-[#00f0ff]">
                            <Sparkles className="w-3 h-3" />
                            AI 작성
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          defaultValue="따뜻하고 친근한 그림체로 일상과 공감 스토리를 그리는 작가입니다."
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 연락처 */}
                  <div className="bg-background rounded-xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">연락처</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">이메일</label>
                        <input
                          type="email"
                          defaultValue="olli@example.com"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          카카오톡 ID
                        </label>
                        <input
                          type="text"
                          defaultValue="olli_kakao"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 지표 & 단가 */}
                <div className="space-y-6">
                  {/* 인사이트 */}
                  <div className="bg-background rounded-xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      지표 & 인사이트
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">리치</label>
                        <input
                          type="number"
                          defaultValue="10000"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          노출양
                        </label>
                        <input
                          type="number"
                          defaultValue="5000"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          팔로워
                        </label>
                        <input
                          type="number"
                          defaultValue="50000"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          참여율 (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          defaultValue="5.2"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* 연령 분포 */}
                    <div className="mb-4">
                      <label className="block text-sm text-muted-foreground mb-3">
                        연령 분포 (%)
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {["13-17", "18-24", "25-34", "35+"].map((age) => (
                          <div key={age}>
                            <label className="block text-xs text-muted-foreground mb-1">
                              {age}
                            </label>
                            <input
                              type="number"
                              defaultValue={age === "13-17" ? "35" : age === "18-24" ? "30" : age === "25-34" ? "20" : "15"}
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 성별 비율 */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-3">
                        성별 비율 (%)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            남성
                          </label>
                          <input
                            type="number"
                            defaultValue="35"
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            여성
                          </label>
                          <input
                            type="number"
                            defaultValue="65"
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 광고 단가 */}
                  <div className="bg-background rounded-xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      광고 단가 (원)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          피드 게시글
                        </label>
                        <input
                          type="number"
                          defaultValue="100000"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          스토리
                        </label>
                        <input
                          type="number"
                          defaultValue="50000"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          릴스
                        </label>
                        <input
                          type="number"
                          defaultValue="200000"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          패키지
                        </label>
                        <input
                          type="number"
                          defaultValue="300000"
                          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 미디어킷 */}
            {activeTab === "mediakit" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      미디어킷 관리
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      상황에 맞는 여러 버전의 미디어킷을 만들어 관리하세요
                    </p>
                  </div>
                  <Button className="bg-[#00e5cc] text-black hover:bg-[#00f0ff]">
                    <Plus className="w-4 h-4 mr-2" />
                    새 미디어킷
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {mediakitVersions.map((kit) => (
                    <div
                      key={kit.id}
                      className="bg-background rounded-xl border border-border p-6 hover:border-[#00e5cc]/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-foreground">
                              {kit.name}
                            </h4>
                            {kit.isDefault && (
                              <Badge className="bg-[#00e5cc]/20 text-[#00e5cc] border-[#00e5cc]/30">
                                기본
                              </Badge>
                            )}
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {kit.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>생성: {kit.createdDate}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {kit.views}회 조회
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-muted-foreground hover:bg-muted"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            미리보기
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-muted-foreground hover:bg-muted"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-muted-foreground hover:bg-muted"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            공유
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-muted-foreground hover:bg-muted"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border text-red-400 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div className="mt-6 bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground mb-2">💡 미디어킷 활용 팁</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 공공기관용과 브랜드용을 구분하여 만들면 전문성이 높아집니다</li>
                        <li>• 정기적으로 지표를 업데이트하여 최신 성과를 보여주세요</li>
                        <li>• 공유 링크 조회수를 확인하여 어떤 기업이 관심있는지 파악하세요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 포트폴리오 */}
            {activeTab === "portfolio" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      포트폴리오
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      완료한 프로젝트를 보기 좋게 정리하세요
                    </p>
                  </div>
                  <Button className="bg-[#00e5cc] text-black hover:bg-[#00f0ff]">
                    <Plus className="w-4 h-4 mr-2" />
                    작품 추가
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-background rounded-xl border border-border overflow-hidden hover:border-[#00e5cc]/30 transition-all cursor-pointer group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 right-4">
                            <Button
                              size="sm"
                              className="w-full bg-white text-black hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              자세히 보기
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-foreground">{item.title}</h4>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.date}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {item.views}
                            </span>
                            <span className="flex items-center gap-1">
                              ❤️ {item.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        {activeTab === "basic" && (
          <div className="mt-6">
            <Button className="w-full py-4 bg-[#00e5cc] text-black font-bold text-lg rounded-xl hover:bg-[#00f0ff]">
              변경사항 저장
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
