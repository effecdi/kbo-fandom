import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

interface LeaveEditorDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LeaveEditorDialog({ open, onConfirm, onCancel }: LeaveEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-xs p-0 overflow-hidden gap-0">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-6 pt-7 pb-5 text-white text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <TriangleAlert className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-bold">현재 편집중이에요!</h3>
        </div>
        <div className="px-6 pt-5 pb-6 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            이대로 나가면 편집중인 화면이 사라져요 😢
          </p>
          <div className="flex gap-2 mt-5">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              계속 편집하기
            </Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm}>
              나가기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
