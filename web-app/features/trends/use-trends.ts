import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { TrendDiscoveryData } from "./types";

export function useTrends(topic: string = "") {
    return useQuery<TrendDiscoveryData>({
        queryKey: ["trends", topic],
        queryFn: () => apiClient.get(`/trends?topic=${encodeURIComponent(topic)}`),
        enabled: Boolean(topic && topic.trim().length > 0),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
