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
import { getOrCreateNiche, saveContentStrategy } from '@/features/persistence/services/storageService';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
        return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
    }

    try {
        // 1. Check Supabase
        const { data: niche } = await supabase
            .from('niches')
            .select('*, content_strategies(*, video_ideas(*))')
            .eq('keyword', keyword)
            .single();

        if (niche?.content_strategies) {
            const s = niche.content_strategies;
            const reconstructed = {
                keyword: niche.keyword,
                postingPlan: s.posting_plan,
                pillars: s.pillars,
                topFormats: s.top_formats,
                videoIdeas: s.video_ideas,
                differentiationStrategies: s.differentiation_strategies,
                quickWins: s.quick_wins,
                computedAt: s.last_computed
            };
            return NextResponse.json(reconstructed);
        }

        // 2. Fresh generation path
        const seed = keyword.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const pr = (offset: number) => (Math.sin(seed + offset) + 1) / 2;

        const mockInsightsData = {
            main_topic: keyword,
            niche_score: Math.floor(pr(1) * 60 + 30),
            score: Math.floor(pr(1) * 60 + 30),
            trend_velocity: Math.floor(pr(2) * 80 + 10),
            competition_density: pr(3) > 0.7 ? 'HIGH' : pr(3) > 0.3 ? 'MEDIUM' : 'LOW',
            revenue_potential: Math.floor(pr(4) * 90 + 5),
            top_regions: ['US', 'UK', 'CA', 'AU'],
            trend_data: [], keyword_clusters: [], subtopics: [],
            opportunity_insights: {
                underserved_angles: [],
                emerging_keywords: [`${keyword} for beginners`, `best ${keyword} tools`],
                recommended_format: 'Long-form',
            },
            is_mock: true,
        };

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
            breakoutVideos: [],
            underservedKeywords: [],
            competitionInsights: [],
            entryInsights: [],
            computedAt: new Date().toISOString(),
        };

        const monetizationInput = buildMonetizationInput(keyword, mockInsightsData as any, mockOpportunityData as any);
        const mockMonetizationData = await getMonetizationInsights(monetizationInput);

        const strategyInput = buildStrategyInput(keyword, mockInsightsData as any, mockOpportunityData as any, mockMonetizationData);
        const contentStrategy = await getContentStrategy(strategyInput);

        // 3. Persist
        const nicheRecord = await getOrCreateNiche(keyword);
        await saveContentStrategy(nicheRecord.id, contentStrategy);

        // Simulated delay
        await new Promise((resolve) => setTimeout(resolve, 900));

        return NextResponse.json(contentStrategy, { status: 200 });
    } catch (error: any) {
        console.error(`[Strategy API] Failed for keyword: "${keyword}"`, error);
        return NextResponse.json({ error: 'Failed to generate content strategy', detail: error?.message ?? 'Unknown error' }, { status: 500 });
    }
}
