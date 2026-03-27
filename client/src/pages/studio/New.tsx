import { StudioLayout } from "@/components/StudioLayout";
import { useNavigate, useSearchParams } from "react-router";
import {
  Sparkles,
  Layers,
  Paintbrush,
  Camera,
  MessageCircle,
  Zap,
  ArrowRight,
  Heart,
  Image as ImageIcon,
  Scissors,
} from "lucide-react";
import {
  addItem,
  generateId,
  getFandomProfile,
  STORE_KEYS,
  type ProjectRecord,
} from "@/lib/local-store";

const templates = [
  {
    id: "instatoon",
    icon: Layers,
    title: "최애 인스타툰",
    description: "최애 멤버로 4컷 인스타툰을 제작합니다",
    panels: 4,
  },
  {
    id: "auto",
    icon: Sparkles,
    title: "AI 팬아트 자동 생성",
    description: "스토리를 입력하면 AI가 팬아트를 자동 생성합니다",
    panels: 4,
  },
  {
    id: "blank",
    icon: Paintbrush,
    title: "자유 캔버스",
    description: "자유롭게 나만의 팬아트를 직접 그립니다",
    panels: 1,
  },
  {
    id: "meme",
    icon: Scissors,
    title: "밈 / 에디트",
    description: "재미있는 밈이나 포토 에디트를 만듭니다",
    panels: 1,
  },
];

const TEMPLATE_TITLES: Record<string, string> = {
  instatoon: "최애 인스타툰",
  auto: "AI 팬아트",
  blank: "자유 캔버스",
  meme: "밈 / 에디트",
};

const tools = [
  {
    id: "pose",
    icon: Camera,
    title: "포즈/표정",
    description: "캐릭터 포즈와 표정을 생성합니다",
  },
  {
    id: "background",
    icon: ImageIcon,
    title: "배경 생성",
    description: "AI로 배경 이미지를 생성합니다",
  },
  {
    id: "bubble",
    icon: MessageCircle,
    title: "말풍선",
    description: "말풍선을 추가하고 편집합니다",
  },
  {
    id: "effects",
    icon: Zap,
    title: "효과",
    description: "블러, 효과선 등 효과를 적용합니다",
  },
  {
    id: "chat",
    icon: MessageCircle,
    title: "챗 메이커",
    description: "채팅 형식의 콘텐츠를 제작합니다",
  },
];

function createProjectAndNavigate(
  navigate: ReturnType<typeof useNavigate>,
  templateId: string,
  panels: number,
  queryString: string,
) {
  const today = new Date().toISOString().split("T")[0];
  const id = generateId("proj");
  const title = TEMPLATE_TITLES[templateId] || "새 프로젝트";

  const project: ProjectRecord = {
    id,
    title,
    status: "draft",
    panels,
    thumbnail: null,
    updatedAt: today,
    createdAt: today,
  };

  addItem(STORE_KEYS.PROJECTS, project);
  navigate(`/studio/editor/${id}${queryString}`);
}

export function StudioNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    const panels = template?.panels ?? 4;

    if (templateId === "auto") {
      createProjectAndNavigate(navigate, templateId, panels, "?mode=auto");
    } else {
      createProjectAndNavigate(
        navigate,
        templateId,
        panels,
        `?template=${templateId}`,
      );
    }
  };

  const handleToolSelect = (toolId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const id = generateId("proj");
    const project: ProjectRecord = {
      id,
      title: `${tools.find((t) => t.id === toolId)?.title || "도구"} 프로젝트`,
      status: "draft",
      panels: 1,
      thumbnail: null,
      updatedAt: today,
      createdAt: today,
    };
    addItem(STORE_KEYS.PROJECTS, project);
    navigate(`/studio/editor/${id}?tool=${toolId}`);
  };

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <Heart className="w-7 h-7" style={{ color: themeColor }} />
            <h1 className="text-3xl font-black text-foreground">새 프로젝트</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {profile
              ? `${profile.groupName} 팬아트를 만들어보세요`
              : "템플릿을 선택하거나 도구를 사용해 시작하세요"}
          </p>
        </div>

        {/* Quick CTA */}
        <button
          onClick={() => navigate("/fandom/create")}
          className="w-full mb-8 p-5 rounded-2xl border border-border hover:shadow-lg transition-all text-left flex items-center gap-4 group"
          style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${themeColor} 8%, transparent), color-mix(in srgb, ${themeColor} 3%, transparent))` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: themeColor }}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">그룹 & 멤버 선택해서 만들기</h3>
            <p className="text-sm text-muted-foreground">구단과 선수를 먼저 선택하고 팬아트를 시작합니다</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Templates */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-foreground mb-4">빠른 시작 템플릿</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="group rounded-2xl border border-border bg-card p-6 text-left hover:shadow-lg hover:border-foreground/15 transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white"
                  style={{ background: themeColor }}
                >
                  <template.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground mb-1">
                  {template.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <div
                  className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: themeColor }}
                >
                  <span>시작하기</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">개별 도구</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className="group rounded-xl border border-border bg-card p-4 text-left hover:shadow-md hover:border-foreground/15 transition-all"
              >
                <tool.icon className="w-8 h-8 text-muted-foreground transition-colors mb-3" style={{}} />
                <h3 className="font-semibold text-sm text-foreground">
                  {tool.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tool.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
