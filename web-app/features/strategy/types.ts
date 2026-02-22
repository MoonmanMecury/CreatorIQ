/**
 * @file types.ts
 * Type definitions for the AI Content Strategy Generator (Step 6).
 * Every output must be grounded in the actual signals from Steps 2–5.
 */

// ---------------------------------------------------------------------------
// Primitive union types
// ---------------------------------------------------------------------------

/** The format / style of a piece of content. */
export type ContentFormat =
    | 'TUTORIAL'
    | 'REVIEW'
    | 'LIST'
    | 'CASE_STUDY'
    | 'COMMENTARY'
    | 'SHORT_FORM'
    | 'DOCUMENTARY'
    | 'COMPARISON'
    | 'INTERVIEW'
    | 'CHALLENGE';

/** Estimated production effort for a single piece of content. */
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

/** How aggressively the creator should publish. */
export type PostingCadence = 'LIGHT' | 'MODERATE' | 'AGGRESSIVE';

// ---------------------------------------------------------------------------
// Content Gap
// ---------------------------------------------------------------------------

/**
 * A specific gap in the existing content landscape that presents an opportunity.
 */
export interface ContentGap {
    /** The missing subtopic, angle, or format that is underserved. */
    topic: string;
    /** The category of gap this represents. */
    gapType: 'SUBTOPIC' | 'FORMAT' | 'AUDIENCE' | 'DEPTH' | 'RECENCY';
    /** Estimated opportunity size, 0–100. Higher = bigger gap. */
    opportunitySize: number;
    /** Why this gap exists in the current content landscape. */
    explanation: string;
    /** A concrete suggested angle for filling this gap. */
    suggestedAngle: string;
}

// ---------------------------------------------------------------------------
// Format Score
// ---------------------------------------------------------------------------

/**
 * A scored content format indicating how well it fits the niche.
 */
export interface FormatScore {
    /** The content format identifier. */
    format: ContentFormat;
    /** Human-readable label, e.g. "Tutorial". */
    label: string;
    /** Predicted success likelihood, 0–100. */
    successLikelihood: number;
    /** Explanation of why this format succeeds for this specific niche. */
    reasoning: string;
    /** A concrete example title using this format and the keyword. */
    exampleTitle: string;
    /** Whether this is a short-form (≤60 second) format. */
    isShortForm: boolean;
}

// ---------------------------------------------------------------------------
// Title Template
// ---------------------------------------------------------------------------

/**
 * A proven title pattern that works well for this type of content.
 */
export interface TitleTemplate {
    /** The template string with {topic} as the placeholder. */
    template: string;
    /** Human-readable name for this pattern, e.g. "Personal Challenge". */
    patternName: string;
    /** How well this pattern is predicted to perform for this keyword. */
    performanceTier: 'HIGH' | 'MEDIUM' | 'LOW';
    /** The template filled in with the actual keyword. */
    exampleFilled: string;
    /** One-sentence explanation of why this title pattern works psychologically. */
    whyItWorks: string;
}

// ---------------------------------------------------------------------------
// Content Pillar
// ---------------------------------------------------------------------------

/**
 * A strategic content pillar — a recurring theme or category of content.
 */
export interface ContentPillar {
    /** Short, memorable name for this pillar, e.g. "Tool Reviews". */
    name: string;
    /** 1–2 sentence description of what this pillar covers. */
    description: string;
    /** Execution priority — 1 = highest priority pillar to start with. */
    priority: number;
    /** 4–6 specific, actionable topic ideas within this pillar. */
    sampleTopics: string[];
    /** Which revenue pathway(s) this pillar best supports. */
    monetizationFit: string;
    /** The best content formats to use for this pillar. */
    contentFormats: ContentFormat[];
}

// ---------------------------------------------------------------------------
// Video Idea
// ---------------------------------------------------------------------------

/**
 * A specific, ready-to-produce video idea grounded in the niche data.
 */
export interface VideoIdea {
    /** A specific, ready-to-use working title for the video. */
    title: string;
    /** The primary content format for this video. */
    format: ContentFormat;
    /** Which content pillar this idea belongs to. */
    pillar: string;
    /** A specific description of the intended target audience. */
    targetAudience: string;
    /** One sentence explaining why this idea will perform, citing actual data signals. */
    whyItWillPerform: string;
    /** How difficult this video is to produce. */
    difficulty: DifficultyLevel;
    /** Realistic estimated hours to research, film, and edit. */
    estimatedProductionHours: number;
    /** Whether there is meaningful search demand for this topic. */
    searchDemandSignal: 'LOW' | 'MEDIUM' | 'HIGH';
    /** How saturated the competition is for this specific topic. */
    competitionSignal: 'LOW' | 'MEDIUM' | 'HIGH';
    /** Whether this idea could also be produced as a 60-second Short. */
    isShortFormVariant: boolean;
    /** A specific opening line or hook idea to capture immediate attention. */
    hookSuggestion: string;
}

// ---------------------------------------------------------------------------
// Growth Phase
// ---------------------------------------------------------------------------

/**
 * A single phase in the multi-phase growth plan.
 */
export interface GrowthPhase {
    /** Phase number: 1, 2, or 3. */
    phase: number;
    /** Human-readable label, e.g. "Foundation Phase". */
    label: string;
    /** Approximate duration of this phase in weeks. */
    durationWeeks: number;
    /** The primary objective for this phase. */
    goal: string;
    /** 4 specific, actionable steps to execute during this phase. */
    keyActions: string[];
}

// ---------------------------------------------------------------------------
// Posting Plan
// ---------------------------------------------------------------------------

/**
 * The recommended content publishing strategy and schedule.
 */
export interface PostingPlan {
    /** How aggressively to publish content. */
    cadence: PostingCadence;
    /** Long-form videos to publish per week. */
    longFormPerWeek: number;
    /** Short-form videos (Shorts/Reels) to publish per week. */
    shortFormPerWeek: number;
    /** Estimated total production hours per week. */
    weeklyCommitmentHours: number;
    /** Plain-language description of exactly what to focus on in month 1. */
    firstMonthFocus: string;
    /** Exactly 3 sequential growth phases. */
    growthPhases: GrowthPhase[];
}

// ---------------------------------------------------------------------------
// Differentiation Strategy
// ---------------------------------------------------------------------------

/**
 * A strategic approach to standing out from existing creators in this niche.
 */
export interface DifferentiationStrategy {
    /** Short name for this strategy, e.g. "Beginner-First Approach". */
    strategy: string;
    /** 2-sentence explanation of what this strategy involves. */
    description: string;
    /** Recommendation priority — 1 = most recommended. */
    priority: number;
    /** How much production effort this strategy requires. */
    effortLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    /** Approximate weeks before this strategy shows measurable impact. */
    timeToImpactWeeks: number;
    /** Why this strategy works specifically for this niche's signals. */
    whyItWorks: string;
}

// ---------------------------------------------------------------------------
// Content Strategy (top-level result)
// ---------------------------------------------------------------------------

/**
 * The full AI-generated content strategy for a keyword/niche.
 * This is the top-level response object returned by the strategy engine.
 */
export interface ContentStrategy {
    /** The keyword this strategy was generated for. */
    keyword: string;
    /** 3–4 sentence executive summary of the strategic direction. */
    strategySummary: string;
    /** Identified gaps in the existing content landscape. */
    contentGaps: ContentGap[];
    /** All content formats scored for this niche, sorted by success likelihood. */
    topFormats: FormatScore[];
    /** Proven title patterns suited for this niche. */
    titleTemplates: TitleTemplate[];
    /** 3–5 strategic content pillars to build the channel around. */
    pillars: ContentPillar[];
    /** Exactly 12 specific, ready-to-produce video ideas. */
    videoIdeas: VideoIdea[];
    /** The recommended publishing schedule and growth phases. */
    postingPlan: PostingPlan;
    /** 4–6 ways to differentiate from existing creators, sorted by priority. */
    differentiationStrategies: DifferentiationStrategy[];
    /** Exactly 5 specific actions to take in the first 2 weeks. */
    quickWins: string[];
    /** ISO 8601 timestamp of when this strategy was computed. */
    computedAt: string;
}

// ---------------------------------------------------------------------------
// Strategy Input contract
// ---------------------------------------------------------------------------

/**
 * Normalised input shape expected by `getContentStrategy`.
 * Fields are mapped from Step 2 (insights), Step 3 (opportunities), and Step 5 (monetization).
 */
export interface StrategyInput {
    /** The keyword/niche being analyzed. */
    keyword: string;
    /** 0–100 demand score from the Step 2 insights layer. */
    demandScore: number;
    /** 0–100 growth/velocity score from Step 2. */
    growthScore: number;
    /** 0–100 competition score from Step 2 (higher = more competitive). */
    competitionScore: number;
    /** 0–100 market saturation score from Step 2. */
    saturationScore: number;
    /** 0–100 overall opportunity index from Step 3. */
    opportunityIndex: number;
    /** Human-readable market maturity label from Step 5, e.g. "DEVELOPING". */
    marketMaturity: string;
    /** 0–100 composite monetization score from Step 5. */
    monetizationScore: number;
    /** Top revenue path type strings from Step 5 (e.g. ["AFFILIATE_MARKETING", "COURSES"]). */
    topRevenuePaths: string[];
    /** Rising/underserved keywords identified in Step 3. */
    risingKeywords: string[];
    /** Titles of breakout videos identified in Step 3. */
    breakoutVideoTitles: string[];
    /** Average uploads per week from top competitors in Step 3. */
    avgCompetitorUploadFrequency: number;
    /** 0–100 signal indicating how well small/new creators are performing in this niche. */
    smallCreatorAdvantage: number;
    /** 0–100 signal indicating how stale the existing content supply is. */
    freshnessGap: number;
}
