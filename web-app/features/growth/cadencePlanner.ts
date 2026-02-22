/**
 * @file cadencePlanner.ts
 * Forecasts content production ramp-up phases and generates a 12-week schedule.
 */

import { GrowthInput, CadencePhase, WeeklySchedule } from './types';

/**
 * Generates 4 phases of content cadence evolution.
 */
export function generateCadencePhases(input: GrowthInput): CadencePhase[] {
    const phases: CadencePhase[] = [
        {
            phase: 1,
            label: "Weeks 1–8: Foundation",
            startWeek: 1,
            endWeek: 8,
            longFormPerWeek: 1,
            shortFormPerWeek: 2,
            totalVideosPerWeek: 3,
            weeklyHoursEstimate: 0, // Computed below
            focus: "Test content formats and find what resonates with the algorithm",
            formatMix: input.topFormats.slice(0, 2),
            rationaleForChange: "Starting conservatively prevents burnout and allows quality focus"
        },
        {
            phase: 2,
            label: "Weeks 9–20: Acceleration",
            startWeek: 9,
            endWeek: 20,
            longFormPerWeek: input.longFormPerWeek,
            shortFormPerWeek: input.shortFormPerWeek,
            totalVideosPerWeek: input.longFormPerWeek + input.shortFormPerWeek,
            weeklyHoursEstimate: 0,
            focus: "Double down on proven formats, begin keyword targeting strategy",
            formatMix: input.topFormats.slice(0, 3),
            rationaleForChange: "Increase volume after identifying 2–3 formats that are gaining traction"
        },
        {
            phase: 3,
            label: "Weeks 21–40: Optimization",
            startWeek: 21,
            endWeek: 40,
            longFormPerWeek: Math.min(input.longFormPerWeek + 1, 4),
            shortFormPerWeek: Math.min(input.shortFormPerWeek + 2, 7),
            totalVideosPerWeek: Math.min(input.longFormPerWeek + 1, 4) + Math.min(input.shortFormPerWeek + 2, 7),
            weeklyHoursEstimate: 0,
            focus: "Optimize titles, thumbnails, and hooks based on performance data",
            formatMix: [...input.topFormats.slice(0, 3), "Experimental"],
            rationaleForChange: "Data from Phase 2 reveals winning patterns — scale what works"
        },
        {
            phase: 4,
            label: "Week 41+: Scale",
            startWeek: 41,
            endWeek: -1,
            longFormPerWeek: Math.min(input.longFormPerWeek + 1, 4),
            shortFormPerWeek: Math.min(input.shortFormPerWeek + 2, 7),
            totalVideosPerWeek: Math.min(input.longFormPerWeek + 1, 4) + Math.min(input.shortFormPerWeek + 2, 7),
            weeklyHoursEstimate: 0,
            focus: "Maintain volume, begin monetization activation and platform expansion",
            formatMix: input.topFormats,
            rationaleForChange: "Channel velocity established — maintain and monetize"
        }
    ];

    return phases.map(p => ({
        ...p,
        weeklyHoursEstimate: Math.round((p.longFormPerWeek * 6) + (p.shortFormPerWeek * 1.5))
    }));
}

/**
 * Generates a detailed 12-week execution schedule.
 */
export function generateWeeklySchedule(phases: CadencePhase[], input: GrowthInput): WeeklySchedule[] {
    const schedule: WeeklySchedule[] = [];

    for (let week = 1; week <= 12; week++) {
        const phase = phases.find(p => week >= p.startWeek && (p.endWeek === -1 || week <= p.endWeek)) || phases[0];

        // Cyclic assignments
        const pillarIndex = (week - 1) % input.topPillars.length;
        const formatIndex = (week - 1) % input.topFormats.length;

        let focusTopic = input.topPillars[pillarIndex] || "General Guide";
        let milestone = week <= 8 ? "Target: 1K subscribers" : "Building to 5K";

        if (week === 1) {
            focusTopic = `Channel Setup & First ${input.keyword} Video`;
            milestone = "Launch week";
        }

        schedule.push({
            week,
            phase: phase.phase,
            longFormCount: phase.longFormPerWeek,
            shortFormCount: phase.shortFormPerWeek,
            primaryFormat: input.topFormats[formatIndex] || "Tutorial",
            focusTopic,
            milestone
        });
    }

    return schedule;
}
