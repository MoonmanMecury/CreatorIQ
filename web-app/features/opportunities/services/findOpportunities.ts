import {
    calculateWeakCompetitionSignal,
    calculateUnderservedDemandSignal,
    calculateSmallCreatorAdvantageSignal,
    calculateFreshnessGapSignal
} from "../gapAnalysis";
import {
    calculateOpportunityIndex,
    getOpportunityClassification,
    generateCompetitionInsights,
    generateEntryInsights
} from "../opportunityIndex";
import { detectBreakoutVideos } from "../breakoutDetection";
import { expandKeywords } from "../keywordExpansion";
import { OpportunityResult, RawVideoData } from "../types";

/**
 * Main service to orchestration the opportunity discovery pipeline.
 */
export async function findOpportunities(keyword: string): Promise<OpportunityResult> {
    // SIMULATED — Seeded random for deterministic output
    const seedValue = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pseudoRandom = (offset: number) => {
        const x = Math.sin(seedValue + offset) * 10000;
        return x - Math.floor(x);
    };

    // 1. SIMULATED — YouTube Search Results
    const rawVideos: RawVideoData[] = Array.from({ length: 15 }).map((_, i) => {
        const subs = Math.floor(pseudoRandom(i) * 1000000) + 1000;
        const views = Math.floor(pseudoRandom(i + 100) * (subs * 5)); // Some huge outliers
        return {
            videoId: `vid_${Math.floor(pseudoRandom(i + 200) * 1000000)}`,
            title: `${keyword} - Mastery Guide Part ${i + 1}`,
            views: views,
            likes: Math.floor(views * 0.04),
            comments: Math.floor(views * 0.005),
            publishDate: new Date(Date.now() - Math.floor(pseudoRandom(i + 300) * 800 * 24 * 60 * 60 * 1000)).toISOString(),
            channelId: `chan_${Math.floor(pseudoRandom(i + 400) * 1000)}`,
            channelName: `Creator ${Math.floor(pseudoRandom(i + 400) * 1000)}`,
            channelSubscribers: subs,
            channelVideoCount: Math.floor(pseudoRandom(i + 500) * 500),
            thumbnailUrl: `https://picsum.photos/seed/${seedValue + i}/400/225`
        };
    });

    // 2. SIMULATED — Insight Scores (Step 2 layer)
    const demandScore = 50 + (pseudoRandom(10) * 40);
    const growthScore = 30 + (pseudoRandom(20) * 60);

    // 3. SIMULATED — Related/Rising Queries
    const relatedQueries = [`best ${keyword}`, `${keyword} tutorials`, `how to ${keyword}`, `${keyword} for beginners`].slice(0, 3);
    const risingQueries = [`${keyword} tools 2026`, `new ${keyword} strategy`, `${keyword} automation`].slice(0, 2);

    // 4. Run Gap Analysis
    const signals = {
        weakCompetition: Math.round(calculateWeakCompetitionSignal(rawVideos)),
        underservedDemand: Math.round(calculateUnderservedDemandSignal(rawVideos, demandScore, growthScore)),
        smallCreatorAdvantage: Math.round(calculateSmallCreatorAdvantageSignal(rawVideos)),
        freshnessGap: Math.round(calculateFreshnessGapSignal(rawVideos, growthScore))
    };

    // 5. Index & Classification
    const opportunityIndex = calculateOpportunityIndex(signals);
    const classification = getOpportunityClassification(opportunityIndex);

    // 6. Breakout Detection
    const breakoutVideos = detectBreakoutVideos(rawVideos, 1.5);

    // 7. Keyword Expansion
    const underservedKeywords = expandKeywords(keyword, relatedQueries, risingQueries);

    // 8. Dynamic Insights
    const competitionInsights = generateCompetitionInsights(signals, rawVideos);
    const entryInsights = generateEntryInsights(signals, underservedKeywords);

    return {
        keyword,
        opportunityIndex,
        classification,
        signals,
        breakoutVideos,
        underservedKeywords,
        competitionInsights,
        entryInsights,
        computedAt: new Date().toISOString()
    };
}
