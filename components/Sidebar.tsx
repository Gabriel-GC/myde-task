"use client";

import { useState, useEffect } from "react";
import { useConversations, useMe } from "@/hooks/useApi";
import { useChatPreferences } from "@/hooks/useChatPreferences";
import { Conversation } from "@/lib/api";
import { MessageSquare, Search, X, Pin, Camera, Paperclip, MoreVertical, Archive, ArchiveRestore, Trash2, Settings } from "lucide-react";

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
        <MessageSquare className="w-10 h-10" strokeWidth={1.5} />
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

  const { data: me } = useMe();
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus] = useState<"online" | "away" | "busy">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("myde_agent_status") as any) || "online";
    }
    return "online";
  });
  const [aiEnabled, setAiEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const val = localStorage.getItem("myde_ai_enabled");
      return val !== "false";
    }
    return true;
  });
  const [soundAlerts, setSoundAlerts] = useState(() => {
    if (typeof window !== "undefined") {
      const val = localStorage.getItem("myde_sound_alerts");
      return val !== "false";
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("myde_agent_status", status);
    window.dispatchEvent(new Event("myde_settings_changed"));
  }, [status]);

  useEffect(() => {
    localStorage.setItem("myde_ai_enabled", String(aiEnabled));
    window.dispatchEvent(new Event("myde_settings_changed"));
  }, [aiEnabled]);

  useEffect(() => {
    localStorage.setItem("myde_sound_alerts", String(soundAlerts));
    window.dispatchEvent(new Event("myde_settings_changed"));
  }, [soundAlerts]);

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
      {(activeMenuId || showSettings) && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => {
            setActiveMenuId(null);
            setShowSettings(false);
          }}
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
                            <Pin className="w-3.5 h-3.5" />
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
                        className={`text-xs flex items-center gap-1 flex-1 min-w-0 ${
                          isUnread
                            ? "text-neutral-950 font-bold"
                            : "text-neutral-500"
                        }`}
                      >
                        {isImagePreview ? (
                          <>
                             <Camera className="w-3.5 h-3.5 text-blue-500 shrink-0" strokeWidth={2.5} />
                            <span className="truncate">Imagem</span>
                          </>
                        ) : isFilePreview ? (
                          <>
                             <Paperclip className="w-3.5 h-3.5 text-neutral-400 shrink-0" strokeWidth={2.5} />
                            <span className="truncate">Arquivo</span>
                          </>
                        ) : (
                          <span className="truncate">{chat.lastMessage || "Nenhuma mensagem"}</span>
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
                      <MoreVertical className="w-4.5 h-4.5" strokeWidth={2.5} />
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
                          <Pin className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
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
                          {showArchived ? (
                            <ArchiveRestore className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
                          ) : (
                            <Archive className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
                          )}
                          <span>
                            {showArchived ? "Desarquivar" : "Arquivar"}
                          </span>
                        </button>

                        <hr className="border-neutral-100 my-1" />

                        <button
                          onClick={(e) => handleDeleteClick(e, chat.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />
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

      <div className="border-t border-neutral-200 bg-neutral-50/60 p-3 flex items-center justify-between gap-3 relative shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 select-none">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {me?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                status === "online"
                  ? "bg-green-500"
                  : status === "away"
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-800 truncate leading-tight">
              {me?.name || "Carregando..."}
            </p>
            <p className="text-[10px] text-neutral-500 truncate mt-0.5">
              {me?.role || "Atendente"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-700 transition-all ${
            showSettings ? "bg-neutral-200/50 text-neutral-700" : ""
          }`}
          title="Configurações do Atendente"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {showSettings && (
          <div
            className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white border border-neutral-100 rounded-xl shadow-xl p-3.5 z-50 flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
                Configurações da Conta
              </h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">Atendente Myde Inbox</p>
            </div>

            <hr className="border-neutral-100" />

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-neutral-500">Status de Atendimento</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setStatus("online")}
                  className={`py-1.5 rounded-md text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                    status === "online"
                      ? "bg-green-50 border-green-200 text-green-700 font-bold"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Online
                </button>
                <button
                  onClick={() => setStatus("away")}
                  className={`py-1.5 rounded-md text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                    status === "away"
                      ? "bg-amber-50 border-amber-200 text-amber-700 font-bold"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Ausente
                </button>
                <button
                  onClick={() => setStatus("busy")}
                  className={`py-1.5 rounded-md text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all ${
                    status === "busy"
                      ? "bg-red-50 border-red-200 text-red-700 font-bold"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Ocupado
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-700">Assistente de IA</span>
                <span className="text-[9px] text-neutral-400">Exibir sugestões automáticas</span>
              </div>
              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-200 flex items-center ${
                  aiEnabled ? "bg-blue-600 justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-neutral-700">Notificações Sonoras</span>
                <span className="text-[9px] text-neutral-400">Alertas de novas mensagens</span>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-9 h-5 rounded-full p-0.5 transition-all duration-200 flex items-center ${
                  soundAlerts ? "bg-blue-600 justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <hr className="border-neutral-100" />

            <div className="bg-neutral-50 rounded-lg p-2.5 flex flex-col gap-1.5 text-[9px] text-neutral-500">
              <div className="flex justify-between">
                <span>ID do Agente:</span>
                <span className="font-semibold text-neutral-700">{me?.id || "---"}</span>
              </div>
              <div className="flex justify-between">
                <span>Conexão API:</span>
                <span className="font-semibold text-green-600 flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                  Ativa
                </span>
              </div>
              <div className="flex justify-between">
                <span>Versão do App:</span>
                <span className="font-semibold text-neutral-700">v1.0.0</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
