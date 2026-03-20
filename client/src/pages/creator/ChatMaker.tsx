import { DashboardLayout } from "@/components/DashboardLayout";
import ChatPage from "../chat";

export function ChatMaker() {
  return (
    <DashboardLayout userType="creator" noPadding>
      <ChatPage />
    </DashboardLayout>
  );
}
