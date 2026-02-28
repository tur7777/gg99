import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Conversation,
  ListConversationsResponse,
  Message,
  ListMessagesResponse,
  CreateMessageRequest,
} from "@shared/api";
import { fetchApi } from "./fetch-client";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      fetchApi<ListConversationsResponse>("/api/conversations"),
    staleTime: 10 * 1000,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () => fetchApi<Conversation>(`/api/conversations/${id}`),
    staleTime: 10 * 1000,
  });
}

export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const queryStr = conversationId
        ? `?conversationId=${conversationId}`
        : "";
      const response = await fetchApi<ListMessagesResponse>(
        `/api/messages${queryStr}`
      );
      return response.items || [];
    },
    enabled: !!conversationId,
    staleTime: 5 * 1000,
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageRequest) =>
      fetchApi<Message>("/api/messages", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
    },
  });
}

export function useEnsureSelfChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) =>
      fetchApi("/api/chat/self", {
        method: "POST",
        body: JSON.stringify({ offerId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
