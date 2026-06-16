"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

function DashboardView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeChatId = searchParams.get("chat");

  const handleSelectChat = (id: string) => {
    router.push(`/?chat=${id}`);
  };

  return (
    <main className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <div className={`${activeChatId ? "hidden md:flex" : "flex w-full"} md:w-auto h-full`}>
        <Sidebar activeId={activeChatId} onSelect={handleSelectChat} />
      </div>

      <div
        className={`${activeChatId ? "flex" : "hidden md:flex"} flex-1 h-full`}
      >
        {activeChatId ? (
          <div className="w-full flex flex-col relative">
            <button
              onClick={() => router.push("/")}
              className="md:hidden absolute top-4 left-2.5 z-10 p-2 bg-white rounded-full shadow-md text-neutral-600 border border-neutral-100 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <ChatArea conversationId={activeChatId} />
          </div>
        ) : (
          <ChatArea conversationId="" />
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Carregando painel...
        </div>
      }
    >
      <DashboardView />
    </Suspense>
  );
}
