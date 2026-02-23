"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTrends } from "@/features/trends/use-trends";
import { useOpportunities } from "@/features/opportunities/hooks/useOpportunities";
import { useMonetization } from "@/features/monetization/hooks/useMonetization";
import { useInsights } from "@/features/insights/hooks/useInsights";

import { OverviewCards } from "@/features/trends/components/overview-cards";
import { TrendVisualization } from "@/features/trends/components/trend-visualization";
import { KeywordClusterPanel } from "@/features/trends/components/keyword-cluster-panel";
import { OpportunityInsightsPanel } from "@/features/trends/components/opportunity-insights-panel";
import { SubtopicPanel } from "@/features/trends/components/subtopic-panel";
import { YouTubeMetricsPanel } from "@/features/trends/components/youtube-metrics-panel";

import { OpportunityScoreCard } from "@/features/opportunities/components/OpportunityScoreCard";
import { CompetitionWeaknessPanel } from "@/features/opportunities/components/CompetitionWeaknessPanel";
import { BreakoutVideosList } from "@/features/opportunities/components/BreakoutVideosList";
import { UnderservedKeywordsList } from "@/features/opportunities/components/UnderservedKeywordsList";

import { MonetizationScoreCard } from "@/features/monetization/components/MonetizationScoreCard";
import { MonetizationBreakdownPanel } from "@/features/monetization/components/MonetizationBreakdownPanel";
import { RevenuePathwaysPanel } from "@/features/monetization/components/RevenuePathwaysPanel";
import { OpportunitiesRisksPanel } from "@/features/monetization/components/OpportunitiesRisksPanel";

import { OpportunityPanel } from "@/features/insights/components/OpportunityPanel";
import { MarketSnapshotCards } from "@/features/insights/components/MarketSnapshotCards";
import { SaveButton } from "@/features/saved/components/SaveButton";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search01Icon, ZapIcon } from "hugeicons-react";
import { ArrowRight } from "lucide-react";

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
    const [searchTopic, setSearchTopic] = useState("");
    const [inputValue, setInputValue] = useState("");

    // Core trend data (search demand + basic metrics)
    const { data: trendData, isLoading: isTrendLoading, isPlaceholderData, error: trendError } = useTrends(searchTopic);

    // Detailed gap analysis and creator opportunities
    const { data: opportunityData, isLoading: isOppLoading, refetch: refetchOpp } = useOpportunities(searchTopic);

    // Monetization intelligence
    const { data: monetizationData, isLoading: isMonLoading } = useMonetization(searchTopic);

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

    const handleKeywordClick = (keyword: string) => {
        setInputValue(keyword);
        setSearchTopic(keyword);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isLoading = isTrendLoading; // Main page primary loader

    // ---- Empty state message for insights section ----
    const showInsightsEmpty = !insightKeyword.trim();
    const showInsightsError = insightsError && !insightsLoading;

    return (
        <div className="relative min-h-screen bg-background text-foreground">
            {/* Page Navigation Sidebar */}
            <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3 p-1 rounded-2xl border bg-background/50 backdrop-blur-md shadow-lg group transition-all duration-300 w-12 hover:w-48 overflow-hidden">
                {[
                    { id: 'section-intelligence', label: 'Intelligence', icon: '⚡' },
                    { id: 'section-analytics', label: 'Analytics', icon: '📊' },
                    { id: 'section-gap', label: 'Gap Analysis', icon: '🔍' },
                    { id: 'section-monetization', label: 'Monetization', icon: '💰' }
                ].map((nav) => (
                    <button
                        key={nav.id}
                        onClick={() => document.getElementById(nav.id)?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all whitespace-nowrap"
                    >
                        <span className="text-sm shrink-0">{nav.icon}</span>
                        <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            {nav.label}
                        </span>
                    </button>
                ))}
            </aside>

            <div className="container mx-auto p-6 space-y-16 animate-in fade-in duration-700">
                {/* ---------------------------------------------------------------- */}
                {/* Header + existing search                                          */}
                {/* ---------------------------------------------------------------- */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            <ZapIcon size={14} className="fill-current" />
                            <span>Intelligence v1.2 Active</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight tracking-tighter sm:text-5xl">Trend & Niche Discovery</h1>
                            <p className="mt-2 text-lg text-muted-foreground">Combining Google Search Demand + YouTube Platform Supply.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-96">
                            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter a keyword (e.g. AI Agents, Sustainable Fashion)"
                                className="h-12 pl-10 text-base"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="lg" disabled={isLoading} className="px-8 font-bold h-12">
                            {isLoading ? "Analyzing..." : "Analyze Niche"}
                        </Button>
                        {searchTopic && (
                            <SaveButton
                                keyword={searchTopic}
                                className="h-12"
                                currentScores={{
                                    opportunityScore: opportunityData?.opportunityIndex,
                                    growthScore: trendData?.niche_score || trendData?.score,
                                    monetizationScore: monetizationData?.monetizationScore,
                                    demandScore: trendData?.trend_velocity,
                                    verdict: insightsData?.verdict,
                                    monetizationVerdict: monetizationData?.verdict,
                                    marketMaturity: monetizationData?.marketMaturity,
                                    topRevenuePaths: monetizationData?.revenuePaths?.map((p: any) => p.type)
                                }}
                            />
                        )}
                    </form>
                </header>

                {/* ---------------------------------------------------------------- */}
                {/* ✦ Opportunity Scoring Section                                   */}
                {/* ---------------------------------------------------------------- */}
                <section id="section-intelligence" className="space-y-6 scroll-mt-24">
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
                        <div className="flex items-center gap-3 w-full sm:w-auto">
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
                            {insightKeyword && (
                                <SaveButton
                                    keyword={insightKeyword}
                                    currentScores={{
                                        opportunityScore: insightsData?.opportunityScore,
                                        verdict: insightsData?.verdict
                                    }}
                                />
                            )}
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
                <section id="section-analytics" className="space-y-16 pt-8 border-t border-border/50 scroll-mt-24">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400">◆</span>
                        <h2 className="text-2xl font-black tracking-tight">Trend Analytics & Niche Insights</h2>
                    </div>

                    {isLoading ? (
                        <div className="space-y-8">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                            </div>
                            <Skeleton className="h-[500px] w-full rounded-2xl" />
                            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                <Skeleton className="h-[350px] w-full rounded-2xl" />
                                <Skeleton className="h-[350px] w-full rounded-2xl" />
                            </div>
                        </div>
                    ) : !searchTopic ? (
                        <div className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] border-2 border-dashed border-border/60 bg-muted/5 text-center gap-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-4xl shadow-inner">
                                📊
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Analytics Awaiting Input</h3>
                                <p className="text-muted-foreground max-w-md mx-auto text-lg">
                                    Use the analyzer at the top to compute search demand, subtopic clusters, and YouTube platform supply.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                {["AI Agents", "Biohacking", "Miniature Gaming"].map(kw => (
                                    <Button
                                        key={kw}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full px-4 hover:border-primary/50 transition-all font-bold text-xs"
                                        onClick={() => {
                                            setInputValue(kw);
                                            setSearchTopic(kw);
                                        }}
                                    >
                                        Try &ldquo;{kw}&rdquo;
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ) : trendError || !trendData ? (
                        <div className="text-center py-20 border-2 border-dashed border-destructive/20 rounded-3xl bg-destructive/5 animate-in fade-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6 text-2xl">
                                ⚠️
                            </div>
                            <h2 className="text-2xl font-black text-destructive tracking-tight">Analysis Failed</h2>
                            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                                We couldn&apos;t reach the trend engine for &ldquo;<span className="font-bold text-foreground">{searchTopic}</span>&rdquo;.
                            </p>
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <Button variant="outline" className="font-bold rounded-xl" onClick={() => setSearchTopic("")}>
                                    Clear Search
                                </Button>
                                <Button className="font-bold rounded-xl px-8" onClick={() => handleSearch(new Event('submit') as any)}>
                                    Refresh Pipeline
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className={`space-y-16 transition-opacity duration-300 ${isPlaceholderData ? "opacity-50" : "opacity-100"}`}>
                            {/* Market Overview */}
                            <div className="space-y-8">
                                <OverviewCards
                                    score={trendData.niche_score || trendData.score}
                                    velocity={trendData.trend_velocity}
                                    density={trendData.competition_density}
                                    revenue={trendData.revenue_potential}
                                    topRegions={trendData.top_regions}
                                />

                                <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                                    <div className="lg:col-span-4 space-y-6">
                                        <TrendVisualization data={trendData.trend_data} />
                                        <SubtopicPanel subtopics={trendData.subtopics} />
                                        <KeywordClusterPanel clusters={trendData.keyword_clusters} />
                                    </div>
                                    <div className="lg:col-span-2 space-y-6">
                                        <OpportunityInsightsPanel insights={trendData.opportunity_insights} />
                                        <YouTubeMetricsPanel metrics={trendData.youtube_metrics} />
                                    </div>
                                </div>
                            </div>

                            {/* Gap Analysis */}
                            <div id="section-gap" className="space-y-10 border-t border-border/50 pt-16 scroll-mt-24">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight">Where You Can Win</h2>
                                    <p className="text-muted-foreground max-w-2xl">
                                        Detailed gap analysis identifying where existing competition is failing and where new creators are breaking through.
                                    </p>
                                </div>

                                <div className="grid gap-6">
                                    <OpportunityScoreCard data={opportunityData} isLoading={isOppLoading} />

                                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                                        <CompetitionWeaknessPanel data={opportunityData} isLoading={isOppLoading} />
                                        <BreakoutVideosList
                                            videos={opportunityData?.breakoutVideos || []}
                                            isLoading={isOppLoading}
                                        />
                                    </div>

                                    <UnderservedKeywordsList
                                        keywords={opportunityData?.underservedKeywords || []}
                                        isLoading={isOppLoading}
                                        onKeywordClick={handleKeywordClick}
                                    />
                                </div>
                            </div>

                            {/* Monetization */}
                            <div id="section-monetization" className="space-y-10 border-t border-border/50 pt-16 scroll-mt-24">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl font-black tracking-tight">💰 Monetization Potential</h2>
                                    </div>
                                    <p className="text-muted-foreground max-w-2xl">
                                        Evaluating commercial interest, audience value, and diversified revenue pathways to determine if this niche is a viable business.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid gap-6 grid-cols-1 lg:grid-cols-10">
                                        <div className="lg:col-span-4 h-full">
                                            <MonetizationScoreCard data={monetizationData} isLoading={isMonLoading} />
                                        </div>
                                        <div className="lg:col-span-6 h-full">
                                            <MonetizationBreakdownPanel breakdown={monetizationData?.breakdown} isLoading={isMonLoading} />
                                        </div>
                                    </div>

                                    <RevenuePathwaysPanel paths={monetizationData?.revenuePaths || []} isLoading={isMonLoading} />

                                    <OpportunitiesRisksPanel
                                        opportunities={monetizationData?.topOpportunities || []}
                                        risks={monetizationData?.risks || []}
                                        isLoading={isMonLoading}
                                    />

                                    {/* CTAs */}
                                    <div className="flex flex-col items-center gap-4 pt-8 border-t border-border/30">
                                        <Link href={`/strategy?keyword=${encodeURIComponent(searchTopic)}`}>
                                            <Button
                                                size="lg"
                                                className="px-8 font-bold gap-2 shadow-[0_0_20px_rgba(var(--primary)/0.3)] hover:shadow-[0_0_30px_rgba(var(--primary)/0.5)] transition-all"
                                            >
                                                Generate Content Strategy
                                                <ArrowRight size={16} />
                                            </Button>
                                        </Link>

                                        <Link
                                            href={`/growth?keyword=${encodeURIComponent(searchTopic)}`}
                                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                        >
                                            View Growth Blueprint
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
