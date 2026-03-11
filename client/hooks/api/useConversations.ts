import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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
    queryFn: async () => {
      const response = await fetchApi<ListConversationsResponse>("/api/conversations");
      return response.conversations || response.items || [];
    },
    staleTime: 10 * 1000,
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: async () => {
      const response = await fetchApi<any>(`/api/conversations/${id}`);
      return response.conversation || response;
    },
    staleTime: 10 * 1000,
  });
}

export function useConversationMessages(conversationId?: string, address?: string) {
  return useInfiniteQuery({
    queryKey: ["conversationMessages", conversationId],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = new URLSearchParams({
        address: address || "",
        limit: "50",
      });
      if (pageParam) {
        params.append("before", pageParam);
      }
      const response = await fetchApi<any>(
        `/api/conversations/${conversationId}?${params.toString()}`
      );
      return {
        messages: response.messages || [],
        pagination: response.pagination || { hasMore: false, oldestTimestamp: null },
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasMore && lastPage.pagination?.oldestTimestamp) {
        return lastPage.pagination.oldestTimestamp;
      }
      return undefined;
    },
    enabled: !!conversationId && !!address,
    staleTime: 5 * 1000,
    initialPageParam: undefined,
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
      return response.items || response.messages || [];
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
