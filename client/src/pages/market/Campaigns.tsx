import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Target,
  Plus,
  Search,
  Filter,
  Sparkles,
  Clock,
  CheckCircle2,
  Users,
  CalendarDays,
  DollarSign,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
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

function formatBudget(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const loadCampaigns = () => {
    seedIfEmpty();
    setCampaigns(listItems<Campaign>(STORE_KEYS.CAMPAIGNS));
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("이 캠페인을 삭제하시겠습니까?")) {
      removeItem<Campaign>(STORE_KEYS.CAMPAIGNS, id);
      loadCampaigns();
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;

    let matchesBudget = true;
    if (budgetFilter === "low") matchesBudget = campaign.budget <= 5000000;
    else if (budgetFilter === "mid") matchesBudget = campaign.budget > 5000000 && campaign.budget <= 10000000;
    else if (budgetFilter === "high") matchesBudget = campaign.budget > 10000000;

    return matchesSearch && matchesStatus && matchesBudget;
  });

  const budgetRanges = [
    { label: "전체", value: "all" },
    { label: "500만원 이하", value: "low" },
    { label: "500만원 ~ 1,000만원", value: "mid" },
    { label: "1,000만원 이상", value: "high" },
  ];

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">캠페인</h1>
            <p className="text-muted-foreground mt-1">브랜드 캠페인을 관리하고 새 캠페인을 등록하세요</p>
          </div>
          <Link to="/market/campaigns/new">
            <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
              <Plus className="w-4 h-4" />
              새 캠페인
            </Button>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="캠페인명 또는 브랜드 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground text-sm"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] bg-muted border-border text-foreground text-sm"
              >
                <option value="all">전체 상태</option>
                <option value="recruiting">모집중</option>
                <option value="active">진행중</option>
                <option value="completed">완료</option>
              </select>
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] bg-muted border-border text-foreground text-sm"
              >
                {budgetRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4 border bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {campaigns.filter((c) => c.status === "recruiting").length}
                </p>
                <p className="text-xs text-muted-foreground">모집중</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 border bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {campaigns.filter((c) => c.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground">진행중</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 border bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {campaigns.filter((c) => c.status === "completed").length}
                </p>
                <p className="text-xs text-muted-foreground">완료</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            const status = statusConfig[campaign.status];
            return (
              <Link
                key={campaign.id}
                to={`/market/campaigns/${campaign.id}`}
                className="block rounded-2xl border bg-card border-border p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-[#00e5cc] transition-colors">
                        {campaign.title}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, campaign.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    <span>{campaign.brand}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatBudget(campaign.budget)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    <span>마감 {campaign.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>지원자 {campaign.applicants}명</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredCampaigns.length === 0 && (
            <div className="rounded-2xl border bg-card border-border p-12 text-center">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-1">검색 결과가 없습니다</p>
              <p className="text-sm text-muted-foreground">다른 조건으로 검색해 보세요</p>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
