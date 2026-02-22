'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStrategy } from '@/features/strategy/hooks/useStrategy';
import { StrategySummaryCard } from '@/features/strategy/components/StrategySummaryCard';
import { ContentPillarsGrid } from '@/features/strategy/components/ContentPillarsGrid';
import { WinningFormatsPanel } from '@/features/strategy/components/WinningFormatsPanel';
import { VideoIdeasBoard } from '@/features/strategy/components/VideoIdeasBoard';
import { DifferentiationPanel } from '@/features/strategy/components/DifferentiationPanel';
import { PostingPlanCard } from '@/features/strategy/components/PostingPlanCard';
import { QuickWinsPanel } from '@/features/strategy/components/QuickWinsPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search01Icon, BrainIcon, RefreshIcon } from 'hugeicons-react';

export default function StrategyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Pre-populate from URL param (cross-feature navigation from /trends and /creators)
    const urlKeyword = searchParams.get('keyword') ?? '';
    const [inputValue, setInputValue] = useState(urlKeyword);
    const [activeKeyword, setActiveKeyword] = useState(urlKeyword);

    // Sync when URL param changes (e.g. direct navigation)
    useEffect(() => {
        if (urlKeyword) {
            setInputValue(urlKeyword);
            setActiveKeyword(urlKeyword);
        }
    }, [urlKeyword]);

    const { data, isLoading, isError, error, refetch } = useStrategy(
        activeKeyword || null
    );

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        setActiveKeyword(trimmed);
        // Update URL without full navigation
        router.replace(`/strategy?keyword=${encodeURIComponent(trimmed)}`, {
            scroll: false,
        });
    };

    const isEmpty = !activeKeyword;

    return (
        <div className="container mx-auto px-4 py-8 space-y-12 animate-in fade-in duration-700 max-w-7xl">
            {/* ------------------------------------------------------------------ */}
            {/* HEADER                                                               */}
            {/* ------------------------------------------------------------------ */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <BrainIcon size={14} />
                        <span>AI Content Strategy Engine</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">
                            Content Strategy
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Data-driven execution plans — exactly what to create, when, and how to stand out.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <form
                    onSubmit={handleSearch}
                    className="flex w-full md:w-auto items-center gap-2"
                >
                    <div className="relative w-full md:w-96">
                        <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="strategy-keyword-input"
                            placeholder="Enter a niche keyword (e.g. personal finance)"
                            className="h-12 pl-10 text-base"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                    <Button
                        id="strategy-generate-btn"
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                        className="px-8 font-bold"
                    >
                        {isLoading ? 'Generating...' : 'Generate Strategy'}
                    </Button>
                </form>
            </header>

            {/* ------------------------------------------------------------------ */}
            {/* EMPTY STATE                                                          */}
            {/* ------------------------------------------------------------------ */}
            {isEmpty && (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border/30 rounded-3xl bg-muted/5">
                    <div className="text-6xl mb-6">🗺️</div>
                    <h2 className="text-2xl font-black text-center">
                        Enter a keyword to generate your personalized content strategy
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-md text-center">
                        Get 12 ready-to-film video ideas, a content pillar framework, posting
                        schedule, and differentiation plan — all in one place.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2 justify-center">
                        {['personal finance', 'ai tools', 'fitness'].map((kw) => (
                            <Button
                                key={kw}
                                variant="outline"
                                size="sm"
                                className="rounded-full border-border/50 text-muted-foreground"
                                onClick={() => {
                                    setInputValue(kw);
                                    setActiveKeyword(kw);
                                }}
                            >
                                Try &ldquo;{kw}&rdquo;
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* ERROR STATE                                                          */}
            {/* ------------------------------------------------------------------ */}
            {isError && !isEmpty && (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-destructive/30 rounded-3xl bg-destructive/5">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-black">Strategy Generation Failed</h2>
                    <p className="text-muted-foreground mt-2 text-center max-w-sm">
                        {error?.message ?? 'An unexpected error occurred. Please try again.'}
                    </p>
                    <Button
                        className="mt-6"
                        variant="outline"
                        onClick={() => refetch()}
                    >
                        <RefreshIcon size={14} className="mr-2" />
                        Retry
                    </Button>
                </div>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* MAIN CONTENT                                                         */}
            {/* ------------------------------------------------------------------ */}
            {!isEmpty && !isError && (
                <div className="space-y-16">
                    {/* 1. Strategy Summary */}
                    <StrategySummaryCard data={data} isLoading={isLoading} />

                    {/* 2. Pillars + Formats */}
                    <section className="space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight">
                                Your Channel Architecture
                            </h2>
                            <p className="text-muted-foreground">
                                The pillars that anchor your content and the formats that win in this niche.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3">
                                <ContentPillarsGrid
                                    pillars={data?.pillars ?? []}
                                    isLoading={isLoading}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <WinningFormatsPanel
                                    formats={data?.topFormats ?? []}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </section>

                    <Separator className="opacity-20" />

                    {/* 3. Video Ideas Board — hero section */}
                    <section className="space-y-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                                <span>12 Ready-to-Film Ideas</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">
                                Your Video Idea Pipeline
                            </h2>
                            <p className="text-muted-foreground">
                                Filter by difficulty or format. Every idea has a hook, audience profile, and signal rationale.
                            </p>
                        </div>
                        <VideoIdeasBoard
                            ideas={data?.videoIdeas ?? []}
                            isLoading={isLoading}
                        />
                    </section>

                    <Separator className="opacity-20" />

                    {/* 4. Differentiation + Posting Plan */}
                    <section className="space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight">
                                How to Win & When to Publish
                            </h2>
                            <p className="text-muted-foreground">
                                Your positioning strategy and optimal publishing schedule with a 3-phase growth roadmap.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
                            <div className="lg:col-span-6">
                                <DifferentiationPanel
                                    strategies={data?.differentiationStrategies ?? []}
                                    isLoading={isLoading}
                                />
                            </div>
                            <div className="lg:col-span-5">
                                <PostingPlanCard
                                    plan={data?.postingPlan}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </section>

                    <Separator className="opacity-20" />

                    {/* 5. Quick Wins — CTA section */}
                    <section className="space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight">
                                Start Here: First 2 Weeks
                            </h2>
                            <p className="text-muted-foreground">
                                The 5 highest-leverage moves to execute before everything else.
                            </p>
                        </div>
                        <QuickWinsPanel
                            wins={data?.quickWins ?? []}
                            isLoading={isLoading}
                        />
                    </section>
                </div>
            )}
        </div>
    );
}
