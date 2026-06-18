"use client";

import React, { useState } from "react";
import { Conversation } from "@/lib/api";
import { Search, X } from "lucide-react";
import { SidebarSkeleton } from "./SidebarSkeleton";
import { SidebarEmptyState } from "./SidebarEmptyState";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  conversations?: Conversation[];
  isLoading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  activeTab: "active" | "unassigned" | "finished" | "profile";
  deletedIds: string[];
  pinnedIds: string[];
  toggleAction: (id: string, type: "delete" | "pin" | "archive") => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  meName?: string;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
}

export function ConversationList({
  conversations = [],
  isLoading,
  activeId,
  onSelect,
  activeTab,
  deletedIds,
  pinnedIds,
  toggleAction,
  showToast,
  meName,
  activeMenuId,
  setActiveMenuId,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  let visibleChats = conversations.filter((c) => {
    if (deletedIds.includes(c.id)) return false;
    const status =
      localStorage.getItem(`myde_chat_status_${c.id}`) ||
      (c.id === "c-1003"
        ? "unassigned"
        : c.id === "c-1004"
        ? "finished"
        : "active");
    return status === activeTab;
  });

  if (search.trim()) {
    const query = search.toLowerCase();
    visibleChats = visibleChats.filter(
      (c) =>
        c.contactName.toLowerCase().includes(query) ||
        c.contactPhone.toLowerCase().includes(query)
    );
  }

  visibleChats.sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <>
      <div className="p-4 pb-3 border-b border-neutral-100 flex flex-col gap-3.5">
        <div className="flex justify-between items-center relative">
          <h2 className="text-xl font-bold text-neutral-800 tracking-tight capitalize select-none">
            {activeTab === "active"
              ? "Conversas Ativas"
              : activeTab === "unassigned"
              ? "Não Atribuídas"
              : "Finalizadas"}
          </h2>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-3 text-neutral-400 pointer-events-none select-none">
            <Search className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <input
            type="text"
            placeholder="Buscar contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-100 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 p-0.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors"
              title="Limpar busca"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading && <SidebarSkeleton />}

        {!isLoading && visibleChats.length === 0 && (
          <SidebarEmptyState activeTab={activeTab} />
        )}

        {!isLoading && visibleChats.length > 0 && (
          <div className="flex flex-col gap-1.5 p-2">
            {visibleChats.map((chat) => (
              <ConversationItem
                key={chat.id}
                chat={chat}
                isSelected={activeId === chat.id}
                isPinned={pinnedIds.includes(chat.id)}
                activeTab={activeTab}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onSelect={onSelect}
                toggleAction={toggleAction}
                showToast={showToast}
                meName={meName}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
