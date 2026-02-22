"use client";

import { useState, useEffect } from "react";
import { useTrends } from "@/features/trends/use-trends";
import { useInsights } from "@/features/insights/hooks/useInsights";
import { OverviewCards } from "@/features/trends/components/overview-cards";
import { TrendVisualization } from "@/features/trends/components/trend-visualization";
import { KeywordClusterPanel } from "@/features/trends/components/keyword-cluster-panel";
import { OpportunityInsightsPanel } from "@/features/trends/components/opportunity-insights-panel";
import { SubtopicPanel } from "@/features/trends/components/subtopic-panel";
import { YouTubeMetricsPanel } from "@/features/trends/components/youtube-metrics-panel";
import { OpportunityPanel } from "@/features/insights/components/OpportunityPanel";
import { MarketSnapshotCards } from "@/features/insights/components/MarketSnapshotCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search01Icon } from "hugeicons-react";

// ---------------------------------------------------------------------------
// Debounce hook — delays triggering insights fetch while user is still typing
// ---------------------------------------------------------------------------
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TrendsPage() {
    // Existing trends search (form submit driven)
    const [searchTopic, setSearchTopic] = useState("Next.js");
    const [inputValue, setInputValue] = useState("Next.js");
    const { data, isLoading, isPlaceholderData, error } = useTrends(searchTopic);

    // New insights search (debounced, separate controlled input)
    const [insightKeyword, setInsightKeyword] = useState("");
    const debouncedInsightKeyword = useDebounce(insightKeyword, 500);
    const { data: insightsData, isLoading: insightsLoading, isError: insightsError } =
        useInsights(debouncedInsightKeyword || null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchTopic(inputValue.trim());
        }
    };

    // ---- Empty state message for insights section ----
    const showInsightsEmpty = !insightKeyword.trim();
    const showInsightsError = insightsError && !insightsLoading;

    return (
        <div className="container mx-auto p-6 space-y-10 animate-in fade-in duration-700">
            {/* ---------------------------------------------------------------- */}
            {/* Header + existing search                                          */}
            {/* ---------------------------------------------------------------- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Trend & Niche Discovery</h1>
                    <p className="text-muted-foreground">
                        Identify high-growth market opportunities combining Search Demand + YouTube Supply.
                    </p>
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

            {/* ---------------------------------------------------------------- */}
            {/* ✦ NEW: Opportunity Scoring Section                               */}
            {/* ---------------------------------------------------------------- */}
            <section className="space-y-6">
                {/* Section header + keyword input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                            <span className="text-violet-400">◆</span>
                            Opportunity Intelligence
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Enter a keyword to get a data-driven opportunity score and market breakdown.
                        </p>
                    </div>

                    {/* Insights keyword input — debounced, standalone */}
                    <div className="relative w-full sm:w-80">
                        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="insights-keyword-input"
                            placeholder="e.g. home workout, AI tools…"
                            className="pl-9"
                            value={insightKeyword}
                            onChange={(e) => setInsightKeyword(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content area */}
                {showInsightsEmpty ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border/60 bg-muted/10 text-center gap-3">
                        <span className="text-4xl">🔍</span>
                        <h3 className="text-lg font-semibold">Analyse a Niche</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Enter a keyword above to analyse its opportunity score, competition level, and market signals.
                        </p>
                    </div>
                ) : showInsightsError ? (
                    /* Error state */
                    <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-destructive/30 bg-destructive/5 text-center gap-3">
                        <span className="text-4xl">⚠️</span>
                        <h3 className="text-lg font-semibold text-destructive">Analysis Failed</h3>
                        <p className="text-sm text-muted-foreground">
                            Could not analyse &ldquo;{debouncedInsightKeyword}&rdquo;. Please try a different keyword.
                        </p>
                    </div>
                ) : (
                    /* Score panel + snapshot cards */
                    <div className="space-y-6">
                        {/* Market Snapshot Cards — full width above panel */}
                        <MarketSnapshotCards
                            data={insightsData}
                            isLoading={insightsLoading}
                        />

                        {/* Opportunity Panel — desktop: side by side with a detail col */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <OpportunityPanel
                                    data={insightsData}
                                    isLoading={insightsLoading}
                                />
                            </div>

                            {/* Signal Detail Card */}
                            {(insightsData || insightsLoading) && (
                                <div className="lg:col-span-2 flex flex-col gap-4">
                                    {insightsLoading ? (
                                        <>
                                            <Skeleton className="h-6 w-40" />
                                            <div className="grid grid-cols-2 gap-4">
                                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                                    <div key={i} className="space-y-1.5 p-4 rounded-xl border border-border/40 bg-card/30">
                                                        <Skeleton className="h-3 w-24" />
                                                        <Skeleton className="h-6 w-16" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : insightsData ? (
                                        <>
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                                Raw Signal Detail
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {[
                                                    { label: "Growth Rate", value: `${insightsData.signals.trend.growthRate}%` },
                                                    { label: "Avg Engagement", value: `${insightsData.signals.creator.avgEngagement}/100` },
                                                    { label: "Top Ch. Subs", value: insightsData.signals.creator.topChannelSubs >= 1_000_000 ? `${(insightsData.signals.creator.topChannelSubs / 1_000_000).toFixed(1)}M` : `${(insightsData.signals.creator.topChannelSubs / 1_000).toFixed(0)}K` },
                                                    { label: "Video Count", value: insightsData.signals.creator.videoCount >= 1_000_000 ? `${(insightsData.signals.creator.videoCount / 1_000_000).toFixed(1)}M` : `${(insightsData.signals.creator.videoCount / 1_000).toFixed(0)}K` },
                                                    { label: "Upload Freq.", value: `${insightsData.signals.creator.uploadFrequency}/wk` },
                                                    { label: "Regional Strength", value: `${insightsData.signals.trend.regionalStrength}/100` },
                                                ].map((item) => (
                                                    <div
                                                        key={item.label}
                                                        className="p-4 rounded-xl border border-border/40 bg-card/30 hover:border-border/70 transition-colors"
                                                    >
                                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                                                            {item.label}
                                                        </p>
                                                        <p className="text-lg font-bold tabular-nums">{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Existing Trends Section                                           */}
            {/* ---------------------------------------------------------------- */}
            <section className="space-y-8">
                <div className="flex items-center gap-2">
                    <span className="text-blue-400">◆</span>
                    <h2 className="text-xl font-semibold tracking-tight">Trend Analytics</h2>
                </div>

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
                        <p className="text-muted-foreground mt-2">
                            Could not fetch data for &ldquo;{searchTopic}&rdquo;. Please try another keyword.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={() => setSearchTopic("Next.js")}>
                            Reset to Default
                        </Button>
                    </div>
                ) : (
                    <div className={`space-y-8 transition-opacity duration-300 ${isPlaceholderData ? "opacity-50" : "opacity-100"}`}>
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
            </section>
        </div>
    );
}
