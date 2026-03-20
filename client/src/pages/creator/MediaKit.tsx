import { DashboardLayout } from "@/components/DashboardLayout";
import MediaKitPage from "../media-kit";

export function MediaKit() {
  return (
    <DashboardLayout userType="creator" noPadding>
      <MediaKitPage />
    </DashboardLayout>
  );
}
