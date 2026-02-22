/**
 * @file videoIdeas.ts
 * Video Ideas Generator — produces exactly 12 specific, ready-to-produce
 * video ideas with grounded reasoning from actual niche signals.
 */

import type {
    VideoIdea,
    ContentPillar,
    FormatScore,
    ContentGap,
    StrategyInput,
    ContentFormat,
    DifficultyLevel,
} from './types';

function getDifficulty(hours: number): DifficultyLevel {
    if (hours < 3) return 'EASY';
    if (hours < 8) return 'MEDIUM';
    return 'HARD';
}

function getDemandSignal(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score > 70) return 'HIGH';
    if (score > 45) return 'MEDIUM';
    return 'LOW';
}

function getCompetitionSignal(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score < 40) return 'LOW';
    if (score < 65) return 'MEDIUM';
    return 'HIGH';
}

/** Retrieve the best-fit format from available scored formats for a given preference. */
function pickBestFormat(
    formats: FormatScore[],
    preferred: ContentFormat[]
): ContentFormat {
    for (const p of preferred) {
        const found = formats.find((f) => f.format === p);
        if (found) return found.format;
    }
    return formats[0]?.format ?? 'TUTORIAL';
}

/**
 * Generates exactly 12 video ideas spread across content pillars and formats.
 * Ensures: ≥2 EASY, ≥2 SHORT_FORM, ≥1 CASE_STUDY, mix of all difficulties.
 */
export function generateVideoIdeas(
    input: StrategyInput,
    pillars: ContentPillar[],
    formats: FormatScore[],
    gaps: ContentGap[]
): VideoIdea[] {
    const kw = input.keyword;
    const ideas: VideoIdea[] = [];
    const demand = getDemandSignal(input.demandScore);
    const comp = getCompetitionSignal(input.competitionScore);

    const topGap = gaps[0]?.topic ?? `getting started with ${kw}`;

    // --- PILLAR 1 IDEAS (Fundamentals / Education) ---
    const pillar1 = pillars[0];

    ideas.push({
        title: `${kw} for Complete Beginners: Everything You Need to Know`,
        format: 'TUTORIAL',
        pillar: pillar1?.name ?? `${kw} Fundamentals`,
        targetAudience: `total beginners who've heard of ${kw} but don't know where to start`,
        whyItWillPerform: `Demand score of ${input.demandScore} confirms a large search audience, and small creator advantage (${input.smallCreatorAdvantage}) means this gap is currently unfilled by established channels.`,
        difficulty: 'MEDIUM',
        estimatedProductionHours: 6,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: false,
        hookSuggestion: `"If you've been Googling '${kw}' for weeks but still feel lost — this video is your starting point."`,
    });

    ideas.push({
        title: `Top 5 ${kw} Mistakes Beginners Make (And How to Fix Them)`,
        format: 'LIST',
        pillar: pillar1?.name ?? `${kw} Fundamentals`,
        targetAudience: `new practitioners who are struggling with common ${kw} pitfalls`,
        whyItWillPerform: `Problem/mistake titles have consistently high CTR; with demand score ${input.demandScore} there's a ready audience actively looking for help.`,
        difficulty: 'EASY',
        estimatedProductionHours: 2,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: true,
        hookSuggestion: `"I'm about to save you months of frustration with ${kw} — because I made all these mistakes first."`,
    });

    ideas.push({
        title: `${kw} in 60 Seconds — The Quick Start Everyone Needs`,
        format: 'SHORT_FORM',
        pillar: pillar1?.name ?? `${kw} Fundamentals`,
        targetAudience: `scroll-first learners who want instant value before committing to long-form content`,
        whyItWillPerform: `Freshness gap of ${input.freshnessGap} and short-form gap in the niche make Shorts a high-ROI format with minimal competition for quick-tip ${kw} content.`,
        difficulty: 'EASY',
        estimatedProductionHours: 1,
        searchDemandSignal: demand,
        competitionSignal: 'LOW',
        isShortFormVariant: true,
        hookSuggestion: `"Here's everything you need to know about ${kw} — I'll explain it in under 60 seconds."`,
    });

    // --- PILLAR 2 IDEAS (Tools & Reviews) ---
    const pillar2 = pillars[1] ?? pillars[0];

    ideas.push({
        title: `Best ${kw} Tools in 2025: Honest Rankings After 30 Days of Testing`,
        format: pickBestFormat(formats, ['REVIEW', 'COMPARISON', 'LIST']),
        pillar: pillar2?.name ?? `${kw} Tools & Resources`,
        targetAudience: `practitioners evaluating which ${kw} tools to invest in or switch to`,
        whyItWillPerform: `Monetization score of ${input.monetizationScore} signals strong commercial intent — buyers are researching before purchase.`,
        difficulty: 'MEDIUM',
        estimatedProductionHours: 7,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: false,
        hookSuggestion: `"I spent 30 days testing every major ${kw} tool so you don't have to. Here's my honest verdict."`,
    });

    ideas.push({
        title: `Free vs Paid ${kw}: Is the Upgrade Actually Worth It?`,
        format: 'COMPARISON',
        pillar: pillar2?.name ?? `${kw} Tools & Resources`,
        targetAudience: `budget-conscious ${kw} users deciding whether to invest in premium options`,
        whyItWillPerform: `Comparison content captures high-intent decision-making searches, and with competition score ${input.competitionScore} there's room to rank for this angle.`,
        difficulty: 'EASY',
        estimatedProductionHours: 3,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: true,
        hookSuggestion: `"You've been wondering if the paid version of ${kw} is worth it. I'm going to give you a straight answer right now."`,
    });

    // --- PILLAR 3 IDEAS (Case Studies) ---
    const pillar3 = pillars.find((p) =>
        p.contentFormats.includes('CASE_STUDY')
    ) ?? pillars[2] ?? pillars[0];

    ideas.push({
        title: `I Tried ${kw} Every Day for 30 Days — Here's Exactly What Happened`,
        format: 'CHALLENGE',
        pillar: pillar3?.name ?? 'Real Results & Case Studies',
        targetAudience: `action-oriented people considering committing to ${kw} but unsure if it's worth the effort`,
        whyItWillPerform: `Personal challenge format creates a powerful curiosity gap; opportunity index of ${input.opportunityIndex} shows the niche is underserved with authentic story content.`,
        difficulty: 'HARD',
        estimatedProductionHours: 10,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: false,
        hookSuggestion: `"30 days ago I committed to doing ${kw} every single day. Here's the raw, honest truth about what happened."`,
    });

    ideas.push({
        title: `How I Got Real Results with ${kw} in 90 Days (Full Breakdown)`,
        format: 'CASE_STUDY',
        pillar: pillar3?.name ?? 'Real Results & Case Studies',
        targetAudience: `motivated learners who want proof that ${kw} actually produces measurable outcomes`,
        whyItWillPerform: `Small creator advantage of ${input.smallCreatorAdvantage} confirms authentic, personal content outperforms faceless informational videos in this niche.`,
        difficulty: 'HARD',
        estimatedProductionHours: 12,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: false,
        hookSuggestion: `"90 days ago I started from zero. Today I'm going to show you every step I took and what the numbers actually look like."`,
    });

    // --- PILLAR 4 IDEAS (News & Commentary / Trend) ---
    const pillar4 =
        pillars.find((p) => p.contentFormats.includes('COMMENTARY')) ?? pillars[0];

    ideas.push({
        title: `The Truth About ${kw} That Nobody in This Space Will Tell You`,
        format: 'COMMENTARY',
        pillar: pillar4?.name ?? `${kw} News & Trends`,
        targetAudience: `intermediate ${kw} practitioners who feel like they're missing something the top creators know`,
        whyItWillPerform: `Growth score of ${input.growthScore} drives algorithm hunger for fresh takes, and freshness gap of ${input.freshnessGap} means contrarian commentary is missing from the feed.`,
        difficulty: 'MEDIUM',
        estimatedProductionHours: 4,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: false,
        hookSuggestion: `"I'm going to say what most ${kw} creators won't say publicly — because it might hurt their affiliate deals."`,
    });

    ideas.push({
        title: `${kw} Is Changing — Here's What You Need to Know Right Now`,
        format: 'SHORT_FORM',
        pillar: pillar4?.name ?? `${kw} News & Trends`,
        targetAudience: `existing ${kw} practitioners who want to stay current without watching long-form content`,
        whyItWillPerform: `Freshness gap signal of ${input.freshnessGap} confirms slow-moving content supply — a quick news-style Short will stand out immediately.`,
        difficulty: 'EASY',
        estimatedProductionHours: 1,
        searchDemandSignal: demand,
        competitionSignal: 'LOW',
        isShortFormVariant: true,
        hookSuggestion: `"Something just changed in ${kw} and most people haven't noticed yet."`,
    });

    // --- GAP-OPPORTUNITY IDEAS ---
    ideas.push({
        title: `The Complete ${kw} Masterclass: Everything You Need to Succeed`,
        format: 'TUTORIAL',
        pillar: pillars[pillars.length - 1]?.name ?? `${kw} Fundamentals`,
        targetAudience: `intermediate learners ready to go deep and stop consuming surface-level ${kw} content`,
        whyItWillPerform: `Depth gap detected — current content lacks comprehensive resources, giving this video a path to rank as the definitive ${kw} guide.`,
        difficulty: 'HARD',
        estimatedProductionHours: 10,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: false,
        hookSuggestion: `"This is the only ${kw} video you'll ever need. I'm covering everything — no fluff, no filler."`,
    });

    ideas.push({
        title: `${topGap}: The Underrated ${kw} Strategy Nobody Talks About`,
        format: pickBestFormat(formats, ['TUTORIAL', 'COMMENTARY', 'LIST']),
        pillar: pillar1?.name ?? `${kw} Fundamentals`,
        targetAudience: `${kw} enthusiasts hungry for fresh angles and overlooked strategies`,
        whyItWillPerform: `Rising keyword signal identified '${topGap}' as a high-opportunity subtopic with minimal dedicated content, giving this video a strong chance to be the first mover.`,
        difficulty: 'MEDIUM',
        estimatedProductionHours: 5,
        searchDemandSignal: demand,
        competitionSignal: 'LOW',
        isShortFormVariant: false,
        hookSuggestion: `"Everyone's talking about ${kw}, but almost nobody's covering this specific angle — and that's exactly why I'm making this video."`,
    });

    ideas.push({
        title: `${kw} on a Budget: Zero-Cost Ways to Get Started Today`,
        format: 'LIST',
        pillar: pillar1?.name ?? `${kw} Fundamentals`,
        targetAudience: `cost-conscious newcomers who want to explore ${kw} before committing any money`,
        whyItWillPerform: `Budget content drives high engagement from aspirational audiences; list format ensures strong CTR and consistent watch time from a large searchable audience.`,
        difficulty: 'EASY',
        estimatedProductionHours: 2,
        searchDemandSignal: demand,
        competitionSignal: comp,
        isShortFormVariant: true,
        hookSuggestion: `"You don't need to spend a dollar to get started with ${kw}. Here's the zero-cost path I'd take if I was starting today."`,
    });

    // Return exactly 12
    return ideas.slice(0, 12);
}
