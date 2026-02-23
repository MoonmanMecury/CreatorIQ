/**
 * Sorts dates descending and determines the upload cadence trend.
 */
export function calculateUploadCadence(publishDates: string[]): { perWeek: number, trend: 'ACCELERATING' | 'STABLE' | 'SLOWING' | 'STALLED' } {
    const sorted = [...publishDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

    const last30 = sorted.filter(d => new Date(d).getTime() >= thirtyDaysAgo).length;
    const prev30 = sorted.filter(d => {
        const t = new Date(d).getTime();
        return t >= sixtyDaysAgo && t < thirtyDaysAgo;
    }).length;

    let trend: 'ACCELERATING' | 'STABLE' | 'SLOWING' | 'STALLED' = 'STABLE';
    if (last30 === 0) {
        trend = 'STALLED';
    } else if (last30 > prev30 * 1.2) {
        trend = 'ACCELERATING';
    } else if (last30 < prev30 * 0.8) {
        trend = 'SLOWING';
    }

    return {
        perWeek: Number((last30 / 4.3).toFixed(1)),
        trend
    };
}

/**
 * Calculates view velocity and trend.
 */
export function calculateViewVelocity(videos: { views: number, publishedAt: string }[]): { avgViewsPerHour: number, trend: 'GROWING' | 'STABLE' | 'DECLINING' } {
    if (videos.length === 0) return { avgViewsPerHour: 0, trend: 'STABLE' };

    const computeVelocity = (v: { views: number, publishedAt: string }) => {
        const hours = (Date.now() - new Date(v.publishedAt).getTime()) / (1000 * 60 * 60);
        return v.views / (hours || 1);
    };

    const velocities = videos.map(computeVelocity);
    const recent = velocities.slice(0, 5);
    const previous = velocities.slice(5, 10);

    const avgRecent = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
    const avgPrev = previous.reduce((a, b) => a + b, 0) / (previous.length || 1);

    let trend: 'GROWING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (avgRecent > avgPrev * 1.15) {
        trend = 'GROWING';
    } else if (avgRecent < avgPrev * 0.85) {
        trend = 'DECLINING';
    }

    return {
        avgViewsPerHour: Number(avgRecent.toFixed(2)),
        trend
    };
}

/**
 * Returns number of days between isoDate and now. Returns 999 if isoDate is null/undefined.
 */
export function daysSince(isoDate: string | null | undefined): number {
    if (!isoDate) return 999;
    const diff = Date.now() - new Date(isoDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
