import { DashboardLayout } from "@/components/DashboardLayout";
import EffectsPage from "../effects";

export function BlurEffects() {
  return (
    <DashboardLayout userType="creator" noPadding>
      <EffectsPage />
    </DashboardLayout>
  );
}
