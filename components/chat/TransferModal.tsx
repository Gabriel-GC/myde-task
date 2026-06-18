"use client";

import React, { useState } from "react";
import { UserPlus, X, Search, Users } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  status: "online" | "away" | "busy";
}

const AGENTS: Agent[] = [
  { id: "agent-2", name: "Bruno Lima", role: "Suporte N2", avatarColor: "#ec4899", status: "online" },
  { id: "agent-3", name: "Carla Souza", role: "Financeiro", avatarColor: "#10b981", status: "online" },
  { id: "agent-4", name: "Diego Rodrigues", role: "Vendas", avatarColor: "#f59e0b", status: "busy" },
  { id: "agent-5", name: "Mariana Costa", role: "Suporte N1", avatarColor: "#8b5cf6", status: "online" },
];

interface TransferModalProps {
  conversationId: string;
  chatStatus: string;
  onClose: () => void;
  handleTransferChat: (agentId: string) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function TransferModal({
  conversationId,
  chatStatus,
  onClose,
  handleTransferChat,
  showToast,
}: TransferModalProps) {
  const [transferSearchQuery, setTransferSearchQuery] = useState("");

  const filteredAgents = AGENTS.filter(
    (agent) =>
      agent.name.toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(transferSearchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-neutral-805 text-sm uppercase tracking-wide flex items-center gap-1.5 select-none">
              <UserPlus className="w-4.5 h-4.5 text-blue-600" />
              Transferir Chat
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5 select-none">
              Selecione um atendente para assumir a conversa
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10">
            <Search className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          <input
            type="text"
            placeholder="Buscar atendente ou setor..."
            value={transferSearchQuery}
            onChange={(e) => setTransferSearchQuery(e.target.value)}
            className="w-full bg-neutral-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-transparent text-neutral-850"
          />
        </div>

        {chatStatus !== "unassigned" && (
          <button
            type="button"
            onClick={() => {
              onClose();
              localStorage.setItem(`myde_chat_status_${conversationId}`, "unassigned");
              localStorage.removeItem(`myde_chat_finished_info_${conversationId}`);
              window.dispatchEvent(new Event("myde_settings_changed"));
              showToast("Atendimento retornado para não atribuídos!", "success");
            }}
            className="w-full text-left p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 hover:border-neutral-450 transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">
                <Users className="w-4 h-4 text-neutral-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-800 group-hover:text-blue-600 transition-colors">
                  Fila de Não Atribuídos
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Deixar conversa disponível para qualquer atendente
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Liberar
            </span>
          </button>
        )}

        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent) => (
              <button
                type="button"
                key={agent.id}
                onClick={() => {
                  onClose();
                  handleTransferChat(agent.id);
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 border border-neutral-100/60 hover:border-blue-100 transition-all flex items-center justify-between gap-3 cursor-pointer group hover:shadow-xs active:scale-98"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-inner relative"
                    style={{ backgroundColor: agent.avatarColor }}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        agent.status === "online" ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 truncate group-hover:text-blue-600 transition-colors">
                      {agent.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                      {agent.role}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Transferir
                </span>
              </button>
            ))
          ) : (
            <div className="text-center py-6 text-neutral-400 text-xs select-none">
              Nenhum atendente encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
