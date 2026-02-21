import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { CreatorAnalysisData } from "./types";

export function useCreator() {
    return useQuery<CreatorAnalysisData>({
        queryKey: ["creator"],
        queryFn: () => apiClient.get("/creators"),
    });
}
