import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Search,
  Send,
  Inbox,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  CalendarDays,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
  removeItem,
  seedIfEmpty,
  STORE_KEYS,
  type Proposal,
} from "@/lib/local-store";

type ProposalTab = "sent" | "received" | "accepted";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "대기중", color: "text-yellow-500 bg-yellow-500/10", icon: Clock },
  accepted: { label: "수락", color: "text-green-500 bg-green-500/10", icon: CheckCircle2 },
  rejected: { label: "거절", color: "text-red-400 bg-red-500/10", icon: XCircle },
};

const tabConfig: { id: ProposalTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "sent", label: "보낸 제안", icon: Send },
  { id: "received", label: "받은 제안", icon: Inbox },
  { id: "accepted", label: "수락됨", icon: CheckCircle2 },
];

function formatBudget(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function ProposalsPage() {
  const [activeTab, setActiveTab] = useState<ProposalTab>("sent");
  const [searchQuery, setSearchQuery] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const loadProposals = () => {
    seedIfEmpty();
    setProposals(listItems<Proposal>(STORE_KEYS.PROPOSALS));
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("이 제안을 삭제하시겠습니까?")) {
      removeItem<Proposal>(STORE_KEYS.PROPOSALS, id);
      loadProposals();
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.brandName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "sent") return matchesSearch && proposal.direction === "sent";
    if (activeTab === "received") return matchesSearch && proposal.direction === "received";
    if (activeTab === "accepted") return matchesSearch && proposal.status === "accepted";

    return matchesSearch;
  });

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">제안 관리</h1>
          <p className="text-muted-foreground mt-1">보내고 받은 제안을 관리하세요</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4 border bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Send className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {proposals.filter((p) => p.direction === "sent").length}
                </p>
                <p className="text-xs text-muted-foreground">보낸 제안</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 border bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Inbox className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {proposals.filter((p) => p.direction === "received").length}
                </p>
                <p className="text-xs text-muted-foreground">받은 제안</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 border bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {proposals.filter((p) => p.status === "accepted").length}
                </p>
                <p className="text-xs text-muted-foreground">수락됨</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl bg-muted p-1 border border-border">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="제안 제목, 크리에이터, 브랜드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground text-sm"
          />
        </div>

        {/* Proposal List */}
        <div className="space-y-3">
          {filteredProposals.map((proposal) => {
            const status = statusConfig[proposal.status];
            return (
              <Link
                key={proposal.id}
                to={`/market/proposals/${proposal.id}`}
                className="block rounded-2xl border bg-card border-border p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-foreground group-hover:text-[#00e5cc] transition-colors">
                      {proposal.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {proposal.direction === "sent"
                        ? `크리에이터: ${proposal.creatorName}`
                        : `브랜드: ${proposal.brandName}`}
                      {proposal.campaignName && ` | 캠페인: ${proposal.campaignName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, proposal.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatBudget(proposal.budget)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    <span>마감 {proposal.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>제안일 {proposal.createdAt}</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {filteredProposals.length === 0 && (
            <div className="rounded-2xl border bg-card border-border p-12 text-center">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-1">제안이 없습니다</p>
              <p className="text-sm text-muted-foreground">
                {activeTab === "sent"
                  ? "크리에이터에게 제안을 보내 보세요"
                  : activeTab === "received"
                    ? "아직 받은 제안이 없습니다"
                    : "수락된 제안이 없습니다"}
              </p>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
