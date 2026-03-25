import { DashboardLayout } from "@/components/DashboardLayout";
import StoryPage from "../story";

export function StoryEditor() {
  return (
    <DashboardLayout noPadding>
      <div className="fixed inset-0 top-[72px] left-60 z-0">
        <StoryPage />
      </div>
    </DashboardLayout>
  );
}
