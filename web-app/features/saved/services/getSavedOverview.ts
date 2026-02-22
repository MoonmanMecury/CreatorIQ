import { createClient } from '@/lib/supabase/client';
import { SavedNichesOverview, SavedNiche } from '../types';
import { getOpportunityFeed } from './getOpportunityFeed';



/**
 * Aggregates all data for the personal dashboard home.
 */
export async function getSavedOverview(userId: string, supabaseClient?: any): Promise<SavedNichesOverview> {
    const supabase = supabaseClient || createClient();
    // 1. Fetch saved niches
    const { data: savedNiches, error: nichesError } = await supabase
        .from('saved_niches')
        .select('*')
        .eq('user_id', userId)
        .order('opportunity_score', { ascending: false });

    if (nichesError) throw nichesError;

    const mappedNiches = savedNiches.map(mapNicheRow);

    // 2. Fetch recent feed items
    const feedItems = await getOpportunityFeed(userId, 20, supabase);

    // 3. Compute aggregations
    const topOpportunities = mappedNiches.slice(0, 3);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Recently changed = have a feed event with score_delta in last 7 days
    const { data: recentChanges } = await supabase
        .from('feed_events')
        .select('saved_niche_id')
        .eq('user_id', userId)
        .not('score_delta', 'is', null)
        .gt('created_at', oneWeekAgo.toISOString());

    const changedIds = new Set(recentChanges?.map((r: any) => r.saved_niche_id) || []);
    const recentlyChanged = mappedNiches.filter((n: SavedNiche) => changedIds.has(n.id));

    const totalSaved = mappedNiches.length;
    const goldmineCount = mappedNiches.filter((n: SavedNiche) => n.verdict === 'GOLDMINE').length;
    const averageOpportunityScore = totalSaved > 0
        ? Math.round(mappedNiches.reduce((acc: number, n: SavedNiche) => acc + (n.opportunityScore || 0), 0) / totalSaved)
        : 0;

    return {
        savedNiches: mappedNiches,
        feedItems,
        topOpportunities,
        recentlyChanged,
        totalSaved,
        goldmineCount,
        averageOpportunityScore
    };
}

function mapNicheRow(row: any): SavedNiche {
    return {
        id: row.id,
        userId: row.user_id,
        keyword: row.keyword,
        opportunityScore: row.opportunity_score,
        growthScore: row.growth_score,
        monetizationScore: row.monetization_score,
        competitionScore: row.competition_score,
        demandScore: row.demand_score,
        saturationScore: row.saturation_score,
        opportunityIndex: row.opportunity_index,
        verdict: row.verdict,
        monetizationVerdict: row.monetization_verdict,
        marketMaturity: row.market_maturity,
        topRevenuePaths: row.top_revenue_paths || [],
        notes: row.notes,
        tags: row.tags || [],
        createdAt: row.created_at,
        lastAnalyzedAt: row.last_analyzed_at,
        market_maturity: row.market_maturity,
        top_revenue_paths: row.top_revenue_paths || []
    };
}
