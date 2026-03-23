import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Target,
  CalendarDays,
  DollarSign,
  Users,
  Sparkles,
  Clock,
  CheckCircle2,
  Star,
  UserPlus,
  BarChart3,
  Eye,
  Trash2,
  ArrowRightCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getItem,
  updateItem,
  removeItem,
  seedIfEmpty,
  STORE_KEYS,
  type Campaign,
} from "@/lib/local-store";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  recruiting: { label: "모집중", color: "text-amber-500 bg-amber-500/10", icon: Sparkles },
  active: { label: "진행중", color: "text-green-500 bg-green-500/10", icon: Clock },
  completed: { label: "완료", color: "text-blue-500 bg-blue-500/10", icon: CheckCircle2 },
};

const nextStatusMap: Record<string, { next: Campaign["status"]; label: string }> = {
  recruiting: { next: "active", label: "진행중으로 변경" },
  active: { next: "completed", label: "완료로 변경" },
};

function formatBudget(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

const mockApplicants = [
  { id: "a1", name: "김작가", genre: "웹툰", followers: "15.2K", rating: 4.8, status: "pending" },
  { id: "a2", name: "이드로우", genre: "일러스트", followers: "8.7K", rating: 4.5, status: "pending" },
  { id: "a3", name: "박크리에이터", genre: "웹툰", followers: "22.1K", rating: 4.9, status: "selected" },
  { id: "a4", name: "최아트", genre: "캐릭터 디자인", followers: "11.3K", rating: 4.6, status: "pending" },
  { id: "a5", name: "정일러스트", genre: "일러스트", followers: "5.8K", rating: 4.3, status: "rejected" },
];

const applicantStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "검토중", color: "text-yellow-500 bg-yellow-500/10" },
  selected: { label: "선정됨", color: "text-green-500 bg-green-500/10" },
  rejected: { label: "미선정", color: "text-red-400 bg-red-500/10" },
};

const mockAnalytics = {
  impressions: "1,245",
  clickRate: "12.3%",
  applicationRate: "3.5%",
  avgResponseTime: "2.1일",
};

export function CampaignDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("applicants");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCampaign = () => {
    seedIfEmpty();
    if (id) {
      const found = getItem<Campaign>(STORE_KEYS.CAMPAIGNS, id);
      setCampaign(found);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const handleStatusChange = () => {
    if (!campaign || !id) return;
    const transition = nextStatusMap[campaign.status];
    if (!transition) return;

    if (confirm(`캠페인 상태를 "${transition.label.replace("으로 변경", "")}"(으)로 변경하시겠습니까?`)) {
      updateItem<Campaign>(STORE_KEYS.CAMPAIGNS, id, { status: transition.next });
      loadCampaign();
    }
  };

  const handleDelete = () => {
    if (!id) return;
    if (confirm("이 캠페인을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      removeItem<Campaign>(STORE_KEYS.CAMPAIGNS, id);
      alert("캠페인이 삭제되었습니다.");
      navigate("/market/campaigns");
    }
  };

  if (loading) {
    return (
      <StudioLayout>
        <div className="max-w-6xl mx-auto text-center py-20">
          <p className="text-muted-foreground">로딩중...</p>
        </div>
      </StudioLayout>
    );
  }

  if (!campaign) {
    return (
      <StudioLayout>
        <div className="max-w-6xl mx-auto text-center py-20">
          <p className="text-lg font-semibold text-foreground mb-2">캠페인을 찾을 수 없습니다</p>
          <p className="text-sm text-muted-foreground mb-4">삭제되었거나 존재하지 않는 캠페인입니다.</p>
          <Button
            onClick={() => navigate("/market/campaigns")}
            className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold"
          >
            캠페인 목록으로
          </Button>
        </div>
      </StudioLayout>
    );
  }

  const status = statusConfig[campaign.status];
  const transition = nextStatusMap[campaign.status];

  const tabs = [
    { id: "applicants", label: "지원자 목록", count: mockApplicants.filter((a) => a.status === "pending").length },
    { id: "selected", label: "선정 크리에이터", count: mockApplicants.filter((a) => a.status === "selected").length },
    { id: "analytics", label: "분석" },
  ];

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/market/campaigns")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          캠페인 목록으로
        </button>

        {/* Campaign Header */}
        <div className="rounded-2xl border bg-card border-border p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-foreground">{campaign.title}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{campaign.brand}</p>
            </div>
            <div className="flex items-center gap-2">
              {transition && (
                <Button
                  onClick={handleStatusChange}
                  size="sm"
                  className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-1.5"
                >
                  <ArrowRightCircle className="w-4 h-4" />
                  {transition.label}
                </Button>
              )}
              <Button
                onClick={handleDelete}
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </Button>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-4">{campaign.description}</p>

          {/* Tags */}
          {(campaign.genre.length > 0 || campaign.tone.length > 0 || campaign.targetAge.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {campaign.genre.map((g) => (
                <span key={g} className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400">
                  {g}
                </span>
              ))}
              {campaign.tone.map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400">
                  {t}
                </span>
              ))}
              {campaign.targetAge.map((a) => (
                <span key={a} className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400">
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-muted p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">예산</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatBudget(campaign.budget)}</p>
            </div>
            <div className="rounded-xl bg-muted p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">마감일</span>
              </div>
              <p className="text-lg font-bold text-foreground">{campaign.deadline}</p>
            </div>
            <div className="rounded-xl bg-muted p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">지원자</span>
              </div>
              <p className="text-lg font-bold text-foreground">{campaign.applicants}명</p>
            </div>
            <div className="rounded-xl bg-muted p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">등록일</span>
              </div>
              <p className="text-lg font-bold text-foreground">{campaign.createdAt}</p>
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
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs bg-[#00e5cc]/20 text-[#00e5cc] px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {(activeTab === "applicants" || activeTab === "selected") && (
          <div className="space-y-3">
            {mockApplicants
              .filter((a) =>
                activeTab === "applicants" ? a.status === "pending" : a.status === "selected"
              )
              .map((applicant) => {
                const appStatus = applicantStatusMap[applicant.status];
                return (
                  <div
                    key={applicant.id}
                    className="rounded-2xl border bg-card border-border p-5 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {applicant.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{applicant.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                              {applicant.genre}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              팔로워 {applicant.followers}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-foreground">{applicant.rating}</span>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${appStatus.color}`}>
                          {appStatus.label}
                        </span>
                        {applicant.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            선정
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {((activeTab === "applicants" &&
              mockApplicants.filter((a) => a.status === "pending").length === 0) ||
              (activeTab === "selected" &&
                mockApplicants.filter((a) => a.status === "selected").length === 0)) && (
              <div className="rounded-2xl border bg-card border-border p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-1">
                  {activeTab === "applicants" ? "지원자가 없습니다" : "선정된 크리에이터가 없습니다"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "applicants"
                    ? "크리에이터의 지원을 기다려 주세요"
                    : "지원자 목록에서 크리에이터를 선정해 주세요"}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border bg-card border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">노출수</span>
              </div>
              <p className="text-2xl font-black text-foreground">{mockAnalytics.impressions}</p>
            </div>
            <div className="rounded-2xl border bg-card border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">클릭률</span>
              </div>
              <p className="text-2xl font-black text-foreground">{mockAnalytics.clickRate}</p>
            </div>
            <div className="rounded-2xl border bg-card border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">지원율</span>
              </div>
              <p className="text-2xl font-black text-foreground">{mockAnalytics.applicationRate}</p>
            </div>
            <div className="rounded-2xl border bg-card border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-[#00e5cc]" />
                <span className="text-xs text-muted-foreground">평균 응답 시간</span>
              </div>
              <p className="text-2xl font-black text-foreground">{mockAnalytics.avgResponseTime}</p>
            </div>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
