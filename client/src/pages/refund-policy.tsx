import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        홈으로 돌아가기
      </Link>

      <h1 className="text-3xl font-bold mb-2">환불 정책</h1>
      <p className="text-sm text-muted-foreground mb-10">시행일: 2025년 1월 1일 | 최종 수정일: 2025년 3월 5일</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">

        <p>
          OLLI(이하 "회사")는 이용자의 권익을 보호하고 투명한 거래를 위해 다음과 같은 환불 정책을 운영합니다.
          본 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 준수합니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제1조 (적용 범위)</h2>
          <p>본 환불 정책은 회사가 제공하는 다음 유료 상품에 적용됩니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Pro 구독:</strong> 월 29,900원 (무제한 AI 이미지 생성)</li>
            <li><strong>크레딧 구매:</strong> 50크레딧 / 4,900원</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제2조 (Pro 구독 환불)</h2>

          <h3 className="text-base font-medium mt-4 mb-2">1. 청약철회(구독 후 7일 이내)</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>구독 결제일로부터 <strong>7일 이내</strong>에 서비스를 이용하지 않은 경우, 전액 환불이 가능합니다.</li>
            <li>구독 후 7일 이내라도 서비스를 이용한 경우(AI 이미지 생성 등), 이용 일수에 해당하는 금액을 차감한 후 잔여 금액을 환불합니다.</li>
          </ul>

          <h3 className="text-base font-medium mt-4 mb-2">2. 구독 기간 중 해지</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>구독 기간 중 해지를 요청하면, 해당 결제 주기 만료일까지 Pro 혜택을 유지한 후 무료 플랜으로 전환됩니다.</li>
            <li>구독 기간 중 해지 시 <strong>잔여 기간에 대한 일할 환불은 원칙적으로 제공하지 않습니다.</strong></li>
            <li>단, 서비스 장애 등 회사의 귀책 사유로 정상적인 서비스 이용이 불가능했던 기간이 있는 경우, 해당 기간에 대해 환불 또는 이용 기간 연장을 제공합니다.</li>
          </ul>

          <h3 className="text-base font-medium mt-4 mb-2">3. 자동 갱신 관련</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Pro 구독은 매월 자동 갱신됩니다.</li>
            <li>자동 갱신 결제 후 7일 이내 서비스 미이용 시 전액 환불이 가능합니다.</li>
            <li>자동 갱신을 원하지 않는 경우 갱신일 전에 해지하시기 바랍니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제3조 (크레딧 환불)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>구매한 크레딧을 <strong>전혀 사용하지 않은 경우</strong>, 구매일로부터 7일 이내에 전액 환불이 가능합니다.</li>
            <li>크레딧을 <strong>일부라도 사용한 경우</strong>, 사용한 크레딧에 해당하는 금액을 차감 후 잔여 금액을 환불합니다.</li>
            <li>무료로 지급된 크레딧(가입 보너스, 월간 무료 크레딧, 일일 보너스 등)은 환불 대상이 아닙니다.</li>
            <li>크레딧은 현금으로 전환되지 않으며, 다른 이용자에게 양도할 수 없습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제4조 (환불이 불가능한 경우)</h2>
          <p>다음의 경우에는 환불이 제한될 수 있습니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>이용자의 귀책 사유로 서비스를 이용할 수 없는 경우 (계정 정지 등)</li>
            <li>이용약관 위반으로 인한 이용 제한 또는 계약 해지의 경우</li>
            <li>구매 후 7일이 경과하고 서비스를 이용한 경우</li>
            <li>프로모션, 이벤트 등을 통해 할인된 가격으로 결제한 경우 (할인 전 정가 기준으로 이용 금액 차감 후 환불)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제5조 (환불 절차)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>환불 신청:</strong> 이메일(<strong>support@olli-ai.com</strong>)로 환불을 요청합니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>가입 이메일 주소</li>
                <li>결제일 및 결제 금액</li>
                <li>환불 사유</li>
              </ul>
            </li>
            <li>
              <strong>환불 심사:</strong> 환불 요청 접수 후 영업일 기준 3일 이내에 환불 가능 여부를 안내합니다.
            </li>
            <li>
              <strong>환불 처리:</strong> 환불 승인 후 영업일 기준 5~7일 이내에 결제 수단으로 환불 금액이 반환됩니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>카카오페이: 카카오페이 잔액으로 환불</li>
                <li>토스페이먼츠: 결제 카드로 환불</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제6조 (환불 금액 산정)</h2>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">구분</th>
                  <th className="text-left py-2 pr-4 font-medium">조건</th>
                  <th className="text-left py-2 font-medium">환불 금액</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">Pro 구독</td>
                  <td className="py-2 pr-4">결제 후 7일 이내, 미이용</td>
                  <td className="py-2">전액 환불</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Pro 구독</td>
                  <td className="py-2 pr-4">결제 후 7일 이내, 이용</td>
                  <td className="py-2">결제 금액 - (일 이용료 x 이용 일수)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Pro 구독</td>
                  <td className="py-2 pr-4">결제 후 7일 초과</td>
                  <td className="py-2">환불 불가 (기간 만료 후 해지)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">크레딧</td>
                  <td className="py-2 pr-4">구매 후 7일 이내, 미사용</td>
                  <td className="py-2">전액 환불</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">크레딧</td>
                  <td className="py-2 pr-4">구매 후 7일 이내, 일부 사용</td>
                  <td className="py-2">결제 금액 - (크레딧 단가 x 사용 크레딧 수)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">크레딧</td>
                  <td className="py-2 pr-4">구매 후 7일 초과</td>
                  <td className="py-2">환불 불가</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제7조 (서비스 종료 시 환불)</h2>
          <p>
            회사의 사정으로 서비스가 종료되는 경우, 종료일 기준으로 잔여 구독 기간에 대한 일할 환불 및
            미사용 유료 크레딧의 전액 환불을 제공합니다. 서비스 종료 최소 30일 전에 이메일 및 서비스 내
            공지를 통해 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제8조 (소비자 분쟁 해결)</h2>
          <p>환불과 관련한 분쟁이 발생한 경우, 다음 기관에 분쟁 조정을 신청할 수 있습니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>한국소비자원 (www.kca.go.kr / 국번없이 1372)</li>
            <li>전자거래분쟁조정위원회 (www.ecmc.or.kr / 1661-5714)</li>
          </ul>
        </section>

        <section className="border-t pt-6 mt-10">
          <p className="text-muted-foreground">
            환불 관련 문의사항이 있으신 경우 <strong>support@olli-ai.com</strong>으로 연락해 주시기 바랍니다.
          </p>
        </section>
      </div>
    </div>
  );
}
