import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getMessages,
  sendMessage,
  suggestReply,
  getMe,
  Conversation,
  Message,
} from "@/lib/api";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    refetchInterval: 3000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      sendMessage(id, text),
    onMutate: async ({ id, text }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", id] });
      const previousMessages = queryClient.getQueryData<Message[]>([
        "messages",
        id,
      ]);

      const optimisticMessage: Message = {
        id: `opt-${Date.now()}`,
        direction: "out",
        body: text,
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(["messages", id], (old) => [
        ...(old || []),
        optimisticMessage,
      ]);

      return { previousMessages };
    },
    onError: (err, { id }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", id], context.previousMessages);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] }); // Atualiza última mensagem na lista
    },
  });
}

export function useAiSuggestion() {
  return useMutation({
    mutationFn: (conversationId: string) => suggestReply(conversationId),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
}
