import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function startStoryTour() {
  const driverObj = driver({
    overlayColor: "rgba(0,0,0,0.55)",
    showProgress: true,
    progressText: "{{current}} / {{total}}",
    nextBtnText: "다음",
    prevBtnText: "이전",
    doneBtnText: "완료",
    popoverClass: "olli-tour-popover",
    steps: [
      // ─── 1. 좌측 탭 메뉴 ───
      {
        element: '[data-testid="left-icon-sidebar"]',
        popover: {
          title: "좌측 탭 메뉴",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/01-sidebar.mp4" type="video/mp4" />
            </video>
            <p>4가지 탭으로 에디터 기능을 전환합니다.</p>
            <ul style="margin-top:4px;padding-left:16px;font-size:13px;color:#888;">
              <li><b>이미지 선택</b>: 갤러리/업로드로 캐릭터 이미지 배치</li>
              <li><b>AI 프롬프트</b>: AI 자동 스크립트 &amp; 이미지 생성</li>
              <li><b>도구</b>: 드로잉, 선, 텍스트, 도형 도구</li>
              <li><b>요소</b>: 자막, 말풍선, 템플릿 관리</li>
            </ul>
          `,
          side: "right" as const,
        },
      },
      // ─── 2. 이미지 탭 ───
      {
        element: '[data-testid="button-left-tab-image"]',
        popover: {
          title: "이미지 선택/업로드",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/02-image-tab.mp4" type="video/mp4" />
            </video>
            <p>갤러리에서 캐릭터를 클릭하면 캔버스에 바로 배치됩니다.</p>
            <ul style="margin-top:4px;padding-left:16px;font-size:13px;color:#888;">
              <li>내 갤러리에서 생성한 캐릭터 이미지를 선택</li>
              <li>파일을 직접 업로드하여 사용 가능</li>
              <li>배경 제거(Pro): 이미지 배경을 투명하게 처리</li>
            </ul>
          `,
          side: "right" as const,
        },
      },
      // ─── 3. AI 탭 ───
      {
        element: '[data-testid="button-left-tab-ai"]',
        popover: {
          title: "AI 프롬프트 탭",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/03-ai-tab.mp4" type="video/mp4" />
            </video>
            <p>AI 기반 자동 생성 기능 4가지를 제공합니다.</p>
            <ul style="margin-top:4px;padding-left:16px;font-size:13px;color:#888;">
              <li><b>AI 프롬프트 자막</b>: 주제만 입력하면 자막 자동 생성</li>
              <li><b>인스타툰 자동화</b>: 캐릭터 + 주제 → 이미지까지 한번에</li>
              <li><b>인스타툰 이미지</b>: 포즈/표정 프롬프트 자동 작성</li>
              <li><b>멀티컷 생성</b>: 여러 장면을 한번에 자동 생성</li>
            </ul>
          `,
          side: "right" as const,
        },
      },
      // ─── 4. AI 자동화 생성 ───
      {
        element: '[data-testid="button-left-tab-ai"]',
        popover: {
          title: "인스타툰 자동화 생성 (Pro)",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/04-instatoon-full.mp4" type="video/mp4" />
            </video>
            <p><b>캐릭터 이미지 + 주제만으로 완성된 인스타툰을 자동 생성합니다.</b></p>
            <ul style="margin-top:6px;padding-left:16px;font-size:13px;color:#888;">
              <li>① <b>기준 캐릭터 이미지 업로드</b> (최대 4장) — 그림체 자동 감지</li>
              <li>② <b>포즈·표정·아이템·배경</b> 프롬프트 자동 작성</li>
              <li>③ <b>한 번에 생성</b> → 캐릭터가 같은 그림체로 재생성</li>
              <li>④ 생성된 이미지가 각 패널에 자동 배치</li>
            </ul>
            <p style="margin-top:6px;font-size:13px;color:#aaa;">10 크레딧 소모 · Pro 멤버십 전용</p>
          `,
          side: "right" as const,
        },
      },
      // ─── 5. 이미지 자동생성 ───
      {
        element: '[data-testid="button-left-tab-ai"]',
        popover: {
          title: "인스타툰 이미지 생성 (Pro)",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/05-instatoon-prompt.mp4" type="video/mp4" />
            </video>
            <p><b>기준 이미지를 바탕으로 포즈·표정 프롬프트를 자동 작성하고 이미지를 생성합니다.</b></p>
            <ul style="margin-top:6px;padding-left:16px;font-size:13px;color:#888;">
              <li>① <b>기준 이미지 선택</b> — 갤러리 또는 직접 업로드</li>
              <li>② <b>아트 스타일 선택</b> — 자동 감지 또는 수동 지정</li>
              <li>③ <b>포즈/표정 프롬프트</b> — AI가 자동으로 영문 프롬프트 생성</li>
              <li>④ <b>생성 버튼</b> → 해당 패널에 이미지 자동 배치</li>
            </ul>
            <p style="margin-top:6px;font-size:13px;color:#aaa;">10 크레딧 소모 · Pro 멤버십 전용</p>
          `,
          side: "right" as const,
        },
      },
      // ─── 6. 멀티컷 생성 ───
      {
        element: '[data-testid="button-left-tab-ai"]',
        popover: {
          title: "자동화툰 멀티컷 생성",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/06-multicut.mp4" type="video/mp4" />
            </video>
            <p><b>한 번에 여러 장면(패널)을 자동으로 생성합니다.</b></p>
            <ul style="margin-top:6px;padding-left:16px;font-size:13px;color:#888;">
              <li>① <b>주제/시나리오 입력</b> — 간단한 설명만으로 OK</li>
              <li>② <b>패널 수 설정</b> — 원하는 장면 수를 선택</li>
              <li>③ <b>일괄 생성</b> → 각 패널에 자동으로 이미지 + 자막 배치</li>
              <li>④ 생성 후 개별 패널 수정 가능</li>
            </ul>
            <p style="margin-top:6px;font-size:13px;color:#aaa;">연속된 스토리를 빠르게 만들고 싶을 때 사용하세요</p>
          `,
          side: "right" as const,
        },
      },
      // ─── 7. 도구 탭 ───
      {
        element: '[data-testid="button-left-tab-tools"]',
        popover: {
          title: "도구 모음",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/07-tools-tab.mp4" type="video/mp4" />
            </video>
            <ul style="padding-left:16px;font-size:13px;">
              <li><b>선택</b>: 요소 선택/이동/크기 조절</li>
              <li><b>드로잉</b>: 펜, 마커, 형광펜으로 자유 드로잉</li>
              <li><b>선</b>: 직선/곡선 추가, 화살표/점선 지원</li>
              <li><b>텍스트</b>: 자유 위치 텍스트 추가</li>
              <li><b>도형</b>: 사각형, 원, 삼각형, 별 등 + 마스크</li>
            </ul>
          `,
          side: "right" as const,
        },
      },
      // ─── 8. 요소 탭 ───
      {
        element: '[data-testid="button-left-tab-elements"]',
        popover: {
          title: "요소: 자막 · 말풍선 · 템플릿",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/08-elements-tab.mp4" type="video/mp4" />
            </video>
            <ul style="padding-left:16px;font-size:13px;">
              <li><b>자막 설정</b>: 상단/하단 자막 텍스트, 폰트, 색상, 배경 스타일</li>
              <li><b>말풍선</b>: 말풍선 추가 (최대 5개), 다양한 스타일 선택</li>
              <li><b>템플릿</b>: 미리 디자인된 말풍선 템플릿 가져오기</li>
            </ul>
          `,
          side: "right" as const,
        },
      },
      // ─── 9. 말풍선 상세 ───
      {
        element: '[data-testid="button-left-tab-elements"]',
        popover: {
          title: "말풍선 기능 상세",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/09-bubble.mp4" type="video/mp4" />
            </video>
            <p><b>요소 탭 → 말풍선에서 다양한 편집이 가능합니다.</b></p>
            <ul style="margin-top:6px;padding-left:16px;font-size:13px;color:#888;">
              <li><b>말풍선 추가</b>: 패널당 최대 5개</li>
              <li><b>스타일 변경</b>: 둥근형, 네모형, 구름형, 외침형 등</li>
              <li><b>꼬리 편집</b>: 꼬리 방향/위치를 드래그로 조절</li>
              <li><b>텍스트 편집</b>: 폰트, 크기, 색상, 정렬 변경</li>
              <li><b>컨텍스트 툴바</b>: 말풍선 클릭 시 상단에 빠른 편집 바 표시</li>
            </ul>
          `,
          side: "right" as const,
        },
      },
      // ─── 10. 상단 툴바 ───
      {
        element: '[data-testid="canvas-toolbar"]',
        popover: {
          title: "상단 툴바",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/10-toolbar.mp4" type="video/mp4" />
            </video>
            <p>패널 추가(+), 좌우 이동, 실행 취소/다시 실행, 줌 조절을 할 수 있어요.</p>
          `,
          side: "bottom" as const,
        },
      },
      // ─── 11. 캔버스 + 컨텍스트 툴바 ───
      {
        element: '[data-testid="story-canvas-area"]',
        popover: {
          title: "캔버스 영역 + 컨텍스트 툴바",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/11-canvas-context.mp4" type="video/mp4" />
            </video>
            <p><b>캔버스에서 요소를 클릭하면 컨텍스트 툴바가 상단에 나타납니다.</b></p>
            <ul style="margin-top:6px;padding-left:16px;font-size:13px;color:#888;">
              <li><b>캐릭터 클릭</b> → 좌우 반전, 삭제, <b>AI 재생성</b> 버튼</li>
              <li><b>텍스트 클릭</b> → 폰트, 크기, 색상, 정렬 빠른 변경</li>
              <li><b>말풍선 클릭</b> → 스타일, 색상, 꼬리 방향 변경</li>
              <li><b>도형/선 클릭</b> → 두께, 투명도, 색상 조절</li>
              <li><b>드로잉 클릭</b> → 색상, 삭제, 복제, 레이어 순서</li>
            </ul>
          `,
          side: "left" as const,
        },
      },
      // ─── 12. AI 재생성 ───
      {
        element: '[data-testid="story-canvas-area"]',
        popover: {
          title: "AI 재생성 기능",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/12-ai-regen.mp4" type="video/mp4" />
            </video>
            <p><b>캔버스에서 캐릭터 이미지를 클릭하면 컨텍스트 툴바에 AI 재생성 버튼이 나타납니다.</b></p>
            <ul style="margin-top:6px;padding-left:16px;font-size:13px;color:#888;">
              <li><b>프롬프트로 재생성</b>: 원하는 장면을 텍스트로 설명 → 해당 캐릭터 이미지 새로 생성</li>
              <li><b>다른 포즈/표정</b>: 프롬프트 없이 자동으로 다른 변형 생성</li>
            </ul>
            <p style="margin-top:6px;font-size:13px;color:#888;">💡 캐릭터를 먼저 클릭 → 상단 컨텍스트 툴바에서 🔄 아이콘을 눌러 재생성 패널을 엽니다.</p>
          `,
          side: "left" as const,
        },
      },
      // ─── 13. 워터마크 ───
      {
        element: '[data-testid="story-canvas-area"]',
        popover: {
          title: "워터마크 (무료 vs Pro)",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/13-watermark.mp4" type="video/mp4" />
            </video>
            <p><b>무료 사용자는 "OLLI Free" 워터마크가 자동 적용됩니다.</b></p>
            <ul style="margin-top:6px;padding-left:16px;font-size:13px;color:#888;">
              <li><b>캔버스 워터마크</b>: 편집 중 캔버스 중앙에 반투명 "OLLI Free" 텍스트가 표시됩니다</li>
              <li><b>이미지 생성 워터마크</b>: 캐릭터/포즈/배경 이미지 생성 시 하단 중앙에 OLLI 로고가 삽입됩니다 (너비 30%, 투명도 70%)</li>
              <li><b>다운로드 시</b>: 워터마크가 포함된 채로 이미지가 저장됩니다</li>
            </ul>
            <p style="margin-top:8px;font-size:13px;"><b>Pro 멤버십 업그레이드 시 모든 워터마크가 완전히 제거됩니다.</b></p>
          `,
          side: "left" as const,
        },
      },
      // ─── 14. 도움말 ───
      {
        element: '[data-testid="button-story-help"]',
        popover: {
          title: "도움말 (이 가이드)",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/14-help.mp4" type="video/mp4" />
            </video>
            <p>언제든 이 버튼을 클릭하면 에디터 기능 가이드를 다시 볼 수 있어요.</p>
          `,
          side: "bottom" as const,
        },
      },
      // ─── 15. 다운로드 ───
      {
        element: '[data-testid="button-download-panel"]',
        popover: {
          title: "다운로드",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/15-download.mp4" type="video/mp4" />
            </video>
            <p>현재 패널 1장 또는 전체 패널을 하나의 세로 이미지로 다운로드할 수 있어요.</p>
          `,
          side: "bottom" as const,
        },
      },
      // ─── 16. 저장 ───
      {
        element: '[data-testid="button-save-story-project"]',
        popover: {
          title: "프로젝트 저장 (Pro)",
          description: `
            <video autoplay loop muted playsinline class="tour-video">
              <source src="/videos/tour/16-save.mp4" type="video/mp4" />
            </video>
            <p>현재 작업을 프로젝트로 저장합니다. '내 편집' 페이지에서 언제든 불러올 수 있어요. Instagram 공유 기능도 지원합니다.</p>
          `,
          side: "bottom" as const,
        },
      },
    ],
  });
  driverObj.drive();
}
