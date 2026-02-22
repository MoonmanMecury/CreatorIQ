/**
 * @file pillars.ts
 * Content Pillar Generator — builds 3–5 strategic content pillars
 * that form the backbone of the creator's channel strategy.
 */

import type { ContentPillar, ContentFormat, StrategyInput } from './types';

/**
 * Generates beginner-oriented topic strings for a keyword.
 */
function beginnerTopics(keyword: string): string[] {
    return [
        `${keyword} explained for absolute beginners`,
        `The basics of ${keyword} you need to know first`,
        `Common ${keyword} mistakes beginners make`,
        `${keyword} starter guide: where to begin in 2025`,
        `How long does it take to learn ${keyword}?`,
    ];
}

/**
 * Generates review/comparison topic strings for a keyword.
 */
function reviewTopics(keyword: string): string[] {
    return [
        `Best ${keyword} tools compared (free vs paid)`,
        `Top ${keyword} resources worth your money`,
        `${keyword} tools for beginners vs professionals`,
        `Honest review: the most popular ${keyword} platforms`,
        `${keyword} setup on a budget: what you actually need`,
    ];
}

/**
 * Generates results/story-driven topic strings.
 */
function caseStudyTopics(keyword: string): string[] {
    return [
        `How one creator made it with ${keyword} from scratch`,
        `My ${keyword} journey: 0 to results in 90 days`,
        `${keyword} experiment: what actually worked for me`,
        `Inside a successful ${keyword} strategy (real numbers)`,
        `Before and after: transforming my approach to ${keyword}`,
    ];
}

/**
 * Generates news and opinion topic strings.
 */
function newsTopics(keyword: string): string[] {
    return [
        `What changed in ${keyword} this month`,
        `My hot take on the latest ${keyword} trends`,
        `Is ${keyword} dying? Here's what the data says`,
        `The biggest ${keyword} news story of the week`,
        `${keyword} predictions for the rest of 2025`,
    ];
}

/**
 * Generates advanced and comprehensive topic strings.
 */
function advancedTopics(keyword: string): string[] {
    return [
        `The definitive ${keyword} masterclass (full strategy)`,
        `Advanced ${keyword} techniques the experts use`,
        `${keyword} deep dive: everything you need to master it`,
        `The complete ${keyword} playbook for serious creators`,
        `How to become the go-to expert in ${keyword}`,
    ];
}

/**
 * Generates 3–5 strategic content pillars based on niche signals.
 *
 * @param input - The normalized strategy input.
 * @returns Pillars sorted by priority ascending (1 = highest).
 */
export function generateContentPillars(input: StrategyInput): ContentPillar[] {
    const pillars: ContentPillar[] = [];
    const k = input.keyword;
    let priorityCounter = 1;

    // --- Pillar 1: Foundational Education ---
    // Priority 1 if demand is high, otherwise still included
    const eduPriority = input.demandScore > 60 ? 1 : 2;
    pillars.push({
        name: `${k} Fundamentals`,
        description: 'Core educational content that captures new audience entering the niche and establishes channel authority.',
        priority: eduPriority,
        sampleTopics: beginnerTopics(k),
        monetizationFit: 'Courses and affiliate links to learning resources',
        contentFormats: ['TUTORIAL', 'LIST'] as ContentFormat[],
    });
    if (eduPriority === 1) priorityCounter = 2;

    // --- Pillar 2: Tools & Reviews ---
    const includeReviews =
        input.monetizationScore > 55 ||
        /tool|software|product|app|platform|saas/i.test(k);
    if (includeReviews) {
        pillars.push({
            name: `${k} Tools & Resources`,
            description: 'Product-focused content that captures buyer-intent searches and drives affiliate commission revenue.',
            priority: priorityCounter++,
            sampleTopics: reviewTopics(k),
            monetizationFit: 'Affiliate marketing and sponsorships',
            contentFormats: ['REVIEW', 'COMPARISON', 'LIST'] as ContentFormat[],
        });
    }

    // --- Pillar 3: Case Studies & Results ---
    if (input.opportunityIndex > 50) {
        pillars.push({
            name: 'Real Results & Case Studies',
            description: 'Proof-based content that builds credibility, social proof, and audience trust through documented outcomes.',
            priority: priorityCounter++,
            sampleTopics: caseStudyTopics(k),
            monetizationFit: 'Coaching, consulting, and course sales',
            contentFormats: ['CASE_STUDY', 'CHALLENGE'] as ContentFormat[],
        });
    }

    // --- Pillar 4: News & Commentary ---
    if (input.growthScore > 65 || input.freshnessGap > 55) {
        pillars.push({
            name: `${k} News & Trends`,
            description: 'Timely content that capitalizes on algorithm freshness signals and positions the channel as a current authority.',
            priority: priorityCounter++,
            sampleTopics: newsTopics(k),
            monetizationFit: 'Sponsorships and ad revenue',
            contentFormats: ['COMMENTARY', 'SHORT_FORM'] as ContentFormat[],
        });
    }

    // --- Pillar 5: Deep Dives ---
    if (input.competitionScore < 60) {
        pillars.push({
            name: 'Advanced & In-Depth Content',
            description: 'Long-form comprehensive content that dominates search rankings and establishes the definitive resource position.',
            priority: priorityCounter++,
            sampleTopics: advancedTopics(k),
            monetizationFit: 'Premium courses and consulting',
            contentFormats: ['TUTORIAL', 'DOCUMENTARY', 'CASE_STUDY'] as ContentFormat[],
        });
    }

    // Ensure at least 3 pillars (add news if we're still short)
    if (pillars.length < 3) {
        pillars.push({
            name: `${k} News & Trends`,
            description: 'Timely commentary and news coverage to build algorithm momentum and audience loyalty.',
            priority: priorityCounter++,
            sampleTopics: newsTopics(k),
            monetizationFit: 'Sponsorships and ad revenue',
            contentFormats: ['COMMENTARY', 'SHORT_FORM'] as ContentFormat[],
        });
    }

    return pillars.sort((a, b) => a.priority - b.priority);
}
