import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    id: "welcome",
    title: "올리가 준비한 크레딧 선물 & 이용 꿀팁!",
    content:
      "올리에 오신 것을 환영합니다! 아래에서 크레딧 시스템과 알뜰하게 사용하는 방법을 확인하세요.",
  },
  {
    id: "signup",
    title: "가입 축하 선물: 20 크레딧 즉시 지급",
    content:
      "올리에 가입하시면 즉시 20 크레딧이 지급됩니다. 캐릭터 생성, 포즈/배경 생성, 스토리 스크립트 등 다양한 기능에 자유롭게 사용해보세요!",
  },
  {
    id: "monthly",
    title: "매월 정기 지원: 매월 1일 30 크레딧 충전",
    content:
      "매월 1일에 무료 사용자에게 10 크레딧이 자동 충전됩니다. 별도의 신청 없이 매달 꾸준히 크레딧을 받을 수 있어요.",
  },
  {
    id: "daily",
    title: "매일매일 출석 보너스: 매일 5 크레딧",
    content:
      "매일 올리에 접속하면 5 크레딧이 보너스로 지급됩니다. 출석 보너스 크레딧은 해당일 자정(KST)에 만료되며, 사용 시 보너스 크레딧이 먼저 차감됩니다.",
  },
  {
    id: "tips",
    title: "수석 기획자의 꿀팁",
    content:
      "\"아끼면 똥 됩니다!\" 크레딧은 매일 출석하면 계속 충전되니 부담 없이 마음껏 사용하세요. 좋은 결과물이 나올 때까지 다양하게 시도해보는 게 가장 좋은 활용법이에요!",
  },
  {
    id: "security",
    title: "안전하고 빠른 1초 시작",
    content:
      "올리는 Google, Kakao 등 소셜 로그인만 지원합니다. 별도 회원가입 없이 1초 만에 시작할 수 있고, 비밀번호 유출 걱정이 없어 더 안전합니다.",
  },
];

export function FAQCreditSection() {
  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-4">자주 묻는 질문</h2>
      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-sm text-left">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
