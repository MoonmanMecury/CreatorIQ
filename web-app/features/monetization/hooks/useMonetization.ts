import { useQuery } from "@tanstack/react-query";
import { MonetizationInsights } from "../types";

/**
 * Hook to fetch monetization analysis for a given keyword.
 */
export function useMonetization(keyword: string | null) {
    return useQuery<MonetizationInsights, Error>({
        queryKey: ['monetization', keyword],
        queryFn: async () => {
            if (!keyword) throw new Error("No keyword provided");

            const response = await fetch(`/api/monetization?keyword=${encodeURIComponent(keyword)}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.error || "Failed to fetch monetization insights");
            }

            return response.json();
        },
        enabled: !!keyword && keyword.length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    });
}
