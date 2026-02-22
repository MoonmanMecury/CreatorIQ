import { createClient } from '@/lib/supabase/client';
import { SaveNichePayload, SavedNiche } from '../types';
import { detectScoreChanges, generateChangeEvents } from '../changeDetection';

/**
 * Saves or updates a niche for a user.
 */
export async function saveNiche(payload: SaveNichePayload, userId: string, supabaseClient?: any): Promise<SavedNiche> {
    const supabase = supabaseClient || createClient();

    // 1. Check if niche already exists
    const { data: existing } = await supabase
        .from('saved_niches')
        .select('*')
        .eq('user_id', userId)
        .eq('keyword', payload.keyword)
        .single();

    if (existing) {
        // 2. Update existing niche
        const { data: updated, error: updateError } = await supabase
            .from('saved_niches')
            .update({
                opportunity_score: payload.opportunityScore,
                growth_score: payload.growthScore,
                monetization_score: payload.monetizationScore,
                competition_score: payload.competitionScore,
                demand_score: payload.demandScore,
                saturation_score: payload.saturationScore,
                opportunity_index: payload.opportunityIndex,
                verdict: payload.verdict,
                monetization_verdict: payload.monetizationVerdict,
                market_maturity: payload.marketMaturity,
                top_revenue_paths: payload.topRevenuePaths,
                last_analyzed_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Record score history & generate events
        await recordHistoryAndEvents(existing.id, userId, payload.keyword, payload, supabase);

        return mapNicheRow(updated);
    } else {
        // 4. Insert new niche
        const { data: inserted, error: insertError } = await supabase
            .from('saved_niches')
            .insert([{
                user_id: userId,
                keyword: payload.keyword,
                opportunity_score: payload.opportunityScore,
                growth_score: payload.growthScore,
                monetization_score: payload.monetizationScore,
                competition_score: payload.competitionScore,
                demand_score: payload.demandScore,
                saturation_score: payload.saturationScore,
                opportunity_index: payload.opportunityIndex,
                verdict: payload.verdict,
                monetization_verdict: payload.monetizationVerdict,
                market_maturity: payload.marketMaturity,
                top_revenue_paths: payload.topRevenuePaths,
                notes: payload.notes,
                tags: payload.tags || []
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        // 5. Initial history and 'SAVED' event
        await supabase.from('niche_score_history').insert([{
            saved_niche_id: inserted.id,
            opportunity_score: payload.opportunityScore,
            growth_score: payload.growthScore,
            monetization_score: payload.monetizationScore,
            competition_score: payload.competitionScore,
            demand_score: payload.demandScore
        }]);

        await supabase.from('feed_events').insert([{
            saved_niche_id: inserted.id,
            user_id: userId,
            event_type: 'SAVED',
            event_title: `New Niche Saved: ${payload.keyword}`,
            event_description: `You've started tracking ${payload.keyword}. We'll notify you of significant score changes.`,
            severity: 'INFO'
        }]);

        return mapNicheRow(inserted);
    }
}

/**
 * Removes a niche and its history.
 */
export async function unsaveNiche(nicheId: string, userId: string, supabaseClient?: any): Promise<void> {
    const supabase = supabaseClient || createClient();
    const { error } = await supabase
        .from('saved_niches')
        .delete()
        .eq('id', nicheId)
        .eq('user_id', userId);

    if (error) throw error;
}

/**
 * Updates private notes for a niche.
 */
export async function updateNicheNotes(nicheId: string, userId: string, notes: string, supabaseClient?: any): Promise<SavedNiche> {
    const supabase = supabaseClient || createClient();
    const { data: updated, error } = await supabase
        .from('saved_niches')
        .update({ notes })
        .eq('id', nicheId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;

    await supabase.from('feed_events').insert([{
        saved_niche_id: nicheId,
        user_id: userId,
        event_type: 'NOTE_ADDED',
        event_title: `Note Added to ${updated.keyword}`,
        event_description: `You added a strategic note: "${notes.slice(0, 50)}${notes.length > 50 ? '...' : ''}"`,
        severity: 'INFO'
    }]);

    return mapNicheRow(updated);
}

/**
 * Updates tags for a niche.
 */
export async function updateNicheTags(nicheId: string, userId: string, tags: string[], supabaseClient?: any): Promise<SavedNiche> {
    const supabase = supabaseClient || createClient();
    const { data: updated, error } = await supabase
        .from('saved_niches')
        .update({ tags })
        .eq('id', nicheId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return mapNicheRow(updated);
}

/**
 * Checks if a specific keyword is already saved by the user.
 */
export async function isNicheSaved(keyword: string, userId: string, supabaseClient?: any): Promise<boolean> {
    const supabase = supabaseClient || createClient();
    const { data } = await supabase
        .from('saved_niches')
        .select('id')
        .eq('user_id', userId)
        .eq('keyword', keyword)
        .maybeSingle();
    return !!data;
}

/**
 * Re-analyzes a niche by comparing old and new scores.
 */
export async function reanalyzeNiche(nicheId: string, userId: string, newScores: SaveNichePayload, supabaseClient?: any): Promise<SavedNiche> {
    const supabase = supabaseClient || createClient();
    const { data: lastHistory } = await supabase
        .from('niche_score_history')
        .select('*')
        .eq('saved_niche_id', nicheId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

    const changes = lastHistory ? detectScoreChanges(lastHistory as any, newScores) : [];

    const { data: updated, error } = await supabase
        .from('saved_niches')
        .update({
            opportunity_score: newScores.opportunityScore,
            growth_score: newScores.growthScore,
            monetization_score: newScores.monetizationScore,
            competition_score: newScores.competitionScore,
            demand_score: newScores.demandScore,
            last_analyzed_at: new Date().toISOString()
        })
        .eq('id', nicheId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;

    // Record new history point
    await supabase.from('niche_score_history').insert([{
        saved_niche_id: nicheId,
        opportunity_score: newScores.opportunityScore,
        growth_score: newScores.growthScore,
        monetization_score: newScores.monetizationScore,
        competition_score: newScores.competitionScore,
        demand_score: newScores.demandScore
    }]);

    // Feed events
    const changeEvents = generateChangeEvents(nicheId, userId, updated.keyword, changes);
    if (changeEvents.length > 0) {
        await supabase.from('feed_events').insert(changeEvents);
    }

    await supabase.from('feed_events').insert([{
        saved_niche_id: nicheId,
        user_id: userId,
        event_type: 'REANALYZED',
        event_title: `Re-analyzed ${updated.keyword}`,
        event_description: `Niche data refreshed. ${changeEvents.length} distinct changes detected.`,
        severity: 'INFO'
    }]);

    return mapNicheRow(updated);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function recordHistoryAndEvents(nicheId: string, userId: string, keyword: string, payload: SaveNichePayload, supabase: any) {
    const { data: lastHistory } = await supabase
        .from('niche_score_history')
        .select('*')
        .eq('saved_niche_id', nicheId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

    if (lastHistory) {
        const changes = detectScoreChanges(lastHistory as any, payload);
        if (changes.length > 0) {
            const changeEvents = generateChangeEvents(nicheId, userId, keyword, changes);
            await supabase.from('feed_events').insert(changeEvents);
            await supabase.from('niche_score_history').insert([{
                saved_niche_id: nicheId,
                opportunity_score: payload.opportunityScore,
                growth_score: payload.growthScore,
                monetization_score: payload.monetizationScore,
                competition_score: payload.competitionScore,
                demand_score: payload.demandScore
            }]);
        }
    }
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
