# Inbox de Atendimento WhatsApp com IA — Myde Frontend

Bem-vindo ao painel de atendimento WhatsApp integrado com assistência de Inteligência Artificial. Esta aplicação foi desenvolvida em Next.js (App Router) e TypeScript, consumindo uma API REST dedicada.

---

## 🚀 Como Iniciar o Projeto

Siga as etapas abaixo para configurar e rodar a aplicação localmente:

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto e configure a URL da API (o arquivo `.env.example` já contém a URL padrão pré-preenchida):
```bash
cp .env.example .env.local
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador para interagir com o painel.

### 4. Compilar para Produção (Build)
```bash
npm run build
```

---

## 📐 Decisões de Arquitetura e Tecnologia

Para atender e superar os critérios de avaliação técnica do desafio da **Myde**, a seguinte arquitetura foi implementada:

### 1. Separação RSC vs Client Component (Next.js App Router)
Para obter uma melhor performance e indexação (SEO), dividimos a aplicação:
*   **Server Component (`app/page.tsx`)**: Responsável por processar a página no servidor, injetar os metadados de SEO estáticos/dinâmicos (OpenGraph, Twitter Cards) e prover um fallback de carregamento assíncrono via `<Suspense>`.
*   **Client Component (`app/dashboard-view.tsx`)**: Isola os hooks de consulta do cliente (`useSearchParams`), o roteador do Next.js e o container de notificações temporárias (Toasts), reduzindo a carga inicial de processamento JavaScript.

### 2. Componentização Modular e Clean Code
Extraímos os dois componentes monolíticos originais (`Sidebar` e `ChatArea`) em pequenos subcomponentes focados na pasta `components/sidebar/` e `components/chat/`. Nenhum arquivo de componente ultrapassa limites de legibilidade, e todos os comentários desnecessários foram removidos, tornando a lógica autoexplicativa.

### 3. Sincronização de Dados com React Query
Utilizamos a biblioteca `@tanstack/react-query` centralizada em hooks customizados (`hooks/useApi.ts`):
*   **Polling Ativo**: Configurado com `refetchInterval: 3000` para manter tanto a lista de conversas quanto a timeline do chat atualizadas automaticamente.
*   **Atualização Otimista (Optimistic Updates)**: No envio de mensagens (`useSendMessage`), a mensagem aparece instantaneamente na tela com um ID temporário e estado de carregamento. Caso a API retorne um erro, o cache do React Query é restaurado para o estado anterior, garantindo consistência visual (UX).

---

## 📈 Diferenciais e Funcionalidades Extras

Focando no critério de **Capricho & Detalhes (10%)**, adicionamos recursos que elevam o MVP para um produto final de mercado:

*   **Autocomplete de Macros (`/`)**: Digitar uma barra `/` na caixa de texto abre um popover com respostas rápidas configuradas. É possível navegar entre elas pelas setas do teclado (`cima`/`baixo`) e inseri-las apertando `Enter`.
*   **Configuração de Atalhos**: Na aba do Perfil, o atendente pode criar, listar e remover suas próprias macros rápidas de texto, salvas localmente.
*   **Alertas Sonoros**: A aplicação reproduz um sinal sonoro suave quando chegam novas mensagens de clientes, desde que o chat específico ou as configurações globais não estejam silenciadas. Persiste no LocalStorage.
*   **Personalização de Fundo do Chat**: O atendente pode escolher entre quatro temas de cores de fundo do chat no painel de perfil.
*   **Gerenciador de Estados de Atendimento**: Implementação de banners para conversas Bloqueadas, Finalizadas (com histórico de quem fechou e quando) e Não Atribuídas (com botão de assumir ticket).
*   **Edição de Mensagens Recentes**: Permite a edição de mensagens enviadas pelo atendente em até 1 minuto após o envio.
*   **Acessibilidade (A11y)**: Injeção de marcações ARIA (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-live="polite"`, `role="status"`) para leitores de tela.

---

## 🏗️ Grade de Componentes

Abaixo está listada a responsabilidade resumida de cada componente na nova estrutura modular:

| Componente | Caminho do Arquivo | Função Principal |
| :--- | :--- | :--- |
| **Sidebar** | `components/Sidebar.tsx` | Layout da barra lateral; controla o redimensionamento dinâmico (resizable divider). |
| **SidebarNavigation** | `components/sidebar/SidebarNavigation.tsx` | Menu de abas vertical para telas de desktop (Ativas, Fila, Histórico, Perfil). |
| **SidebarMobileNav** | `components/sidebar/SidebarMobileNav.tsx` | Menu de navegação inferior horizontal adaptado para dispositivos móveis. |
| **SidebarSkeleton** | `components/sidebar/SidebarSkeleton.tsx` | Animação de esqueleto (Skeleton UI) para carregamento da lista de contatos. |
| **SidebarEmptyState** | `components/sidebar/SidebarEmptyState.tsx` | Feedback visual amigável quando a lista de contatos está vazia. |
| **ProfileTab** | `components/sidebar/ProfileTab.tsx` | Aba de perfil com controle de som/IA, edição de macros de atalho e seletor de tema. |
| **ConversationList** | `components/sidebar/ConversationList.tsx` | Gerencia a caixa de busca de contatos, filtragem e ordenação por fixados. |
| **ConversationItem** | `components/sidebar/ConversationItem.tsx` | Card de contato individual; possui o menu suspenso de ações rápidas do chat. |
| **ChatArea** | `components/ChatArea.tsx` | Controlador e orquestrador do chat ativo; gerencia o histórico de mensagens e APIs. |
| **ChatHeader** | `components/chat/ChatHeader.tsx` | Topo do chat ativo; exibe dados do contato e opções de finalizar/transferir. |
| **ChatSearchBar** | `components/chat/ChatSearchBar.tsx` | Caixa de busca para localizar termos no histórico de conversação com botões next/prev. |
| **MessageList** | `components/chat/MessageList.tsx` | Container de mensagens que agrupa os balões e exibe divisores de datas ("Ontem", "Hoje"). |
| **MessageBubble** | `components/chat/MessageBubble.tsx` | Balão de mensagem (Trata texto, imagens, downloads de arquivos, edição e ticks). |
| **ChatInputArea** | `components/chat/ChatInputArea.tsx` | Footer de digitação, painel de emojis, sugestão de IA, pré-visualização de anexo e macros. |
| **ChatBanners** | `components/chat/ChatBanners.tsx` | Banners substitutos do input de texto para chats Bloqueados, Sem Atribuição ou Finalizados. |
| **TransferModal** | `components/chat/TransferModal.tsx` | Modal com lista de atendentes ativos para transferência ou liberação de chat. |
| **ImagePreviewModal** | `components/chat/ImagePreviewModal.tsx` | Visualizador de imagens anexadas em tamanho cheio com overlay escuro. |

---

## 🔮 O que Faria Diferente com Mais Tempo

Se tivéssemos mais prazo para o desenvolvimento, as seguintes melhorias seriam priorizadas:

1.  **Sincronização em Tempo Real (WebSockets / Server-Sent Events)**: Substituir o Polling por uma conexão persistente bidirecional, reduzindo requisições HTTP e latência.
2.  **Gerenciador de Estado Global (Zustand)**: Substituir os eventos customizados do window (`window.dispatchEvent`) por uma store do Zustand para gerenciar preferências e macros de forma mais limpa.
3.  **Testes Automatizados**: Implementar testes unitários e de integração com Jest/React Testing Library, e testes ponta-a-ponta (E2E) com Playwright.
4.  **Acessibilidade Teclado Completa**: Implementar focos controlados (focus trap) e gatilhos de escape em todos os menus dropdown e modais da aplicação.
