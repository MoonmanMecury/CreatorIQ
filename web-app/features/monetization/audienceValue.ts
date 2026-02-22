/**
 * @file audienceValue.ts
 * Estimates how valuable the niche audience is to advertisers.
 * Pure deterministic function — no API calls.
 */

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

interface CategoryDef {
    baseScore: number;
    triggers: string[];
}

/**
 * Ordered list of audience value categories.
 * Detection scans keyword + related keywords; the highest matched score wins.
 */
const CATEGORIES: CategoryDef[] = [
    {
        baseScore: 95,
        triggers: ['invest', 'stock', 'crypto', 'trading', 'wealth', 'retirement', 'fund', 'finance', 'financial'],
    },
    {
        baseScore: 90,
        triggers: ['business', 'startup', 'entrepreneur', 'revenue', 'saas', 'agency', 'b2b', 'enterprise'],
    },
    {
        baseScore: 85,
        triggers: ['software', 'coding', 'developer', 'ai', 'tool', 'platform', 'app', 'programmer', 'code', 'tech'],
    },
    {
        baseScore: 80,
        triggers: ['career', 'resume', 'job', 'interview', 'skill', 'certification', 'promotion', 'professional', 'linkedin'],
    },
    {
        baseScore: 75,
        triggers: ['supplement', 'fitness', 'workout', 'diet', 'nutrition', 'weight loss', 'gym', 'health', 'muscle'],
    },
    {
        baseScore: 70,
        triggers: ['course', 'learn', 'study', 'degree', 'exam', 'tutorial', 'education', 'university', 'training'],
    },
    {
        baseScore: 70,
        triggers: ['golf', 'travel', 'photography', 'guitar', 'luxury', 'sailing', 'skiing', 'diving', 'watch'],
    },
    {
        baseScore: 65,
        triggers: ['renovation', 'diy', 'kitchen', 'garden', 'home', 'decor', 'interior', 'landscaping', 'plumbing'],
    },
    {
        baseScore: 50,
        triggers: ['gaming', 'game', 'esports', 'stream', 'twitch', 'playstation', 'xbox', 'nintendo'],
    },
    {
        baseScore: 40,
        triggers: ['vlog', 'daily', 'routine', 'lifestyle', 'day in my life', 'haul'],
    },
    {
        baseScore: 30,
        triggers: ['funny', 'meme', 'reaction', 'prank', 'celebrity', 'drama', 'gossip'],
    },
];

/** High-value English-speaking regional signals that warrant a +5 CPM bonus. */
const PREMIUM_REGION_SIGNALS = ['us', 'usa', 'uk', 'united kingdom', 'australia', 'canada', 'new zealand'];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Estimate audience commercial value for a niche keyword.
 *
 * Step 1 — category detection:
 *   Scan combined text for category triggers; take the highest matching base score.
 *   If no category matches, return a neutral 45.
 *
 * Step 2 — regional adjustment:
 *   If the keyword contains a premium English-market signal, apply +5.
 *
 * @returns Clamped 0–100.
 */
export function calculateAudienceValueScore(
    keyword: string,
    relatedKeywords: string[] = []
): number {
    const combined = [keyword, ...relatedKeywords].join(' ').toLowerCase();

    // Step 1 — find highest matching category
    let baseScore = 45; // neutral default
    for (const cat of CATEGORIES) {
        if (cat.triggers.some((t) => combined.includes(t))) {
            if (cat.baseScore > baseScore) {
                baseScore = cat.baseScore;
            }
        }
    }

    // Step 2 — regional bonus
    const hasRegionalBonus = PREMIUM_REGION_SIGNALS.some((r) => combined.includes(r));
    const bonus = hasRegionalBonus ? 5 : 0;

    return Math.max(0, Math.min(100, baseScore + bonus));
}
