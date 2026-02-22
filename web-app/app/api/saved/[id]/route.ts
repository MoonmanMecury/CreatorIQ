import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { unsaveNiche, updateNicheNotes, updateNicheTags, reanalyzeNiche } from '@/features/saved/services/saveNiche';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await unsaveNiche(id, user.id, supabase);
        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Saved ID DELETE] Error:', error);
        return NextResponse.json({ error: 'Failed to delete niche', detail: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const userId = user.id;
        let updatedNiche;

        if (body.reanalyze === true && body.newScores) {
            updatedNiche = await reanalyzeNiche(id, userId, body.newScores, supabase);
        } else if (body.notes !== undefined) {
            updatedNiche = await updateNicheNotes(id, userId, body.notes, supabase);
        } else if (body.tags !== undefined) {
            updatedNiche = await updateNicheTags(id, userId, body.tags, supabase);
        } else {
            return NextResponse.json({ error: 'No valid patch fields provided' }, { status: 400 });
        }

        return NextResponse.json(updatedNiche);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Saved ID PATCH] Error:', error);
        return NextResponse.json({ error: 'Failed to update niche', detail: message }, { status: 500 });
    }
}
