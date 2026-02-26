import { NextRequest, NextResponse } from 'next/server';
import { getMonetizationInsights, buildMonetizationInput } from '@/features/monetization/services/getMonetizationInsights';
import { getOrCreateNiche, saveMonetizationInsights } from '@/features/persistence/services/storageService';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

/**
 * GET /api/monetization?keyword=xxx
 * Returns full monetization analysis for a niche.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
        return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    try {
        // Auth check
        const userClient = await createServerSupabaseClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Check Supabase using Admin client
        const { data: niche } = await supabase
            .from('niches')
            .select('*, monetization_insights(*)')
            .eq('keyword', keyword)
            .single();

        if (niche?.monetization_insights) {
            const m = niche.monetization_insights;
            const reconstructed = {
                keyword: niche.keyword,
                monetizationScore: m.score,
                verdict: m.verdict,
                verdictLabel: m.verdict_label,
                verdictDescription: m.verdict_description,
                cpmTier: m.cpm_tier,
                marketMaturity: m.market_maturity,
                breakdown: m.score_breakdown,
                revenuePaths: m.revenue_paths,
                topOpportunities: m.top_opportunities,
                risks: m.risks,
                computedAt: m.last_computed
            };
            return NextResponse.json(reconstructed);
        }

        // 2. Build input and call logic (using deterministic mock data if needed)
        const seed = keyword.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const pseudoRandom = (offset: number) => (Math.sin(seed + offset) + 1) / 2;

        const input = buildMonetizationInput(
            keyword,
            { main_topic: keyword, niche_score: 75, trend_velocity: 80, competition_density: 'MEDIUM' } as any,
            { opportunityIndex: 65, classification: 'STRONG', signals: { weakCompetition: 80, underservedDemand: 70, smallCreatorAdvantage: 60, freshnessGap: 50 } } as any
        );

        const insights = await getMonetizationInsights(input);

        // 4. Persist
        const nicheRecord = await getOrCreateNiche(keyword);
        await saveMonetizationInsights(nicheRecord.id, insights);

        return NextResponse.json(insights);

    } catch (error: any) {
        console.error(`Monetization API error for keyword "${keyword}":`, error);
        return NextResponse.json({ error: "Failed to compute monetization insights", detail: error.message }, { status: 500 });
    }
}
