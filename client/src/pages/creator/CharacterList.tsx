import { DashboardLayout } from "@/components/DashboardLayout";
import GalleryPage from "../gallery";

export function CharacterList() {
  return (
    <DashboardLayout userType="creator" noPadding>
      <GalleryPage />
    </DashboardLayout>
  );
}
