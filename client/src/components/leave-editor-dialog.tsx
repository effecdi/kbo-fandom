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
      <DialogContent className="max-w-xs">
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <TriangleAlert className="h-10 w-10 text-amber-500" />
          <h3 className="text-lg font-bold">현재 편집중이에요!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            이대로 나가면 편집중인 화면이 사라져요 😢
          </p>
          <div className="flex gap-2 w-full mt-2">
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
