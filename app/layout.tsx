import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Inbox Myde | Atendimento IA",
  description:
    "Plataforma de atendimento otimizada com assistência de Inteligência Artificial.",
  robots: "index, follow",
  keywords: ["WhatsApp", "IA", "Atendimento", "Myde", "Chatbot", "Inteligência Artificial", "CRM", "OpenAI"],
  authors: [{ name: "Myde Tech" }],
  creator: "Myde Tech",
  publisher: "Myde Tech",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
