"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Info as InfoIcon, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: any) => {
      const { message, type } = e.detail;
      const id = String(Math.random());
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener("myde_toast" as any, handleToast);
    return () => window.removeEventListener("myde_toast" as any, handleToast);
  }, []);

  return (
    <div className="fixed top-3 left-3 right-3 md:top-4 md:right-4 md:left-auto z-50 flex flex-col gap-2.5 md:max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : t.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          <span className="shrink-0 mt-0.5">
            {t.type === "success" && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />}
            {t.type === "error" && <AlertCircle className="w-4.5 h-4.5 text-red-500" />}
            {t.type === "info" && <InfoIcon className="w-4.5 h-4.5 text-blue-500" />}
          </span>
          <p className="text-xs font-semibold flex-1 leading-relaxed">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
            className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

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
      <ToastContainer />
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
