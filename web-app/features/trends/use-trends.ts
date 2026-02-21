import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { TrendDiscoveryData } from "./types";

export function useTrends(topic: string = "Next.js") {
    return useQuery<TrendDiscoveryData>({
        queryKey: ["trends", topic],
        queryFn: () => apiClient.get(`/trends?topic=${encodeURIComponent(topic)}`),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
