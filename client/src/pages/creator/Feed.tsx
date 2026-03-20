import { DashboardLayout } from "@/components/DashboardLayout";
import FeedPage from "../feed";

export function Feed() {
  return (
    <DashboardLayout userType="creator" noPadding>
      <FeedPage />
    </DashboardLayout>
  );
}
