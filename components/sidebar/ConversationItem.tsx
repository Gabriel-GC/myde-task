"use client";

import React from "react";
import { Conversation } from "@/lib/api";
import {
  Pin,
  MoreVertical,
  CheckCircle2,
  UserPlus,
  ArchiveRestore,
  Camera,
  Paperclip,
  Ban,
} from "lucide-react";

interface ConversationItemProps {
  chat: Conversation;
  isSelected: boolean;
  isPinned: boolean;
  activeTab: "active" | "unassigned" | "finished" | "profile";
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onSelect: (id: string) => void;
  toggleAction: (id: string, type: "delete" | "pin" | "archive") => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  meName?: string;
}

export function ConversationItem({
  chat,
  isSelected,
  isPinned,
  activeTab,
  activeMenuId,
  setActiveMenuId,
  onSelect,
  toggleAction,
  showToast,
  meName,
}: ConversationItemProps) {
  const isUnread = chat.unread > 0;
  const isMenuOpen = activeMenuId === chat.id;

  const getLastMessageText = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`myde_last_edited_${chat.id}`);
      if (stored) {
        try {
          const { editedText, originalText } = JSON.parse(stored);
          if (chat.lastMessage === originalText) {
            return editedText;
          }
        } catch {}
      }
    }
    return chat.lastMessage || "Nenhuma mensagem";
  };

  const lastMsgText = getLastMessageText();

  let isFilePreview = false;
  let isImagePreview = false;

  if (lastMsgText && lastMsgText.startsWith('{"type":"file"')) {
    try {
      const fileData = JSON.parse(lastMsgText);
      isFilePreview = fileData.type === "file";
      isImagePreview = isFilePreview && fileData.fileType.startsWith("image/");
    } catch {}
  }

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

  const isBlocked =
    typeof window !== "undefined" &&
    localStorage.getItem(`myde_blocked_${chat.id}`) === "true";

  return (
    <div
      onClick={() => onSelect(chat.id)}
      className={`group relative w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-3 border ${
        isSelected
          ? "bg-blue-50/70 border-blue-100/80 hover:bg-blue-50/70 shadow-xs"
          : "bg-white border-transparent hover:bg-neutral-50/80"
      }`}
    >
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-lg bg-blue-600 transition-all duration-200 origin-left ${
          isSelected ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      />

      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-inner text-sm relative select-none"
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

          <div className="flex items-center gap-1.5 shrink-0 select-none">
            {isBlocked && (
              <span className="text-red-500" title="Contato Bloqueado">
                <Ban className="w-3.5 h-3.5" />
              </span>
            )}
            {isPinned && (
              <span className="text-blue-500" title="Conversa Fixada">
                <Pin className="w-3.5 h-3.5" />
              </span>
            )}
            <span
              className={`text-[11px] ${
                isUnread ? "text-blue-600 font-semibold" : "text-neutral-400"
              }`}
            >
              {formatTime(chat.lastMessageAt)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div
            className={`text-xs flex items-center gap-1 flex-1 min-w-0 ${
              isUnread ? "text-neutral-950 font-bold" : "text-neutral-500"
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
              <span className="truncate">{lastMsgText}</span>
            )}
          </div>

          {activeTab === "unassigned" ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem(`myde_chat_status_${chat.id}`, "active");
                localStorage.removeItem(`myde_chat_finished_info_${chat.id}`);
                window.dispatchEvent(new Event("myde_settings_changed"));
                showToast("Conversa atribuída a você!", "success");
              }}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer text-center"
            >
              Atribuir
            </button>
          ) : (
            isUnread && (
              <span className="min-w-4.5 h-4.5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-xs">
                {chat.unread}
              </span>
            )
          )}
        </div>
      </div>

      <div className="shrink-0 relative z-40">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuId(isMenuOpen ? null : chat.id);
          }}
          className={`p-1 rounded-lg text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-700 transition-all ${
            isMenuOpen
              ? "opacity-100 bg-neutral-200/50 text-neutral-700"
              : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          }`}
          title="Opções"
        >
          <MoreVertical className="w-4.5 h-4.5" strokeWidth={2.5} />
        </button>

        {isMenuOpen && (
          <div
            className="absolute right-0 max-md:right-[24px] max-md:top-[15px] top-7 w-44 bg-white rounded-xl shadow-lg border border-neutral-100 py-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
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

            {activeTab === "active" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem(`myde_chat_status_${chat.id}`, "finished");
                  const finishedAt = new Date().toISOString();
                  const finishedBy = meName || "Atendente myde";
                  localStorage.setItem(
                    `myde_chat_finished_info_${chat.id}`,
                    JSON.stringify({ finishedAt, finishedBy })
                  );
                  window.dispatchEvent(new Event("myde_settings_changed"));
                  showToast("Atendimento finalizado!", "success");
                  setActiveMenuId(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
                <span>Finalizar Atendimento</span>
              </button>
            )}

            {activeTab === "unassigned" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem(`myde_chat_status_${chat.id}`, "active");
                  localStorage.removeItem(`myde_chat_finished_info_${chat.id}`);
                  window.dispatchEvent(new Event("myde_settings_changed"));
                  showToast("Atendimento atribuído a você!", "success");
                  setActiveMenuId(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
                <span>Atribuir a mim</span>
              </button>
            )}

            {activeTab === "finished" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem(`myde_chat_status_${chat.id}`, "active");
                  localStorage.removeItem(`myde_chat_finished_info_${chat.id}`);
                  window.dispatchEvent(new Event("myde_settings_changed"));
                  showToast("Atendimento reaberto!", "success");
                  setActiveMenuId(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <ArchiveRestore className="w-3.5 h-3.5 text-neutral-400" strokeWidth={2} />
                <span>Reabrir Atendimento</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
