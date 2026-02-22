/**
 * GET /api/strategy?keyword=...
 * Returns a full ContentStrategy for the given keyword.
 * Rule-based synchronous generation — no LLM or paid API calls.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getContentStrategy,
    buildStrategyInput,
} from '@/features/strategy/services/getContentStrategy';
import { getMonetizationInsights, buildMonetizationInput } from '@/features/monetization/services/getMonetizationInsights';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
        return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
    }

    try {
        // Simulated delay — strategy generation feels like it's doing real work
        await new Promise((resolve) => setTimeout(resolve, 900));

        // -----------------------------------------------------------------------
        // Deterministic seed from keyword (same pattern used by Steps 3 & 5)
        // -----------------------------------------------------------------------
        const seed = keyword
            .split('')
            .reduce((a, b) => a + b.charCodeAt(0), 0);
        const pr = (offset: number) => (Math.sin(seed + offset) + 1) / 2;

        // -----------------------------------------------------------------------
        // Simulated Step 2 (Insights) data
        // -----------------------------------------------------------------------
        const mockInsightsData = {
            main_topic: keyword,
            niche_score: Math.floor(pr(1) * 60 + 30),
            score: Math.floor(pr(1) * 60 + 30),
            trend_velocity: Math.floor(pr(2) * 80 + 10),
            competition_density: pr(3) > 0.7 ? 'HIGH' : pr(3) > 0.3 ? 'MEDIUM' : 'LOW',
            revenue_potential: Math.floor(pr(4) * 90 + 5),
            top_regions: ['US', 'UK', 'CA', 'AU'],
            trend_data: [],
            keyword_clusters: [],
            subtopics: [],
            opportunity_insights: {
                underserved_angles: [],
                emerging_keywords: [
                    `${keyword} for beginners`,
                    `${keyword} tutorial 2025`,
                    `best ${keyword} tools`,
                    `${keyword} tips`,
                ],
                recommended_format: 'Long-form',
            },
            is_mock: true,
        };

        // -----------------------------------------------------------------------
        // Simulated Step 3 (Opportunities) data
        // -----------------------------------------------------------------------
        const risingKeywords = [
            { keyword: `${keyword} for beginners`, growthRate: Math.floor(pr(10) * 80 + 20), competitionLevel: 'LOW' as const, searchVolumeTrend: 'RISING' as const, isLongTail: true, relatedTo: keyword },
            { keyword: `best ${keyword} tools`, growthRate: Math.floor(pr(11) * 70 + 20), competitionLevel: 'MEDIUM' as const, searchVolumeTrend: 'RISING' as const, isLongTail: true, relatedTo: keyword },
            { keyword: `${keyword} tutorial 2025`, growthRate: Math.floor(pr(12) * 60 + 20), competitionLevel: 'LOW' as const, searchVolumeTrend: 'RISING' as const, isLongTail: true, relatedTo: keyword },
            { keyword: `${keyword} tips and tricks`, growthRate: Math.floor(pr(13) * 50 + 20), competitionLevel: 'MEDIUM' as const, searchVolumeTrend: 'STABLE' as const, isLongTail: true, relatedTo: keyword },
            { keyword: `${keyword} step by step`, growthRate: Math.floor(pr(14) * 40 + 20), competitionLevel: 'LOW' as const, searchVolumeTrend: 'RISING' as const, isLongTail: true, relatedTo: keyword },
        ];

        const breakoutVideos = [
            {
                videoId: 'sim1',
                title: `Complete ${keyword} Guide for 2025`,
                channelName: 'TechGrowthChannel',
                channelSubscribers: Math.floor(pr(20) * 200000 + 50000),
                views: Math.floor(pr(21) * 500000 + 100000),
                likes: Math.floor(pr(22) * 20000 + 5000),
                comments: Math.floor(pr(23) * 2000 + 500),
                publishDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                outperformanceRatio: parseFloat((pr(24) * 3 + 1).toFixed(2)),
                thumbnailUrl: '',
                videoUrl: '',
            },
            {
                videoId: 'sim2',
                title: `I Tried ${keyword} for 30 Days`,
                channelName: 'ContentCreatorsPro',
                channelSubscribers: Math.floor(pr(25) * 80000 + 10000),
                views: Math.floor(pr(26) * 300000 + 50000),
                likes: Math.floor(pr(27) * 10000 + 2000),
                comments: Math.floor(pr(28) * 800 + 100),
                publishDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                outperformanceRatio: parseFloat((pr(29) * 4 + 1.5).toFixed(2)),
                thumbnailUrl: '',
                videoUrl: '',
            },
        ];

        const mockOpportunityData = {
            keyword,
            opportunityIndex: Math.floor(pr(5) * 70 + 20),
            classification: 'STRONG' as const,
            signals: {
                weakCompetition: Math.floor(pr(6) * 100),
                underservedDemand: Math.floor(pr(7) * 100),
                smallCreatorAdvantage: Math.floor(pr(8) * 100),
                freshnessGap: Math.floor(pr(9) * 100),
            },
            breakoutVideos,
            underservedKeywords: risingKeywords,
            competitionInsights: [],
            entryInsights: [],
            computedAt: new Date().toISOString(),
        };

        // -----------------------------------------------------------------------
        // Simulated Step 5 (Monetization) data
        // -----------------------------------------------------------------------
        const monetizationInput = buildMonetizationInput(
            keyword,
            mockInsightsData as any,
            mockOpportunityData as any
        );
        const mockMonetizationData = getMonetizationInsights(monetizationInput);

        // -----------------------------------------------------------------------
        // Build StrategyInput and generate ContentStrategy
        // -----------------------------------------------------------------------
        const strategyInput = buildStrategyInput(
            keyword,
            mockInsightsData as any,
            mockOpportunityData,
            mockMonetizationData
        );

        const contentStrategy = getContentStrategy(strategyInput);

        return NextResponse.json(contentStrategy, { status: 200 });
    } catch (error: any) {
        console.error(`[Strategy API] Failed for keyword: "${keyword}"`, error);
        return NextResponse.json(
            {
                error: 'Failed to generate content strategy',
                detail: error?.message ?? 'Unknown error',
            },
            { status: 500 }
        );
    }
}
