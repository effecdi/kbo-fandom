import { useState, useEffect } from "react";
import { Sparkles, X, ArrowDown } from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";

const EXAMPLE_PROMPTS = [
  "카페에서 생긴 로맨스 4컷 만들어줘",
  "월요일 출근길 공감 웹툰 만들어줘",
  "반려동물과의 일상 만화 만들어줘",
];

export function OnboardingOverlay() {
  const { state, dispatch } = useWorkspace();
  const [visible, setVisible] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(0);

  useEffect(() => {
    if (!state.onboardingDismissed && state.copilot.messages.length === 0) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [state.onboardingDismissed, state.copilot.messages.length]);

  // Rotate example prompts
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentPrompt((p) => (p + 1) % EXAMPLE_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [visible]);

  // Auto-dismiss when user sends first message
  useEffect(() => {
    if (state.copilot.messages.length > 0) {
      setVisible(false);
      dispatch({ type: "DISMISS_ONBOARDING" });
    }
  }, [state.copilot.messages.length, dispatch]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    dispatch({ type: "DISMISS_ONBOARDING" });
  }

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-center">
      {/* Backdrop - subtle, not blocking */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto"
        onClick={dismiss}
      />

      {/* Content */}
      <div className="relative z-10 text-center pointer-events-auto max-w-lg px-6">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute -top-12 right-0 p-2 rounded-full bg-card/80 hover:bg-card border border-border transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* AI Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e5cc] to-[#00b4d8] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#00e5cc]/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-black text-foreground mb-2">
          AI로 인스타툰을 만들어보세요
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          아래 입력창에 만들고 싶은 내용을 말해보세요.
          <br />
          AI가 자동으로 4컷 인스타툰을 생성합니다.
        </p>

        {/* Example prompt bubble */}
        <div className="bg-card border border-border rounded-2xl px-5 py-3 inline-block shadow-lg mb-6">
          <p className="text-xs text-muted-foreground mb-1">이렇게 말해보세요:</p>
          <p className="text-sm font-medium text-[#00e5cc] transition-all duration-500">
            "{EXAMPLE_PROMPTS[currentPrompt]}"
          </p>
        </div>

        {/* Arrow pointing to bottom dock */}
        <div className="flex flex-col items-center gap-2 mt-4 animate-bounce">
          <ArrowDown className="w-5 h-5 text-[#00e5cc]" />
          <span className="text-xs text-muted-foreground">아래 입력창을 클릭하세요</span>
        </div>
      </div>
    </div>
  );
}
