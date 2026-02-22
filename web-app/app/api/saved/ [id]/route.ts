import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { unsaveNiche, updateNicheNotes, updateNicheTags, reanalyzeNiche } from '@/features/saved/services/saveNiche';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await unsaveNiche(params.id, session.user.id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete niche', detail: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const userId = session.user.id;
        let updatedNiche;

        if (body.reanalyze === true && body.newScores) {
            updatedNiche = await reanalyzeNiche(params.id, userId, body.newScores);
        } else if (body.notes !== undefined) {
            updatedNiche = await updateNicheNotes(params.id, userId, body.notes);
        } else if (body.tags !== undefined) {
            updatedNiche = await updateNicheTags(params.id, userId, body.tags);
        } else {
            return NextResponse.json({ error: 'No valid patch fields provided' }, { status: 400 });
        }

        return NextResponse.json(updatedNiche);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update niche', detail: error.message }, { status: 500 });
    }
}
