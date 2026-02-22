import { NextRequest, NextResponse } from 'next/server';
import { generateInsights } from '@/features/insights/services/generateInsights';
import { getOrCreateNiche } from '@/features/persistence/services/storageService';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

/**
 * GET /api/insights?keyword=<keyword>
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.trim() === '') {
        return NextResponse.json(
            { error: 'Missing required query parameter: keyword' },
            { status: 400 },
        );
    }

    try {
        // Auth check
        const userClient = await createServerSupabaseClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check Supabase using Admin client
        const { data: niche } = await supabase
            .from('niches')
            .select('*')
            .eq('keyword', keyword)
            .single();

        // 2. Generate insights
        const data = await generateInsights(keyword);

        // 3. Persist core metrics to niches table (storageService uses admin)
        const nicheRecord = await getOrCreateNiche(keyword);

        // Update core metrics
        await supabase
            .from('niches')
            .update({
                niche_score: data.opportunityScore,
                updated_at: new Date().toISOString()
            })
            .eq('id', nicheRecord.id);

        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        const detail = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/api/insights] Failed to generate insights:', detail);
        return NextResponse.json(
            { error: 'Failed to generate insights', detail },
            { status: 500 },
        );
    }
}
