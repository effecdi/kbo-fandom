import { DashboardLayout } from "@/components/DashboardLayout";
import EditsPage from "../edits";

export function Contents() {
  return (
    <DashboardLayout userType="creator" noPadding>
      <EditsPage />
    </DashboardLayout>
  );
}
