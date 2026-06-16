"use client";

import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useApi";
import { useChatPreferences } from "@/hooks/useChatPreferences";
import { Conversation } from "@/lib/api";

interface SidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-transparent">
          <div className="w-11 h-11 rounded-full bg-neutral-200 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 py-1">
            <div className="flex justify-between items-baseline mb-2">
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-24" />
              <div className="h-3 bg-neutral-200 rounded animate-pulse w-8" />
            </div>
            <div className="h-3 bg-neutral-200 rounded animate-pulse w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ showArchived }: { showArchived: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-64 animate-in fade-in duration-300">
      <div className="p-4 bg-neutral-100 rounded-full mb-3 text-neutral-400">
        <svg
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-neutral-700">
        Nenhuma conversa
      </h3>
      <p className="text-xs text-neutral-400 mt-1 max-w-[220px]">
        {showArchived
          ? "Você não tem nenhuma conversa arquivada no momento."
          : "Nenhuma conversa ativa encontrada."}
      </p>
    </div>
  );
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const { data: conversations, isLoading } = useConversations();
  const { deletedIds, pinnedIds, archivedIds, toggleAction } =
    useChatPreferences();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    setActiveMenuId(null);
  }, [showArchived, search]);

  let visibleChats =
    conversations?.filter((c) => {
      if (deletedIds.includes(c.id)) return false;
      if (showArchived) return archivedIds.includes(c.id);
      return !archivedIds.includes(c.id);
    }) || [];

  const totalActive =
    conversations?.filter(
      (c) => !deletedIds.includes(c.id) && !archivedIds.includes(c.id),
    ).length || 0;
  const totalArchived =
    conversations?.filter(
      (c) => !deletedIds.includes(c.id) && archivedIds.includes(c.id),
    ).length || 0;

  visibleChats = visibleChats.filter(
    (c) =>
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPhone.toLowerCase().includes(search.toLowerCase()),
  );

  visibleChats.sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta conversa? Essa ação é local.",
      )
    ) {
      toggleAction(id, "delete");
      if (activeId === id) onSelect("");
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-[350px] border-r border-neutral-200 bg-white flex flex-col h-full select-none relative">
      {/* Backdrop transparente para fechar dropdowns abertos */}
      {activeMenuId && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setActiveMenuId(null)}
        />
      )}

      <div className="p-4 pb-3 border-b border-neutral-100 flex flex-col gap-3.5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-800 tracking-tight">
            Mensagens
          </h2>
        </div>

        <div className="bg-neutral-100 p-0.5 rounded-lg flex items-center text-xs font-semibold text-neutral-500">
          <button
            onClick={() => setShowArchived(false)}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 ${
              !showArchived
                ? "bg-white text-neutral-800 shadow-xs"
                : "hover:text-neutral-700"
            }`}
          >
            <span>Ativas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
                !showArchived
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "bg-neutral-200/60 text-neutral-500"
              }`}
            >
              {totalActive}
            </span>
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 ${
              showArchived
                ? "bg-white text-neutral-800 shadow-xs"
                : "hover:text-neutral-700"
            }`}
          >
            <span>Arquivadas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] transition-colors ${
                showArchived
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "bg-neutral-200/60 text-neutral-500"
              }`}
            >
              {totalArchived}
            </span>
          </button>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-3 text-neutral-400 pointer-events-none">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
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
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading && <SidebarSkeleton />}

        {!isLoading && visibleChats.length === 0 && (
          <EmptyState showArchived={showArchived} />
        )}

        {!isLoading && visibleChats.length > 0 && (
          <div className="flex flex-col gap-1.5 p-2">
            {visibleChats.map((chat: Conversation) => {
              const isSelected = activeId === chat.id;
              const isPinned = pinnedIds.includes(chat.id);
              const isUnread = chat.unread > 0;

              let isFilePreview = false;
              let isImagePreview = false;

              if (chat.lastMessage && chat.lastMessage.startsWith('{"type":"file"')) {
                try {
                  const fileData = JSON.parse(chat.lastMessage);
                  isFilePreview = fileData.type === "file";
                  isImagePreview = isFilePreview && fileData.fileType.startsWith("image/");
                } catch {}
              }

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelect(chat.id)}
                  className={`group relative w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-3 border ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-100/80 hover:bg-blue-50/70 shadow-xs"
                      : "bg-white border-transparent hover:bg-neutral-50/80"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-lg bg-blue-600 transition-all duration-200 origin-left ${
                      isSelected
                        ? "scale-y-100 opacity-100"
                        : "scale-y-0 opacity-0"
                    }`}
                  />

                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-inner text-sm relative"
                    style={{ backgroundColor: chat.avatarColor || "#9ca3af" }}
                  >
                    {chat.contactName.charAt(0).toUpperCase()}

                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 border-2 border-white rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1 gap-1.5">
                      <h3
                        className={`text-sm truncate transition-colors ${
                          isSelected ? "text-blue-900" : "text-neutral-800"
                        } ${isUnread ? "font-bold text-neutral-900" : "font-semibold"}`}
                      >
                        {chat.contactName}
                      </h3>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isPinned && (
                          <span
                            className="text-blue-500"
                            title="Conversa Fixada"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 5h14l-4 4v6l-2 2v3l-1-1-1 1v-3l-2-2V9L5 5z"
                              />
                            </svg>
                          </span>
                        )}
                        <span
                          className={`text-[11px] ${
                            isUnread
                              ? "text-blue-600 font-semibold"
                              : "text-neutral-400"
                          }`}
                        >
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <div
                        className={`text-xs truncate flex items-center gap-1 flex-1 ${
                          isUnread
                            ? "text-neutral-950 font-bold"
                            : "text-neutral-500"
                        }`}
                      >
                        {isImagePreview ? (
                          <>
                            <span className="text-blue-500 shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </span>
                            <span>Imagem</span>
                          </>
                        ) : isFilePreview ? (
                          <>
                            <span className="text-neutral-400 shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414M18 10.5V6a2 2 0 00-2-2h-4.5m4.5 4.5H16" />
                              </svg>
                            </span>
                            <span>Arquivo</span>
                          </>
                        ) : (
                          <span>{chat.lastMessage || "Nenhuma mensagem"}</span>
                        )}
                      </div>

                      {isUnread && (
                        <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 relative z-40">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === chat.id ? null : chat.id,
                        );
                      }}
                      className={`p-1 rounded-lg text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-700 transition-all ${
                        activeMenuId === chat.id
                          ? "opacity-100 bg-neutral-200/50 text-neutral-700"
                          : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      }`}
                      title="Opções"
                    >
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>

                    {activeMenuId === chat.id && (
                      <div
                        className="absolute right-0 top-7 w-44 bg-white rounded-xl shadow-lg border border-neutral-100 py-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAction(chat.id, "pin");
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 5h14l-4 4v6l-2 2v3l-1-1-1 1v-3l-2-2V9L5 5z"
                            />
                          </svg>
                          <span>{isPinned ? "Desafixar" : "Fixar"}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAction(chat.id, "archive");
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {showArchived ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10v6a2 2 0 002 2h14a2 2 0 002-2v-6M3 10a2 2 0 012-2h14a2 2 0 012 2"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            )}
                          </svg>
                          <span>
                            {showArchived ? "Desarquivar" : "Arquivar"}
                          </span>
                        </button>

                        <hr className="border-neutral-100 my-1" />

                        <button
                          onClick={(e) => handleDeleteClick(e, chat.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
