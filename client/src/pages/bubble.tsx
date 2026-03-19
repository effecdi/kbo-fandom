import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Download, Plus, Trash2, MessageCircle, ArrowRight, Type, Move, Maximize2, ImagePlus, X, Loader2, Layers, ChevronUp, ChevronDown, Save, Minimize2, ZoomIn, ZoomOut, FolderOpen, Share2, Crown, Lightbulb, Copy, FilePlus, Wand2, FolderPlus } from "lucide-react";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { LeaveEditorDialog } from "@/components/leave-editor-dialog";
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
import { useLocation, useSearch } from "wouter";
import { BubbleCanvas } from "@/components/bubble-canvas";
import { SpeechBubble, CharacterOverlay, PageData, DragMode, BubbleStyle, TailStyle } from "@/lib/bubble-types";
import { generateId, KOREAN_FONTS, STYLE_LABELS, FLASH_STYLE_LABELS, TAIL_LABELS, drawBubble, getTailGeometry, getDefaultTailTip, getFontFamily } from "@/lib/bubble-utils";
import { BubbleContextToolbar, BubbleFloatingSettings } from "@/components/canvas-context-toolbar";
import "@/components/canvas-context-toolbar.scss";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ElementPropertiesPanel } from "@/components/element-properties-panel";
import { LayerListPanel, type LayerItem } from "@/components/layer-list-panel";

function bubblePath(n: number) {
  return `/assets/bubbles/bubble_${String(n).padStart(3, "0")}.png`;
}

type TemplateCategory = { label: string; ids: number[] };

const BUBBLE_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    label: "말풍선 (외침/효과)",
    ids: [109, 110, 111, 112, 113],
  },
  {
    label: "이펙트 / 스티커",
    ids: [108, 114, 115, 116, 117],
  },
];

const BUBBLE_COLOR_PRESETS = [
  { label: "흰색", fill: "#ffffff", stroke: "#222222" },
  { label: "검정", fill: "#1a1a1a", stroke: "#000000" },
  { label: "노랑", fill: "#fef08a", stroke: "#ca8a04" },
  { label: "하늘", fill: "#bae6fd", stroke: "#0ea5e9" },
  { label: "분홍", fill: "#fecdd3", stroke: "#e11d48" },
  { label: "연두", fill: "#bbf7d0", stroke: "#16a34a" },
  { label: "보라", fill: "#e9d5ff", stroke: "#9333ea" },
  { label: "주황", fill: "#fed7aa", stroke: "#ea580c" },
  { label: "투명", fill: "transparent", stroke: "#222222" },
];

export default function BubblePage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();
  const { showDialog: showLeaveDialog, confirmLeave, cancelLeave } = useNavigationGuard();
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const loadProjectId = searchParams.get("projectId");
  const from = searchParams.get("from");
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());

  const [pages, setPages] = useState<PageData[]>([
    { id: generateId(), bubbles: [], characters: [], canvasSize: { width: 540, height: 675 } }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const activePage = pages[activePageIndex];

  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const [showBubbleSettings, setShowBubbleSettings] = useState(false);

  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateCategoryIdx, setTemplateCategoryIdx] = useState(0);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const [zoom, setZoom] = useState(100);
  const [removingBg, setRemovingBg] = useState(false);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const { data: galleryItems = [], isLoading: galleryLoading } = useQuery<any[]>({
    queryKey: ["/api/gallery"],
    enabled: isAuthenticated,
  });

  const { data: usage } = useQuery<any>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  const isPro = usage?.tier === "pro" || usage?.tier === "premium";
  const canAllFonts = isPro || (usage?.creatorTier ?? 0) >= 3;

  const { data: projectFolders = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/project-folders"],
    enabled: isAuthenticated,
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/project-folders", { name });
      return res.json();
    },
    onSuccess: (folder: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-folders"] });
      setSelectedFolderId(folder.id);
      setNewFolderName("");
      setShowNewFolderInput(false);
      setCreatingFolder(false);
    },
    onError: (err: any) => {
      toast({ title: "폴더 생성 실패", description: err.message, variant: "destructive" });
      setCreatingFolder(false);
    },
  });
  const availableFonts = canAllFonts ? KOREAN_FONTS : KOREAN_FONTS.slice(0, 3);

  const showBackButton = from === "story";

  // State helpers
  const updatePage = useCallback((index: number, updates: Partial<PageData>) => {
    setPages(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  }, []);

  const updateActivePage = useCallback((updates: Partial<PageData>) => {
    updatePage(activePageIndex, updates);
  }, [activePageIndex, updatePage]);

  // Bubble helpers
  const updateBubble = useCallback((bubbleId: string, updates: Partial<SpeechBubble>) => {
    updateActivePage({
      bubbles: activePage.bubbles.map(b => b.id === bubbleId ? { ...b, ...updates } : b)
    });
  }, [activePage, updateActivePage]);

  const updateChar = useCallback((charId: string, updates: Partial<CharacterOverlay>) => {
    updateActivePage({
      characters: activePage.characters.map(c => c.id === charId ? { ...c, ...updates } : c)
    });
  }, [activePage, updateActivePage]);

  const layerItems = useMemo(() => {
    const items: Array<
      | { type: "char"; id: string; z: number; label: string; thumb?: string }
      | { type: "bubble"; id: string; z: number; label: string; thumb?: string }
    > = [
      ...activePage.characters.map((c) => ({
        type: "char" as const,
        id: c.id,
        z: c.zIndex ?? 0,
        label: "캐릭터",
        thumb: c.imageUrl,
      })),
      ...activePage.bubbles.map((b, i) => ({
        type: "bubble" as const,
        id: b.id,
        z: b.zIndex ?? 10,
        label: b.text || STYLE_LABELS[b.style] || `말풍선 ${i + 1}`,
      })),
    ];
    return items.sort((a, b) => b.z - a.z);
  }, [activePage.characters, activePage.bubbles]);

  const [dragLayerIdx, setDragLayerIdx] = useState<number | null>(null);

  const applyLayerOrder = useCallback((ordered: Array<{ type: "char" | "bubble"; id: string }>) => {
    // layerItems is displayed high→low (index 0 = topmost). Give highest zIndex to index 0.
    const n = ordered.length;
    updateActivePage({
      characters: activePage.characters.map((c) => {
        const idx = ordered.findIndex((it) => it.type === "char" && it.id === c.id);
        return idx >= 0 ? { ...c, zIndex: n - 1 - idx } : c;
      }),
      bubbles: activePage.bubbles.map((b) => {
        const idx = ordered.findIndex((it) => it.type === "bubble" && it.id === b.id);
        return idx >= 0 ? { ...b, zIndex: n - 1 - idx } : b;
      }),
    });
  }, [activePage, updateActivePage]);

  const moveLayer = (index: number, direction: "up" | "down") => {
    const items = layerItems;
    if (direction === "up" && index <= 0) return;
    if (direction === "down" && index >= items.length - 1) return;
    const a = items[index];
    const b = items[direction === "up" ? index - 1 : index + 1];
    // Ensure distinct z values so swap is always visible
    const zTop = Math.max(a.z, b.z, items.length);
    const [newAz, newBz] = direction === "up" ? [zTop, zTop - 1] : [zTop - 1, zTop];
    // Single updateActivePage call to avoid state overwrites
    updateActivePage({
      characters: activePage.characters.map((c) => {
        if (c.id === a.id && a.type === "char") return { ...c, zIndex: newAz };
        if (c.id === b.id && b.type === "char") return { ...c, zIndex: newBz };
        return c;
      }),
      bubbles: activePage.bubbles.map((bb) => {
        if (bb.id === a.id && a.type === "bubble") return { ...bb, zIndex: newAz };
        if (bb.id === b.id && b.type === "bubble") return { ...bb, zIndex: newBz };
        return bb;
      }),
    });
  };

  const deleteSelectedElement = useCallback(() => {
    if (selectedBubbleId) {
      updateActivePage({
        bubbles: activePage.bubbles.filter((b) => b.id !== selectedBubbleId),
      });
      setSelectedBubbleId(null);
    } else if (selectedCharId) {
      updateActivePage({
        characters: activePage.characters.filter((c) => c.id !== selectedCharId),
      });
      setSelectedCharId(null);
    }
  }, [activePage, selectedBubbleId, selectedCharId, updateActivePage]);

  const toggleLockSelectedElement = useCallback(() => {
    if (selectedBubbleId) {
      const b = activePage.bubbles.find((bb) => bb.id === selectedBubbleId);
      if (!b) return;
      updateBubble(selectedBubbleId, { locked: !b.locked });
    } else if (selectedCharId) {
      const c = activePage.characters.find((cc) => cc.id === selectedCharId);
      if (!c) return;
      updateChar(selectedCharId, { locked: !c.locked });
    }
  }, [activePage, selectedBubbleId, selectedCharId, updateBubble, updateChar]);

  const groupSelectedBubbleWithAbove = useCallback(() => {
    if (!selectedBubbleId) return;
    const bubbles = activePage.bubbles;
    const current = bubbles.find((b) => b.id === selectedBubbleId);
    if (!current) return;
    const sorted = [...bubbles].sort((a, b) => (a.zIndex ?? 10) - (b.zIndex ?? 10));
    const idx = sorted.findIndex((b) => b.id === current.id);
    const neighbor = sorted[idx + 1] ?? sorted[idx - 1];
    const groupId = generateId();
    const ids = [current.id, ...(neighbor ? [neighbor.id] : [])];
    updateActivePage({
      bubbles: bubbles.map((b) =>
        ids.includes(b.id) ? { ...b, groupId } : b,
      ),
    });
  }, [activePage, selectedBubbleId, updateActivePage]);

  const ungroupSelectedBubble = useCallback(() => {
    if (!selectedBubbleId) return;
    const bubbles = activePage.bubbles;
    const current = bubbles.find((b) => b.id === selectedBubbleId);
    if (!current || !current.groupId) return;
    const gid = current.groupId;
    updateActivePage({
      bubbles: bubbles.map((b) =>
        b.groupId === gid ? { ...b, groupId: undefined } : b,
      ),
    });
  }, [activePage, selectedBubbleId, updateActivePage]);

  const rotateSelectedElement = useCallback(() => {
    if (!selectedCharId) return;
    const c = activePage.characters.find((cc) => cc.id === selectedCharId);
    if (!c) return;
    const next = (c.rotation || 0) + Math.PI / 12;
    updateChar(selectedCharId, { rotation: next });
  }, [activePage, selectedCharId, updateChar]);

  const copySelectedElement = useCallback(() => {
    if (selectedBubbleId) {
      const b = activePage.bubbles.find((bb) => bb.id === selectedBubbleId);
      if (!b) return;
      localStorage.setItem("olli_clipboard", JSON.stringify({ type: "bubble", data: b }));
      toast({ title: "복사됨", description: "말풍선이 복사되었습니다." });
    } else if (selectedCharId) {
      const c = activePage.characters.find((cc) => cc.id === selectedCharId);
      if (!c) return;
      localStorage.setItem("olli_clipboard", JSON.stringify({ type: "char", data: c }));
      toast({ title: "복사됨", description: "캐릭터가 복사되었습니다." });
    }
  }, [activePage, selectedBubbleId, selectedCharId, toast]);

  const pasteFromClipboard = useCallback(() => {
    try {
      const raw = localStorage.getItem("olli_clipboard");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.type === "bubble") {
        const b = parsed.data as SpeechBubble;
        const maxZ = activePage.bubbles.reduce((acc, cur) => Math.max(acc, cur.zIndex ?? 10), 10);
        const newBubble: SpeechBubble = {
          ...b,
          id: generateId(),
          x: b.x + 20,
          y: b.y + 20,
          zIndex: maxZ + 1,
        };
        updateActivePage({ bubbles: [...activePage.bubbles, newBubble] });
        setSelectedBubbleId(newBubble.id);
        setSelectedCharId(null);
      } else if (parsed.type === "char") {
        const c = parsed.data as CharacterOverlay;
        const maxZ = activePage.characters.reduce((acc, cur) => Math.max(acc, cur.zIndex ?? 0), 0);
        const newChar: CharacterOverlay = {
          ...c,
          id: generateId(),
          x: c.x + 20,
          y: c.y + 20,
          zIndex: maxZ + 1,
        };
        updateActivePage({ characters: [...activePage.characters, newChar] });
        setSelectedCharId(newChar.id);
        setSelectedBubbleId(null);
      }
      toast({ title: "붙여넣기 완료" });
    } catch {
      toast({ title: "붙여넣기 실패", description: "클립보드 데이터를 읽을 수 없습니다.", variant: "destructive" });
    }
  }, [activePage, updateActivePage, toast]);

  const addBubble = () => {
    const newBubble: SpeechBubble = {
      id: generateId(),
      seed: Math.floor(Math.random() * 1000000),
      x: activePage.canvasSize.width / 2 - 80,
      y: activePage.canvasSize.height / 2 - 40,
      width: 160,
      height: 80,
      text: "",
      style: "linedrawing",
      tailStyle: "short",
      tailDirection: "bottom",
      tailBaseSpread: 8,
      tailLength: undefined,
      tailCurve: 0.5,
      tailJitter: 1,
      dotsScale: 1,
      dotsSpacing: 1,
      strokeWidth: 2,
      wobble: 5,
      fontSize: 14,
      fontKey: "default",
      shapeSides: 6,
      shapeCornerRadius: 8,
      shapeWobble: 0,
      shapeSpikeCount: 12,
      shapeSpikeHeight: 20,
      shapeSpikeSharpness: 0.7,
      shapeBumpCount: 8,
      shapeBumpSize: 15,
      shapeBumpRoundness: 0.8,
      zIndex: 10,
      groupId: undefined,
    };
    updateActivePage({ bubbles: [...activePage.bubbles, newBubble] });
    setSelectedBubbleId(newBubble.id);
    setSelectedCharId(null);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (!selectedBubbleId && !selectedCharId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelectedElement();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelectedElement, selectedBubbleId, selectedCharId]);

  const addPage = () => {
    const newPage: PageData = {
      id: generateId(),
      bubbles: [],
      characters: [],
      canvasSize: { width: 540, height: 675 },
    };
    setPages(prev => [...prev, newPage]);
    setActivePageIndex(pages.length); // Select new page
    toast({ title: "페이지 추가됨", description: "새로운 페이지가 생성되었습니다." });
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      toast({ title: "삭제 불가", description: "최소 1개의 페이지가 필요합니다.", variant: "destructive" });
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== index));
    if (activePageIndex >= index && activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  const duplicatePage = (index: number) => {
    const p = pages[index];
    const newPage: PageData = {
      ...p,
      id: generateId(),
      bubbles: p.bubbles.map(b => ({ ...b, id: generateId() })),
      characters: p.characters.map(c => ({ ...c, id: generateId() })),
    };
    setPages(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, newPage);
      return next;
    });
    toast({ title: "페이지 복제됨" });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Fit to active canvas or resize canvas?
        // Typically resize canvas to match image, but max constrained
        const maxW = 800;
        const maxH = 1000;
        let w = img.width;
        let h = img.height;
        const s = Math.min(maxW / w, maxH / h, 1);
        w = Math.round(w * s);
        h = Math.round(h * s);

        updateActivePage({
          imageElement: img,
          imageDataUrl: ev.target?.result as string,
          canvasSize: { width: w, height: h },
          bubbles: [], // Clear bubbles on new image? Or keep? keeping seems safer but bubble positions might be off. 
          // Original code cleared bubbles. Let's keep that behavior or ask?
          // "setBubbles([])" was in original.
        });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const resizeCanvas = (srcCanvas: HTMLCanvasElement, w: number, h: number): string => {
    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return srcCanvas.toDataURL("image/png");
    ctx.drawImage(srcCanvas, 0, 0, w, h);
    return offscreen.toDataURL("image/png");
  };

  const handleDownload = () => {
    const canvas = canvasRefs.current.get(activePage.id);
    if (!canvas) return;
    const dataUrl = resizeCanvas(canvas, 1080, 1350);
    const link = document.createElement("a");
    link.download = `bubble-page-${activePageIndex + 1}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadAll = () => {
    pages.forEach((page, index) => {
      const canvas = canvasRefs.current.get(page.id);
      if (!canvas) return;
      const dataUrl = resizeCanvas(canvas, 1080, 1350);
      const link = document.createElement("a");
      link.download = `bubble-page-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  const { data: loadedProject } = useQuery<any>({
    queryKey: ["/api/bubble-projects", loadProjectId],
    enabled: isAuthenticated && !!loadProjectId,
  });

  const projectLoadedRef = useRef<number | null>(null);
  useEffect(() => {
    if (loadedProject && projectLoadedRef.current !== loadedProject.id) {
      projectLoadedRef.current = loadedProject.id;
      setCurrentProjectId(loadedProject.id);
      setProjectName(loadedProject.name);
      setSelectedFolderId(loadedProject.folderId ?? null);

      // 이미지 로드 후 새 페이지 객체 생성하여 캔버스 redraw 강제
      const forceNewPageRefs = () => {
        setPages(cur => cur.map(pp => ({ ...pp })));
      };

      try {
        const data = typeof loadedProject.canvasData === "string"
          ? JSON.parse(loadedProject.canvasData)
          : loadedProject.canvasData;
        if (data.pages) {
          const restoredPages = data.pages.map((p: PageData) => ({
            ...p,
            bubbles: p.bubbles.map((b: any) => {
              if (b.templateSrc && !b.templateImg) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => forceNewPageRefs();
                img.src = b.templateSrc;
                return { ...b, templateImg: img };
              }
              return b;
            }),
            characters: p.characters.map((c: any) => {
              if (c.imageUrl && !c.imgElement) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => forceNewPageRefs();
                img.src = c.imageUrl;
                return { ...c, imgElement: img };
              }
              return c;
            }),
            imageElement: p.imageDataUrl ? (() => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => forceNewPageRefs();
              img.src = p.imageDataUrl;
              return img;
            })() : undefined
          }));
          setPages(restoredPages);
        } else {
          const newPage: PageData = {
            id: generateId(),
            bubbles: (data.bubbles || []).map((b: any) => {
              if (b.templateSrc) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => forceNewPageRefs();
                img.src = b.templateSrc;
                return { ...b, templateImg: img };
              }
              return b;
            }),
            characters: (data.characterOverlays || []).map((c: any) => {
              if (c.imageUrl) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => forceNewPageRefs();
                img.src = c.imageUrl;
                return { ...c, imgElement: img };
              }
              return c;
            }),
            canvasSize: data.canvasSize || { width: 540, height: 675 },
            imageDataUrl: data.imageDataUrl,
            imageElement: data.imageDataUrl ? (() => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => forceNewPageRefs();
              img.src = data.imageDataUrl;
              return img;
            })() : undefined
          };
          setPages([newPage]);
        }
      } catch (e) {
        console.error("Failed to load project:", e);
        toast({ title: "프로젝트 로드 실패", variant: "destructive" });
      }
    }
  }, [loadedProject, toast]);

  const selectedBubble = activePage.bubbles.find(b => b.id === selectedBubbleId);
  const selectedChar = activePage.characters.find(c => c.id === selectedCharId);

  const handleFlipTailHorizontally = useCallback(() => {
    if (!selectedBubble) return;
    const b = selectedBubble;
    if (b.tailStyle === "none") return;

    const cx = b.x + b.width / 2;
    const defaultTip = getDefaultTailTip(b);
    const origTipX = b.tailTipX ?? defaultTip?.x ?? cx;
    const origTipY = b.tailTipY ?? defaultTip?.y ?? (b.y + b.height);

    const updates: Partial<SpeechBubble> = {
      tailTipX: 2 * cx - origTipX,
      tailTipY: origTipY,
    };

    if (typeof b.tailCtrl1X === "number" && typeof b.tailCtrl1Y === "number") {
      updates.tailCtrl1X = 2 * cx - b.tailCtrl1X;
      updates.tailCtrl1Y = b.tailCtrl1Y;
    }
    if (typeof b.tailCtrl2X === "number" && typeof b.tailCtrl2Y === "number") {
      updates.tailCtrl2X = 2 * cx - b.tailCtrl2X;
      updates.tailCtrl2Y = b.tailCtrl2Y;
    }

    updateBubble(b.id, updates);
  }, [selectedBubble, updateBubble]);

  const handleRemoveBackground = async () => {
    if (!selectedChar) return;
    if (!isPro) {
      toast({
        title: "Pro 전용 기능",
        description: "배경제거는 Pro 멤버십 전용 기능입니다.",
        variant: "destructive",
      });
      return;
    }
    try {
      setRemovingBg(true);
      const res = await apiRequest("POST", "/api/remove-background", {
        sourceImageData: selectedChar.imageUrl,
      });
      const data = await res.json();
      const imageUrl = data.imageUrl as string;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        updateActivePage({
          characters: activePage.characters.map((c) =>
            c.id === selectedChar.id ? { ...c, imageUrl, imgElement: img } : c,
          ),
        });
        toast({ title: "배경 제거 완료" });
      };
      img.src = imageUrl;
    } catch (error: any) {
      toast({
        title: "배경 제거 실패",
        description: error?.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setRemovingBg(false);
    }
  };

  const startBubbleTour = useCallback(() => {
    const ensureDriver = () =>
      new Promise<void>((resolve) => {
        const hasDriver = (window as any)?.driver?.js?.driver;
        if (hasDriver) {
          resolve();
          return;
        }
        const cssId = "driverjs-css";
        if (!document.getElementById(cssId)) {
          const link = document.createElement("link");
          link.id = cssId;
          link.rel = "stylesheet";
          link.href = "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css";
          document.head.appendChild(link);
        }
        const scriptId = "driverjs-script";
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.id = scriptId;
          script.src = "https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js";
          script.onload = () => resolve();
          document.body.appendChild(script);
        } else {
          resolve();
        }
      });
    ensureDriver().then(() => {
      const driver = (window as any).driver.js.driver;
      const driverObj = driver({
        overlayColor: "rgba(0,0,0,0.6)",
        showProgress: true,
        steps: [
          {
            element: '[data-testid="bubble-toolbar"]',
            popover: { title: "말풍선 툴바", description: "다운로드, 배경 이미지, 저장 등을 할 수 있어요." },
          },
          {
            element: '[data-testid="button-download-bubble"]',
            popover: { title: "다운로드", description: "현재 페이지를 이미지로 저장합니다." },
          },
          {
            element: '[data-testid="button-upload-bubble-bg"]',
            popover: { title: "배경 이미지", description: "말풍선 뒤에 깔릴 배경 이미지를 설정합니다." },
          },
          {
            element: '[data-testid="button-save-bubble-project"]',
            popover: { title: "프로젝트 저장", description: "작업을 프로젝트로 저장해두고 다시 불러올 수 있어요." },
          },
          {
            element: '[data-testid="bubble-canvas-area"]',
            popover: { title: "캔버스", description: "말풍선과 캐릭터를 배치하고 크기를 조절해보세요." },
          },
          {
            element: '[data-testid="bubble-right-panel"]',
            popover: { title: "속성 패널", description: "텍스트, 폰트, 꼬리 방향 등 세부 옵션을 바꿉니다." },
          },
        ],
      });
      driverObj.drive();
    });
  }, []);

  return (
    <div className="editor-page flex h-screen w-full flex-col bg-background" data-lenis-prevent>
      {/* Top bar - Story 스타일과 통일 */}
      <header className="flex h-14 items-center border-b bg-background px-4" data-testid="bubble-toolbar">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button variant="ghost" size="icon" onClick={() => setLocation("/story")}>
                <ArrowRight className="h-4 w-4 rotate-180" />
              </Button>
            )}
            <h1 className="text-base font-semibold">말풍선 편집기</h1>
            {isPro && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3 text-yellow-500" /> Pro
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => guard(() => handleDownload())}
              title="다운로드"
              data-testid="button-download-bubble"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 h-8 text-[13px] px-2.5 bg-muted/40 hover:bg-muted/60"
              onClick={() => guard(() => handleDownloadAll())}
              data-testid="button-download-bubble-all"
            >
              <Download className="h-3.5 w-3.5" />
              전체 다운로드
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 h-8 text-[13px] px-2.5 bg-muted/40 hover:bg-muted/60"
              onClick={() => guard(() => document.getElementById("bg-upload")?.click())}
              data-testid="button-upload-bubble-bg"
            >
              <Upload className="h-3.5 w-3.5" />
              배경 이미지
            </Button>
            <input
              type="file"
              id="bg-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Button
              size="sm"
              onClick={() => {
                guard(() => {
                  if (!isPro) {
                    toast({
                      title: "Pro 전용 기능",
                      description: "말풍선 프로젝트 저장은 Pro 업그레이드 후 이용할 수 있습니다.",
                      variant: "destructive",
                    });
                    setLocation("/pricing");
                    return;
                  }
                  setShowSaveModal(true);
                });
              }}
              className="gap-1.5 h-8 text-[13px] px-2.5 bg-primary text-primary-foreground border-primary"
              data-testid="button-save-bubble-project"
            >
              <Save className="h-3.5 w-3.5" />
              저장
              {isPro && <Crown className="h-3 w-3 ml-0.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={startBubbleTour}
              title="도움말"
              data-testid="button-bubble-help"
            >
              <Lightbulb className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setLocation("/edits")}
              title="내 편집"
              data-testid="button-bubble-my-edits"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" data-testid="bubble-canvas-area">
        {/* Main Canvas Area - Scrollable List */}
        <div className="flex-1 overflow-y-auto bg-muted/20 dark:bg-muted/10 px-8 pb-8 pt-[5rem]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 pb-32">
            {pages.map((page, i) => (
              <ContextMenu key={page.id}>
                <ContextMenuTrigger>
                  <div
                    onClick={() => setActivePageIndex(i)}
                    className={`relative shadow-lg transition-all ${activePageIndex === i ? "ring-4 ring-primary ring-offset-2" : "opacity-90 hover:opacity-100"}`}
                  >
                    <div className="absolute -left-12 top-0 flex flex-col gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-sm ${activePageIndex === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {i + 1}
                      </div>
                    </div>
                    {pages.length > 1 && (
                      <button
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-red-500 shadow hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(i);
                        }}
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Bubble context toolbar */}
                    {activePageIndex === i && selectedBubbleId && (() => {
                      const selBubble = page.bubbles.find(b => b.id === selectedBubbleId);
                      if (!selBubble) return null;
                      return (
                        <>
                          <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                            <BubbleContextToolbar
                              bubble={selBubble}
                              onChange={(updates) => {
                                updatePage(i, {
                                  bubbles: page.bubbles.map(b => b.id === selectedBubbleId ? { ...b, ...updates } : b),
                                });
                              }}
                              showSettings={showBubbleSettings}
                              onShowSettings={() => setShowBubbleSettings(s => !s)}
                              canAllFonts={canAllFonts}
                            />
                          </div>
                          {showBubbleSettings && (
                            <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 55 }}>
                              <BubbleFloatingSettings
                                bubble={selBubble}
                                onChange={(updates) => {
                                  updatePage(i, {
                                    bubbles: page.bubbles.map(b => b.id === selectedBubbleId ? { ...b, ...updates } : b),
                                  });
                                }}
                                onClose={() => setShowBubbleSettings(false)}
                              />
                            </div>
                          )}
                        </>
                      );
                    })()}

                    <BubbleCanvas
                      page={page}
                      isActive={activePageIndex === i}
                      zoom={zoom}
                      onUpdateBubble={(id, u) => updatePage(i, { bubbles: page.bubbles.map(b => b.id === id ? { ...b, ...u } : b) })}
                      onUpdateChar={(id, u) => updatePage(i, { characters: page.characters.map(c => c.id === id ? { ...c, ...u } : c) })}
                      onSelectBubble={(id) => {
                        setSelectedBubbleId(id);
                        if (id) { setSelectedCharId(null); setActivePageIndex(i); }
                        if (!id) { setShowBubbleSettings(false); setEditingBubbleId(null); }
                        if (id && editingBubbleId && editingBubbleId !== id) setEditingBubbleId(null);
                      }}
                      onSelectChar={(id) => {
                        setSelectedCharId(id);
                        if (id) { setSelectedBubbleId(null); setActivePageIndex(i); }
                        setShowBubbleSettings(false);
                        setEditingBubbleId(null);
                      }}
                      selectedBubbleId={activePageIndex === i ? selectedBubbleId : null}
                      selectedCharId={activePageIndex === i ? selectedCharId : null}
                      onCanvasRef={(el) => { if (el) canvasRefs.current.set(page.id, el); else canvasRefs.current.delete(page.id); }}
                      onEditBubble={(id) => setEditingBubbleId(id)}
                      editingBubbleId={activePageIndex === i ? editingBubbleId : null}
                      showWatermark={!isPro}
                    />

                    {/* Inline text editing overlay */}
                    {activePageIndex === i && editingBubbleId && (() => {
                      const b = page.bubbles.find(bb => bb.id === editingBubbleId);
                      if (!b) return null;
                      const cW = page.canvasSize.width;
                      const cH = page.canvasSize.height;
                      const canvasEl = canvasRefs.current.get(page.id);
                      if (!canvasEl) return null;
                      const rect = canvasEl.getBoundingClientRect();
                      const sx = rect.width / cW;
                      const sy = rect.height / cH;
                      return (
                        <textarea
                          autoFocus
                          value={b.text}
                          onChange={(e) => {
                            updatePage(i, { bubbles: page.bubbles.map(bb => bb.id === editingBubbleId ? { ...bb, text: e.target.value } : bb) });
                          }}
                          onBlur={() => setEditingBubbleId(null)}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Escape") setEditingBubbleId(null);
                          }}
                          style={{
                            position: "absolute",
                            left: b.x * sx,
                            top: b.y * sy,
                            width: b.width * sx,
                            height: b.height * sy,
                            fontSize: b.fontSize * sx,
                            fontFamily: getFontFamily(b.fontKey),
                            textAlign: "center",
                            color: b.strokeColor || "#222222",
                            background: "rgba(255,255,255,0.85)",
                            border: "2px solid hsl(var(--primary))",
                            borderRadius: 6,
                            padding: "4px",
                            resize: "none",
                            outline: "none",
                            zIndex: 30,
                            overflow: "hidden",
                            lineHeight: 1.3,
                            boxSizing: "border-box" as const,
                          }}
                        />
                      );
                    })()}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {(selectedBubbleId || selectedCharId) && (
                    <>
                      <ContextMenuItem onClick={copySelectedElement}>복사</ContextMenuItem>
                      <ContextMenuItem onClick={pasteFromClipboard}>붙여넣기</ContextMenuItem>
                      <ContextMenuItem onClick={rotateSelectedElement}>회전</ContextMenuItem>
                      <ContextMenuSeparator />
                      {selectedBubbleId && (
                        <>
                          <ContextMenuItem onClick={groupSelectedBubbleWithAbove}>
                            그룹으로 묶기
                          </ContextMenuItem>
                          <ContextMenuItem onClick={ungroupSelectedBubble}>
                            그룹 해제
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                        </>
                      )}
                      <ContextMenuItem onClick={toggleLockSelectedElement}>
                        {selectedCharId
                          ? activePage.characters.find((c) => c.id === selectedCharId)?.locked
                            ? "잠금 해제"
                            : "잠금"
                          : selectedBubbleId
                          ? activePage.bubbles.find((b) => b.id === selectedBubbleId)?.locked
                            ? "잠금 해제"
                            : "잠금"
                          : "잠금"}
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={deleteSelectedElement} className="text-red-500">
                        삭제
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                    </>
                  )}
                  <ContextMenuLabel>Page {i + 1}</ContextMenuLabel>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => duplicatePage(i)}><Copy className="mr-2 h-4 w-4" /> Duplicate Page</ContextMenuItem>
                  <ContextMenuItem onClick={() => deletePage(i)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete Page</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}

            <Button variant="outline" className="h-24 w-full max-w-[500px] border-dashed" onClick={addPage}>
              <FilePlus className="mr-2 h-6 w-6 text-muted-foreground/70" />
              <span className="text-muted-foreground">Add New Page</span>
            </Button>
          </div>
        </div>

        {/* Right Panel — Properties (top) + Layers (bottom) */}
        <div className="h-full w-[300px] shrink-0 bg-card border-l" data-testid="bubble-right-panel">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={55} minSize={20}>
              <ElementPropertiesPanel
                selectedBubble={selectedBubble ?? null}
                selectedChar={selectedChar ?? null}
                selectedText={null}
                selectedLine={null}
                onUpdateBubble={(id, updates) => updateBubble(id, updates)}
                onUpdateChar={(id, updates) => {
                  updateActivePage({
                    characters: activePage.characters.map(c => c.id === id ? { ...c, ...updates } : c),
                  });
                }}
                onDeleteBubble={(id) => {
                  updateActivePage({ bubbles: activePage.bubbles.filter(b => b.id !== id) });
                  if (selectedBubbleId === id) setSelectedBubbleId(null);
                }}
                onDeleteChar={(id) => {
                  updateActivePage({ characters: activePage.characters.filter(c => c.id !== id) });
                  if (selectedCharId === id) setSelectedCharId(null);
                }}
                onFlipTailHorizontally={handleFlipTailHorizontally}
                onRemoveBackground={handleRemoveBackground}
                removingBg={removingBg}
                isPro={isPro}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={45} minSize={20}>
              <div className="h-full flex flex-col">
                {/* Add buttons */}
                <div className="p-2 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-center gap-1 h-7 text-[13px] bg-muted/40 hover:bg-muted/60"
                      onClick={() => guard(() => addBubble())}
                    >
                      <MessageCircle className="h-3 w-3" />
                      말풍선
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-center gap-1 h-7 text-[13px] bg-muted/40 hover:bg-muted/60"
                      onClick={() => guard(() => setShowGalleryPicker(true))}
                    >
                      <ImagePlus className="h-3 w-3" />
                      캐릭터
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 justify-center gap-1 h-7 text-[13px] bg-muted/40 hover:bg-muted/60"
                      onClick={() => guard(() => setShowTemplatePicker(true))}
                    >
                      <Type className="h-3 w-3" />
                      템플릿
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <LayerListPanel
                    items={layerItems as LayerItem[]}
                    selectedCharId={selectedCharId}
                    selectedBubbleId={selectedBubbleId}
                    onSelectChar={setSelectedCharId}
                    onSelectBubble={setSelectedBubbleId}
                    onMoveLayer={moveLayer}
                    onDeleteLayer={(item) => {
                      if (item.type === "char") {
                        updateActivePage({ characters: activePage.characters.filter(c => c.id !== item.id) });
                        if (selectedCharId === item.id) setSelectedCharId(null);
                      } else {
                        updateActivePage({ bubbles: activePage.bubbles.filter(b => b.id !== item.id) });
                        if (selectedBubbleId === item.id) setSelectedBubbleId(null);
                      }
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Gallery Picker Dialog */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>캐릭터 불러오기</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-3 gap-4 overflow-y-auto sm:grid-cols-4">
                {galleryItems?.map((item: any) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer overflow-hidden rounded-lg border bg-card transition hover:ring-2 hover:ring-primary"
                onClick={() => {
                  // Assuming helper function from original file is adapted inline or we use logic here
                  // For brevity, using inline simplified logic
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.src = item.resultImageUrl;
                  img.onload = () => {
                    const newChar = {
                      id: generateId(), imageUrl: item.resultImageUrl, imgElement: img,
                      x: 100, y: 100, width: 200, height: 200, originalWidth: img.width, originalHeight: img.height,
                      label: item.prompt || "Character", zIndex: 10
                    };
                    updateActivePage({ characters: [...activePage.characters, newChar] });
                    setShowGalleryPicker(false);
                  };
                }}
              >
                <img src={item.resultImageUrl} alt="Gallery" className="aspect-square h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Picker */}
      <Dialog open={showTemplatePicker} onOpenChange={setShowTemplatePicker}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>말풍선 템플릿</DialogTitle></DialogHeader>
          <div className="flex gap-2">
            {BUBBLE_TEMPLATE_CATEGORIES.map((cat, i) => (
              <Button key={i} variant={templateCategoryIdx === i ? "default" : "outline"} onClick={() => setTemplateCategoryIdx(i)} size="sm">
                {cat.label}
              </Button>
            ))}
          </div>
          <div className="grid max-h-[60vh] grid-cols-4 gap-4 overflow-y-auto">
            {BUBBLE_TEMPLATE_CATEGORIES[templateCategoryIdx].ids.map(id => (
              <div key={id} className="cursor-pointer rounded border bg-card p-2 hover:bg-muted" onClick={() => {
                // Logic to add template bubble
                const path = bubblePath(id);
                const img = new Image(); img.src = path;
                img.onload = () => {
                  const newB = {
                    id: generateId(), seed: 0, x: 100, y: 100, width: 200, height: 150,
                    text: "", style: "image" as BubbleStyle, tailStyle: "none" as TailStyle, tailDirection: "bottom" as const,
                    strokeWidth: 0, wobble: 0, fontSize: 16, fontKey: "default", templateSrc: path, templateImg: img, zIndex: 10
                  };
                  updateActivePage({ bubbles: [...activePage.bubbles, newB] });
                  setShowTemplatePicker(false);
                };
              }}>
                <img src={bubblePath(id)} className="h-24 w-full object-contain" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-base">말풍선 프로젝트 저장</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="프로젝트 이름"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Select
              value={selectedFolderId ? String(selectedFolderId) : "none"}
              onValueChange={(v) => setSelectedFolderId(v === "none" ? null : Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="폴더 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">폴더 없음</SelectItem>
                {projectFolders.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showNewFolderInput ? (
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="새 폴더 이름"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFolderName.trim()) {
                      setCreatingFolder(true);
                      createFolderMutation.mutate(newFolderName.trim());
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="h-[3.125rem] px-3 text-[13px] shrink-0"
                  disabled={creatingFolder || !newFolderName.trim()}
                  onClick={() => {
                    setCreatingFolder(true);
                    createFolderMutation.mutate(newFolderName.trim());
                  }}
                >
                  {creatingFolder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "추가"}
                </Button>
                <Button variant="ghost" className="h-9 w-9 p-0 shrink-0" onClick={() => { setShowNewFolderInput(false); setNewFolderName(""); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => setShowNewFolderInput(true)}
              >
                <FolderPlus className="h-3.5 w-3.5" />
                새 폴더 만들기
              </Button>
            )}
            <Button
              className="w-full gap-1.5"
              disabled={savingProject || !projectName.trim()}
              onClick={async () => {
                if (!projectName.trim()) return;
                setSavingProject(true);
                try {
                  const saveData = {
                    pages: pages.map(p => ({
                      ...p,
                      bubbles: p.bubbles.map(b => ({ ...b, templateImg: undefined })),
                      characters: p.characters.map(c => ({ ...c, imgElement: undefined })),
                      imageElement: undefined,
                    })),
                    version: 2,
                  };
                  const canvasData = JSON.stringify(saveData);
                  if (currentProjectId) {
                    await apiRequest("PATCH", `/api/bubble-projects/${currentProjectId}`, {
                      name: projectName.trim(),
                      canvasData,
                      folderId: selectedFolderId,
                    });
                  } else {
                    const res = await apiRequest("POST", "/api/bubble-projects", {
                      name: projectName.trim(),
                      canvasData,
                      editorType: "bubble",
                      folderId: selectedFolderId,
                    });
                    const newProject = await res.json();
                    setCurrentProjectId(newProject.id);
                  }
                  queryClient.invalidateQueries({ queryKey: ["/api/bubble-projects"] });
                  toast({ title: "저장 완료", description: "프로젝트가 저장되었습니다." });
                  setShowSaveModal(false);
                } catch (e: any) {
                  toast({ title: "저장 실패", description: e.message || "프로젝트를 저장할 수 없습니다.", variant: "destructive" });
                } finally {
                  setSavingProject(false);
                }
              }}
            >
              {savingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {currentProjectId ? "업데이트" : "저장하기"}
            </Button>
            {currentProjectId && (
              <p className="text-[13px] text-muted-foreground text-center">
                기존 프로젝트를 덮어씁니다
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      <LeaveEditorDialog open={showLeaveDialog} onConfirm={confirmLeave} onCancel={cancelLeave} />
    </div>
  );
}
