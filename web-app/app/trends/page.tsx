"use client";

import { useState } from "react";
import { useTrends } from "@/features/trends/use-trends";
import { OverviewCards } from "@/features/trends/components/overview-cards";
import { TrendVisualization } from "@/features/trends/components/trend-visualization";
import { KeywordClusterPanel } from "@/features/trends/components/keyword-cluster-panel";
import { OpportunityInsightsPanel } from "@/features/trends/components/opportunity-insights-panel";
import { SubtopicPanel } from "@/features/trends/components/subtopic-panel";
import { YouTubeMetricsPanel } from "@/features/trends/components/youtube-metrics-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search01Icon } from "hugeicons-react";

export default function TrendsPage() {
    const [searchTopic, setSearchTopic] = useState("Next.js");
    const [inputValue, setInputValue] = useState("Next.js");
    const { data, isLoading, isPlaceholderData, error } = useTrends(searchTopic);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchTopic(inputValue.trim());
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Trend & Niche Discovery</h1>
                    <p className="text-muted-foreground">Identify high-growth market opportunities combining Search Demand + YouTube Supply.</p>
                </div>

                <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
                    <div className="relative w-full md:w-80">
                        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search topic (e.g. AI, Crypto, Fitness)"
                            className="pl-9"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Searching..." : "Research"}
                    </Button>
                </form>
            </header>

            {isLoading ? (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
                    </div>
                    <Skeleton className="h-[400px] w-full" />
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <Skeleton className="h-[300px] w-full" />
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                </div>
            ) : error || !data ? (
                <div className="text-center py-20 border rounded-xl bg-muted/20">
                    <h2 className="text-2xl font-bold text-destructive">Error Loading Data</h2>
                    <p className="text-muted-foreground mt-2">Could not fetch data for "{searchTopic}". Please try another keyword.</p>
                    <Button variant="outline" className="mt-6" onClick={() => setSearchTopic("Next.js")}>
                        Reset to Default
                    </Button>
                </div>
            ) : (
                <div className={`space-y-8 transition-opacity duration-300 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
                    <OverviewCards
                        score={data.niche_score || data.score}
                        velocity={data.trend_velocity}
                        density={data.competition_density}
                        revenue={data.revenue_potential}
                        topRegions={data.top_regions}
                    />

                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                        <div className="lg:col-span-4 space-y-6">
                            <TrendVisualization data={data.trend_data} />
                            <SubtopicPanel subtopics={data.subtopics} />
                            <KeywordClusterPanel clusters={data.keyword_clusters} />
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <OpportunityInsightsPanel insights={data.opportunity_insights} />
                            <YouTubeMetricsPanel metrics={data.youtube_metrics} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
