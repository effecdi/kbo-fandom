import { DashboardLayout } from "@/components/DashboardLayout";
import DashboardPage from "./dashboard";

export function CreatorDashboard() {
  return (
    <DashboardLayout userType="creator" noPadding>
      <DashboardPage />
    </DashboardLayout>
  );
}
