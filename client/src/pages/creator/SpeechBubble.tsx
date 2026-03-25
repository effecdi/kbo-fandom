import { DashboardLayout } from "@/components/DashboardLayout";
import BubblePage from "../bubble";

export function SpeechBubble() {
  return (
    <DashboardLayout noPadding>
      <div className="fixed inset-0 top-[72px] left-60 z-0">
        <BubblePage />
      </div>
    </DashboardLayout>
  );
}
