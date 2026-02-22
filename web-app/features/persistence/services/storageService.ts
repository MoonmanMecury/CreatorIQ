import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

/**
 * Ensures a niche entry exists in the database.
 */
export async function getOrCreateNiche(keyword: string) {
    const { data: niche } = await supabase
        .from('niches')
        .select('*')
        .eq('keyword', keyword)
        .single();

    if (niche) return niche;

    const { data: newNiche, error: createError } = await supabase
        .from('niches')
        .insert([{ keyword }])
        .select()
        .single();

    if (createError) {
        // Check if it was created by a race condition
        const { data: retryNiche } = await supabase
            .from('niches')
            .select('*')
            .eq('keyword', keyword)
            .single();
        if (retryNiche) return retryNiche;
        throw createError;
    }
    return newNiche;
}

/**
 * Updates root niche metrics.
 */
export async function updateNicheMetrics(nicheId: string, metrics: {
    niche_score?: number;
    trend_velocity?: number;
    competition_density?: string;
    revenue_potential?: number;
}) {
    // Ensure integer fields are rounded
    const sanitizedMetrics = {
        ...metrics,
        niche_score: typeof metrics.niche_score === 'number' ? Math.round(metrics.niche_score) : undefined,
        revenue_potential: typeof metrics.revenue_potential === 'number' ? Math.round(metrics.revenue_potential) : undefined,
    };

    const { error } = await supabase
        .from('niches')
        .update(sanitizedMetrics)
        .eq('id', nicheId);

    if (error) throw error;
}

/**
 * Saves Trend Discovery data.
 */
export async function saveTrendDiscovery(nicheId: string, data: any) {
    const { error } = await supabase
        .from('trend_discovery')
        .upsert({
            niche_id: nicheId,
            trend_data: data.trend_data || [],
            keyword_clusters: data.keyword_clusters || [],
            subtopics: data.subtopics || [],
            opportunity_insights: data.opportunity_insights || {},
            youtube_metrics: data.youtube_metrics || {},
            last_computed: new Date().toISOString()
        }, { onConflict: 'niche_id' });

    if (error) throw error;
}

/**
 * Saves Opportunity Analysis data.
 */
export async function saveOpportunityAnalysis(nicheId: string, data: any) {
    const { data: analysis, error: analysisError } = await supabase
        .from('opportunity_analysis')
        .upsert({
            niche_id: nicheId,
            opportunity_index: typeof data.opportunityIndex === 'number' ? Math.round(data.opportunityIndex) : 0,
            classification: data.classification,
            gap_signals: data.signals,
            competition_insights: data.competitionInsights,
            entry_insights: data.entryInsights,
            last_computed: new Date().toISOString()
        }, { onConflict: 'niche_id' })
        .select()
        .single();

    if (analysisError) throw analysisError;

    // Handle nested relationships for Breakout Videos
    if (data.breakoutVideos?.length > 0) {
        await supabase.from('breakout_videos').delete().eq('opportunity_id', analysis.id);
        await supabase.from('breakout_videos').insert(
            data.breakoutVideos.slice(0, 10).map((v: any) => ({
                opportunity_id: analysis.id,
                video_id: v.videoId || 'mock',
                title: v.title || 'Untitled',
                channel_name: v.channelName,
                views: v.views,
                outperformance_ratio: v.outperformanceRatio,
                thumbnail_url: v.thumbnailUrl,
                video_url: v.videoUrl,
                publish_date: v.publishDate
            }))
        );
    }

    // Handle Underserved Keywords
    if (data.underservedKeywords?.length > 0) {
        await supabase.from('underserved_keywords').delete().eq('opportunity_id', analysis.id);
        await supabase.from('underserved_keywords').insert(
            data.underservedKeywords.slice(0, 10).map((k: any) => ({
                opportunity_id: analysis.id,
                keyword: k.keyword,
                growth_rate: k.growthRate,
                competition_level: k.competitionLevel,
                search_volume_trend: k.searchVolumeTrend,
                is_long_tail: k.isLongTail
            }))
        );
    }
}

/**
 * Saves Monetization Insights.
 */
export async function saveMonetizationInsights(nicheId: string, data: any) {
    const { error } = await supabase
        .from('monetization_insights')
        .upsert({
            niche_id: nicheId,
            score: typeof data.monetizationScore === 'number' ? Math.round(data.monetizationScore) : 0,
            verdict: data.verdict,
            verdict_label: data.verdictLabel,
            verdict_description: data.verdictDescription,
            cpm_tier: data.cpmTier,
            market_maturity: data.market_maturity || data.marketMaturity,
            score_breakdown: data.breakdown,
            revenue_paths: data.revenuePaths,
            top_opportunities: data.topOpportunities,
            risks: data.risks,
            last_computed: new Date().toISOString()
        }, { onConflict: 'niche_id' });

    if (error) throw error;
}

/**
 * Saves Content Strategy.
 */
export async function saveContentStrategy(nicheId: string, data: any) {
    const { data: strategy, error: strategyError } = await supabase
        .from('content_strategies')
        .upsert({
            niche_id: nicheId,
            posting_plan: data.postingPlan,
            pillars: data.pillars,
            top_formats: data.topFormats,
            differentiation_strategies: data.differentiationStrategies,
            quick_wins: data.quickWins,
            last_computed: new Date().toISOString()
        }, { onConflict: 'niche_id' })
        .select()
        .single();

    if (strategyError) throw strategyError;

    // Handle Video Ideas
    if (data.videoIdeas?.length > 0) {
        await supabase.from('video_ideas').delete().eq('strategy_id', strategy.id);
        await supabase.from('video_ideas').insert(
            data.videoIdeas.slice(0, 10).map((v: any) => ({
                strategy_id: strategy.id,
                title: v.title,
                hook: v.hook,
                format: v.format,
                pillar: v.pillar,
                difficulty: v.difficulty,
                potential_views: v.potentialViews,
                rationale: v.rationale,
                target_audience: v.targetAudience
            }))
        );
    }
}

/**
 * Saves Growth Blueprint.
 */
export async function saveGrowthBlueprint(nicheId: string, data: any) {
    const { error } = await supabase
        .from('growth_blueprints')
        .upsert({
            niche_id: nicheId,
            executive_summary: data.executiveSummary,
            current_stage: data.currentStage,
            projected_authority_weeks: data.projectedAuthorityWeeks,
            total_weekly_hours_launch: data.totalWeeklyHoursAtLaunch,
            total_weekly_hours_scale: data.totalWeeklyHoursAtScale,
            subscriber_milestones: data.subscriberMilestones,
            cadence_phases: data.cadencePhases,
            weekly_schedule: data.first12WeeksSchedule,
            platform_recommendations: data.platformRecommendations,
            kpi_targets: data.kpiTargets,
            alerts: data.alerts,
            last_computed: new Date().toISOString()
        }, { onConflict: 'niche_id' });

    if (error) throw error;
}
