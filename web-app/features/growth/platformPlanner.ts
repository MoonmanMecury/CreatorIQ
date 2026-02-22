/**
 * @file platformPlanner.ts
 * Recommends social platforms for content distribution beyond YouTube.
 */

import { GrowthInput, PlatformRecommendation, PlatformType } from './types';

/**
 * Evaluates market signals to suggest the best platforms for expansion.
 */
export function generatePlatformRecommendations(input: GrowthInput): PlatformRecommendation[] {
    const platforms: { type: PlatformType; label: string; baseScore: number; commitment: number }[] = [
        { type: 'TIKTOK', label: 'TikTok', baseScore: 60, commitment: 2 },
        { type: 'INSTAGRAM', label: 'Instagram', baseScore: 50, commitment: 3 },
        { type: 'LINKEDIN', label: 'LinkedIn', baseScore: 30, commitment: 2 },
        { type: 'TWITTER', label: 'X (Twitter)', baseScore: 40, commitment: 1 },
        { type: 'NEWSLETTER', label: 'Email Newsletter', baseScore: 45, commitment: 3 },
        { type: 'PODCAST', label: 'Podcast', baseScore: 25, commitment: 2 },
        { type: 'REDDIT', label: 'Reddit', baseScore: 35, commitment: 2 },
    ];

    const results: PlatformRecommendation[] = [];

    // Always include YouTube as priority 1
    results.push({
        platform: 'YOUTUBE',
        label: 'YouTube',
        relevanceScore: 100,
        priority: 1,
        whenToStart: "Primary platform — already in use",
        contentAdaptation: "Core long-form and Shorts production",
        expectedBenefit: "Main growth and search authority engine",
        weeklyTimeCommitment: Math.round(input.longFormPerWeek * 6 + input.shortFormPerWeek * 1.5),
        primaryContentFormat: "Long-form + Shorts"
    });

    for (const p of platforms) {
        let score = p.baseScore;
        let adaptation = "";
        let benefit = "";
        let start = "";
        let format = "";

        switch (p.type) {
            case 'TIKTOK':
                if (input.freshnessGap > 55) score += 20;
                if (input.smallCreatorAdvantage > 60) score += 15;
                if (input.shortFormPerWeek >= 3) score += 10;
                start = "Immediately — repurpose Shorts content cross-posted";
                format = "60-second tips and quick wins";
                adaptation = "Vertical format with faster pacing and trending sounds";
                benefit = "Rapid discovery and viral breakout potential";
                break;
            case 'INSTAGRAM':
                const lifestyleNiches = ["lifestyle", "fitness", "food", "travel", "photography", "fashion"];
                if (lifestyleNiches.some(n => input.keyword.toLowerCase().includes(n))) score += 20;
                if (input.monetizationScore > 65) score += 15;
                if (input.demandScore > 70) score += 10;
                start = "After 1K YouTube subscribers";
                format = "Carousel posts + Reels repurposed from Shorts";
                adaptation = "Visual-first storytelling and high-quality stills";
                benefit = "Strongest for brand partnerships and community interaction";
                break;
            case 'LINKEDIN':
                const professionalNiches = ["business", "career", "b2b", "software", "finance", "productivity", "marketing"];
                if (professionalNiches.some(n => input.keyword.toLowerCase().includes(n))) score += 35;
                if (input.monetizationScore > 70) score += 15;
                start = "After establishing 3–4 pillar videos on YouTube";
                format = "Written breakdowns + native video clips";
                adaptation = "Value-driven textual commentary on video insights";
                benefit = "High-ticket monetization and professional networking";
                break;
            case 'TWITTER':
                if (input.growthScore > 65) score += 20;
                const techNiches = ["tech", "ai", "crypto", "news", "politics", "commentary"];
                if (techNiches.some(n => input.keyword.toLowerCase().includes(n))) score += 15;
                start = "From day 1 — low time investment";
                format = "Thread breakdowns + behind-the-scenes";
                adaptation = "Threaded storytelling and real-time updates";
                benefit = "Fastest feedback loop and community building";
                break;
            case 'NEWSLETTER':
                if (input.monetizationScore > 70) score += 25;
                const pathMatches = ["COURSES", "COACHING", "DIGITAL_PRODUCTS"];
                if (input.topRevenuePaths.some(p => pathMatches.includes(p))) score += 20;
                start = "After 5K YouTube subscribers";
                format = "Weekly digest + exclusive tips";
                adaptation = "Curated long-form written value";
                benefit = "Direct audience ownership and highest revenue conversion";
                break;
            case 'PODCAST':
                const talkNiches = ["interviews", "deep-dive", "storytelling", "business", "education"];
                if (talkNiches.some(n => input.keyword.toLowerCase().includes(n))) score += 30;
                if (input.longFormPerWeek >= 2) score += 20;
                start = "After 10K subscribers";
                format = "Video audio + standalone episodes";
                adaptation = "Pure audio deep-dives and guest conversations";
                benefit = "Deepest audience connection and passive listening reach";
                break;
            case 'REDDIT':
                const communityNiches = ["tech", "gaming", "finance", "fitness", "productivity", "diy"];
                if (communityNiches.some(n => input.keyword.toLowerCase().includes(n))) score += 25;
                if (input.demandScore > 65) score += 10;
                start = "From day 1 — organic participation";
                format = "Value-first comments + organic shares";
                adaptation = "Authentic text interactions based on video research";
                benefit = "Highly targeted referral traffic and sub-niche authority";
                break;
        }

        if (score > 30) {
            results.push({
                platform: p.type,
                label: p.label,
                relevanceScore: Math.min(score, 98),
                priority: 0, // Assigned below
                whenToStart: start,
                contentAdaptation: adaptation,
                expectedBenefit: benefit,
                weeklyTimeCommitment: p.commitment,
                primaryContentFormat: format
            });
        }
    }

    // Sort by score and assign priority (skipping YouTube at 1)
    const sortedExpansion = results
        .filter(r => r.platform !== 'YOUTUBE')
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

    sortedExpansion.forEach((r, i) => { r.priority = i + 2; });

    return [results[0], ...sortedExpansion].slice(0, 5);
}
