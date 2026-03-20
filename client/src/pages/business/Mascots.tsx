import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Download, Sparkles, GitBranch, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router";

export function Mascots() {
  const navigate = useNavigate();

  const mascots = [
    {
      id: 1,
      name: "브랜디",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
      style: "Friendly",
      createdAt: "2026-02-15",
      usedIn: 5,
      status: "approved",
      version: "v2.3",
    },
    {
      id: 2,
      name: "올리",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      style: "Professional",
      createdAt: "2026-01-20",
      usedIn: 12,
      status: "approved",
      version: "v3.1",
    },
    {
      id: 3,
      name: "코코",
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop",
      style: "Playful",
      createdAt: "2026-03-01",
      usedIn: 3,
      status: "pending",
      version: "v1.0",
    },
  ];

  return (
    <DashboardLayout userType="business">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              내 마스코트 관리 🎭
            </h1>
            <p className="text-muted-foreground">
              브랜드/공공 마스코트를 관리하고 활용하세요
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => navigate("/business/mascot")}
          >
            <Plus className="w-4 h-4 mr-2" />
            새 마스코트 생성
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-6 border border-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="마스코트 검색..."
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="archived">보관됨</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="recent">
            <SelectTrigger>
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">최근 생성순</SelectItem>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="used">사용 빈도순</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-styles">
            <SelectTrigger>
              <SelectValue placeholder="스타일" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-styles">전체 스타일</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mascots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mascots.map((mascot) => (
          <div
            key={mascot.id}
            className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
              <img
                src={mascot.image}
                alt={mascot.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Badge
                  variant={
                    mascot.status === "approved"
                      ? "default"
                      : mascot.status === "pending"
                      ? "secondary"
                      : "outline"
                  }
                  className={
                    mascot.status === "approved"
                      ? "bg-green-600"
                      : mascot.status === "pending"
                      ? "bg-yellow-600"
                      : ""
                  }
                >
                  {mascot.status === "approved" ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> 승인됨</>
                  ) : mascot.status === "pending" ? (
                    <><Clock className="w-3 h-3 mr-1" /> 검토중</>
                  ) : (
                    "초안"
                  )}
                </Badge>
                <Badge variant="outline" className="bg-white/90">
                  <GitBranch className="w-3 h-3 mr-1" />
                  {mascot.version}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-black text-foreground text-lg mb-1">{mascot.name}</h3>
                  <p className="text-sm text-muted-foreground">{mascot.style} 스타일</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div>
                  <span className="font-semibold text-foreground">{mascot.usedIn}</span>
                  <span className="ml-1">개 콘텐츠</span>
                </div>
                <div className="text-xs">생성: {mascot.createdAt}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate("/business/content")}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  콘텐츠 생성
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  상세 보기
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (hidden when mascots exist) */}
      {mascots.length === 0 && (
        <div className="bg-card rounded-2xl p-12 border border-border text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">
            첫 번째 마스코트를 만들어보세요
          </h3>
          <p className="text-muted-foreground mb-2">
            브랜드 정체성이나 공공 캠페인을 담은 마스코트로 콘텐츠를 시작하세요
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            기업 홍보, 공공기관 캠페인, 지역 홍보 등 다양하게 활용 가능합니다
          </p>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            onClick={() => navigate("/business/mascot")}
          >
            <Plus className="w-4 h-4 mr-2" />
            마스코트 생성하기
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}