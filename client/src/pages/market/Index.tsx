import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Target,
  Users,
  MessageSquare,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Sparkles,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type Campaign,
  type Proposal,
  type Collaboration,
} from "@/lib/local-store";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
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

export function MarketIndex() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [proposalCount, setProposalCount] = useState(0);
  const [activeCollabCount, setActiveCollabCount] = useState(0);

  useEffect(() => {
    seedIfEmpty();
    const camps = listItems<Campaign>(STORE_KEYS.CAMPAIGNS);
    setCampaigns(camps);

    const proposals = listItems<Proposal>(STORE_KEYS.PROPOSALS);
    setProposalCount(proposals.length);

    const collabs = listItems<Collaboration>(STORE_KEYS.COLLABORATIONS);
    setActiveCollabCount(collabs.filter((c) => c.status === "in_progress").length);
  }, []);

  // Show up to 3 most recent campaigns
  const recentCampaigns = [...campaigns]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">마켓</h1>
            <p className="text-muted-foreground mt-1">캠페인, 크리에이터 매칭, 협업을 관리하세요</p>
          </div>
          <Link to="/market/campaigns/new">
            <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
              <Plus className="w-4 h-4" />
              새 캠페인
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link to="/market/campaigns" className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-amber-500" />
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
            </div>
            <p className="text-2xl font-black text-foreground">{campaigns.length}</p>
            <p className="text-sm text-muted-foreground">캠페인</p>
          </Link>

          <Link to="/market/proposals" className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Send className="w-8 h-8 text-cyan-500" />
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
            </div>
            <p className="text-2xl font-black text-foreground">{proposalCount}</p>
            <p className="text-sm text-muted-foreground">제안</p>
          </Link>

          <Link to="/market/creators" className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-purple-500" />
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
            </div>
            <p className="text-2xl font-black text-foreground">128</p>
            <p className="text-sm text-muted-foreground">크리에이터</p>
          </Link>

          <Link to="/market/collaborations" className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <MessageSquare className="w-8 h-8 text-green-500" />
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
            </div>
            <p className="text-2xl font-black text-foreground">{activeCollabCount}</p>
            <p className="text-sm text-muted-foreground">진행중 협업</p>
          </Link>
        </div>

        {/* Recent Campaigns */}
        <div className="rounded-2xl border bg-card border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">최근 캠페인</h2>
            <Link to="/market/campaigns" className="text-sm text-[#00e5cc] hover:underline">전체 보기</Link>
          </div>
          {recentCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">등록된 캠페인이 없습니다</p>
              <Link to="/market/campaigns/new" className="text-sm text-[#00e5cc] hover:underline mt-1 inline-block">
                새 캠페인 등록하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCampaigns.map((campaign) => {
                const status = statusConfig[campaign.status];
                return (
                  <Link
                    key={campaign.id}
                    to={`/market/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${status.color}`}>
                        <status.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{campaign.title}</p>
                        <p className="text-xs text-muted-foreground">{campaign.brand} · 마감 {campaign.deadline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatBudget(campaign.budget)}</p>
                      <p className={`text-xs ${status.color} rounded-full px-2 py-0.5 inline-block`}>{status.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
