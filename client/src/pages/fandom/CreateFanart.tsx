import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { IdolMemberPicker } from "@/components/fandom/idol-member-picker";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Check,
  Camera,
  Brush,
  MessageSquare,
  Smartphone,
  Star,
  Scissors,
  Layers,
} from "lucide-react";
import {
  listItems,
  addItem,
  generateId,
  seedIfEmpty,
  getFandomProfile,
  STORE_KEYS,
  type IdolGroup,
  type IdolMember,
  type ProjectRecord,
} from "@/lib/local-store";
import type { FandomEditorMeta, FandomTemplateType, FandomStylePreset } from "@/lib/workspace-types";
import {
  FANDOM_TEMPLATES,
  TEMPLATE_CATEGORIES,
  STYLE_PRESETS,
  POSE_CHIPS,
  OUTFIT_CHIPS,
  MOOD_CHIPS,
  POSE_OUTFIT_TEMPLATES,
  TEMPLATE_LABELS,
} from "@/lib/fandom-templates";

type Step = "group" | "template" | "style" | "details";

const STEPS: { id: Step; label: string; num: number }[] = [
  { id: "group", label: "그룹 & 멤버", num: 1 },
  { id: "template", label: "무엇을 만들까?", num: 2 },
  { id: "style", label: "스타일 & 옵션", num: 3 },
  { id: "details", label: "시작", num: 4 },
];

const TEMPLATE_ICONS: Record<string, typeof ImageIcon> = {
  photocard: Camera,
  portrait: Star,
  wallpaper: Smartphone,
  concept: Camera,
  edit: Layers,
  fanart: Brush,
  sticker: Scissors,
  instatoon: MessageSquare,
  meme: MessageSquare,
};

export function FandomCreateFanart() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("group");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<FandomStylePreset | null>(null);
  const [selectedPose, setSelectedPose] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("popular");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groups, setGroups] = useState<IdolGroup[]>([]);
  const [members, setMembers] = useState<IdolMember[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setGroups(listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS));
    setMembers(listItems<IdolMember>(STORE_KEYS.IDOL_MEMBERS));
    const profile = getFandomProfile();
    if (profile?.groupId) {
      setSelectedGroupId(profile.groupId);
    }
  }, []);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const themeColor = selectedGroup?.coverColor || "var(--fandom-primary, #7B2FF7)";
  const selectedMemberNames = members
    .filter((m) => selectedMembers.includes(m.id))
    .map((m) => m.name);

  const templateDef = FANDOM_TEMPLATES.find((t) => t.id === selectedTemplate);
  const showPoseOutfit = templateDef && POSE_OUTFIT_TEMPLATES.includes(templateDef.type);

  function handleMemberToggle(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  // Auto-generate title when entering details step
  function goToDetails() {
    if (!templateDef) return;
    const memberPart = selectedMemberNames.length > 0
      ? selectedMemberNames.join(", ")
      : selectedGroup?.name || "";
    const autoTitle = `${memberPart} ${templateDef.label}`;
    if (!title) setTitle(autoTitle);
    setStep("details");
  }

  function handleOpenEditor() {
    if (!selectedGroup || !title.trim() || !templateDef) return;

    const templateType = templateDef.type;

    const projectId = generateId("proj");
    const now = new Date().toISOString().slice(0, 10);
    const project: ProjectRecord = {
      id: projectId,
      title: title.trim(),
      status: "draft",
      panels: templateDef.panels,
      thumbnail: null,
      updatedAt: now,
      createdAt: now,
    };
    addItem(STORE_KEYS.PROJECTS, project);

    const meta: FandomEditorMeta = {
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      coverColor: selectedGroup.coverColor,
      memberTags: selectedMemberNames,
      templateType,
      title: title.trim(),
      description: description.trim(),
      stylePreset: selectedStyle || undefined,
      poseHint: selectedPose || undefined,
      outfitHint: selectedOutfit || undefined,
      moodHint: selectedMood || undefined,
    };
    localStorage.setItem(`olli-fandom-editor-${projectId}`, JSON.stringify(meta));

    navigate(`/editor/${projectId}?mode=fandom`);
  }

  const currentStepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">팬아트 만들기</h1>
            <p className="text-sm text-muted-foreground">아이돌의 모든 것을 다양한 스타일로 만들어보세요</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= currentStepIdx
                    ? "text-white"
                    : "bg-muted text-muted-foreground"
                }`}
                style={i <= currentStepIdx ? { background: themeColor } : {}}
              >
                {i < currentStepIdx ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${i <= currentStepIdx ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-0.5" style={{ background: i < currentStepIdx ? themeColor : "var(--border)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-border bg-card p-6">
          {/* ── Step 1: Group & Members ── */}
          {step === "group" && (
            <div className="space-y-6">
              <IdolMemberPicker
                selectedGroupId={selectedGroupId}
                selectedMembers={selectedMembers}
                onGroupChange={setSelectedGroupId}
                onMemberToggle={handleMemberToggle}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => setStep("template")}
                  disabled={!selectedGroupId}
                  className="text-white font-bold gap-2 hover:opacity-90"
                  style={{ background: themeColor }}
                >
                  다음
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Template Selection (9 templates) ── */}
          {step === "template" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">무엇을 만들까요?</label>
                {/* Category tabs */}
                <div className="flex gap-1.5 mb-4">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeCategory === cat.id
                          ? "text-white"
                          : "text-muted-foreground bg-muted hover:text-foreground"
                      }`}
                      style={activeCategory === cat.id ? { background: themeColor } : {}}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Template grid */}
                <div className="grid grid-cols-3 gap-3">
                  {FANDOM_TEMPLATES
                    .filter((t) => t.category === activeCategory)
                    .map((tmpl) => {
                      const IconComp = TEMPLATE_ICONS[tmpl.type] || ImageIcon;
                      const isSelected = selectedTemplate === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? ""
                              : "border-border bg-card hover:border-muted-foreground"
                          }`}
                          style={isSelected ? { borderColor: themeColor, background: `color-mix(in srgb, ${themeColor} 10%, transparent)` } : {}}
                        >
                          {/* Aspect ratio preview shape */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <IconComp className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{tmpl.aspect}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{tmpl.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{tmpl.desc}</p>
                        </button>
                      );
                    })}
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("group")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </Button>
                <Button
                  onClick={() => setStep("style")}
                  disabled={!selectedTemplate}
                  className="text-white font-bold gap-2 hover:opacity-90"
                  style={{ background: themeColor }}
                >
                  다음
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Style & Options ── */}
          {step === "style" && (
            <div className="space-y-6">
              {/* Art Style */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">아트 스타일</label>
                <div className="grid grid-cols-5 gap-2">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                      className={`px-3 py-2.5 rounded-xl border text-center transition-all text-xs font-medium ${
                        selectedStyle === style.id
                          ? "text-white"
                          : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                      }`}
                      style={selectedStyle === style.id ? { background: themeColor, borderColor: themeColor } : {}}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pose chips (for portrait/photocard/concept) */}
              {showPoseOutfit && (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">포즈</label>
                  <div className="flex flex-wrap gap-2">
                    {POSE_CHIPS.map((pose) => (
                      <button
                        key={pose}
                        onClick={() => setSelectedPose(selectedPose === pose ? null : pose)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedPose === pose
                            ? "text-white border-transparent"
                            : "border-border text-muted-foreground hover:border-muted-foreground"
                        }`}
                        style={selectedPose === pose ? { background: themeColor } : {}}
                      >
                        {pose}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Outfit chips (for portrait/photocard/concept) */}
              {showPoseOutfit && (
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">의상</label>
                  <div className="flex flex-wrap gap-2">
                    {OUTFIT_CHIPS.map((outfit) => (
                      <button
                        key={outfit}
                        onClick={() => setSelectedOutfit(selectedOutfit === outfit ? null : outfit)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedOutfit === outfit
                            ? "text-white border-transparent"
                            : "border-border text-muted-foreground hover:border-muted-foreground"
                        }`}
                        style={selectedOutfit === outfit ? { background: themeColor } : {}}
                      >
                        {outfit}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mood chips (all templates) */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">분위기</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_CHIPS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedMood === mood
                          ? "text-white border-transparent"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                      style={selectedMood === mood ? { background: themeColor } : {}}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">모든 옵션은 선택사항이에요. 건너뛸 수 있어요.</p>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("template")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goToDetails}
                    className="gap-2"
                  >
                    건너뛰기
                  </Button>
                  <Button
                    onClick={goToDetails}
                    className="text-white font-bold gap-2 hover:opacity-90"
                    style={{ background: themeColor }}
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Title & Start ── */}
          {step === "details" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="팬아트 제목을 입력하세요"
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--fandom-primary,#7B2FF7)]/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">설명 (선택)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="팬아트에 대해 설명해주세요"
                  rows={2}
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--fandom-primary,#7B2FF7)]/30 resize-none"
                />
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">요약</p>
                <div className="text-sm text-foreground space-y-0.5">
                  <p>그룹: <span className="font-semibold">{selectedGroup?.name}</span></p>
                  {selectedMemberNames.length > 0 && (
                    <p>멤버: <span className="font-semibold">{selectedMemberNames.join(", ")}</span></p>
                  )}
                  <p>템플릿: <span className="font-semibold">{templateDef?.label}</span>
                    <span className="text-muted-foreground ml-1">({templateDef?.aspect})</span>
                  </p>
                  {selectedStyle && (
                    <p>스타일: <span className="font-semibold">{STYLE_PRESETS.find((s) => s.id === selectedStyle)?.label}</span></p>
                  )}
                  {selectedPose && <p>포즈: <span className="font-semibold">{selectedPose}</span></p>}
                  {selectedOutfit && <p>의상: <span className="font-semibold">{selectedOutfit}</span></p>}
                  {selectedMood && <p>분위기: <span className="font-semibold">{selectedMood}</span></p>}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("style")} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  이전
                </Button>
                <Button
                  onClick={handleOpenEditor}
                  disabled={!title.trim()}
                  className="font-bold gap-2 text-white"
                  style={{
                    background: selectedGroup
                      ? `linear-gradient(135deg, ${selectedGroup.coverColor}, ${selectedGroup.coverColor}cc)`
                      : "linear-gradient(135deg, hsl(262, 89%, 58%), hsl(262, 70%, 50%))",
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  에디터에서 만들기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
