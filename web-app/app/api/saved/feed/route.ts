import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getOpportunityFeed, rankFeedItems } from '@/features/saved/services/getOpportunityFeed';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        const feedItems = await getOpportunityFeed(user.id, limit, supabase);
        const rankedItems = rankFeedItems(feedItems);

        return NextResponse.json(rankedItems);
    } catch (error: any) {
        console.error('[Saved Feed API GET] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch feed', detail: error.message }, { status: 500 });
    }
}
