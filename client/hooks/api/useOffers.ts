import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Offer,
  ListOffersResponse,
  CreateOfferRequest,
} from "@shared/api";
import { fetchApi } from "./fetch-client";

export function useOffers(query?: string) {
  return useQuery({
    queryKey: ["offers", query],
    queryFn: async () => {
      const queryStr = query ? `?q=${encodeURIComponent(query)}` : "";
      const response = await fetchApi<ListOffersResponse>(
        `/api/offers${queryStr}`
      );
      return (response.items || []).filter(
        (item) => item && typeof item === "object"
      );
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ["offers", id],
    queryFn: () => fetchApi<Offer>(`/api/offers/${id}`),
    staleTime: 30 * 1000,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferRequest) =>
      fetchApi<Offer>("/api/offers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
