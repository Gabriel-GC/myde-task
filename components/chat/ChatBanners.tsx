"use client";

import React from "react";
import { Ban, Users, CheckCircle2 } from "lucide-react";

interface ChatBannersProps {
  conversationId: string;
  chatStatus: string;
  isBlocked: boolean;
  handleToggleBlock: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  chatInfoLastMessageAt?: string;
  meName?: string;
}

export function ChatBanners({
  conversationId,
  chatStatus,
  isBlocked,
  handleToggleBlock,
  showToast,
  chatInfoLastMessageAt,
  meName,
}: ChatBannersProps) {
  const formatFinishedDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  if (isBlocked) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-805 text-left m-3 select-none">
        <div className="flex items-center gap-3">
          <Ban className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-900">Contato Bloqueado</p>
            <p className="text-[10px] text-red-600 mt-0.5">
              Você não pode enviar mensagens para contatos bloqueados.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleBlock}
          className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 text-center shadow-xs"
        >
          Desbloquear Contato
        </button>
      </div>
    );
  }

  if (chatStatus === "unassigned") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-blue-805 text-left m-3 select-none">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-900">Conversa Não Atribuída</p>
            <p className="text-[10px] text-blue-600 mt-0.5">
              Esta conversa ainda não foi atribuída a nenhum atendente.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(`myde_chat_status_${conversationId}`, "active");
            window.dispatchEvent(new Event("myde_settings_changed"));
            showToast("Atendimento atribuído a você!", "success");
          }}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 text-center shadow-xs"
        >
          Atribuir a mim
        </button>
      </div>
    );
  }

  if (chatStatus === "finished") {
    let finishedAt = chatInfoLastMessageAt || new Date().toISOString();
    let finishedBy = "Atendente myde";

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`myde_chat_finished_info_${conversationId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          finishedAt = parsed.finishedAt;
          finishedBy = parsed.finishedBy;
        } catch {}
      }
    }

    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-850 text-left m-3 select-none">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-neutral-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-neutral-900">Atendimento Finalizado</p>
            <p className="text-[10px] text-neutral-550 mt-0.5">
              Esta conversa foi finalizada e está em modo de leitura.
            </p>
            <p className="text-[10px] text-neutral-500 mt-1 font-semibold">
              Finalizado em {formatFinishedDateTime(finishedAt)} por {finishedBy}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(`myde_chat_status_${conversationId}`, "active");
            window.dispatchEvent(new Event("myde_settings_changed"));
            showToast("Atendimento reaberto!", "success");
          }}
          className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 text-center shadow-xs"
        >
          Reabrir Atendimento
        </button>
      </div>
    );
  }

  return null;
}
