import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Order,
  ListOrdersResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
} from "@shared/api";
import { fetchApi } from "./fetch-client";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchApi<ListOrdersResponse>("/api/orders"),
    staleTime: 10 * 1000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => fetchApi<Order>(`/api/orders/${id}`),
    staleTime: 10 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      fetchApi<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrderRequest) =>
      fetchApi<Order>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
