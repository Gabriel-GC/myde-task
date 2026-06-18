"use client";

import { MessageSquare } from "lucide-react";

interface SidebarEmptyStateProps {
  activeTab: "active" | "unassigned" | "finished" | "profile";
}

export function SidebarEmptyState({ activeTab }: SidebarEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-64 animate-in fade-in duration-300 select-none">
      <div className="p-4 bg-neutral-100 rounded-full mb-3 text-neutral-400">
        <MessageSquare className="w-10 h-10" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-neutral-700">
        Nenhuma conversa
      </h3>
      <p className="text-xs text-neutral-400 mt-1 max-w-[220px]">
        {activeTab === "unassigned"
          ? "Nenhuma conversa pendente para atribuição."
          : activeTab === "finished"
          ? "Você não tem nenhuma conversa finalizada."
          : "Nenhuma conversa ativa encontrada."}
      </p>
    </div>
  );
}
