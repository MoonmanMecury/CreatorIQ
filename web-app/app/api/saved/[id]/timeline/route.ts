import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTimelineForNiche, formatTimelineForDisplay } from '@/features/saved/services/getTimeline';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await getTimelineForNiche(id, user.id, supabase);
        const timeline = formatTimelineForDisplay(data.events, data.scoreHistory);

        return NextResponse.json(timeline);
    } catch (error: any) {
        console.error('[Timeline API GET] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch timeline', detail: error.message }, { status: 500 });
    }
}
