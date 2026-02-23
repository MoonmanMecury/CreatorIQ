import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CreatorAnalysis } from "./creator-types";

export function useCreator(channelId: string | null) {
    return useQuery<CreatorAnalysis>({
        queryKey: ["creator", channelId],
        queryFn: async () => {
            const { data } = await axios.get(`/api/creators?channelId=${channelId}`);
            return data;
        },
        enabled: !!channelId,
    });
}
