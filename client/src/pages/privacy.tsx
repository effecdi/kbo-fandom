import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        홈으로 돌아가기
      </Link>

      <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-sm text-muted-foreground mb-10">시행일: 2025년 1월 1일 | 최종 수정일: 2026년 3월 14일</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">
        <p>
          OLLI(이하 "회사")는 「개인정보 보호법」 제30조에 따라 이용자의 개인정보를 보호하고
          이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </p>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제1조 (개인정보의 수집 항목 및 수집 방법)</h2>
          <h3 className="text-base font-medium mt-4 mb-2">1. 수집 항목</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>필수 항목:</strong> 이메일 주소, 비밀번호(소셜 로그인 시 제외), 닉네임(표시 이름)</li>
            <li><strong>소셜 로그인 시:</strong> 소셜 계정 고유 식별자, 이메일 주소, 프로필 이미지 URL</li>
            <li><strong>Instagram 연동 시:</strong> Instagram 사용자 ID, 사용자 이름, 계정 유형, 미디어 게시 권한, 프로필 정보</li>
            <li><strong>결제 시:</strong> 결제 수단 정보(카드사명, 승인번호 등 — 카드번호 전체는 수집하지 않음), 결제 일시, 결제 금액</li>
            <li><strong>서비스 이용 과정에서 자동 수집:</strong> IP 주소, 쿠키, 접속 일시, 서비스 이용 기록, 기기 정보(브라우저 종류, OS), 화면 해상도</li>
          </ul>
          <h3 className="text-base font-medium mt-4 mb-2">2. 수집 방법</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>회원가입, 소셜 로그인(Google, Kakao 등)</li>
            <li>Instagram 계정 연동(Instagram Graph API를 통한 OAuth 인증)</li>
            <li>서비스 이용 중 이용자의 직접 입력</li>
            <li>결제 과정에서 PG사(포트원)를 통한 수집</li>
            <li>자동 수집 장치(쿠키 등)를 통한 수집</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제2조 (개인정보의 수집·이용 목적)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>회원 관리:</strong> 회원제 서비스 이용에 따른 본인 확인, 회원 식별, 불량 회원의 부정 이용 방지</li>
            <li><strong>서비스 제공:</strong> AI 이미지 생성, 인스타툰·웹툰 제작 도구, 콘텐츠 저장 및 관리</li>
            <li><strong>Instagram 게시:</strong> 이용자가 제작한 콘텐츠를 이용자의 Instagram 계정에 게시 (이용자의 명시적 요청 시에만 수행)</li>
            <li><strong>요금 결제:</strong> 유료 서비스(Pro 구독, 크레딧 구매) 결제 처리 및 환불</li>
            <li><strong>서비스 개선:</strong> 신규 기능 개발, 통계 분석, 서비스 품질 향상</li>
            <li><strong>고객 지원:</strong> 문의 사항 및 불만 처리, 공지사항 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제3조 (개인정보의 보유 및 이용 기간)</h2>
          <p>회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 사유에 해당하는 경우 명시한 기간 동안 보존합니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>회원 탈퇴 시:</strong> 탈퇴 후 30일간 보관 후 파기 (재가입 악용 방지)</li>
            <li><strong>Instagram 연동 데이터:</strong> 연동 해제 즉시 삭제</li>
            <li><strong>전자상거래법에 따른 보존:</strong>
              <ul className="list-disc pl-6 space-y-1 mt-1">
                <li>계약 또는 청약철회에 관한 기록: 5년</li>
                <li>대금 결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년</li>
              </ul>
            </li>
            <li><strong>통신비밀보호법:</strong> 로그인 기록: 3개월</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제4조 (개인정보의 제3자 제공)</h2>
          <p>
            회사는 이용자의 개인정보를 제2조에서 명시한 범위 내에서만 처리하며,
            이용자의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
            다만 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">제공받는 자</th>
                  <th className="text-left py-2 pr-4 font-medium">제공 항목</th>
                  <th className="text-left py-2 pr-4 font-medium">제공 목적</th>
                  <th className="text-left py-2 font-medium">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">Meta Platforms (Instagram)</td>
                  <td className="py-2 pr-4">이용자가 선택한 이미지, 캡션</td>
                  <td className="py-2 pr-4">Instagram 게시 (이용자 요청 시)</td>
                  <td className="py-2">게시 완료 후 즉시 삭제 (Instagram 플랫폼에는 이용자 관리 하에 보관)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제5조 (개인정보 처리의 위탁)</h2>
          <p>회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">수탁업체</th>
                  <th className="text-left py-2 pr-4 font-medium">위탁 업무</th>
                  <th className="text-left py-2 font-medium">소재국</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">포트원(PortOne)</td>
                  <td className="py-2 pr-4">결제 처리</td>
                  <td className="py-2">대한민국</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Supabase Inc.</td>
                  <td className="py-2 pr-4">회원 인증, 데이터 저장</td>
                  <td className="py-2">미국</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Google LLC (Gemini API)</td>
                  <td className="py-2 pr-4">AI 텍스트·이미지 생성</td>
                  <td className="py-2">미국</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Fly.io Inc.</td>
                  <td className="py-2 pr-4">서버 호스팅</td>
                  <td className="py-2">미국</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Meta Platforms Inc.</td>
                  <td className="py-2 pr-4">Instagram 콘텐츠 게시</td>
                  <td className="py-2">미국</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제6조 (개인정보의 국외 이전)</h2>
          <p>
            회사는 서비스 제공을 위해 이용자의 개인정보를 국외에 소재한 업체에 위탁·이전하고 있습니다.
            해당 업체들은 각각의 개인정보보호 정책에 따라 이용자의 정보를 안전하게 관리하며,
            회사는 「개인정보 보호법」 제39조의12에 따라 다음 사항을 고지합니다.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>이전되는 국가:</strong> 미국</li>
            <li><strong>이전 일시 및 방법:</strong> 서비스 이용 시 네트워크를 통한 전송</li>
            <li><strong>이전되는 항목:</strong> 제1조에 명시된 수집 항목</li>
            <li><strong>이전받는 자의 이용 목적:</strong> 제5조 위탁 업무 범위 내</li>
            <li><strong>보호 조치:</strong> SSL/TLS 암호화 전송, 접근 권한 제한, 위탁 계약 체결</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제7조 (이용자의 권리·의무 및 행사 방법)</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>열람권:</strong> 본인의 개인정보 처리 현황 열람 요구</li>
            <li><strong>정정권:</strong> 오류 등이 있을 경우 정정 요구</li>
            <li><strong>삭제권:</strong> 개인정보 삭제 요구 (회원 탈퇴 포함)</li>
            <li><strong>처리정지권:</strong> 개인정보 처리 정지 요구</li>
            <li><strong>동의 철회권:</strong> 개인정보 수집·이용에 대한 동의 철회</li>
            <li><strong>데이터 이동권:</strong> 본인의 데이터를 다운로드 받을 권리</li>
          </ul>
          <p className="mt-2">
            위 권리 행사는 서비스 내 계정 설정(대시보드 &gt; 회원 탈퇴) 또는 이메일(support@olli-ai.com)을 통해 가능하며,
            회사는 이에 대해 지체 없이(최대 10영업일 이내) 조치하겠습니다.
          </p>

          <h3 className="text-base font-medium mt-4 mb-2">Instagram 데이터 삭제 요청</h3>
          <p>
            이용자가 Instagram 연동을 해제하거나, Meta 플랫폼에서 OLLI 앱 접근을 제거할 경우,
            회사는 해당 이용자의 Instagram 관련 데이터(액세스 토큰, Instagram 사용자 정보)를 즉시 삭제합니다.
            별도의 데이터 삭제를 요청하려면 support@olli-ai.com으로 연락하거나
            서비스 내 대시보드에서 Instagram 연동 해제를 진행해주세요.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제8조 (개인정보의 파기 절차 및 방법)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>파기 절차:</strong> 목적 달성 후 별도의 DB로 옮겨 내부 방침 및 관련 법령에 따라 일정 기간 저장 후 파기</li>
            <li><strong>파기 방법:</strong> 전자적 파일 형태는 기록을 재생할 수 없는 기술적 방법으로 삭제</li>
            <li><strong>파기 시점:</strong> 보유 기간 만료일로부터 5일 이내, 처리 목적 달성 시 5일 이내</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제9조 (쿠키의 사용)</h2>
          <p>회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.</p>
          <h3 className="text-base font-medium mt-4 mb-2">1. 사용하는 쿠키의 종류</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>필수 쿠키:</strong> 로그인 인증 상태 유지 (Supabase Auth 세션)</li>
            <li><strong>기능 쿠키:</strong> 테마 설정(다크/라이트 모드), 에디터 사용 환경 설정</li>
          </ul>
          <h3 className="text-base font-medium mt-4 mb-2">2. 쿠키 관리</h3>
          <p>
            이용자는 웹 브라우저의 설정을 통해 쿠키의 저장을 거부하거나 삭제할 수 있습니다.
            다만, 필수 쿠키를 거부할 경우 로그인이 필요한 서비스 이용에 어려움이 있을 수 있습니다.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            회사는 광고 목적의 쿠키 또는 서드파티 추적 쿠키를 사용하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제10조 (개인정보의 안전성 확보 조치)</h2>
          <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>비밀번호 암호화 저장(bcrypt) 및 전송 구간 SSL/TLS 암호화</li>
            <li>인증 토큰(JWT) 기반 접근 제어</li>
            <li>해킹 등에 대비한 기술적 대책 (방화벽, 침입 탐지 시스템 등)</li>
            <li>개인정보 취급 직원의 최소화 및 교육</li>
            <li>접속 기록의 보관 및 위·변조 방지</li>
            <li>Instagram 액세스 토큰 암호화 저장 및 최소 권한 원칙 적용</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제11조 (AI 생성 콘텐츠 및 자동화된 의사결정)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>이용자가 입력한 프롬프트(텍스트)는 생성 기록 관리를 위해 저장되며, 이용자가 삭제 요청 시 삭제됩니다.</li>
            <li>생성된 이미지는 이용자의 계정에 저장되며, 이용자가 삭제를 요청할 경우 즉시 삭제됩니다.</li>
            <li>AI 모델 학습에 이용자의 입력 데이터를 사용하지 않습니다.</li>
            <li>AI 이미지 생성 시 이용자의 프롬프트는 Google Gemini API에 전달되며, Google의 개인정보처리방침에 따라 처리됩니다.</li>
            <li>회사는 이용자에 대한 프로파일링 또는 자동화된 의사결정을 수행하지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제12조 (만 14세 미만 아동의 개인정보 보호)</h2>
          <p>
            회사는 만 14세 미만 아동의 회원가입을 제한하고 있습니다.
            만 14세 미만 아동의 개인정보를 수집하는 경우에는 법정대리인의 동의를 받아야 하며,
            법정대리인이 아동의 개인정보에 대한 열람, 정정·삭제, 처리정지를 요청할 수 있습니다.
          </p>
          <p className="mt-2">
            만 14세 미만 아동이 법정대리인의 동의 없이 개인정보를 제공한 사실을 알게 된 경우,
            해당 개인정보를 지체 없이 파기합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제13조 (개인정보 보호책임자)</h2>
          <ul className="list-none space-y-1">
            <li><strong>담당부서:</strong> OLLI 운영팀</li>
            <li><strong>이메일:</strong> support@olli-ai.com</li>
          </ul>
          <p className="mt-3">
            기타 개인정보 침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의하실 수 있습니다.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
            <li>개인정보 분쟁조정위원회 (www.kopico.go.kr / 1833-6972)</li>
            <li>대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)</li>
            <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-8 mb-3">제14조 (개인정보 처리방침의 변경)</h2>
          <p>
            이 개인정보 처리방침은 법령·정책 또는 보안 기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 수 있으며,
            변경 시에는 시행일 최소 7일 전에 서비스 내 공지사항 또는 이메일을 통해 안내하겠습니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            이전 개인정보 처리방침은 서비스 내에서 확인하실 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
