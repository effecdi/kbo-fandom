import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Receipt } from "lucide-react";
import type { Payment } from "@shared/schema";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProductLabel(productType: string, creditsAdded: number) {
  if (productType === "pro") return "Pro 멤버십";
  return `크레딧 ${creditsAdded}개`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge variant="default">완료</Badge>;
    case "pending":
      return <Badge variant="secondary">대기</Badge>;
    case "cancelled":
      return <Badge variant="destructive">취소</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function PaymentsPage() {
  const { isAuthenticated } = useAuth();

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-sm text-muted-foreground mb-5">결제 내역을 보려면 로그인해주세요.</p>
        <Button asChild size="sm">
          <a href="/login">로그인</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pricing">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">결제 내역</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !payments || payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">결제 내역이 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">
            아직 결제한 내역이 없어요.
          </p>
          <Link href="/pricing">
            <Button variant="outline" size="sm">
              요금제 보기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>상품</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-center">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm">
                    {formatDate(payment.createdAt as unknown as string)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {getProductLabel(payment.productType, payment.creditsAdded)}
                  </TableCell>
                  <TableCell className="text-sm text-right tabular-nums">
                    {payment.amount.toLocaleString("ko-KR")}원
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(payment.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
