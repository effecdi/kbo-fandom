import { StudioLayout } from "@/components/StudioLayout";
import { useNavigate, useSearchParams } from "react-router";
import {
  Sparkles,
  Wand2,
  Layers,
  Building2,
  Paintbrush,
  Camera,
  MessageCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  addItem,
  generateId,
  STORE_KEYS,
  type ProjectRecord,
} from "@/lib/local-store";

const templates = [
  {
    id: "instatoon",
    icon: Layers,
    title: "인스타툰 4컷",
    description: "4컷 형식의 인스타그램용 웹툰을 제작합니다",
    color: "from-pink-500 to-rose-500",
    panels: 4,
  },
  {
    id: "auto",
    icon: Sparkles,
    title: "AI 자동 생성",
    description: "스토리를 입력하면 AI가 자동으로 웹툰을 생성합니다",
    color: "from-purple-500 to-indigo-500",
    panels: 4,
  },
  {
    id: "blank",
    icon: Paintbrush,
    title: "빈 캔버스",
    description: "자유롭게 컷을 구성하고 직접 제작합니다",
    color: "from-cyan-500 to-blue-500",
    panels: 1,
  },
  {
    id: "mascot",
    icon: Building2,
    title: "마스코트 콘텐츠",
    description: "브랜드 마스코트를 활용한 콘텐츠를 제작합니다",
    color: "from-amber-500 to-orange-500",
    panels: 1,
  },
];

const TEMPLATE_TITLES: Record<string, string> = {
  instatoon: "인스타툰 4컷",
  auto: "AI 자동 생성",
  blank: "새 프로젝트",
  mascot: "마스코트 콘텐츠",
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
    icon: Paintbrush,
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
  const selectedTool = searchParams.get("tool");
  const selectedTemplate = searchParams.get("template");
  const selectedMode = searchParams.get("mode");

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
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground">새 프로젝트</h1>
          <p className="text-muted-foreground mt-1">
            템플릿을 선택하거나 도구를 사용해 시작하세요
          </p>
        </div>

        {/* Templates */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-foreground mb-4">템플릿</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="group rounded-2xl border border-border bg-card p-6 text-left hover:shadow-lg hover:border-[#00e5cc]/50 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}
                >
                  <template.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-1">
                  {template.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[#00e5cc] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>시작하기</span>
                  <ArrowRight className="w-4 h-4" />
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
                className="group rounded-xl border border-border bg-card p-4 text-left hover:shadow-md hover:border-[#00e5cc]/50 transition-all"
              >
                <tool.icon className="w-8 h-8 text-muted-foreground group-hover:text-[#00e5cc] transition-colors mb-3" />
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
