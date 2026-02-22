import { UnderservedKeyword } from "./types";

/**
 * Expands a base keyword into a list of underserved related keywords.
 * Uses deterministic simulation for growth rates where data is missing.
 */
export function expandKeywords(
    baseKeyword: string,
    relatedQueries: string[],
    risingQueries: string[]
): UnderservedKeyword[] {
    const allQueries = [
        ...risingQueries.map(q => ({ query: q, type: 'RISING' as const })),
        ...relatedQueries.map(q => ({ query: q, type: 'STABLE' as const }))
    ];

    // Map and deduplicate
    const seen = new Set<string>();
    const results: UnderservedKeyword[] = [];

    for (const item of allQueries) {
        const normalized = item.query.toLowerCase().trim();
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        const words = normalized.split(/\s+/);
        const isLongTail = words.length >= 3;

        // Determine competition level
        let competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
        if (isLongTail) competitionLevel = 'LOW';
        else if (words.length === 1) competitionLevel = 'HIGH';

        // Seeded deterministic growth rate
        const seed = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const mockGrowth = item.type === 'RISING'
            ? 40 + (seed % 51)  // 40-90
            : 5 + (seed % 31);  // 5-35

        results.push({
            keyword: item.query,
            growthRate: mockGrowth,
            competitionLevel,
            searchVolumeTrend: item.type === 'RISING' ? 'RISING' : 'STABLE',
            isLongTail,
            relatedTo: baseKeyword
        });
    }

    // Prioritize Rising, then Long-Tail
    return results
        .sort((a, b) => {
            // Rising first
            if (a.searchVolumeTrend === 'RISING' && b.searchVolumeTrend !== 'RISING') return -1;
            if (a.searchVolumeTrend !== 'RISING' && b.searchVolumeTrend === 'RISING') return 1;

            // Long-tail second
            if (a.isLongTail && !b.isLongTail) return -1;
            if (!a.isLongTail && b.isLongTail) return 1;

            return b.growthRate - a.growthRate;
        })
        .slice(0, 15);
}
