import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, Zap, Heart, Coffee, Smile } from "lucide-react";

const QUICK_TEMPLATES = [
  {
    id: "romance",
    icon: Heart,
    label: "연애툰",
    prompt: "카페에서 우연히 만난 두 사람의 설레는 이야기",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    id: "empathy",
    icon: Coffee,
    label: "공감툰",
    prompt: "월요일 아침 출근길의 현실 공감 에피소드",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    id: "daily",
    icon: Smile,
    label: "일상툰",
    prompt: "반려동물과의 따뜻한 일상 이야기",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    id: "auto",
    icon: Zap,
    label: "자유 주제",
    prompt: "",
    gradient: "from-[#00e5cc] to-[#00b4d8]",
  },
];

export function QuickStartHero() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function handleGenerate(inputPrompt?: string) {
    const p = (inputPrompt ?? prompt).trim();
    if (!p) {
      navigate("/studio/editor/new?mode=auto");
      return;
    }
    const encoded = encodeURIComponent(p);
    navigate(`/studio/editor/new?prompt=${encoded}`);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  function handleTemplateClick(template: (typeof QUICK_TEMPLATES)[number]) {
    if (template.prompt) {
      handleGenerate(template.prompt);
    } else {
      // Free topic - focus input
      setIsFocused(true);
      document.getElementById("hero-input")?.focus();
    }
  }

  return (
    <div className="mb-12">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00e5cc] to-[#00b4d8] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#00e5cc]/20">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">
          무엇을 만들고 싶으세요?
        </h1>
        <p className="text-muted-foreground">
          아이디어를 입력하면 AI가 인스타툰을 만들어드려요
        </p>
      </div>

      {/* Input area */}
      <div className="max-w-2xl mx-auto mb-6">
        <div
          className={`relative rounded-2xl border-2 transition-all duration-300 ${
            isFocused
              ? "border-[#00e5cc] shadow-lg shadow-[#00e5cc]/10"
              : "border-border hover:border-[#00e5cc]/30"
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <Sparkles
              className={`w-5 h-5 shrink-0 transition-colors ${
                isFocused ? "text-[#00e5cc]" : "text-muted-foreground"
              }`}
            />
            <input
              id="hero-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="예: 카페에서 생긴 로맨스 4컷 만들어줘"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base"
            />
            <button
              onClick={() => handleGenerate()}
              className="px-5 py-2 rounded-xl bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold text-sm flex items-center gap-2 transition-colors shrink-0"
            >
              <span>시작</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick template buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        {QUICK_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-[#00e5cc]/50 hover:shadow-md transition-all"
          >
            <div
              className={`w-7 h-7 rounded-lg bg-gradient-to-br ${template.gradient} flex items-center justify-center`}
            >
              <template.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {template.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
