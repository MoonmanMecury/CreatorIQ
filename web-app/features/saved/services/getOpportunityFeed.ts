import { createClient } from '@/lib/supabase/client';
import { OpportunityFeedItem, FeedEvent } from '../types';



/**
 * Fetches the user's opportunity feed events.
 */
export async function getOpportunityFeed(userId: string, limit: number = 50, supabaseClient?: any): Promise<OpportunityFeedItem[]> {
    const supabase = supabaseClient || createClient();
    const { data, error } = await supabase
        .from('feed_events')
        .select(`
            *,
            saved_niches (
                keyword,
                opportunity_score,
                monetization_score,
                verdict
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    return data.map((row: any) => ({
        id: row.id,
        keyword: row.saved_niches?.keyword || 'Unknown',
        savedNicheId: row.saved_niche_id,
        eventType: row.event_type,
        title: row.event_title,
        description: row.event_description,
        severity: row.severity,
        scoreDelta: row.score_delta,
        createdAt: row.created_at,
        currentScores: {
            opportunity: row.saved_niches?.opportunity_score,
            monetization: row.saved_niches?.monetization_score,
            verdict: row.saved_niches?.verdict
        }
    }));
}

/**
 * Fetches all feed events for a specific niche.
 */
export async function getFeedForNiche(savedNicheId: string, userId: string, supabaseClient?: any): Promise<FeedEvent[]> {
    const supabase = supabaseClient || createClient();
    const { data, error } = await supabase
        .from('feed_events')
        .select('*')
        .eq('saved_niche_id', savedNicheId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FeedEvent[];
}

/**
 * Ranks feed items by importance logic.
 */
export function rankFeedItems(items: OpportunityFeedItem[]): OpportunityFeedItem[] {
    const now = new Date().getTime();

    return [...items].sort((a, b) => {
        const scoreA = computeImportance(a, now);
        const scoreB = computeImportance(b, now);
        return scoreB - scoreA;
    });
}

function computeImportance(item: OpportunityFeedItem, now: number): number {
    let score = 0;

    // Severity weighting
    if (item.severity === 'CRITICAL') score += 100;
    else if (item.severity === 'WARNING') score += 60;
    else score += 20;

    // Type weighting
    if (item.eventType === 'BREAKOUT') score += 50;

    // Delta weighting
    score += Math.abs(item.scoreDelta ?? 0) * 2;

    // Recency weighting
    const createdTime = new Date(item.createdAt).getTime();
    const ageHrs = (now - createdTime) / (1000 * 60 * 60);

    if (ageHrs <= 24) score += 100;
    else if (ageHrs <= 168) score += 70; // within 1 week
    else score += 30;

    return score;
}
