/**
 * Represents trend signal data derived from Google Trends / Pytrends.
 * Encapsulates how a keyword is trending over time and geographically.
 */
export interface TrendSignal {
  /** The keyword this signal describes */
  keyword: string;
  /** Rate of change in interest over time — positive = accelerating, negative = declining */
  velocity: number;
  /** Percentage growth over the measurement window (e.g., 90 days) */
  growthRate: number;
  /** Geographic concentration score 0–100; high = strong regional demand cluster */
  regionalStrength: number;
  /** Number of breakout / "rising" related queries detected by Google Trends */
  risingQueriesCount: number;
}

/**
 * Represents creator/supply signal data derived from YouTube Data API v3.
 * Measures the competitive landscape of content creators in this niche.
 */
export interface CreatorSignal {
  /** The keyword this signal describes */
  keyword: string;
  /** Total number of YouTube videos matching the keyword search */
  videoCount: number;
  /** Average view count per video across the top search results */
  avgViews: number;
  /** Average engagement ratio: (likes + comments) / views, expressed as 0–100 */
  avgEngagement: number;
  /** Subscriber count of the largest / most dominant channel in the niche */
  topChannelSubs: number;
  /** Average number of uploads per week across the top channels in the niche */
  uploadFrequency: number;
  /** Fraction of top videos that come from channels with < 100 k subscribers (0–1) */
  smallCreatorRatio: number;
}

/**
 * The computed opportunity scoring object — combines trend and creator signals
 * into a single actionable intelligence object for niche analysis.
 */
export interface OpportunityScore {
  /** The keyword being scored */
  keyword: string;
  /** 0–100 — how strong and growing the audience demand is */
  demandScore: number;
  /** 0–100 — how much established competition exists (higher = more competition) */
  competitionScore: number;
  /** 0–100 — how crowded and mature the niche is (higher = more saturated) */
  saturationScore: number;
  /** 0–100 — final composite score balancing demand against competition & saturation */
  opportunityScore: number;
  /** Human-readable verdict tier based on the opportunity score */
  verdict: 'LOW' | 'MEDIUM' | 'HIGH' | 'GOLDMINE';
  /** The raw signals used to compute this score */
  signals: {
    trend: TrendSignal;
    creator: CreatorSignal;
  };
  /** Array of 3–6 human-readable bullet point insights about this niche */
  insights: string[];
  /** ISO 8601 timestamp of when this score was computed */
  computedAt: string;
}

/**
 * The shape returned by the `/api/insights` route — mirrors OpportunityScore
 * but is the canonical API response type for the frontend to consume.
 */
export interface InsightsResponse {
  /** The keyword that was analysed */
  keyword: string;
  /** 0–100 final composite opportunity score */
  opportunityScore: number;
  /** Human-readable verdict tier */
  verdict: 'LOW' | 'MEDIUM' | 'HIGH' | 'GOLDMINE';
  /** 0–100 audience demand score */
  demandScore: number;
  /** 0–100 competition score (higher = more competition) */
  competitionScore: number;
  /** 0–100 saturation score (higher = more saturated) */
  saturationScore: number;
  /** Raw trend and creator signals */
  signals: {
    trend: TrendSignal;
    creator: CreatorSignal;
  };
  /** 3–6 human-readable insight bullets */
  insights: string[];
  /** ISO 8601 timestamp of computation */
  computedAt: string;
}
