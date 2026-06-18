"use client";

import { MessageSquare, Users, CheckCircle2 } from "lucide-react";

interface SidebarMobileNavProps {
  activeTab: "active" | "unassigned" | "finished" | "profile";
  setActiveTab: (tab: "active" | "unassigned" | "finished" | "profile") => void;
  meName?: string;
}

export function SidebarMobileNav({
  activeTab,
  setActiveTab,
  meName,
}: SidebarMobileNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-neutral-200 z-45 flex items-center justify-around px-2 pointer-events-auto shadow-lg animate-in slide-in-from-bottom duration-200"
      role="tablist"
      aria-label="Navegação móvel"
    >
      <button
        onClick={() => setActiveTab("active")}
        role="tab"
        aria-selected={activeTab === "active"}
        aria-label="Chats Ativos"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
          activeTab === "active" ? "text-blue-600 font-bold" : "text-neutral-400"
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[9px] mt-0.5">Ativas</span>
      </button>

      <button
        onClick={() => setActiveTab("unassigned")}
        role="tab"
        aria-selected={activeTab === "unassigned"}
        aria-label="Chats Não Atribuídos"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
          activeTab === "unassigned" ? "text-blue-600 font-bold" : "text-neutral-400"
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[9px] mt-0.5">Não Atrib.</span>
      </button>

      <button
        onClick={() => setActiveTab("finished")}
        role="tab"
        aria-selected={activeTab === "finished"}
        aria-label="Chats Finalizados"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
          activeTab === "finished" ? "text-blue-600 font-bold" : "text-neutral-400"
        }`}
      >
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-[9px] mt-0.5">Finalizadas</span>
      </button>

      <button
        onClick={() => setActiveTab("profile")}
        role="tab"
        aria-selected={activeTab === "profile"}
        aria-label="Configurações e Perfil"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
          activeTab === "profile" ? "text-blue-600 font-bold" : "text-neutral-400"
        }`}
      >
        <div
          className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-inner transition-colors ${
            activeTab === "profile" ? "bg-blue-600 ring-2 ring-blue-500/20" : "bg-neutral-400"
          }`}
        >
          {meName?.charAt(0).toUpperCase() || "A"}
        </div>
        <span className="text-[9px] mt-0.5">Perfil</span>
      </button>
    </nav>
  );
}
