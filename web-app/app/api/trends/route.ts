import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateNiche, saveTrendDiscovery, updateNicheMetrics } from '@/features/persistence/services/storageService';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

/**
 * GET /api/trends?keyword=xxx
 * Returns trend discovery data, persisted in Supabase.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') || searchParams.get('topic');

    if (!keyword) {
        return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    try {
        // Auth check
        const userClient = await createServerSupabaseClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Check if we already have this niche and its trend discovery in Supabase using Admin client
        const { data: niche } = await supabase
            .from('niches')
            .select('*, trend_discovery(*)')
            .eq('keyword', keyword)
            .single();

        if (niche?.trend_discovery) {
            return NextResponse.json(niche.trend_discovery);
        }

        // 2. If not found, facilitate deterministic generation
        const seed = keyword.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const pseudoRandom = (offset: number) => (Math.sin(seed + offset) + 1) / 2;

        const generatedData = {
            main_topic: keyword,
            niche_score: Math.floor(pseudoRandom(1) * 60 + 30),
            trend_velocity: Math.floor(pseudoRandom(2) * 80 + 10),
            competition_density: pseudoRandom(3) > 0.7 ? 'High' : pseudoRandom(3) > 0.3 ? 'Medium' : 'Low',
            revenue_potential: Math.floor(pseudoRandom(4) * 90 + 5),
            top_regions: ['United States', 'United Kingdom', 'Canada', 'India'],
            trend_data: Array.from({ length: 12 }, (_, i) => ({
                date: `2023-${String(i + 1).padStart(2, '0')}-01`,
                value: Math.floor(pseudoRandom(i + 10) * 100)
            })),
            keyword_clusters: [
                { keyword: `${keyword} guide`, volume: 'High', growth: 15 },
                { keyword: `best ${keyword} 2024`, volume: 'Medium', growth: 42 },
                { keyword: `${keyword} tips for beginners`, volume: 'High', growth: 8 }
            ],
            subtopics: [
                { keyword: `Advanced ${keyword}`, growth_rate: 22, competition_score: 45, recommendation: 'High' },
                { keyword: `${keyword} reviews`, growth_rate: 12, competition_score: 80, recommendation: 'Medium' }
            ],
            opportunity_insights: {
                underserved_angles: [`Unfiltered ${keyword} tutorials`, `${keyword} case studies for small teams`],
                emerging_keywords: [`AI-powered ${keyword}`, `Sustainable ${keyword}`],
                recommended_format: 'Reels/Shorts'
            },
            youtube_metrics: {
                total_views: Math.floor(pseudoRandom(5) * 5000000),
                average_engagement: Number((pseudoRandom(6) * 5 + 1).toFixed(2)),
                supply_count: Math.floor(pseudoRandom(7) * 2000)
            },
            is_mock: true
        };

        // 3. Persist to Supabase (storageService uses admin)
        const nicheRecord = await getOrCreateNiche(keyword);
        await updateNicheMetrics(nicheRecord.id, {
            niche_score: generatedData.niche_score,
            trend_velocity: generatedData.trend_velocity,
            competition_density: generatedData.competition_density,
            revenue_potential: generatedData.revenue_potential
        });
        await saveTrendDiscovery(nicheRecord.id, generatedData);

        return NextResponse.json(generatedData);

    } catch (error: any) {
        console.error(`Trends API error for keyword "${keyword}":`, error);
        return NextResponse.json({ error: "Internal Server Error", detail: error.message }, { status: 500 });
    }
}
