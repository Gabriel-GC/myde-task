"use client";

import { MessageSquare, Users, CheckCircle2 } from "lucide-react";

interface SidebarNavigationProps {
  activeTab: "active" | "unassigned" | "finished" | "profile";
  setActiveTab: (tab: "active" | "unassigned" | "finished" | "profile") => void;
  meName?: string;
}

export function SidebarNavigation({
  activeTab,
  setActiveTab,
  meName,
}: SidebarNavigationProps) {
  return (
    <aside className="hidden md:flex w-14 bg-neutral-50 flex-col items-center justify-between py-5 shrink-0 border-r border-neutral-200 text-neutral-400">
      <div className="flex flex-col gap-6 items-center w-full" role="tablist" aria-orientation="vertical">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs mb-3 shadow-xs select-none">
          M
        </div>

        <button
          onClick={() => setActiveTab("active")}
          role="tab"
          aria-selected={activeTab === "active"}
          aria-label="Conversas Ativas"
          className={`p-2.5 rounded-lg transition-all cursor-pointer relative group ${
            activeTab === "active"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          }`}
          title="Conversas Ativas"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
            Conversas Ativas
          </span>
        </button>

        <button
          onClick={() => setActiveTab("unassigned")}
          role="tab"
          aria-selected={activeTab === "unassigned"}
          aria-label="Conversas Não Atribuídas"
          className={`p-2.5 rounded-lg transition-all cursor-pointer relative group ${
            activeTab === "unassigned"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          }`}
          title="Não Atribuídas"
        >
          <Users className="w-4.5 h-4.5" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
            Não Atribuídas
          </span>
        </button>

        <button
          onClick={() => setActiveTab("finished")}
          role="tab"
          aria-selected={activeTab === "finished"}
          aria-label="Conversas Finalizadas"
          className={`p-2.5 rounded-lg transition-all cursor-pointer relative group ${
            activeTab === "finished"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          }`}
          title="Finalizadas"
        >
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
            Finalizadas
          </span>
        </button>
      </div>

      <button
        onClick={() => setActiveTab("profile")}
        role="tab"
        aria-selected={activeTab === "profile"}
        aria-label="Configurações e Perfil"
        className={`p-0.5 rounded-full border transition-all cursor-pointer relative group ${
          activeTab === "profile"
            ? "border-blue-500 ring-2 ring-blue-500/10"
            : "border-transparent hover:border-neutral-300"
        }`}
        title="Meu Perfil"
      >
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-inner">
          {meName?.charAt(0).toUpperCase() || "A"}
        </div>
        <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
          Meu Perfil
        </span>
      </button>
    </aside>
  );
}
