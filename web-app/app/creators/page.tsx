"use client";

import { useCreator } from "@/features/creators/use-creator";
import { CreatorHeader } from "@/features/creators/components/creator-header";
import { EngagementBreakdown } from "@/features/creators/components/engagement-breakdown";
import { AudienceOverview } from "@/features/creators/components/audience-overview";
import { CompetitionDensityIndicator } from "@/features/creators/components/competition-density";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorsPage() {
    const { data, isLoading, error } = useCreator();

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-8 mt-12">
                <Skeleton className="h-40 w-full" />
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                    <Skeleton className="lg:col-span-4 h-[400px]" />
                    <Skeleton className="lg:col-span-2 h-[400px]" />
                </div>
                <Skeleton className="h-[200px] w-full" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mx-auto p-6 text-center mt-20">
                <h2 className="text-2xl font-bold text-destructive">Error Loading Data</h2>
                <p className="text-muted-foreground mt-2">Please check your connection or try again later.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Competition & Creator Analysis</h1>
                <p className="text-muted-foreground">Deep dive into creator performance and audience demographics.</p>
            </header>

            <CreatorHeader profile={data.profile} />

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-6">
                <EngagementBreakdown
                    posts={data.engagement_breakdown.posts}
                    trend={data.engagement_breakdown.trend}
                />
                <AudienceOverview
                    regions={data.audience_overview.regions}
                    ageSegments={data.audience_overview.age_segments}
                />
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <CompetitionDensityIndicator density={data.competition_density} />
                {/* Placeholder for other analysis metrics */}
            </div>
        </div>
    );
}
