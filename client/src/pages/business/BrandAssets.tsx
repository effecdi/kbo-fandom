import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import {
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  Filter,
  Search,
  Plus,
  Upload,
  FolderOpen,
  Image as ImageIcon,
  Palette,
  FileText,
  Grid3x3,
  List,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Star,
  Shield,
  GitBranch,
  Calendar,
  User,
  Tag,
  Share2,
  Lock,
  Unlock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router";

type AssetType = "mascot" | "logo" | "icon" | "color" | "document";
type AssetStatus = "approved" | "pending" | "draft" | "rejected" | "archived";
type ViewMode = "grid" | "list";

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  thumbnail: string;
  version: string;
  lastModified: string;
  modifiedBy: string;
  tags: string[];
  downloads: number;
  isLocked: boolean;
}

export function BrandAssets() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedType, setSelectedType] = useState<AssetType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const assets: Asset[] = [
    {
      id: "1",
      name: "메인 마스코트 - 올리",
      type: "mascot",
      status: "approved",
      thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400",
      version: "v2.3",
      lastModified: "2024-03-10",
      modifiedBy: "김담당",
      tags: ["공식", "메인", "캐릭터"],
      downloads: 245,
      isLocked: true,
    },
    {
      id: "2",
      name: "서브 캐릭터 - 토리",
      type: "mascot",
      status: "pending",
      thumbnail: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400",
      version: "v1.0",
      lastModified: "2024-03-12",
      modifiedBy: "박과장",
      tags: ["서브", "신규"],
      downloads: 12,
      isLocked: false,
    },
    {
      id: "3",
      name: "브랜드 로고 세트",
      type: "logo",
      status: "approved",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      version: "v3.1",
      lastModified: "2024-03-05",
      modifiedBy: "이대리",
      tags: ["로고", "공식"],
      downloads: 567,
      isLocked: true,
    },
    {
      id: "4",
      name: "SNS 아이콘 팩",
      type: "icon",
      status: "approved",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
      version: "v1.5",
      lastModified: "2024-03-08",
      modifiedBy: "최팀장",
      tags: ["아이콘", "SNS"],
      downloads: 189,
      isLocked: false,
    },
    {
      id: "5",
      name: "컬러 팔레트",
      type: "color",
      status: "approved",
      thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400",
      version: "v2.0",
      lastModified: "2024-03-01",
      modifiedBy: "김담당",
      tags: ["컬러", "가이드"],
      downloads: 423,
      isLocked: true,
    },
    {
      id: "6",
      name: "스프링 캠페인 캐릭터",
      type: "mascot",
      status: "draft",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      version: "v0.8",
      lastModified: "2024-03-13",
      modifiedBy: "박과장",
      tags: ["캠페인", "시즌"],
      downloads: 3,
      isLocked: false,
    },
    {
      id: "7",
      name: "브랜드 가이드라인",
      type: "document",
      status: "approved",
      thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400",
      version: "v4.2",
      lastModified: "2024-02-28",
      modifiedBy: "최팀장",
      tags: ["가이드", "문서"],
      downloads: 892,
      isLocked: true,
    },
    {
      id: "8",
      name: "이벤트 로고 초안",
      type: "logo",
      status: "rejected",
      thumbnail: "https://images.unsplash.com/photo-1534670007418-fbb7f6cf32c3?w=400",
      version: "v1.0",
      lastModified: "2024-03-11",
      modifiedBy: "이대리",
      tags: ["이벤트", "미승인"],
      downloads: 0,
      isLocked: false,
    },
  ];

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case "approved":
        return theme === "dark" ? "text-green-400 bg-green-500/20" : "text-green-600 bg-green-100";
      case "pending":
        return theme === "dark" ? "text-yellow-400 bg-yellow-500/20" : "text-yellow-600 bg-yellow-100";
      case "draft":
        return theme === "dark" ? "text-gray-400 bg-gray-500/20" : "text-muted-foreground bg-muted";
      case "rejected":
        return theme === "dark" ? "text-red-400 bg-red-500/20" : "text-red-600 bg-red-100";
      case "archived":
        return theme === "dark" ? "text-muted-foreground bg-gray-700/20" : "text-muted-foreground bg-muted";
    }
  };

  const getStatusIcon = (status: AssetStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "draft":
        return <Edit className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      case "archived":
        return <Archive className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status: AssetStatus) => {
    switch (status) {
      case "approved":
        return "승인됨";
      case "pending":
        return "검토중";
      case "draft":
        return "초안";
      case "rejected":
        return "반려됨";
      case "archived":
        return "보관됨";
    }
  };

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case "mascot":
        return <Sparkles className="w-4 h-4" />;
      case "logo":
        return <ImageIcon className="w-4 h-4" />;
      case "icon":
        return <Grid3x3 className="w-4 h-4" />;
      case "color":
        return <Palette className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: AssetType) => {
    switch (type) {
      case "mascot":
        return "마스코트";
      case "logo":
        return "로고";
      case "icon":
        return "아이콘";
      case "color":
        return "컬러";
      case "document":
        return "문서";
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesType = selectedType === "all" || asset.type === selectedType;
    const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    total: assets.length,
    approved: assets.filter(a => a.status === "approved").length,
    pending: assets.filter(a => a.status === "pending").length,
    draft: assets.filter(a => a.status === "draft").length,
  };

  return (
    <DashboardLayout userType="business">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-black mb-2 ${
              theme === "dark" ? "text-white" : "text-foreground"
            }`}>
              브랜드 자산
            </h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-muted-foreground"}>
              승인된 마스코트, 로고, 아이콘을 통합 관리하고 버전을 추적하세요
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className={theme === "dark" ? "border-border" : ""}
            >
              <Upload className="w-4 h-4 mr-2" />
              업로드
            </Button>
            <Button
              onClick={() => navigate("/business/mascot")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 자산 생성
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 border ${
            theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                  {stats.total}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                  전체 자산
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${
            theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                  {stats.approved}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                  승인됨
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${
            theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                  {stats.pending}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                  검토중
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border ${
            theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                  {stats.draft}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                  초안
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={`rounded-2xl p-6 border mb-6 ${
        theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === "dark" ? "text-muted-foreground" : "text-gray-400"
            }`} />
            <Input
              placeholder="자산 이름 또는 태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-12 ${
                theme === "dark" ? "bg-gray-900 border-border" : ""
              }`}
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              className={selectedType === "all" ? "bg-blue-500" : ""}
            >
              전체
            </Button>
            {(["mascot", "logo", "icon", "color", "document"] as AssetType[]).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                className={selectedType === type ? "bg-blue-500" : ""}
              >
                {getTypeIcon(type)}
                <span className="ml-2">{getTypeLabel(type)}</span>
              </Button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AssetStatus | "all")}
            className={`px-4 py-2 rounded-lg border font-semibold text-sm ${
              theme === "dark"
                ? "bg-gray-900 border-border text-white"
                : "bg-card border-border text-foreground"
            }`}
          >
            <option value="all">모든 상태</option>
            <option value="approved">승인됨</option>
            <option value="pending">검토중</option>
            <option value="draft">초안</option>
            <option value="rejected">반려됨</option>
            <option value="archived">보관됨</option>
          </select>

          {/* View Mode */}
          <div className={`flex rounded-lg border ${
            theme === "dark" ? "border-border" : "border-border"
          }`}>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-l-lg ${
                viewMode === "grid"
                  ? theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-muted text-foreground"
                  : theme === "dark"
                  ? "text-gray-400"
                  : "text-muted-foreground"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-r-lg ${
                viewMode === "list"
                  ? theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-muted text-foreground"
                  : theme === "dark"
                  ? "text-gray-400"
                  : "text-muted-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`group rounded-2xl border overflow-hidden hover:shadow-xl transition-all ${
                theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={asset.thumbnail}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(asset.status)}`}>
                    {getStatusIcon(asset.status)}
                    {getStatusLabel(asset.status)}
                  </span>
                </div>
                {/* Lock Badge */}
                {asset.isLocked && (
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-bold text-sm line-clamp-1 ${
                    theme === "dark" ? "text-white" : "text-foreground"
                  }`}>
                    {asset.name}
                  </h3>
                  <button className={theme === "dark" ? "text-gray-400" : "text-muted-foreground"}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-muted text-muted-foreground"
                  }`}>
                    {getTypeLabel(asset.type)}
                  </span>
                  <span className={`text-xs font-mono ${
                    theme === "dark" ? "text-muted-foreground" : "text-muted-foreground"
                  }`}>
                    {asset.version}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {asset.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {asset.tags.length > 2 && (
                    <span className={`text-xs ${theme === "dark" ? "text-muted-foreground" : "text-muted-foreground"}`}>
                      +{asset.tags.length - 2}
                    </span>
                  )}
                </div>

                <div className={`flex items-center justify-between text-xs pt-3 border-t ${
                  theme === "dark" ? "border-border text-muted-foreground" : "border-border text-muted-foreground"
                }`}>
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <span>{asset.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{asset.lastModified}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`rounded-xl p-4 border hover:shadow-lg transition-all ${
                theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={asset.thumbnail}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold truncate ${
                      theme === "dark" ? "text-white" : "text-foreground"
                    }`}>
                      {asset.name}
                    </h3>
                    {asset.isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`inline-flex items-center gap-1 ${
                      theme === "dark" ? "text-gray-400" : "text-muted-foreground"
                    }`}>
                      {getTypeIcon(asset.type)}
                      {getTypeLabel(asset.type)}
                    </span>
                    <span className={`font-mono text-xs ${
                      theme === "dark" ? "text-muted-foreground" : "text-muted-foreground"
                    }`}>
                      {asset.version}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(asset.status)}`}>
                      {getStatusIcon(asset.status)}
                      {getStatusLabel(asset.status)}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="hidden lg:flex gap-1">
                  {asset.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className={`hidden md:flex items-center gap-4 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-muted-foreground"
                }`}>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{asset.modifiedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{asset.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{asset.lastModified}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <div className={`text-center py-16 rounded-2xl border ${
          theme === "dark" ? "bg-[#1a1a1a] border-border" : "bg-card border-border"
        }`}>
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-foreground"
          }`}>
            자산을 찾을 수 없습니다
          </h3>
          <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
            검색 조건을 변경하거나 새 자산을 생성해보세요
          </p>
          <Button
            onClick={() => navigate("/business/mascot")}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 자산 생성
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
