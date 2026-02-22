/**
 * @file route.ts
 * API endpoint for generating the Creator Growth Blueprint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGrowthBlueprint, buildGrowthInput } from '@/features/growth/services/getGrowthBlueprint';
import { getOrCreateNiche, saveGrowthBlueprint } from '@/features/persistence/services/storageService';
import { supabase } from '@/lib/supabase';

/**
 * Deterministically seeds data based on a keyword string.
 */
function getSeededValue(seed: string, offset: number = 0, max: number = 100): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const final = Math.abs(hash + offset) % max;
    return final;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');

    if (!keyword) {
        return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    try {
        // 1. Check Supabase
        const { data: niche } = await supabase
            .from('niches')
            .select('*, growth_blueprints(*)')
            .eq('keyword', keyword)
            .single();

        if (niche?.growth_blueprints) {
            const g = niche.growth_blueprints;
            const reconstructed = {
                keyword: niche.keyword,
                executiveSummary: g.executive_summary,
                currentStage: g.current_stage,
                projectedAuthorityWeeks: g.projected_authority_weeks,
                subscriberMilestones: g.subscriber_milestones,
                cadencePhases: g.cadence_phases,
                first12WeeksSchedule: g.weekly_schedule,
                platformRecommendations: g.platform_recommendations,
                kpiTargets: g.kpi_targets,
                alerts: g.alerts,
                totalWeeklyHoursAtLaunch: g.total_weekly_hours_launch,
                totalWeeklyHoursAtScale: g.total_weekly_hours_scale,
                computedAt: g.last_computed
            };
            return NextResponse.json(reconstructed);
        }

        // 2. Generate Fresh Mock Upstream Data
        const insightsData = {
            niche_score: getSeededValue(keyword, 10),
            trend_velocity: getSeededValue(keyword, 20),
            competition_density: getSeededValue(keyword, 30) > 50 ? 'High' : 'Medium'
        } as any;

        const opportunityData = {
            opportunityIndex: getSeededValue(keyword, 50),
            signals: {
                freshnessGap: getSeededValue(keyword, 60),
                smallCreatorAdvantage: getSeededValue(keyword, 70),
            },
            underservedKeywords: [
                { keyword: `${keyword} guide` },
                { keyword: `best ${keyword}` }
            ]
        } as any;

        const monetizationData = {
            monetizationScore: getSeededValue(keyword, 90),
            marketMaturity: getSeededValue(keyword, 100) > 50 ? 'MATURE' : 'DEVELOPING',
            revenuePaths: [
                { type: 'AD_REVENUE' },
                { type: 'AFFILIATE_MARKETING' }
            ]
        } as any;

        const strategyData = {
            postingPlan: {
                cadence: getSeededValue(keyword, 110) > 60 ? 'AGGRESSIVE' : 'MODERATE',
                longFormPerWeek: getSeededValue(keyword, 120, 3) + 1,
                shortFormPerWeek: getSeededValue(keyword, 130, 5) + 1
            },
            pillars: [{ name: "Education" }, { name: "Case Studies" }],
            topFormats: [{ label: "Tutorial" }, { label: "List" }],
            differentiationStrategies: [{ strategy: "Beginner-First" }]
        } as any;

        // 3. Build Input and Generate
        const input = buildGrowthInput(keyword, insightsData, opportunityData, monetizationData, strategyData);
        const blueprint = getGrowthBlueprint(input);

        // 4. Persist
        const nicheRecord = await getOrCreateNiche(keyword);
        await saveGrowthBlueprint(nicheRecord.id, blueprint);

        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json(blueprint);
    } catch (error: any) {
        console.error(`[Growth API] Error generating blueprint for ${keyword}:`, error);
        return NextResponse.json({ error: "Failed to generate growth blueprint", detail: error.message }, { status: 500 });
    }
}
