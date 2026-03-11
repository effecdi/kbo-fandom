import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        홈으로 돌아가기
      </Link>

      <h1 className="text-3xl font-bold mb-2">이용약관</h1>
      <p className="text-sm text-muted-foreground mb-10">시행일: 2025년 1월 1일 | 최종 수정일: 2025년 3월 5일</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제1조 (목적)</h2>
          <p>
            이 약관은 OLLI(이하 "회사")가 제공하는 AI 인스타툰·웹툰 자동화 서비스(이하 "서비스")의
            이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제2조 (정의)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>"서비스"</strong>란 회사가 제공하는 AI 기반 캐릭터·이미지 생성, 인스타툰·웹툰 편집, 스토리 에디터, 말풍선·이펙트 도구 등 일체의 온라인 서비스를 말합니다.</li>
            <li><strong>"이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li><strong>"회원"</strong>이란 회사에 회원 가입을 한 자로서, 계속적으로 서비스를 이용할 수 있는 자를 말합니다.</li>
            <li><strong>"크레딧"</strong>이란 서비스 내 AI 이미지 생성 등 유료 기능을 이용하기 위해 필요한 서비스 내 재화를 말합니다.</li>
            <li><strong>"Pro 구독"</strong>이란 월정액을 지불하고 무제한 생성 등의 혜택을 이용하는 유료 구독 상품을 말합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
            <li>회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
            <li>약관이 변경되는 경우 회사는 변경 사항을 시행일 7일 전부터 서비스 내 공지사항 또는 이메일로 안내합니다.</li>
            <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제4조 (회원 가입 및 계정)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회원 가입은 이용자가 약관의 내용에 동의한 후, 회원 가입 양식에 따라 정보를 기입하거나 소셜 로그인을 통해 완료됩니다.</li>
            <li>회원은 가입 시 제공한 정보가 정확하고 최신임을 보증하며, 변경 사항 발생 시 즉시 수정하여야 합니다.</li>
            <li>회원은 자신의 계정 정보를 안전하게 관리할 책임이 있으며, 제3자에게 이를 양도하거나 대여할 수 없습니다.</li>
            <li>회원의 계정이 도용되거나 제3자가 사용하고 있음을 인지한 경우, 즉시 회사에 통보하여야 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제5조 (서비스의 제공 및 변경)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 다음과 같은 서비스를 제공합니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>AI 기반 캐릭터 및 이미지 생성 서비스</li>
                <li>인스타툰·웹툰 편집 및 제작 도구</li>
                <li>스토리 에디터, 채팅 메이커, 말풍선·이펙트 도구</li>
                <li>광고 매칭, 미디어 키트 등 비즈니스 도구</li>
                <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
              </ul>
            </li>
            <li>회사는 서비스의 내용을 기술적, 운영적 필요에 따라 변경할 수 있으며, 변경 전 공지합니다.</li>
            <li>회사는 무료로 제공되는 서비스의 일부 또는 전부를 변경·중단할 수 있으며, 이에 대해 별도의 보상을 하지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제6조 (요금 및 결제)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>서비스의 기본 이용은 무료이며, 일부 기능은 크레딧 또는 Pro 구독이 필요합니다.</li>
            <li>유료 서비스의 요금 및 결제 방법은 서비스 내 요금 안내 페이지에 별도로 게시합니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li><strong>Pro 구독:</strong> 월 29,900원 (무제한 생성)</li>
                <li><strong>크레딧 구매:</strong> 50크레딧 / 4,900원</li>
                <li><strong>무료 플랜:</strong> 가입 시 20크레딧 + 매월 10크레딧 + 매일 출석 5크레딧</li>
              </ul>
            </li>
            <li>결제는 카카오페이, 토스페이먼츠 등 회사가 지정한 결제 수단을 통해 이루어집니다.</li>
            <li>이용자는 결제 시 본인 명의의 결제 수단을 사용하여야 하며, 타인의 결제 수단을 무단으로 사용해서는 안 됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제7조 (Pro 구독의 해지)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Pro 구독 이용자는 언제든지 서비스 내 요금제 페이지에서 구독을 해지할 수 있습니다.</li>
            <li>구독 해지 시 현재 결제 주기 만료일까지 Pro 혜택이 유지된 후 무료 플랜으로 전환되며, 10크레딧이 지급됩니다.</li>
            <li>해지를 요청하면 즉시 해지되는 것이 아니라 결제 주기 만료일까지 Pro 혜택이 유지됩니다. 환불에 관한 사항은 별도의 환불 정책을 따릅니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제8조 (AI 생성 콘텐츠의 저작권)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>이용자가 서비스를 통해 생성한 AI 이미지·콘텐츠의 저작권은 관련 법령에 따릅니다.</li>
            <li>이용자는 생성된 콘텐츠를 상업적·비상업적 목적으로 자유롭게 사용할 수 있습니다. 단, 다음의 경우는 제외합니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>타인의 초상권, 상표권, 저작권 등을 침해하는 콘텐츠</li>
                <li>불법적이거나 반사회적인 목적의 콘텐츠</li>
                <li>AI로 생성된 콘텐츠를 AI 모델 학습 데이터로 재판매하는 행위</li>
              </ul>
            </li>
            <li>회사는 이용자가 생성한 콘텐츠를 서비스 홍보 목적으로 사용할 수 있으며, 이 경우 이용자의 별도 동의를 받습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제9조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>허위 정보를 기재하거나, 타인의 정보를 도용하는 행위</li>
            <li>서비스를 이용하여 법령 또는 공서양속에 반하는 콘텐츠를 생성·유포하는 행위</li>
            <li>서비스의 운영을 고의로 방해하거나, 비정상적인 방법으로 서비스를 이용하는 행위</li>
            <li>자동화 도구(봇, 스크래퍼 등)를 이용하여 대량으로 서비스를 이용하는 행위</li>
            <li>회사 또는 제3자의 지식재산권을 침해하는 행위</li>
            <li>다른 이용자의 개인정보를 무단으로 수집·저장·유포하는 행위</li>
            <li>성적으로 노골적이거나, 폭력적이거나, 혐오를 조장하는 콘텐츠를 생성하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제10조 (회사의 의무)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 관련 법령과 이 약관이 금지하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.</li>
            <li>회사는 이용자의 개인정보를 안전하게 보호하며, 개인정보처리방침을 공시하고 준수합니다.</li>
            <li>회사는 서비스 이용과 관련한 이용자의 불만·의견을 접수하고 적절한 조치를 취합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제11조 (서비스 이용 제한 및 중지)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우 서비스 이용을 제한하거나 이용 계약을 해지할 수 있습니다.</li>
            <li>회사는 시스템 점검, 장비 교체, 서비스 개선 등의 사유로 서비스를 일시적으로 중단할 수 있으며, 사전에 공지합니다.</li>
            <li>천재지변, 전쟁, 해킹 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 서비스를 제한하거나 중지할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제12조 (면책 조항)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 AI가 생성한 이미지·콘텐츠의 정확성, 완전성, 적합성을 보증하지 않습니다.</li>
            <li>이용자가 서비스를 통해 생성한 콘텐츠를 사용함으로 인해 발생하는 법적 책임은 이용자에게 있습니다.</li>
            <li>회사는 무료로 제공되는 서비스의 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</li>
            <li>회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제13조 (회원 탈퇴 및 자격 상실)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회원은 언제든지 서비스 내 설정 또는 이메일을 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.</li>
            <li>탈퇴 시 회원의 모든 데이터(생성된 이미지, 프로젝트 등)는 30일 후 영구 삭제됩니다.</li>
            <li>탈퇴 후에도 관련 법령에 따라 일정 기간 보관이 필요한 정보는 별도 보관됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제14조 (분쟁 해결)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>서비스 이용과 관련하여 회사와 이용자 간에 분쟁이 발생한 경우, 양 당사자는 분쟁의 해결을 위해 성실히 협의합니다.</li>
            <li>협의가 이루어지지 않은 경우 관련 법령에 따른 관할 법원에 소를 제기할 수 있습니다.</li>
            <li>이 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.</li>
          </ol>
        </section>

        <section className="border-t pt-6 mt-10">
          <p className="text-muted-foreground">
            본 약관에 대한 문의사항이 있으신 경우 <strong>support@olli-ai.com</strong>으로 연락해 주시기 바랍니다.
          </p>
        </section>
      </div>
    </div>
  );
}
