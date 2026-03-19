import { DashboardLayout } from "@/components/DashboardLayout";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/theme-provider";

export function Contents() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const contents = [
    {
      id: 1,
      title: "봄날의 산책",
      type: "인스타툰",
      thumbnail: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop",
      status: "published",
      publishDate: "2024-03-10",
      views: "45.2K",
      likes: "3.8K",
      shares: "892",
      comments: "234",
      character: "올리",
      episodes: 1,
    },
    {
      id: 2,
      title: "직장인의 하루",
      type: "시리즈툰",
      thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
      status: "published",
      publishDate: "2024-03-08",
      views: "68.5K",
      likes: "5.2K",
      shares: "1.2K",
      comments: "456",
      character: "민지",
      episodes: 8,
    },
    {
      id: 3,
      title: "건강한 아침 루틴",
      type: "협업툰",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
      status: "scheduled",
      publishDate: "2024-03-15",
      views: "0",
      likes: "0",
      shares: "0",
      comments: "0",
      character: "올리",
      episodes: 1,
      client: "헬스케어 브랜드",
    },
    {
      id: 4,
      title: "주말 브런치 레시피",
      type: "인스타툰",
      thumbnail: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=400&h=400&fit=crop",
      status: "draft",
      publishDate: null,
      views: "0",
      likes: "0",
      shares: "0",
      comments: "0",
      character: "코코",
      episodes: 1,
    },
    {
      id: 5,
      title: "여행 준비 체크리스트",
      type: "협업툰",
      thumbnail: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop",
      status: "in_review",
      publishDate: null,
      views: "0",
      likes: "0",
      shares: "0",
      comments: "0",
      character: "민지",
      episodes: 1,
      client: "여행 플랫폼",
    },
    {
      id: 6,
      title: "환경 보호 캠페인",
      type: "협업툰",
      thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop",
      status: "published",
      publishDate: "2024-03-05",
      views: "92.3K",
      likes: "8.1K",
      shares: "2.5K",
      comments: "678",
      character: "올리",
      episodes: 1,
      client: "환경부",
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      published: { label: "게시됨", color: "bg-green-100 text-green-700", icon: CheckCircle },
      scheduled: { label: "예약됨", color: "bg-blue-100 text-blue-700", icon: Clock },
      draft: { label: "임시저장", color: "bg-gray-100 text-gray-700", icon: FileText },
      in_review: { label: "검토중", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
    };
    return configs[status] || configs.draft;
  };

  const stats = {
    total: contents.length,
    published: contents.filter(c => c.status === "published").length,
    scheduled: contents.filter(c => c.status === "scheduled").length,
    draft: contents.filter(c => c.status === "draft").length,
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-black mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              콘텐츠 관리
            </h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>내가 만든 모든 콘텐츠를 관리하세요</p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            onClick={() => navigate("/creator/story")}
          >
            <Plus className="w-5 h-5 mr-2" />
            새 콘텐츠 만들기
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{stats.total}</span>
            </div>
            <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>전체 콘텐츠</p>
          </div>
          <div className={`rounded-xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{stats.published}</span>
            </div>
            <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>게시됨</p>
          </div>
          <div className={`rounded-xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{stats.scheduled}</span>
            </div>
            <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>예약됨</p>
          </div>
          <div className={`rounded-xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{stats.draft}</span>
            </div>
            <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>임시저장</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`rounded-xl p-4 border mb-6 ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="콘텐츠 검색..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        {/* Contents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => {
            const statusConfig = getStatusConfig(content.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={content.id}
                className={`rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {content.episodes > 1 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-black/70 text-white border-0">
                        {content.episodes} 에피소드
                      </Badge>
                    </div>
                  )}
                  {content.client && (
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-purple-600 text-white border-0">
                        협업: {content.client}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 line-clamp-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {content.title}
                      </h3>
                      <div className={`flex items-center gap-2 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <span>{content.type}</span>
                        <span>·</span>
                        <span>{content.character}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stats */}
                  {content.status === "published" && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className={`text-center p-2 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="w-3 h-3 text-gray-500" />
                          <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {content.views}
                          </span>
                        </div>
                      </div>
                      <div className={`text-center p-2 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Heart className="w-3 h-3 text-gray-500" />
                          <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {content.likes}
                          </span>
                        </div>
                      </div>
                      <div className={`text-center p-2 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Share2 className="w-3 h-3 text-gray-500" />
                          <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {content.shares}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  {content.publishDate && (
                    <div className={`flex items-center gap-1 text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      <Calendar className="w-3 h-3" />
                      <span>
                        {content.status === "scheduled" ? "예약일: " : "게시일: "}
                        {content.publishDate}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      수정
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      보기
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}