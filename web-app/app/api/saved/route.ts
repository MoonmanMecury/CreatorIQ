import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSavedOverview } from '@/features/saved/services/getSavedOverview';
import { saveNiche } from '@/features/saved/services/saveNiche';

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const overview = await getSavedOverview(user.id, supabase);
        return NextResponse.json(overview);
    } catch (error: any) {
        console.error('[Saved API GET] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch saved niches', detail: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        if (!payload.keyword) {
            return NextResponse.json({ error: 'keyword is required' }, { status: 400 });
        }

        const niche = await saveNiche(payload, user.id, supabase);
        return NextResponse.json(niche, { status: 201 });
    } catch (error: any) {
        console.error('[Saved API POST] Error:', error);
        return NextResponse.json({ error: 'Failed to save niche', detail: error.message }, { status: 500 });
    }
}
