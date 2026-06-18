"use client";

import React from "react";
import { Conversation } from "@/lib/api";
import {
  Search,
  MoreVertical,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  Ban,
} from "lucide-react";

interface ChatHeaderProps {
  chatInfo?: Conversation;
  chatStatus: string;
  isBlocked: boolean;
  meName?: string;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  showActionsMenu: boolean;
  setShowActionsMenu: (show: boolean) => void;
  setShowTransferModal: (show: boolean) => void;
  handleToggleBlock: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  conversationId: string;
}

export function ChatHeader({
  chatInfo,
  chatStatus,
  isBlocked,
  meName,
  showSearch,
  setShowSearch,
  showActionsMenu,
  setShowActionsMenu,
  setShowTransferModal,
  handleToggleBlock,
  showToast,
  conversationId,
}: ChatHeaderProps) {
  return (
    <div className="bg-white pl-14 pr-4 py-3.5 md:px-6 md:py-4 border-b border-neutral-200 flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3 min-w-0">
        {chatInfo && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shrink-0"
            style={{ backgroundColor: chatInfo.avatarColor || "#ccc" }}
          >
            {chatInfo.contactName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-neutral-900 truncate text-sm md:text-base">
            {chatInfo?.contactName || "Carregando..."}
          </h2>
          <p className="text-xs text-neutral-500 truncate">{chatInfo?.contactPhone}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all cursor-pointer ${
            showSearch ? "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200" : ""
          }`}
          title="Buscar mensagens"
        >
          <Search className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className={`p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all cursor-pointer ${
              showActionsMenu ? "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200" : ""
            }`}
            title="Opções do Chat"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showActionsMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-1 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                type="button"
                onClick={() => {
                  setShowSearch(true);
                  setShowActionsMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-neutral-400" />
                <span>Buscar Mensagens</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTransferModal(true);
                  setShowActionsMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-neutral-400" />
                <span>Transferir Atendimento</span>
              </button>

              {chatStatus === "active" && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`myde_chat_status_${conversationId}`, "finished");
                    const finishedAt = new Date().toISOString();
                    const finishedBy = meName || "Atendente myde";
                    localStorage.setItem(
                      `myde_chat_finished_info_${conversationId}`,
                      JSON.stringify({ finishedAt, finishedBy })
                    );
                    window.dispatchEvent(new Event("myde_settings_changed"));
                    showToast("Atendimento finalizado!", "success");
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                  <span>Finalizar Atendimento</span>
                </button>
              )}

              {chatStatus === "unassigned" && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`myde_chat_status_${conversationId}`, "active");
                    localStorage.removeItem(`myde_chat_finished_info_${conversationId}`);
                    window.dispatchEvent(new Event("myde_settings_changed"));
                    showToast("Atendimento atribuído a você!", "success");
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-neutral-400" />
                  <span>Atribuir a mim</span>
                </button>
              )}

              {chatStatus === "finished" && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`myde_chat_status_${conversationId}`, "active");
                    localStorage.removeItem(`myde_chat_finished_info_${conversationId}`);
                    window.dispatchEvent(new Event("myde_settings_changed"));
                    showToast("Atendimento reaberto!", "success");
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-neutral-400" />
                  <span>Reabrir Atendimento</span>
                </button>
              )}

              <hr className="border-neutral-100 my-0.5" />

              <button
                type="button"
                onClick={() => {
                  handleToggleBlock();
                  setShowActionsMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  isBlocked ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"
                }`}
              >
                <Ban className={`w-4 h-4 ${isBlocked ? "text-green-500" : "text-red-500"}`} />
                <span>{isBlocked ? "Desbloquear Contato" : "Bloquear Contato"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
