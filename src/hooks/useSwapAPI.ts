import { useQuery } from "@tanstack/react-query";
import { apiClient } from "~/services/api";

export function useNetworks() {
  return useQuery({
    queryKey: ["networks"],
    queryFn: () => apiClient.getNetworks(),
  });
}

export function useKeypairs() {
  return useQuery({
    queryKey: ["keypairs"],
    queryFn: () => apiClient.getKeypairs(),
  });
}
