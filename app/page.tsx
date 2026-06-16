"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { Suspense } from "react";

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
              className="md:hidden absolute top-[18px] left-2.5 z-10 p-2 bg-white rounded-full shadow-md text-neutral-600 border border-neutral-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
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
