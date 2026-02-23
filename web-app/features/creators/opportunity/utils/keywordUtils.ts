const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'not', 'this', 'that', 'it',
]);

/**
 * Strips HTML, removes punctuation, removes stop words, returns unique words 4+ chars.
 */
export function extractKeywords(text: string): string[] {
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    const words = cleanText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w));

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const w of words) {
        if (!seen.has(w)) {
            seen.add(w);
            unique.push(w);
        }
    }
    return unique.slice(0, 15);
}

/**
 * Returns capitalized words/phrases (2+ chars, starts with uppercase) that are not sentence starters.
 */
export function extractNamedEntities(text: string): string[] {
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    // Match words starting with uppercase, not at the beginning of a sentence.
    // This is a simplified heuristic.
    const sentences = cleanText.split(/[.!?]\s+/);
    const entities = new Set<string>();

    sentences.forEach(s => {
        const words = s.split(/\s+/);
        // Skip first word as it's always capitalized if it's the start
        words.slice(1).forEach(w => {
            const clean = w.replace(/[^\w]/g, '');
            if (clean.length >= 2 && /^[A-Z]/.test(clean)) {
                entities.add(clean);
            }
        });
    });

    return Array.from(entities);
}

/**
 * Returns a 0-1 Jaccard similarity score: intersection.size / union.size.
 */
export function computeKeywordOverlap(setA: string[], setB: string[]): number {
    if (setA.length === 0 || setB.length === 0) return 0;
    const a = new Set(setA);
    const b = new Set(setB);
    const intersection = new Set([...a].filter(x => b.has(x)));
    const union = new Set([...a, ...b]);
    return intersection.size / union.size;
}

/**
 * Groups keyword arrays into topic clusters.
 * Groups keyword arrays into topic clusters using the same greedy algorithm from the synthesizer:
 * two arrays belong together if they share 2+ keywords.
 */
export function clusterKeywordsByTopic(keywordArrays: string[][]): Map<string, string[]> {
    const clusters: { label: string; keywords: Set<string>; count: Map<string, number> }[] = [];

    keywordArrays.forEach(words => {
        let foundClusterIndex = -1;

        for (let i = 0; i < clusters.length; i++) {
            const cluster = clusters[i];
            let crossover = 0;
            for (const w of words) {
                if (cluster.keywords.has(w)) {
                    crossover++;
                }
            }
            if (crossover >= 2) {
                foundClusterIndex = i;
                break;
            }
        }

        if (foundClusterIndex !== -1) {
            const cluster = clusters[foundClusterIndex];
            words.forEach(w => {
                cluster.keywords.add(w);
                cluster.count.set(w, (cluster.count.get(w) || 0) + 1);
            });
        } else if (words.length > 0) {
            const count = new Map<string, number>();
            words.forEach(w => count.set(w, 1));
            clusters.push({
                label: '', // Will set later
                keywords: new Set(words),
                count: count
            });
        }
    });

    const result = new Map<string, string[]>();
    clusters.forEach(c => {
        // Topic label = most frequent keyword across the cluster
        let bestWord = '';
        let maxCount = 0;
        c.count.forEach((val, key) => {
            if (val > maxCount) {
                maxCount = val;
                bestWord = key;
            }
        });
        c.label = bestWord || 'Unknown Topic';
        result.set(c.label, Array.from(c.keywords));
    });

    return result;
}
