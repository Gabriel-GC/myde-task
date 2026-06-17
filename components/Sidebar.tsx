"use client";

import { useState, useEffect } from "react";
import { useConversations, useMe } from "@/hooks/useApi";
import { useChatPreferences } from "@/hooks/useChatPreferences";
import { Conversation } from "@/lib/api";
import { MessageSquare, Search, X, Pin, Camera, Paperclip, MoreVertical, Archive, ArchiveRestore, Trash2, Settings, Menu, BellOff, Ban, Users, CheckCircle2, UserPlus } from "lucide-react";

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

function EmptyState({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-64 animate-in fade-in duration-300">
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

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    window.dispatchEvent(new CustomEvent("myde_toast", { detail: { message, type } }));
  };

  const { data: conversations, isLoading } = useConversations();
  const { deletedIds, pinnedIds, archivedIds, toggleAction, resetPreferences } =
    useChatPreferences();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "unassigned" | "finished" | "profile">("active");

  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(280, Math.min(e.clientX, 550));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const { data: me } = useMe();
  const [enterToSendSetting, setEnterToSendSetting] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myde_enter_to_send") !== "false";
    }
    return true;
  });
  const [macros, setMacros] = useState<Array<{ id: string; shortcut: string; text: string }>>([]);
  const [newShortcut, setNewShortcut] = useState("");
  const [newText, setNewText] = useState("");

  useEffect(() => {
    localStorage.setItem("myde_enter_to_send", String(enterToSendSetting));
    window.dispatchEvent(new Event("myde_settings_changed"));
  }, [enterToSendSetting]);

  useEffect(() => {
    const loadMacros = () => {
      const saved = localStorage.getItem("myde_macros");
      if (saved) {
        setMacros(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", shortcut: "saudacao", text: "Olá! Seja muito bem-vindo ao suporte da Myde. Como posso ajudar você hoje?" },
          { id: "2", shortcut: "pix", text: "Nossa chave PIX CNPJ é: 12.345.678/0001-90. Após realizar o pagamento, envie o comprovante por aqui!" },
          { id: "3", shortcut: "suporte", text: "Seu caso foi encaminhado para nossa equipe técnica de segundo nível. Entraremos em contato em até 2 horas." },
          { id: "4", shortcut: "obrigado", text: "Muito obrigado pelo contato! Se precisar de mais alguma coisa, ficamos à inteira disposição. Tenha um ótimo dia!" }
        ];
        localStorage.setItem("myde_macros", JSON.stringify(defaults));
        setMacros(defaults);
      }
    };
    loadMacros();
    window.addEventListener("myde_macros_changed", loadMacros);
    return () => window.removeEventListener("myde_macros_changed", loadMacros);
  }, []);

  const [editTrigger, setEditTrigger] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setEditTrigger((prev) => prev + 1);
    window.addEventListener("myde_message_edited", handleUpdate);
    window.addEventListener("myde_settings_changed", handleUpdate);
    return () => {
      window.removeEventListener("myde_message_edited", handleUpdate);
      window.removeEventListener("myde_settings_changed", handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleTransfer = (e: any) => {
      const { conversationId } = e.detail;
      toggleAction(conversationId, "delete");
      if (activeId === conversationId) {
        onSelect("");
      }
    };
    window.addEventListener("myde_chat_transferred", handleTransfer as any);
    return () => window.removeEventListener("myde_chat_transferred", handleTransfer as any);
  }, [activeId, onSelect, toggleAction]);

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanShortcut = newShortcut.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanText = newText.trim();
    if (!cleanShortcut || !cleanText) return;

    if (macros.some(m => m.shortcut === cleanShortcut)) {
      showToast("Já existe um atalho com este nome.", "error");
      return;
    }

    const updated = [
      ...macros,
      { id: String(Date.now()), shortcut: cleanShortcut, text: cleanText }
    ];
    localStorage.setItem("myde_macros", JSON.stringify(updated));
    setMacros(updated);
    window.dispatchEvent(new Event("myde_macros_changed"));

    setNewShortcut("");
    setNewText("");
  };

  const handleDeleteMacro = (id: string) => {
    const updated = macros.filter(m => m.id !== id);
    localStorage.setItem("myde_macros", JSON.stringify(updated));
    setMacros(updated);
    window.dispatchEvent(new Event("myde_macros_changed"));
  };
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
  }, [activeTab, search]);

  let visibleChats =
    conversations?.filter((c) => {
      if (deletedIds.includes(c.id)) return false;
      const status = localStorage.getItem(`myde_chat_status_${c.id}`) || (c.id === "c-1003" ? "unassigned" : c.id === "c-1004" ? "finished" : "active");
      return status === activeTab;
    }) || [];

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
    <div
      style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
      className="flex h-full w-full md:w-[380px] shrink-0 pb-14 md:pb-0 font-sans bg-white border-r border-neutral-200 relative"
    >
      <aside className="hidden md:flex w-14 bg-neutral-50 flex-col items-center justify-between py-5 shrink-0 border-r border-neutral-200 text-neutral-400">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs mb-3 shadow-xs">
            M
          </div>
          
          <button
            onClick={() => setActiveTab("active")}
            className={`p-2.5 rounded-lg transition-all cursor-pointer relative group ${
              activeTab === "active" ? "bg-blue-50 text-blue-600 font-bold" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            }`}
            title="Conversas Ativas"
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
              Conversas Ativas
            </span>
          </button>

          <button
            onClick={() => setActiveTab("unassigned")}
            className={`p-2.5 rounded-lg transition-all cursor-pointer relative group ${
              activeTab === "unassigned" ? "bg-blue-50 text-blue-600 font-bold" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            }`}
            title="Não Atribuídas"
          >
            <Users className="w-4.5 h-4.5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
              Não Atribuídas
            </span>
          </button>

          <button
            onClick={() => setActiveTab("finished")}
            className={`p-2.5 rounded-lg transition-all cursor-pointer relative group ${
              activeTab === "finished" ? "bg-blue-50 text-blue-600 font-bold" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            }`}
            title="Finalizadas"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
              Finalizadas
            </span>
          </button>
        </div>

        <button
          onClick={() => setActiveTab("profile")}
          className={`p-0.5 rounded-full border transition-all cursor-pointer relative group ${
            activeTab === "profile" ? "border-blue-500 ring-2 ring-blue-500/10" : "border-transparent hover:border-neutral-300"
          }`}
          title="Meu Perfil"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-inner">
            {me?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap shadow-md">
            Meu Perfil
          </span>
        </button>
      </aside>

      <aside className="flex-1 border-r border-neutral-200 bg-white flex flex-col h-full select-none relative min-w-0">
        {activeMenuId && (
          <div
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => {
              setActiveMenuId(null);
            }}
          />
        )}

        {activeTab === "profile" ? (
          <div className="flex-1 flex flex-col min-h-0 bg-white animate-in fade-in duration-200">
            <div className="p-4 pb-3 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-800 tracking-tight">
                Meu Perfil
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 flex flex-col gap-6">
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 flex items-center gap-4 text-left shadow-xs">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0 select-none">
                  {me?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-neutral-850 text-sm md:text-base truncate">{me?.name || "Carregando..."}</h3>
                  <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">{me?.role || "Atendente"}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ativo
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">Preferências de Chat</span>
                
                <div className="flex flex-col gap-0.5 bg-neutral-50/30 border border-neutral-200 rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => setAiEnabled(!aiEnabled)}
                    className="w-full flex items-center justify-between gap-4 p-3 hover:bg-neutral-50 rounded-xl transition-all text-left active:scale-[0.99] cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-neutral-805 block">Copiloto de IA</span>
                      <span className="text-[10px] text-neutral-455 block mt-0.5 leading-relaxed">Exibir sugestões de resposta automáticas por inteligência artificial</span>
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
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className="w-full flex items-center justify-between gap-4 p-3 hover:bg-neutral-50 rounded-xl transition-all text-left active:scale-[0.99] cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-neutral-805 block">Alertas Sonoros</span>
                      <span className="text-[10px] text-neutral-455 block mt-0.5 leading-relaxed">Reproduzir aviso sonoro quando novas mensagens chegarem</span>
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
                    onClick={() => setEnterToSendSetting(!enterToSendSetting)}
                    className="w-full flex items-center justify-between gap-4 p-3 hover:bg-neutral-50 rounded-xl transition-all text-left active:scale-[0.99] cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-neutral-805 block">Pressionar Enter para Enviar</span>
                      <span className="text-[10px] text-neutral-455 block mt-0.5 leading-relaxed">Use Enter para enviar mensagens e Shift+Enter para nova linha</span>
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
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">Respostas Rápidas (Macros)</span>
                
                <form onSubmit={handleAddMacro} className="flex flex-col gap-2.5 bg-neutral-50/50 p-3.5 rounded-xl border border-neutral-200/80 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider">Novo Atalho</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-neutral-400 font-bold text-xs select-none">/</span>
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
                    <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider">Mensagem Automática</label>
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
                      <div key={macro.id} className="flex items-center justify-between gap-3 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 hover:border-neutral-200 transition-all text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-blue-600 text-xs text-left">/{macro.shortcut}</p>
                          <p className="text-neutral-500 truncate text-[10px] text-left mt-0.5 leading-relaxed">{macro.text}</p>
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
                  <p className="text-center text-[10px] text-neutral-400 py-2">Nenhum atalho configurado.</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5 border-t border-neutral-100 pt-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">Tema do Fundo do Chat</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "Clássico", color: "#EFEAE2" },
                    { name: "Cinza", color: "#f5f5f5" },
                    { name: "Slate", color: "#e2e8f0" },
                    { name: "Sky", color: "#f0f9ff" }
                  ].map((theme) => {
                    const isActive = localStorage.getItem("myde_chat_bg") === theme.color || (!localStorage.getItem("myde_chat_bg") && theme.color === "#EFEAE2");
                    return (
                      <button
                        key={theme.color}
                        onClick={() => {
                          localStorage.setItem("myde_chat_bg", theme.color);
                          window.dispatchEvent(new Event("myde_settings_changed"));
                        }}
                        className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all hover:bg-neutral-50 cursor-pointer ${
                          isActive
                            ? "border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/10 text-blue-700"
                            : "border-neutral-200 text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full border border-neutral-300 shadow-inner shrink-0" style={{ backgroundColor: theme.color }} />
                        <span className="truncate w-full">{theme.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-left pl-1">Ações Administrativas</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm("Deseja mesmo restaurar todos os chats arquivados, fixados e ocultados?")) {
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
                      if (window.confirm("Deseja limpar todas as configurações (macros, preferências, etc.)? Isso restaurará os padrões.")) {
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
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 pb-3 border-b border-neutral-100 flex flex-col gap-3.5">
              <div className="flex justify-between items-center relative">
                <h2 className="text-xl font-bold text-neutral-800 tracking-tight capitalize">
                  {activeTab === "active" ? "Conversas Ativas" : activeTab === "unassigned" ? "Não Atribuídas" : "Finalizadas"}
                </h2>
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
          <EmptyState activeTab={activeTab} />
        )}

        {!isLoading && visibleChats.length > 0 && (
          <div className="flex flex-col gap-1.5 p-2">
            {visibleChats.map((chat: Conversation) => {
              const isSelected = activeId === chat.id;
              const isPinned = pinnedIds.includes(chat.id);
              const isUnread = chat.unread > 0;

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
                        {typeof window !== "undefined" && localStorage.getItem(`myde_blocked_${chat.id}`) === "true" && (
                          <span
                            className="text-red-500"
                            title="Contato Bloqueado"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </span>
                        )}
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
                    {activeTab === "finished" && (() => {
                      const getFinishedInfo = () => {
                        if (typeof window !== "undefined") {
                          const stored = localStorage.getItem(`myde_chat_finished_info_${chat.id}`);
                          if (stored) {
                            try {
                              return JSON.parse(stored);
                            } catch {}
                          }
                        }
                        return {
                          finishedAt: chat.lastMessageAt,
                          finishedBy: "Atendente myde"
                        };
                      };
                      const finishedInfo = getFinishedInfo();
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
                      return (
                        <div className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1 border-t border-neutral-100 pt-1.5 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            Finalizado em {formatFinishedDateTime(finishedInfo.finishedAt)} por {finishedInfo.finishedBy}
                          </span>
                        </div>
                      );
                    })()}
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

                        {activeTab === "active" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              localStorage.setItem(`myde_chat_status_${chat.id}`, "finished");
                              const finishedAt = new Date().toISOString();
                              const finishedBy = me?.name || "Atendente myde";
                              localStorage.setItem(`myde_chat_finished_info_${chat.id}`, JSON.stringify({ finishedAt, finishedBy }));
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
            })}
          </div>
        )}
      </div>
          </>
        )}

    </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-neutral-200 z-45 flex items-center justify-around px-2 pointer-events-auto shadow-lg animate-in slide-in-from-bottom duration-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === "active" ? "text-blue-600 font-bold" : "text-neutral-400"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Ativas</span>
        </button>

        <button
          onClick={() => setActiveTab("unassigned")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative cursor-pointer ${
            activeTab === "unassigned" ? "text-blue-600 font-bold" : "text-neutral-400"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Não Atrib.</span>
        </button>

        <button
          onClick={() => setActiveTab("finished")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === "finished" ? "text-blue-600 font-bold" : "text-neutral-400"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Finalizadas</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeTab === "profile" ? "text-blue-600 font-bold" : "text-neutral-400"
          }`}
        >
          <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-inner ${
            activeTab === "profile" ? "bg-blue-600 ring-2 ring-blue-500/20" : "bg-neutral-400"
          }`}>
            {me?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <span className="text-[9px] mt-0.5">Perfil</span>
        </button>
      </nav>

      <div
        onMouseDown={() => setIsResizing(true)}
        className="hidden md:block absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/20 active:bg-blue-600/30 transition-colors z-50 group"
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0.5 w-0.5 h-8 bg-neutral-300 rounded group-hover:bg-blue-500 transition-colors" />
      </div>
    </div>
  );
}
