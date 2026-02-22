import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YouTubeTrendMetrics } from "../types";
import { YoutubeIcon, ViewIcon, FavouriteIcon, GlobalIcon } from "hugeicons-react";

interface YouTubeMetricsPanelProps {
    metrics?: YouTubeTrendMetrics;
}

export function YouTubeMetricsPanel({ metrics }: YouTubeMetricsPanelProps) {
    if (!metrics) return null;

    const stats = [
        {
            label: "Total Relevant Views",
            value: metrics.total_views.toLocaleString(),
            icon: ViewIcon,
            color: "text-blue-500"
        },
        {
            label: "Avg. Engagement Rate",
            value: `${metrics.average_engagement}%`,
            icon: FavouriteIcon,
            color: "text-red-500"
        },
        {
            label: "Supply (Channels/Videos)",
            value: metrics.supply_count.toString(),
            icon: YoutubeIcon,
            color: "text-primary"
        }
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <YoutubeIcon className="h-4 w-4 text-red-600" />
                    Market Supply (YouTube)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                <span className="text-xs text-muted-foreground">{stat.label}</span>
                            </div>
                            <span className="text-sm font-bold">{stat.value}</span>
                        </div>
                    ))}
                    <div className="pt-2 border-t text-[10px] text-muted-foreground italic">
                        Real-time data aggregated from top 10 trending videos.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
