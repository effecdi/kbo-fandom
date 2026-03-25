import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, Heart, Layers, Scissors, Paintbrush } from "lucide-react";
import { getFandomProfile } from "@/lib/local-store";

const QUICK_TEMPLATES = [
  {
    id: "instatoon",
    icon: Layers,
    label: "최애 인스타툰",
    prompt: "최애 멤버로 4컷 인스타툰을 만들어줘",
  },
  {
    id: "fanart",
    icon: Heart,
    label: "팬아트",
    prompt: "예쁜 팬아트 일러스트를 만들어줘",
  },
  {
    id: "meme",
    icon: Scissors,
    label: "밈 / 코믹",
    prompt: "재미있는 밈을 만들어줘",
  },
  {
    id: "free",
    icon: Paintbrush,
    label: "자유 주제",
    prompt: "",
  },
];

export function QuickStartHero() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  function handleGenerate(inputPrompt?: string) {
    const p = (inputPrompt ?? prompt).trim();
    if (!p) {
      navigate("/fandom/create");
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
      setIsFocused(true);
      document.getElementById("hero-input")?.focus();
    }
  }

  return (
    <div className="mb-12">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
          style={{ background: themeColor }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2">
          {profile ? `${profile.groupName} 팬아트를 만들어보세요` : "무엇을 만들고 싶으세요?"}
        </h1>
        <p className="text-muted-foreground">
          아이디어를 입력하면 AI가 팬아트를 만들어드려요
        </p>
      </div>

      {/* Input area */}
      <div className="max-w-2xl mx-auto mb-6">
        <div
          className={`relative rounded-2xl border-2 transition-all duration-300 ${
            isFocused
              ? "shadow-lg"
              : "border-border hover:border-foreground/20"
          }`}
          style={isFocused ? { borderColor: themeColor } : {}}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <Sparkles
              className="w-5 h-5 shrink-0 transition-colors"
              style={{ color: isFocused ? themeColor : undefined }}
            />
            <input
              id="hero-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={profile ? `${profile.groupName} 팬아트 아이디어를 입력하세요...` : "예: 멤버들의 귀여운 4컷 인스타툰 만들어줘"}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base"
            />
            <button
              onClick={() => handleGenerate()}
              className="px-5 py-2 rounded-xl text-white font-bold text-sm flex items-center gap-2 transition-colors shrink-0 hover:opacity-90"
              style={{ background: themeColor }}
            >
              <span>시작</span>
              <ArrowRight className="w-5 h-5" />
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
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: themeColor }}
            >
              <template.icon className="w-4 h-4" />
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
