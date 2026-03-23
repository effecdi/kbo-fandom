import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  DollarSign,
  CalendarDays,
  FileText,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ListChecks,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getItem,
  updateItem,
  removeItem,
  seedIfEmpty,
  STORE_KEYS,
  type Proposal,
} from "@/lib/local-store";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "대기중", color: "text-yellow-500 bg-yellow-500/10", icon: Clock },
  accepted: { label: "수락", color: "text-green-500 bg-green-500/10", icon: CheckCircle2 },
  rejected: { label: "거절", color: "text-red-400 bg-red-500/10", icon: XCircle },
};

function formatBudget(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function ProposalDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProposal = () => {
    seedIfEmpty();
    if (id) {
      const found = getItem<Proposal>(STORE_KEYS.PROPOSALS, id);
      setProposal(found);
      if (found) {
        setResponseText(found.response || "");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProposal();
  }, [id]);

  const handleAccept = () => {
    if (!id) return;
    updateItem<Proposal>(STORE_KEYS.PROPOSALS, id, {
      status: "accepted",
      response: responseText,
    });
    alert("제안을 수락했습니다!");
    loadProposal();
  };

  const handleReject = () => {
    if (!id) return;
    updateItem<Proposal>(STORE_KEYS.PROPOSALS, id, {
      status: "rejected",
      response: responseText,
    });
    alert("제안을 거절했습니다.");
    loadProposal();
  };

  const handleSaveResponse = () => {
    if (!id) return;
    updateItem<Proposal>(STORE_KEYS.PROPOSALS, id, {
      response: responseText,
    });
    alert("응답이 저장되었습니다.");
  };

  const handleDelete = () => {
    if (!id) return;
    if (confirm("이 제안을 삭제하시겠습니까?")) {
      removeItem<Proposal>(STORE_KEYS.PROPOSALS, id);
      alert("제안이 삭제되었습니다.");
      navigate("/market/proposals");
    }
  };

  if (loading) {
    return (
      <StudioLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground">로딩중...</p>
        </div>
      </StudioLayout>
    );
  }

  if (!proposal) {
    return (
      <StudioLayout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-lg font-semibold text-foreground mb-2">제안을 찾을 수 없습니다</p>
          <p className="text-sm text-muted-foreground mb-4">삭제되었거나 존재하지 않는 제안입니다.</p>
          <Button
            onClick={() => navigate("/market/proposals")}
            className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold"
          >
            제안 목록으로
          </Button>
        </div>
      </StudioLayout>
    );
  }

  const status = statusConfig[proposal.status];

  return (
    <StudioLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/market/proposals")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          제안 목록으로
        </button>

        {/* Proposal Header */}
        <div className="rounded-2xl border bg-card border-border p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-foreground">{proposal.title}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>제안일: {proposal.createdAt}</span>
                {proposal.campaignName && <span>캠페인: {proposal.campaignName}</span>}
                <span>방향: {proposal.direction === "sent" ? "보낸 제안" : "받은 제안"}</span>
              </div>
            </div>
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

          {proposal.requirements && (
            <p className="text-sm text-foreground leading-relaxed">{proposal.requirements}</p>
          )}
        </div>

        {/* Brand & Creator Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Brand Info */}
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">브랜드 정보</h3>
                <p className="text-xs text-muted-foreground">제안 브랜드</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">브랜드명</span>
                <span className="text-sm font-medium text-foreground">{proposal.brandName}</span>
              </div>
              {proposal.campaignName && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">캠페인</span>
                  <span className="text-sm font-medium text-foreground">{proposal.campaignName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-purple-500/10">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">크리에이터 정보</h3>
                <p className="text-xs text-muted-foreground">제안 대상 크리에이터</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">크리에이터</span>
                <span className="text-sm font-medium text-foreground">{proposal.creatorName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#00e5cc]" />
              <span className="text-sm text-muted-foreground">예산</span>
            </div>
            <p className="text-2xl font-black text-foreground">{formatBudget(proposal.budget)}</p>
            <p className="text-xs text-muted-foreground mt-1">VAT 별도</p>
          </div>
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="w-5 h-5 text-[#00e5cc]" />
              <span className="text-sm text-muted-foreground">마감일</span>
            </div>
            <p className="text-2xl font-black text-foreground">{proposal.deadline}</p>
            <p className="text-xs text-muted-foreground mt-1">최종 결과물 제출 기한</p>
          </div>
        </div>

        {/* Deliverables */}
        {proposal.deliverables && proposal.deliverables.length > 0 && (
          <div className="rounded-2xl border bg-card border-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <ListChecks className="w-5 h-5 text-[#00e5cc]" />
              <h3 className="text-base font-bold text-foreground">산출물</h3>
            </div>
            <ul className="space-y-2">
              {proposal.deliverables.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00e5cc]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#00e5cc]">{index + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {proposal.requirements && (
          <div className="rounded-2xl border bg-card border-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-[#00e5cc]" />
              <h3 className="text-base font-bold text-foreground">요구사항</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{proposal.requirements}</p>
          </div>
        )}

        {/* Response Section */}
        {proposal.status === "pending" && (
          <div className="rounded-2xl border bg-card border-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-[#00e5cc]" />
              <h3 className="text-base font-bold text-foreground">응답</h3>
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="제안에 대한 의견을 작성해 주세요..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground resize-none mb-4"
            />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleSaveResponse}
                className="gap-2"
              >
                임시 저장
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <XCircle className="w-4 h-4" />
                  거절
                </Button>
                <Button
                  onClick={handleAccept}
                  className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  수락
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Already Responded */}
        {proposal.status !== "pending" && (
          <div className="rounded-2xl border bg-card border-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <status.icon className={`w-5 h-5 ${status.color.split(" ")[0]}`} />
              <p className="text-sm font-medium text-foreground">
                이 제안은 <span className={status.color.split(" ")[0]}>{status.label}</span> 상태입니다.
              </p>
            </div>
            {proposal.response && (
              <div className="mt-3 p-4 rounded-lg bg-muted border border-border">
                <p className="text-xs text-muted-foreground mb-1">응답 내용</p>
                <p className="text-sm text-foreground">{proposal.response}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
