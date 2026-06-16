"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/useApi";
import { Conversation } from "@/lib/api";

interface SidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const { data: conversations, isLoading, isError } = useConversations();
  const [search, setSearch] = useState("");

  const filtered =
    conversations?.filter((c) =>
      c.contactName.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  return (
    <aside className="w-full md:w-80 border-r border-neutral-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-xl font-semibold mb-4 text-neutral-800">
          Mensagens
        </h2>
        <input
          type="text"
          placeholder="Buscar contato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-neutral-500 text-sm">
            Carregando...
          </div>
        )}
        {isError && (
          <div className="p-4 text-center text-red-500 text-sm">
            Erro ao carregar contatos.
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="p-4 text-center text-neutral-500 text-sm">
            Nenhuma conversa encontrada.
          </div>
        )}

        {filtered.map((chat: Conversation) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={`w-full text-left p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors flex items-center gap-3 ${
              activeId === chat.id ? "bg-blue-50 hover:bg-blue-50" : ""
            }`}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium shrink-0"
              style={{ backgroundColor: chat.avatarColor || "#ccc" }}
            >
              {chat.contactName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-neutral-900 truncate">
                  {chat.contactName}
                </h3>
                <span className="text-xs text-neutral-500">
                  {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-neutral-600 truncate">
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
