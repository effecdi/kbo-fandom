import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Image, BookOpen, Upload } from "lucide-react";
import type { Generation, BubbleProject } from "@shared/schema";

interface PublishToFeedDialogProps {
  children: React.ReactNode;
}

export function PublishToFeedDialog({ children }: PublishToFeedDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"image" | "project">("image");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gallery } = useQuery<Generation[]>({
    queryKey: ["/api/gallery"],
    enabled: open && tab === "image",
  });

  const { data: projects } = useQuery<BubbleProject[]>({
    queryKey: ["/api/bubble-projects"],
    enabled: open && tab === "project",
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("Please select a source");
      const res = await apiRequest("POST", "/api/feed", {
        type: tab,
        title: title.trim(),
        description: description.trim() || undefined,
        sourceId: selectedId,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Published!", description: "Your post is now live on the feed." });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Publish Failed", description: error.message, variant: "destructive" });
    },
  });

  function resetForm() {
    setSelectedId(null);
    setTitle("");
    setDescription("");
    setTab("image");
  }

  const items = tab === "image" ? (gallery || []) : (projects || []);
  const canPublish = selectedId && title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish to Feed</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as "image" | "project"); setSelectedId(null); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image" className="gap-1.5">
              <Image className="h-4 w-4" />
              Gallery Images
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              Story Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-4">
            {gallery && gallery.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No images in gallery</p>
            )}
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {(gallery || []).map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setSelectedId(gen.id)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedId === gen.id ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <img
                    src={gen.thumbnailUrl || gen.resultImageUrl}
                    alt={gen.prompt}
                    className="h-full w-full object-cover"
                  />
                  {selectedId === gen.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="project" className="mt-4">
            {projects && projects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No projects available</p>
            )}
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {(projects || []).map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => setSelectedId(proj.id)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedId === proj.id ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  {proj.thumbnailUrl ? (
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-[13px]">
                      {proj.name}
                    </div>
                  )}
                  {selectedId === proj.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-3 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="feed-title">Title *</Label>
            <Input
              id="feed-title"
              placeholder="Enter a title for your post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="feed-desc">Description (optional)</Label>
            <Input
              id="feed-desc"
              placeholder="Add a short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>

        <Button
          className="w-full mt-4 gap-1.5"
          onClick={() => publishMutation.mutate()}
          disabled={!canPublish || publishMutation.isPending}
        >
          <Upload className="h-4 w-4" />
          {publishMutation.isPending ? "Publishing..." : "Publish"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
