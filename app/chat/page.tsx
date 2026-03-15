import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import ChatInterface from "@/components/ChatInterface";

export const metadata: Metadata = { title: "Ask AI" };

export default async function ChatPage() {
  await requireAuth();

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      <ChatInterface />
    </div>
  );
}
