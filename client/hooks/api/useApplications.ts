import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Application,
  ListApplicationsResponse,
  SelectExecutorRequest,
} from "@shared/api";
import { fetchApi } from "./fetch-client";

export function useApplicationsByOffer(offerId: string) {
  return useQuery({
    queryKey: ["applications", "offer", offerId],
    queryFn: () =>
      fetchApi<ListApplicationsResponse>(`/api/applications/offer/${offerId}`),
    staleTime: 10 * 1000,
  });
}

export function useApplicationsByFreelancer() {
  return useQuery({
    queryKey: ["applications", "freelancer"],
    queryFn: () =>
      fetchApi<ListApplicationsResponse>("/api/applications/freelancer"),
    staleTime: 10 * 1000,
  });
}

export function useApplicationsByCreator() {
  return useQuery({
    queryKey: ["applications", "creator"],
    queryFn: () =>
      fetchApi<ListApplicationsResponse>("/api/applications/creator"),
    staleTime: 10 * 1000,
  });
}

export function useApplyToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { offerId: string }) =>
      fetchApi<Application>("/api/applications", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useSelectExecutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SelectExecutorRequest) =>
      fetchApi("/api/applications/select", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
