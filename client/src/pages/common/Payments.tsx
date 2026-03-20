import { DashboardLayout } from "@/components/DashboardLayout";
import { CreditCard, Download, Calendar, DollarSign, Check, FileText, Receipt, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Payments() {
  const payments = [
    {
      id: 1,
      date: "2024-03-01",
      plan: "Pro 플랜",
      amount: "₩19,900",
      method: "신용카드 ****1234",
      status: "완료",
    },
    {
      id: 2,
      date: "2024-02-01",
      plan: "Pro 플랜",
      amount: "₩19,900",
      method: "신용카드 ****1234",
      status: "완료",
    },
    {
      id: 3,
      date: "2024-01-01",
      plan: "Pro 플랜",
      amount: "₩19,900",
      method: "신용카드 ****1234",
      status: "완료",
    },
    {
      id: 4,
      date: "2023-12-01",
      plan: "Pro 플랜",
      amount: "₩19,900",
      method: "신용카드 ****1234",
      status: "완료",
    },
  ];

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-foreground">
            결제 및 구독 관리
          </h1>
          <p className="text-muted-foreground">
            현재 플랜과 결제 내역을 확인하세요
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="rounded-3xl border-2 p-8 mb-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 dark:from-[#00e5cc]/10 dark:to-[#00b3a6]/5 dark:border-[#00e5cc]/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3">
                <TrendingUp className="w-4 h-4" />
                Pro
              </div>
              <h2 className="text-2xl font-black mb-1 text-foreground">
                Pro 플랜 구독 중
              </h2>
              <p className="text-sm text-muted-foreground">
                무제한 캐릭터 생성 및 고급 기능 이용 중
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="font-semibold bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white hover:shadow-lg">
                플랜 업그레이드
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                결제 수단 변경
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 border bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  월 결제 금액
                </span>
              </div>
              <p className="text-2xl font-black text-foreground">
                ₩19,900
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                매월 자동 결제
              </p>
            </div>

            <div className="rounded-2xl p-5 border bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  다음 결제일
                </span>
              </div>
              <p className="text-2xl font-black text-foreground">
                2024-04-01
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                7일 후
              </p>
            </div>

            <div className="rounded-2xl p-5 border bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">
                  결제 수단
                </span>
              </div>
              <p className="text-2xl font-black text-foreground">
                ****1234
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Visa 신용카드
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-3xl border p-8 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black mb-1 text-foreground">
                결제 내역
              </h2>
              <p className="text-sm text-muted-foreground">
                최근 4개월 결제 내역
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              <Download className="w-4 h-4 mr-2" />
              전체 내역 다운로드
            </Button>
          </div>

          {/* Payment List */}
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl p-5 border transition-all hover:shadow-md bg-muted border-border hover:border-border"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-card">
                      <Receipt className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">
                          {payment.plan}
                        </h3>
                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20">
                          <Check className="w-3 h-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.date} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-black text-foreground">
                      {payment.amount}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      영수증
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="rounded-2xl p-6 mt-6 border bg-muted border-border">
          <h3 className="font-bold mb-2 text-foreground">
            도움이 필요하신가요?
          </h3>
          <p className="text-sm mb-4 text-muted-foreground">
            결제 관련 문의사항이 있으시면 고객지원팀에 연락해주세요
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
              고객지원 문의
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
              FAQ 보기
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
