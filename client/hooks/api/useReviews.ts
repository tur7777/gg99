import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateReviewRequest,
  ListReviewsResponse,
  GetUserStatsResponse,
} from "@shared/api";
import { fetchApi } from "./fetch-client";

export function useReviewsByAddress(address: string) {
  return useQuery({
    queryKey: ["reviews", address],
    queryFn: () =>
      fetchApi<ListReviewsResponse>(`/api/reviews/${address}`),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserStats(address: string) {
  return useQuery({
    queryKey: ["userStats", address],
    queryFn: () =>
      fetchApi<GetUserStatsResponse>(`/api/users/${address}/stats`),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) =>
      fetchApi("/api/reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.revieweeAddress],
      });
      queryClient.invalidateQueries({
        queryKey: ["userStats", variables.revieweeAddress],
      });
    },
  });
}
