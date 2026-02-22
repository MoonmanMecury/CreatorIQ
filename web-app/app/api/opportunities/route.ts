import { NextRequest, NextResponse } from "next/server";
import { findOpportunities } from "@/features/opportunities/services/findOpportunities";
import { getOrCreateNiche, saveOpportunityAnalysis } from "@/features/persistence/services/storageService";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

/**
 * GET /api/opportunities?keyword=...
 * Computes gap analysis and entry opportunities for a given keyword.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    if (!keyword) {
        return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    try {
        // Enforce auth
        const userClient = await createServerSupabaseClient();
        const { data: { user } } = await userClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Check Supabase for existing analysis using Admin client
        // This ensures discovery works even for public/un-RLS records
        const { data: niche } = await supabase
            .from('niches')
            .select('*, opportunity_analysis(*, breakout_videos(*), underserved_keywords(*))')
            .eq('keyword', keyword)
            .single();

        if (niche?.opportunity_analysis) {
            // Reconstruct the result object to match what findOpportunities returns
            const analysis = niche.opportunity_analysis;
            const reconstructed = {
                keyword: niche.keyword,
                opportunityIndex: analysis.opportunity_index,
                classification: analysis.classification,
                signals: analysis.gap_signals,
                breakoutVideos: analysis.breakout_videos,
                underservedKeywords: analysis.underserved_keywords,
                competitionInsights: analysis.competition_insights,
                entryInsights: analysis.entry_insights,
                computedAt: analysis.last_computed
            };
            return NextResponse.json(reconstructed);
        }

        // 2. Not found, compute Fresh
        const result = await findOpportunities(keyword);

        // 3. Persist to Supabase (storageService uses admin client internally now)
        const nicheRecord = await getOrCreateNiche(keyword);
        await saveOpportunityAnalysis(nicheRecord.id, result);

        // Simulated backend delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error(`[Opportunities API] Failed for keyword: "${keyword}"`, error);
        return NextResponse.json({
            error: "Failed to compute opportunities",
            detail: error.message
        }, { status: 500 });
    }
}
