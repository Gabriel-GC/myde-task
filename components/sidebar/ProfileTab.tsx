"use client";

import React, { useState, useEffect } from "react";
import { Trash2, LogOut } from "lucide-react";

interface Macro {
  id: string;
  shortcut: string;
  text: string;
}

interface ProfileTabProps {
  me?: { name?: string; role?: string };
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  resetPreferences: () => void;
}

export function ProfileTab({ me, showToast, resetPreferences }: ProfileTabProps) {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [enterToSendSetting, setEnterToSendSetting] = useState(true);
  const [chatBg, setChatBg] = useState("#EFEAE2");

  const [macros, setMacros] = useState<Macro[]>([]);
  const [newShortcut, setNewShortcut] = useState("");
  const [newText, setNewText] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAiEnabled(localStorage.getItem("myde_ai_enabled") !== "false");
      setSoundAlerts(localStorage.getItem("myde_sound_alerts") !== "false");
      setEnterToSendSetting(localStorage.getItem("myde_enter_to_send") !== "false");
      setChatBg(localStorage.getItem("myde_chat_bg") || "#EFEAE2");

      const savedMacros = localStorage.getItem("myde_macros");
      if (savedMacros) {
        setMacros(JSON.parse(savedMacros));
      } else {
        const defaults = [
          {
            id: "1",
            shortcut: "saudacao",
            text: "Olá! Seja muito bem-vindo ao suporte da Myde. Como posso ajudar você hoje?",
          },
          {
            id: "2",
            shortcut: "pix",
            text: "Nossa chave PIX CNPJ é: 12.345.678/0001-90. Após realizar o pagamento, envie o comprovante por aqui!",
          },
          {
            id: "3",
            shortcut: "suporte",
            text: "Seu caso foi encaminhado para nossa equipe técnica de segundo nível. Entraremos em contato em até 2 horas.",
          },
          {
            id: "4",
            shortcut: "obrigado",
            text: "Muito obrigado pelo contato! Se precisar de mais alguma coisa, ficamos à inteira disposição. Tenha um ótimo dia!",
          },
        ];
        localStorage.setItem("myde_macros", JSON.stringify(defaults));
        setMacros(defaults);
      }
    }
  }, []);

  const updateAiEnabled = (val: boolean) => {
    setAiEnabled(val);
    localStorage.setItem("myde_ai_enabled", String(val));
    window.dispatchEvent(new Event("myde_settings_changed"));
  };

  const updateSoundAlerts = (val: boolean) => {
    setSoundAlerts(val);
    localStorage.setItem("myde_sound_alerts", String(val));
    window.dispatchEvent(new Event("myde_settings_changed"));
  };

  const updateEnterToSend = (val: boolean) => {
    setEnterToSendSetting(val);
    localStorage.setItem("myde_enter_to_send", String(val));
    window.dispatchEvent(new Event("myde_settings_changed"));
  };

  const updateChatBg = (val: string) => {
    setChatBg(val);
    localStorage.setItem("myde_chat_bg", val);
    window.dispatchEvent(new Event("myde_settings_changed"));
  };

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanShortcut = newShortcut
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const cleanText = newText.trim();
    if (!cleanShortcut || !cleanText) return;

    if (macros.some((m) => m.shortcut === cleanShortcut)) {
      showToast("Já existe um atalho com este nome.", "error");
      return;
    }

    const updated = [
      ...macros,
      { id: String(Date.now()), shortcut: cleanShortcut, text: cleanText },
    ];
    localStorage.setItem("myde_macros", JSON.stringify(updated));
    setMacros(updated);
    window.dispatchEvent(new Event("myde_macros_changed"));

    setNewShortcut("");
    setNewText("");
    showToast("Atalho adicionado com sucesso!", "success");
  };

  const handleDeleteMacro = (id: string) => {
    const updated = macros.filter((m) => m.id !== id);
    localStorage.setItem("myde_macros", JSON.stringify(updated));
    setMacros(updated);
    window.dispatchEvent(new Event("myde_macros_changed"));
    showToast("Atalho removido.", "info");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white animate-in fade-in duration-200">
      <div className="p-4 pb-3 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-800 tracking-tight">Meu Perfil</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 flex flex-col gap-6">
        <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 flex items-center gap-4 text-left shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0 select-none">
            {me?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-neutral-850 text-sm md:text-base truncate">
              {me?.name || "Carregando..."}
            </h3>
            <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
              {me?.role || "Atendente"}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ativo
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">
            Preferências de Chat
          </span>

          <div className="flex flex-col gap-0.5 bg-neutral-50/30 border border-neutral-200 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => updateAiEnabled(!aiEnabled)}
              className="w-full flex items-center justify-between gap-4 p-3 hover:bg-neutral-50 rounded-xl transition-all text-left active:scale-[0.99] cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-neutral-805 block">Copiloto de IA</span>
                <span className="text-[10px] text-neutral-455 block mt-0.5 leading-relaxed">
                  Exibir sugestões de resposta automáticas por inteligência artificial
                </span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0 flex items-center ${
                  aiEnabled ? "bg-blue-600 justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </button>

            <hr className="border-neutral-100 mx-3" />

            <button
              type="button"
              onClick={() => updateSoundAlerts(!soundAlerts)}
              className="w-full flex items-center justify-between gap-4 p-3 hover:bg-neutral-50 rounded-xl transition-all text-left active:scale-[0.99] cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-neutral-805 block">Alertas Sonoros</span>
                <span className="text-[10px] text-neutral-455 block mt-0.5 leading-relaxed">
                  Reproduzir aviso somoro quando novas mensagens chegarem
                </span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0 flex items-center ${
                  soundAlerts ? "bg-blue-600 justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </button>

            <hr className="border-neutral-100 mx-3" />

            <button
              type="button"
              onClick={() => updateEnterToSend(!enterToSendSetting)}
              className="w-full flex items-center justify-between gap-4 p-3 hover:bg-neutral-50 rounded-xl transition-all text-left active:scale-[0.99] cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-neutral-805 block">
                  Pressionar Enter para Enviar
                </span>
                <span className="text-[10px] text-neutral-455 block mt-0.5 leading-relaxed">
                  Use Enter para enviar mensagens e Shift+Enter para nova linha
                </span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0 flex items-center ${
                  enterToSendSetting ? "bg-blue-600 justify-end" : "bg-neutral-200 justify-start"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">
            Respostas Rápidas (Macros)
          </span>

          <form
            onSubmit={handleAddMacro}
            className="flex flex-col gap-2.5 bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-200/80 text-left"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider">
                Novo Atalho
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-neutral-400 font-bold text-xs select-none">
                  /
                </span>
                <input
                  type="text"
                  placeholder="ex: pix, saudacao"
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  className="w-full bg-white rounded-lg pl-6 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-neutral-200 text-neutral-800 placeholder-neutral-400 transition-all focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider">
                Mensagem Automática
              </label>
              <textarea
                placeholder="Digite a resposta rápida..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full bg-white rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border border-neutral-200 resize-none h-14 text-neutral-800 placeholder-neutral-400 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all active:scale-[0.97] cursor-pointer shadow-xs"
            >
              Adicionar Atalho
            </button>
          </form>

          {macros.length > 0 ? (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-0.5">
              {macros.map((macro) => (
                <div
                  key={macro.id}
                  className="flex items-center justify-between gap-3 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 hover:border-neutral-200 transition-all text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-blue-600 text-xs text-left">
                      /{macro.shortcut}
                    </p>
                    <p className="text-neutral-500 truncate text-[10px] text-left mt-0.5 leading-relaxed">
                      {macro.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteMacro(macro.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    title="Excluir atalho"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[10px] text-neutral-400 py-2">
              Nenhum atalho configurado.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-4">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">
            Tema do Fundo do Chat
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: "Clássico", color: "#EFEAE2" },
              { name: "Cinza", color: "#f5f5f5" },
              { name: "Slate", color: "#e2e8f0" },
              { name: "Sky", color: "#f0f9ff" },
            ].map((theme) => {
              const isActive = chatBg === theme.color;
              return (
                <button
                  key={theme.color}
                  onClick={() => updateChatBg(theme.color)}
                  className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all hover:bg-neutral-50 cursor-pointer ${
                    isActive
                      ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/10 text-blue-700"
                      : "border-neutral-200 text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full border border-neutral-300 shadow-inner shrink-0"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="truncate w-full">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">
            Ações Administrativas
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Deseja mesmo restaurar todos os chats arquivados, fixados e ocultados?"
                  )
                ) {
                  resetPreferences();
                  showToast("Todos os chats foram restaurados com sucesso!", "success");
                  setTimeout(() => window.location.reload(), 1000);
                }
              }}
              className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-all active:scale-[0.97] cursor-pointer text-center border border-neutral-200/50"
            >
              Restaurar Chats
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Deseja limpar todas as configurações (macros, preferências, etc.)? Isso restaurará os padrões."
                  )
                ) {
                  localStorage.clear();
                  showToast("Todas as configurações foram limpas!", "success");
                  setTimeout(() => window.location.reload(), 1000);
                }
              }}
              className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all active:scale-[0.97] cursor-pointer text-center border border-red-100"
            >
              Limpar Tudo
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              showToast("Função de logout não implementada nesta versão demonstrativa.", "info");
            }}
            className="w-full mt-2 py-2 bg-red-50/40 hover:bg-red-100/50 text-red-600 hover:text-red-700 text-xs font-bold rounded-xl transition-all active:scale-[0.97] cursor-pointer text-center border border-red-100/50 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
