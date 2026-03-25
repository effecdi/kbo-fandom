import { DashboardLayout } from "@/components/DashboardLayout";
import ChatPage from "../chat";

export function ChatMaker() {
  return (
    <DashboardLayout noPadding>
      <ChatPage />
    </DashboardLayout>
  );
}
