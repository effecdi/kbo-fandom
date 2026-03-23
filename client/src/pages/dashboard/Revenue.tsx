import { useState, useEffect, useMemo } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  ArrowUp,
  Wallet,
  CreditCard,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
  addItem,
  removeItem,
  seedIfEmpty,
  generateId,
  STORE_KEYS,
  type RevenueRecord,
} from "@/lib/local-store";

type DateRange = "month" | "3months" | "6months" | "all";
type TxStatusKey = "completed" | "pending" | "processing";

const statusLabel: Record<TxStatusKey, string> = {
  completed: "완료",
  pending: "대기",
  processing: "처리중",
};

const statusConfig: Record<TxStatusKey, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  completed: { bg: "bg-green-500/10", text: "text-green-500", icon: CheckCircle2 },
  pending: { bg: "bg-amber-500/10", text: "text-amber-500", icon: AlertCircle },
  processing: { bg: "bg-blue-500/10", text: "text-blue-500", icon: Loader2 },
};

const dateRangeLabels: Record<DateRange, string> = {
  month: "이번 달",
  "3months": "3개월",
  "6months": "6개월",
  all: "전체",
};

function formatCurrency(amount: number): string {
  return `\u20A9${amount.toLocaleString()}`;
}

function getDateRangeCutoff(range: DateRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  switch (range) {
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "3months":
      return new Date(now.getFullYear(), now.getMonth() - 2, 1);
    case "6months":
      return new Date(now.getFullYear(), now.getMonth() - 5, 1);
    default:
      return null;
  }
}

export function RevenuePage() {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newProject, setNewProject] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newStatus, setNewStatus] = useState<TxStatusKey>("pending");

  function reload() {
    setRecords(listItems<RevenueRecord>(STORE_KEYS.REVENUE));
  }

  useEffect(() => {
    seedIfEmpty();
    reload();
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    const cutoff = getDateRangeCutoff(dateRange);
    let filtered = [...records];
    if (cutoff) {
      filtered = filtered.filter((r) => new Date(r.date) >= cutoff);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, dateRange]);

  // Computed totals
  const totalRevenue = records
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthRevenue = records
    .filter((r) => r.date.startsWith(currentMonth) && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthRevenue = records
    .filter((r) => r.date.startsWith(prevMonth) && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const monthChange = prevMonthRevenue > 0
    ? ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1)
    : thisMonthRevenue > 0 ? "100" : "0";

  const pendingAmount = records
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);

  const processingAmount = records
    .filter((r) => r.status === "processing")
    .reduce((sum, r) => sum + r.amount, 0);

  function handleAdd() {
    if (!newProject.trim() || !newAmount.trim()) return;
    const amount = parseInt(newAmount.replace(/[^0-9]/g, ""), 10);
    if (isNaN(amount) || amount <= 0) return;

    addItem<RevenueRecord>(STORE_KEYS.REVENUE, {
      id: generateId("rev"),
      date: newDate,
      project: newProject.trim(),
      amount,
      status: newStatus,
    });

    setNewProject("");
    setNewAmount("");
    setNewDate(new Date().toISOString().split("T")[0]);
    setNewStatus("pending");
    setShowAddForm(false);
    reload();
  }

  function handleDelete(id: string) {
    removeItem<RevenueRecord>(STORE_KEYS.REVENUE, id);
    reload();
  }

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">수익 관리</h1>
            <p className="text-muted-foreground mt-1">수익 현황과 거래 내역을 확인하세요</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="w-4 h-4" />
              수익 추가
            </Button>
          </div>
        </div>

        {/* Add Revenue Form */}
        {showAddForm && (
          <div className="rounded-2xl border bg-card border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">새 수익 기록 추가</h2>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">프로젝트명</label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="프로젝트 이름 입력"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">금액 (원)</label>
                <input
                  type="text"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="예: 500000"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">날짜</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">상태</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TxStatusKey)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc]/50"
                >
                  <option value="pending">대기</option>
                  <option value="processing">처리중</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-[#00e5cc] text-black hover:bg-[#00e5cc]/90 font-bold gap-2"
            >
              <Plus className="w-4 h-4" />
              추가하기
            </Button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-500">
                <ArrowUp className="w-3 h-3" />
                +{monthChange}%
              </div>
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm font-semibold text-muted-foreground mt-1">총 수익 (완료)</p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(thisMonthRevenue)}</p>
            <p className="text-sm font-semibold text-muted-foreground mt-1">이번 달</p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(pendingAmount + processingAmount)}</p>
            <p className="text-sm font-semibold text-muted-foreground mt-1">대기 + 처리중</p>
          </div>
        </div>

        {/* Payout Info */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">정산 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#00e5cc]/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#00e5cc]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">다음 정산일</p>
                <p className="text-sm font-semibold text-foreground">2026년 3월 31일</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">정산 계좌</p>
                <p className="text-sm font-semibold text-foreground">신한은행 ****-****-1234</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">정산 주기</p>
                <p className="text-sm font-semibold text-foreground">매월 말일</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter + Transaction Table */}
        <div className="rounded-2xl border bg-card border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">거래 내역 ({filteredRecords.length}건)</h2>
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dateRange === range
                      ? "bg-[#00e5cc] text-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dateRangeLabels[range]}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">날짜</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">프로젝트</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">금액</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">상태</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">삭제</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      해당 기간의 거래 내역이 없습니다
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((tx) => {
                    const config = statusConfig[tx.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-muted-foreground">{tx.date}</td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">{tx.project}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-foreground text-right">{formatCurrency(tx.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusLabel[tx.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
