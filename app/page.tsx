import { Suspense } from "react";
import DashboardView from "./dashboard-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel de Atendimento - Myde",
  description:
    "Gerencie seus atendimentos de WhatsApp integrados com Inteligência Artificial. Respostas automatizadas, macros rápidas, transferência de chats e painel otimizado.",
  openGraph: {
    title: "Painel de Atendimento - Myde",
    description:
      "Gerencie seus atendimentos de WhatsApp integrados com Inteligência Artificial. Respostas automatizadas, macros rápidas, transferência de chats e painel otimizado.",
    type: "website",
    locale: "pt_BR",
    url: "https://myde.com.br",
  },
  twitter: {
    card: "summary_large_image",
    title: "Painel de Atendimento - Myde",
    description:
      "Gerencie seus atendimentos de WhatsApp integrados com Inteligência Artificial. Respostas automatizadas, macros rápidas, transferência de chats e painel otimizado.",
  },
};

export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          className="h-screen flex items-center justify-center font-sans text-neutral-500 bg-neutral-50 select-none animate-pulse text-sm"
          role="status"
          aria-live="polite"
        >
          Carregando painel de atendimento...
        </div>
      }
    >
      <DashboardView />
    </Suspense>
  );
}
