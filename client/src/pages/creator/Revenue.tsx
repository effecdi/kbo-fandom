import { DashboardLayout } from "@/components/DashboardLayout";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Revenue() {
  const summary = {
    totalEarnings: "32,450,000",
    thisMonth: "8,500,000",
    pending: "4,200,000",
    lastMonth: "7,800,000",
    monthlyChange: "+8.97%",
    isPositive: true,
  };

  const recentTransactions = [
    {
      id: 1,
      project: "환경부 캠페인",
      client: "환경부",
      amount: "8,000,000",
      status: "completed",
      date: "2024-03-10",
      paymentDate: "2024-03-15",
    },
    {
      id: 2,
      project: "봄 축제 홍보",
      client: "서울시청",
      amount: "5,500,000",
      status: "pending",
      date: "2024-03-08",
      paymentDate: "2024-03-20",
    },
    {
      id: 3,
      project: "헬스케어 브랜드",
      client: "헬시라이프",
      amount: "4,200,000",
      status: "in_progress",
      date: "2024-03-05",
      paymentDate: "2024-03-25",
    },
    {
      id: 4,
      project: "교육부 안전교육",
      client: "교육부",
      amount: "6,500,000",
      status: "completed",
      date: "2024-02-25",
      paymentDate: "2024-03-05",
    },
    {
      id: 5,
      project: "여행 플랫폼",
      client: "트래블코리아",
      amount: "3,800,000",
      status: "completed",
      date: "2024-02-20",
      paymentDate: "2024-02-28",
    },
  ];

  const monthlyData = [
    { month: "2023-10", earnings: "4,200,000" },
    { month: "2023-11", earnings: "5,100,000" },
    { month: "2023-12", earnings: "6,800,000" },
    { month: "2024-01", earnings: "7,200,000" },
    { month: "2024-02", earnings: "7,800,000" },
    { month: "2024-03", earnings: "8,500,000" },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      completed: { label: "정산완료", color: "bg-green-100 text-green-700", icon: CheckCircle },
      pending: { label: "정산대기", color: "bg-yellow-100 text-yellow-700", icon: Clock },
      in_progress: { label: "작업중", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
    };
    return configs[status] || configs.pending;
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              수익 현황 💰
            </h1>
            <p className="text-muted-foreground">수익과 정산 내역을 확인하세요</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="2024-03">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-03">2024년 3월</SelectItem>
                <SelectItem value="2024-02">2024년 2월</SelectItem>
                <SelectItem value="2024-01">2024년 1월</SelectItem>
                <SelectItem value="2023-12">2023년 12월</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              리포트 다운로드
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {summary.totalEarnings}원
            </div>
            <div className="text-sm text-muted-foreground">총 누적 수익</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  summary.isPositive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {summary.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {summary.monthlyChange}
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {summary.thisMonth}원
            </div>
            <div className="text-sm text-muted-foreground">이번 달 수익</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {summary.pending}원
            </div>
            <div className="text-sm text-muted-foreground">정산 대기</div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground mb-1">
              {summary.lastMonth}원
            </div>
            <div className="text-sm text-muted-foreground">지난 달 수익</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground">월별 수익 추이</h2>
              <Button variant="ghost" size="sm">
                전체 보기
              </Button>
            </div>

            <div className="space-y-4">
              {monthlyData.map((data, idx) => {
                const height = ((parseFloat(data.earnings.replace(/,/g, "")) / 10000000) * 100);
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground font-semibold">
                      {data.month}
                    </div>
                    <div className="flex-1">
                      <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-end pr-3"
                          style={{ width: `${height}%` }}
                        >
                          <span className="text-white text-sm font-bold">
                            {data.earnings}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-foreground">정산 계좌</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">은행</p>
                  <p className="font-semibold text-foreground">국민은행</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">계좌번호</p>
                  <p className="font-semibold text-foreground">
                    123-45-678901
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">예금주</p>
                  <p className="font-semibold text-foreground">김민지</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                계좌 변경
              </Button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-foreground mb-2">💡 정산 안내</h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>프로젝트 완료 후 5영업일 내 정산</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>매월 1일, 15일 일괄 정산</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>세금계산서 자동 발행</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-foreground">최근 거래 내역</h2>
            <Button variant="ghost" size="sm">
              전체 내역
            </Button>
          </div>

          <div className="space-y-4">
            {recentTransactions.map((transaction) => {
              const statusConfig = getStatusConfig(transaction.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-foreground">
                          {transaction.project}
                        </h4>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{transaction.client}</span>
                        <span>·</span>
                        <span>작업일: {transaction.date}</span>
                        <span>·</span>
                        <span>정산일: {transaction.paymentDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-foreground mb-1">
                      {transaction.amount}원
                    </div>
                    <Button variant="ghost" size="sm">
                      상세 보기
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
