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
      <p className="text-sm text-muted-foreground mb-10">시행일: 2025년 1월 1일 | 최종 수정일: 2026년 3월 14일</p>

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
            <li><strong>"서비스"</strong>란 회사가 제공하는 AI 기반 캐릭터·이미지 생성, 인스타툰·웹툰 편집, 스토리 에디터, 말풍선·이펙트 도구, Instagram 연동 게시 기능 등 일체의 온라인 서비스를 말합니다.</li>
            <li><strong>"이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li><strong>"회원"</strong>이란 회사에 회원 가입을 한 자로서, 계속적으로 서비스를 이용할 수 있는 자를 말합니다.</li>
            <li><strong>"크레딧"</strong>이란 서비스 내 AI 이미지 생성 등 유료 기능을 이용하기 위해 필요한 서비스 내 재화를 말합니다.</li>
            <li><strong>"Pro 구독"</strong>이란 월정액을 지불하고 무제한 생성 등의 혜택을 이용하는 유료 구독 상품을 말합니다.</li>
            <li><strong>"제3자 플랫폼"</strong>이란 Instagram, Facebook 등 회사의 서비스와 연동되는 Meta Platforms, Inc. 및 기타 외부 서비스를 말합니다.</li>
            <li><strong>"Instagram 연동"</strong>이란 이용자가 자신의 Instagram 비즈니스/크리에이터 계정을 본 서비스에 연결하여 콘텐츠를 게시하거나 계정 정보를 조회하는 기능을 말합니다.</li>
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
            <li>만 13세 미만의 아동은 서비스에 가입할 수 없습니다. 회사가 만 13세 미만 아동의 가입 사실을 인지한 경우 해당 계정을 즉시 삭제합니다.</li>
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
                <li>Instagram 연동을 통한 콘텐츠 게시 서비스 (피드, 캐러셀, 스토리)</li>
                <li>갤러리 관리 및 이미지 저장 서비스</li>
                <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
              </ul>
            </li>
            <li>회사는 서비스의 내용을 기술적, 운영적 필요에 따라 변경할 수 있으며, 변경 전 공지합니다.</li>
            <li>회사는 무료로 제공되는 서비스의 일부 또는 전부를 변경·중단할 수 있으며, 이에 대해 별도의 보상을 하지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제6조 (Instagram 연동 서비스)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>이용자는 서비스를 통해 자신의 Instagram 비즈니스 또는 크리에이터 계정을 연동하여, 서비스 내에서 생성한 콘텐츠를 Instagram에 직접 게시할 수 있습니다.</li>
            <li>Instagram 연동 시 이용자는 다음 사항에 동의합니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>회사가 이용자의 Instagram 계정 기본 정보(사용자명, 프로필 사진 등)에 접근하는 것</li>
                <li>회사가 이용자를 대신하여 Instagram에 콘텐츠(이미지, 캡션)를 게시하는 것</li>
                <li>회사가 게시에 필요한 범위 내에서 Instagram Graph API를 통해 데이터를 처리하는 것</li>
              </ul>
            </li>
            <li>Instagram 연동 서비스는 Meta Platforms, Inc.의 Instagram Graph API를 통해 제공되며, Meta의 플랫폼 약관 및 개발자 정책의 적용을 받습니다.</li>
            <li>이용자는 Instagram 연동을 언제든지 해제할 수 있으며, 해제 시 회사는 해당 이용자의 Instagram 관련 데이터(액세스 토큰 등)를 즉시 삭제합니다.</li>
            <li>회사는 Meta의 정책 변경, API 중단, 기술적 제한 등으로 Instagram 연동 서비스가 일시적 또는 영구적으로 제한될 수 있으며, 이에 대해 별도의 보상을 하지 않습니다.</li>
            <li>Instagram에 게시된 콘텐츠는 Instagram의 이용약관 및 커뮤니티 가이드라인의 적용을 받으며, 이를 위반하여 발생하는 책임은 이용자에게 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제7조 (요금 및 결제)</h2>
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
          <h2 className="text-xl font-semibold mt-8 mb-3">제8조 (Pro 구독의 해지)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Pro 구독 이용자는 언제든지 서비스 내 요금제 페이지에서 구독을 해지할 수 있습니다.</li>
            <li>구독 해지 시 현재 결제 주기 만료일까지 Pro 혜택이 유지된 후 무료 플랜으로 전환되며, 10크레딧이 지급됩니다.</li>
            <li>해지를 요청하면 즉시 해지되는 것이 아니라 결제 주기 만료일까지 Pro 혜택이 유지됩니다. 환불에 관한 사항은 별도의 환불 정책을 따릅니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제9조 (AI 생성 콘텐츠의 저작권 및 라이선스)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>이용자가 서비스를 통해 생성한 AI 이미지·콘텐츠의 저작권은 관련 법령에 따릅니다.</li>
            <li>이용자는 생성된 콘텐츠를 상업적·비상업적 목적으로 자유롭게 사용할 수 있습니다. 단, 다음의 경우는 제외합니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>타인의 초상권, 상표권, 저작권 등을 침해하는 콘텐츠</li>
                <li>불법적이거나 반사회적인 목적의 콘텐츠</li>
                <li>AI로 생성된 콘텐츠를 AI 모델 학습 데이터로 재판매하는 행위</li>
              </ul>
            </li>
            <li>이용자는 서비스를 통해 Instagram에 게시하는 콘텐츠에 대해, 해당 콘텐츠를 게시할 적법한 권리가 있음을 보증합니다.</li>
            <li>이용자가 Instagram에 콘텐츠를 게시하는 경우, 해당 콘텐츠에 대해 Instagram(Meta Platforms, Inc.)의 이용약관에 따른 비독점적, 무상, 양도 가능한 라이선스가 Instagram에 부여됩니다. 이는 회사가 아닌 Instagram의 약관에 의한 것입니다.</li>
            <li>회사는 이용자가 생성한 콘텐츠를 서비스 홍보 목적으로 사용할 수 있으며, 이 경우 이용자의 별도 동의를 받습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제10조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>허위 정보를 기재하거나, 타인의 정보를 도용하는 행위</li>
            <li>서비스를 이용하여 법령 또는 공서양속에 반하는 콘텐츠를 생성·유포하는 행위</li>
            <li>서비스의 운영을 고의로 방해하거나, 비정상적인 방법으로 서비스를 이용하는 행위</li>
            <li>자동화 도구(봇, 스크래퍼 등)를 이용하여 대량으로 서비스를 이용하는 행위</li>
            <li>회사 또는 제3자의 지식재산권을 침해하는 행위</li>
            <li>다른 이용자의 개인정보를 무단으로 수집·저장·유포하는 행위</li>
            <li>성적으로 노골적이거나, 폭력적이거나, 혐오를 조장하는 콘텐츠를 생성하는 행위</li>
            <li>Instagram 연동 기능을 이용하여 스팸, 대량 게시, 허위 참여 유도 등 Instagram 커뮤니티 가이드라인을 위반하는 행위</li>
            <li>타인의 Instagram 계정 정보를 무단으로 사용하거나, 본인 소유가 아닌 계정을 연동하는 행위</li>
            <li>서비스를 통해 수집된 제3자 플랫폼 데이터를 차별, 감시, 불법적 프로파일링 등의 목적으로 사용하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제11조 (콘텐츠 관리 및 모더레이션)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 이용자가 생성하거나 게시한 콘텐츠가 법령, 이 약관, 또는 제3자 플랫폼의 정책을 위반하는 경우 사전 통지 없이 해당 콘텐츠를 삭제하거나 게시를 제한할 수 있습니다.</li>
            <li>회사는 AI 생성 과정에서 부적절한 콘텐츠(폭력, 혐오, 성적 콘텐츠 등)의 생성을 방지하기 위한 안전장치를 운영합니다.</li>
            <li>이용자가 Instagram에 게시한 콘텐츠가 Instagram 커뮤니티 가이드라인을 위반하여 삭제되거나 계정이 제한되는 경우, 이에 대한 책임은 이용자에게 있습니다.</li>
            <li>회사는 반복적으로 정책을 위반하는 이용자의 서비스 이용을 영구적으로 제한할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제12조 (회사의 의무)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 관련 법령과 이 약관이 금지하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.</li>
            <li>회사는 이용자의 개인정보를 안전하게 보호하며, 개인정보처리방침을 공시하고 준수합니다.</li>
            <li>회사는 서비스 이용과 관련한 이용자의 불만·의견을 접수하고 적절한 조치를 취합니다.</li>
            <li>회사는 Meta Platforms, Inc.의 플랫폼 약관 및 개발자 정책을 준수하며, Instagram API를 통해 수집한 데이터를 정해진 목적 외로 사용하지 않습니다.</li>
            <li>회사는 이용자의 Instagram 연동 데이터에 대해 업계 표준 수준의 보안 조치를 유지하며, 보안 사고 발생 시 즉시 이용자에게 통보하고 Meta에 보고합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제13조 (제3자 플랫폼 데이터 처리)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 Instagram Graph API를 통해 이용자가 명시적으로 승인한 범위의 데이터만 수집·처리합니다.</li>
            <li>회사는 제3자 플랫폼에서 수집한 데이터를 다음과 같은 용도로만 사용합니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>이용자의 Instagram 계정 연동 상태 확인</li>
                <li>이용자가 요청한 콘텐츠의 Instagram 게시</li>
                <li>게시 이력 관리</li>
              </ul>
            </li>
            <li>회사는 제3자 플랫폼 데이터를 다음과 같은 용도로 사용하지 않습니다.
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>이용자의 동의 없이 제3자에게 판매, 라이선스 또는 양도</li>
                <li>인종, 종교, 성별 등 보호되는 특성에 기반한 차별적 사용</li>
                <li>감시, 추적, 불법적 프로파일링</li>
                <li>신용, 보험, 고용 등의 적격성 판단</li>
              </ul>
            </li>
            <li>이용자가 Instagram 연동을 해제하거나 회원 탈퇴를 요청하는 경우, 회사는 해당 이용자의 Instagram 관련 데이터를 합리적인 기간 내에 삭제합니다. 단, 법령에 의해 보관이 필요한 경우는 예외로 합니다.</li>
            <li>Meta Platforms, Inc.가 이용자 보호를 위해 데이터 삭제를 요청하는 경우, 회사는 이에 즉시 응합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제14조 (서비스 이용 제한 및 중지)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우 서비스 이용을 제한하거나 이용 계약을 해지할 수 있습니다.</li>
            <li>회사는 시스템 점검, 장비 교체, 서비스 개선 등의 사유로 서비스를 일시적으로 중단할 수 있으며, 사전에 공지합니다.</li>
            <li>천재지변, 전쟁, 해킹 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 서비스를 제한하거나 중지할 수 있습니다.</li>
            <li>Meta Platforms, Inc.의 정책 변경, API 접근 제한, 또는 기타 제3자 플랫폼의 사유로 Instagram 연동 서비스가 제한되는 경우, 회사는 이에 대한 책임을 지지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제15조 (면책 조항)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회사는 AI가 생성한 이미지·콘텐츠의 정확성, 완전성, 적합성을 보증하지 않습니다.</li>
            <li>이용자가 서비스를 통해 생성한 콘텐츠를 사용함으로 인해 발생하는 법적 책임은 이용자에게 있습니다.</li>
            <li>회사는 무료로 제공되는 서비스의 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</li>
            <li>회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
            <li>회사는 이용자가 Instagram에 게시한 콘텐츠로 인해 발생하는 Instagram 계정 제한, 정지, 삭제 등에 대하여 책임을 지지 않습니다.</li>
            <li>회사는 Instagram API의 오류, 지연, 중단 등으로 인한 게시 실패 또는 데이터 손실에 대하여 책임을 지지 않습니다.</li>
            <li>AI 생성 콘텐츠가 의도치 않게 타인의 초상, 상표, 저작물과 유사하게 생성되는 경우, 이를 Instagram 등 외부 플랫폼에 게시하여 발생하는 법적 분쟁의 책임은 이용자에게 있습니다.</li>
            <li>관련 법령이 허용하는 범위 내에서 회사의 최대 책임 한도는 이용자가 최근 12개월간 회사에 지불한 금액 또는 100,000원 중 큰 금액으로 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제16조 (회원 탈퇴 및 자격 상실)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>회원은 언제든지 서비스 내 설정 또는 이메일을 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.</li>
            <li>탈퇴 시 회원의 모든 데이터(생성된 이미지, 프로젝트, Instagram 연동 데이터 등)는 30일 후 영구 삭제됩니다.</li>
            <li>탈퇴 후에도 관련 법령에 따라 일정 기간 보관이 필요한 정보는 별도 보관됩니다.</li>
            <li>탈퇴 시 Instagram 연동은 자동으로 해제되며, 관련 액세스 토큰 및 계정 정보는 즉시 삭제됩니다. 단, 이미 Instagram에 게시된 콘텐츠는 Instagram 서버에 남으며, 이는 Instagram 내에서 직접 삭제하여야 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제17조 (분쟁 해결)</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>서비스 이용과 관련하여 회사와 이용자 간에 분쟁이 발생한 경우, 양 당사자는 분쟁의 해결을 위해 성실히 협의합니다.</li>
            <li>협의가 이루어지지 않은 경우 관련 법령에 따른 관할 법원에 소를 제기할 수 있습니다.</li>
            <li>이 약관에 명시되지 않은 사항은 관련 법령 및 상관례에 따릅니다.</li>
            <li>본 약관의 해석 및 적용은 대한민국 법률에 따릅니다.</li>
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
