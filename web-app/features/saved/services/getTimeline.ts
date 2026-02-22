import { createClient } from '@/lib/supabase/client';
import { FeedEvent, ScoreHistory } from '../types';

export interface TimelineEntry {
    date: string
    type: 'EVENT' | 'SCORE_SNAPSHOT'
    eventData?: FeedEvent
    scoreData?: ScoreHistory
    label: string
    description: string
}

/**
 * Fetched mixed timeline data for a niche.
 */
export async function getTimelineForNiche(savedNicheId: string, userId: string, supabaseClient?: any): Promise<{ events: FeedEvent[], scoreHistory: ScoreHistory[] }> {
    const supabase = supabaseClient || createClient();
    const [eventsRes, historyRes] = await Promise.all([
        supabase
            .from('feed_events')
            .select('*')
            .eq('saved_niche_id', savedNicheId)
            .eq('user_id', userId)
            .order('created_at', { ascending: true }),
        supabase
            .from('niche_score_history')
            .select('*')
            .eq('saved_niche_id', savedNicheId)
            .order('recorded_at', { ascending: true })
    ]);

    if (eventsRes.error) throw eventsRes.error;
    if (historyRes.error) throw historyRes.error;

    return {
        events: eventsRes.data as FeedEvent[],
        scoreHistory: historyRes.data as ScoreHistory[]
    };
}

/**
 * Formats events and history into a unified sortable timeline.
 */
export function formatTimelineForDisplay(events: FeedEvent[], history: ScoreHistory[]): TimelineEntry[] {
    const entries: TimelineEntry[] = [];

    events.forEach(e => {
        entries.push({
            date: e.createdAt,
            type: 'EVENT',
            eventData: e,
            label: e.eventTitle,
            description: e.eventDescription || ''
        });
    });

    history.forEach(h => {
        entries.push({
            date: h.recordedAt,
            type: 'SCORE_SNAPSHOT',
            scoreData: h,
            label: 'Score Snapshot',
            description: `Opportunity: ${h.opportunityScore}, Monetization: ${h.monetizationScore}`
        });
    });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
