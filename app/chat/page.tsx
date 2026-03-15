import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import ChatInterface from "@/components/ChatInterface";

export const metadata: Metadata = { title: "Ask AI" };

export default async function ChatPage() {
  await requireAuth();

  return (
    <div className="fixed inset-0 flex flex-col" style={{ top: "64px" }}>
      <ChatInterface />
    </div>
  );
}
