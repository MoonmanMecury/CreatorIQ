import { useQuery } from "@tanstack/react-query";
import { OpportunityResult } from "../types";

/**
 * Hook to fetch opportunity analysis for a given keyword.
 */
export function useOpportunities(keyword: string | null) {
    return useQuery<OpportunityResult, Error>({
        queryKey: ['opportunities', keyword],
        queryFn: async () => {
            if (!keyword) throw new Error("No keyword provided");

            const response = await fetch(`/api/opportunities?keyword=${encodeURIComponent(keyword)}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.error || "Failed to fetch opportunities");
            }

            return response.json();
        },
        enabled: !!keyword && keyword.length > 0,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    });
}
