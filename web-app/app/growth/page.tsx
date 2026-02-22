/**
 * @file page.tsx
 * The main Creator Growth Blueprint dashboard page.
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGrowthBlueprint } from "@/features/growth/hooks/useGrowthBlueprint";
import { BlueprintSummaryCard } from "@/features/growth/components/BlueprintSummaryCard";
import { SubscriberMilestonesTracker } from "@/features/growth/components/SubscriberMilestonesTracker";
import { CadenceSchedule } from "@/features/growth/components/CadenceSchedule";
import { PlatformExpansionRoadmap } from "@/features/growth/components/PlatformExpansionRoadmap";
import { KpiProgressTracker } from "@/features/growth/components/KpiProgressTracker";
import { AlertsPanel } from "@/features/growth/components/AlertsPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search01Icon, RocketIcon } from "hugeicons-react";
import { motion } from "framer-motion";

function GrowthPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialKeyword = searchParams.get("keyword") || "";

    const [inputValue, setInputValue] = useState(initialKeyword);
    const [activeKeyword, setActiveKeyword] = useState(initialKeyword);

    const { data, isLoading, isError, error } = useGrowthBlueprint(activeKeyword || null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setActiveKeyword(inputValue.trim());
            // Update URL without refresh
            const params = new URLSearchParams(window.location.search);
            params.set("keyword", inputValue.trim());
            router.push(`/growth?${params.toString()}`, { scroll: false });
        }
    };

    // Update internal state if URL changes externally
    useEffect(() => {
        if (initialKeyword && initialKeyword !== activeKeyword) {
            setInputValue(initialKeyword);
            setActiveKeyword(initialKeyword);
        }
    }, [initialKeyword]);

    return (
        <div className="relative min-h-screen">
            {/* Page Navigation Sidebar */}
            <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3 p-1 rounded-2xl border bg-background/50 backdrop-blur-md shadow-lg group transition-all duration-300 w-12 hover:w-48 overflow-hidden">
                {[
                    { id: 'section-summary', label: 'Summary', icon: '📋' },
                    { id: 'section-journey', label: 'Journey', icon: '📈' },
                    { id: 'section-schedule', label: 'Schedule', icon: '📅' },
                    { id: 'section-platforms', label: 'Platforms', icon: '📱' },
                    { id: 'section-tracking', label: 'Tracking', icon: '🎯' },
                    { id: 'section-alerts', label: 'Alerts', icon: '⚠️' }
                ].map((nav) => (
                    <a
                        key={nav.id}
                        href={`#${nav.id}`}
                        className="flex items-center gap-4 p-2 rounded-xl transition-all duration-200 hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 group/item"
                    >
                        <span className="flex-shrink-0 w-6 text-center text-lg">{nav.icon}</span>
                        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {nav.label}
                        </span>
                    </a>
                ))}
            </aside>

            <div className="container mx-auto p-6 space-y-12 animate-in fade-in duration-700">
                {/* Header / Search */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
                            <RocketIcon size={14} className="fill-current" />
                            <span>Growth Engine v1.0 Live</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Creator Growth Blueprint</h1>
                            <p className="mt-2 text-lg text-muted-foreground">Deterministic scaling roadmap grounded in niche data.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="flex w-full md:w-auto items-center gap-2">
                        <div className="relative w-full md:w-96">
                            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter a niche (e.g. AI Tools, Coffee Roasting)"
                                className="h-12 pl-10 text-base"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="lg" disabled={isLoading} className="px-8 font-bold bg-emerald-600 hover:bg-emerald-700">
                            {isLoading ? "Charting..." : "Chart Growth"}
                        </Button>
                    </form>
                </header>

                {!activeKeyword ? (
                    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/5 text-center">
                        <div className="bg-emerald-500/10 p-6 rounded-full text-emerald-500 mb-6">
                            <RocketIcon size={48} />
                        </div>
                        <h2 className="text-2xl font-black">Begin Your Journey</h2>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            Enter a keyword above to generate a 120-week growth roadmap and execution schedule for your niche.
                        </p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-destructive/20 rounded-3xl bg-destructive/5 text-center">
                        <h2 className="text-xl font-bold text-destructive">Failed to generate blueprint</h2>
                        <p className="text-muted-foreground mt-2">{(error as any)?.message || "Internal Service Error"}</p>
                        <Button variant="outline" className="mt-6" onClick={() => setActiveKeyword(activeKeyword)}>
                            Retry Analysis
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Executive Summary Section */}
                        <div id="section-summary" className="scroll-mt-24">
                            <BlueprintSummaryCard data={data} isLoading={isLoading} />
                        </div>

                        {/* Timeline Hero Section */}
                        <section id="section-journey" className="space-y-8 scroll-mt-24">
                            <div className="flex flex-col items-center text-center space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">The Subscriber Journey</h3>
                                <p className="text-muted-foreground max-w-xl">
                                    Mapping your scale from the first 1,000 subscribers to global authority in the {activeKeyword} niche.
                                </p>
                            </div>
                            <SubscriberMilestonesTracker milestones={data?.subscriberMilestones || []} isLoading={isLoading} />
                        </section>

                        {/* Execution Row: Cadence + Platforms */}
                        <section className="grid grid-cols-1 lg:grid-cols-10 gap-8">
                            <div id="section-schedule" className="lg:col-span-6 space-y-8 scroll-mt-24">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tight">Content Execution Schedule</h3>
                                    <p className="text-sm text-muted-foreground">Strategic volume ramp-up and your first 12 weeks of topics.</p>
                                </div>
                                <CadenceSchedule
                                    phases={data?.cadencePhases || []}
                                    weeklySchedule={data?.first12WeeksSchedule || []}
                                    isLoading={isLoading}
                                />
                            </div>
                            <div id="section-platforms" className="lg:col-span-4 h-full scroll-mt-24">
                                <PlatformExpansionRoadmap platforms={data?.platformRecommendations || []} isLoading={isLoading} />
                            </div>
                        </section>

                        {/* Tracking & Alerts Section */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div id="section-tracking" className="scroll-mt-24">
                                <KpiProgressTracker kpis={data?.kpiTargets || []} isLoading={isLoading} />
                            </div>
                            <div id="section-alerts" className="scroll-mt-24">
                                <AlertsPanel alerts={data?.alerts || []} isLoading={isLoading} />
                            </div>
                        </section>

                        {/* Footnote */}
                        <div className="text-center pb-12">
                            <p className="text-xs text-muted-foreground opacity-50">
                                Blueprint generated based on market supply/demand heuristics. Local performance may vary by content quality.
                                <br />
                                Last updated: {data?.computedAt ? new Date(data.computedAt).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function GrowthPage() {
    return (
        <Suspense fallback={<div className="container mx-auto p-6"><Skeleton className="h-[200px] w-full" /></div>}>
            <GrowthPageContent />
        </Suspense>
    );
}
