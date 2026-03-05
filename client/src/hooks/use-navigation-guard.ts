import { useState, useEffect, useCallback, useRef } from "react";

/**
 * 에디터 페이지에서 이탈 방지 훅
 * - beforeunload: 브라우저 닫기/새로고침
 * - popstate + dummy history: 브라우저 뒤로가기
 * - pushState 인터셉트: wouter 내부 네비게이션 (메뉴, 버튼 등)
 */
export function useNavigationGuard(enabled: boolean = true) {
  const [showDialog, setShowDialog] = useState(false);
  const pendingNavRef = useRef<(() => void) | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // 1. 브라우저 닫기/새로고침
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    // 2. 브라우저 뒤로가기 — dummy history entry
    window.history.pushState({ __editorGuard: true }, "");

    const onPopState = () => {
      if (!enabledRef.current) return;
      // 다시 push해서 현재 페이지 유지
      window.history.pushState({ __editorGuard: true }, "");
      pendingNavRef.current = () => {
        enabledRef.current = false;
        window.history.go(-2);
      };
      setShowDialog(true);
    };
    window.addEventListener("popstate", onPopState);

    // 3. wouter 내부 네비게이션 인터셉트
    const origPushState = window.history.pushState;
    window.history.pushState = function (
      state: unknown,
      title: string,
      url?: string | URL | null,
    ) {
      // 가드용 push는 통과
      if ((state as any)?.__editorGuard) {
        return origPushState.call(window.history, state, title, url);
      }
      // 가드 활성 + 실제 URL 변경이면 차단
      if (enabledRef.current && url && String(url) !== window.location.href) {
        pendingNavRef.current = () => {
          enabledRef.current = false;
          origPushState.call(window.history, state, title, url);
          window.dispatchEvent(new PopStateEvent("popstate", { state }));
        };
        setShowDialog(true);
        return;
      }
      return origPushState.call(window.history, state, title, url);
    };

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
      window.history.pushState = origPushState;
    };
  }, [enabled]);

  const confirmLeave = useCallback(() => {
    setShowDialog(false);
    const nav = pendingNavRef.current;
    pendingNavRef.current = null;
    if (nav) nav();
  }, []);

  const cancelLeave = useCallback(() => {
    setShowDialog(false);
    pendingNavRef.current = null;
  }, []);

  return { showDialog, confirmLeave, cancelLeave };
}
