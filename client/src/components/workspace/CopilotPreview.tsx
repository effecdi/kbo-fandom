import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CopilotMessage } from "@/lib/workspace-types";
import { useWorkspace } from "@/hooks/use-workspace";

interface CopilotPreviewProps {
  message: CopilotMessage;
}

export function CopilotPreview({ message }: CopilotPreviewProps) {
  const { dispatch } = useWorkspace();
  const [fullPreview, setFullPreview] = useState(false);

  if (!message.preview || message.preview.applied) return null;

  return (
    <>
      <div className="mx-3 mt-1 rounded-lg border border-border overflow-hidden bg-muted/50">
        {message.preview.type === "image" && (
          <img
            src={message.preview.data}
            alt="AI 생성 결과"
            className="w-full h-32 object-cover cursor-pointer"
            onClick={() => setFullPreview(true)}
          />
        )}
        <div className="flex items-center gap-1.5 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] gap-1"
            onClick={() => setFullPreview(true)}
          >
            <Eye className="w-3 h-3" />
            미리보기
          </Button>
          <Button
            size="sm"
            className="h-7 text-[10px] gap-1 bg-[#00e5cc] hover:bg-[#00f0ff] text-black"
            onClick={() =>
              dispatch({ type: "COPILOT_APPLY_PREVIEW", messageId: message.id })
            }
          >
            <Check className="w-3 h-3" />
            적용
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] gap-1 text-red-400"
            onClick={() =>
              dispatch({ type: "COPILOT_APPLY_PREVIEW", messageId: message.id })
            }
          >
            <X className="w-3 h-3" />
            폐기
          </Button>
        </div>
      </div>

      {/* Full preview overlay */}
      {fullPreview && message.preview.type === "image" && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setFullPreview(false)}
        >
          <img
            src={message.preview.data}
            alt="미리보기"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setFullPreview(false)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </>
  );
}
