/**
 * @file quickWins.ts
 * Quick Wins Generator — surfaces the 5 highest-leverage actions
 * a creator can take in their first 2 weeks in this niche.
 */

import type { VideoIdea, ContentGap, StrategyInput } from './types';

/**
 * Returns exactly 5 specific, actionable quick wins for the first 2 weeks.
 *
 * @param input - The normalized strategy input.
 * @param ideas - The 12 generated video ideas.
 * @param gaps - The identified content gaps.
 * @returns Exactly 5 action strings.
 */
export function generateQuickWins(
    input: StrategyInput,
    ideas: VideoIdea[],
    gaps: ContentGap[]
): string[] {
    const wins: string[] = [];
    const kw = input.keyword;

    // 1. Easiest video idea — lowest estimatedProductionHours
    const easiest = [...ideas].sort(
        (a, b) => a.estimatedProductionHours - b.estimatedProductionHours
    )[0];
    if (easiest) {
        wins.push(
            `Film and publish: "${easiest.title}" — your lowest-effort, highest-demand starting point (${easiest.estimatedProductionHours}h to produce)`
        );
    } else {
        wins.push(
            `Film and publish a beginner-focused ${kw} tutorial — your fastest path to first impressions`
        );
    }

    // 2. Keyword targeting action based on top content gap
    const topGap = gaps[0];
    if (topGap) {
        wins.push(
            `Target the "${topGap.topic}" content gap now — use it as your primary keyword in the first video title and description, as it has an opportunity score of ${topGap.opportunitySize}/100 with low existing coverage`
        );
    } else {
        wins.push(
            `Research and lock in your top 3 ${kw} long-tail keywords using free tools like Google Trends and TubeBuddy before filming your first video`
        );
    }

    // 3. Short-form action
    const shortFormIdea = ideas.find((i) => i.format === 'SHORT_FORM' || i.isShortFormVariant);
    if (shortFormIdea) {
        wins.push(
            `Record a 60-second Short based on "${shortFormIdea.title}" — repurpose your long-form research into a quick hook to seed the algorithm before your full video goes live`
        );
    } else {
        wins.push(
            `Create your first ${kw} Short or Reel this week — even a 45-second tip drives early subscribers and tells the algorithm your channel is active`
        );
    }

    // 4. Competitor research action
    wins.push(
        `Audit the top 10 ${kw} videos on YouTube right now: note their title patterns, thumbnail styles, and the first comment that gets the most likes — this is your direct roadmap for what the audience actually wants`
    );

    // 5. Channel setup action relevant to top revenue path
    const topRevenue = input.topRevenuePaths[0] ?? 'AD_REVENUE';
    const revenueSetupMap: Record<string, string> = {
        AD_REVENUE: `Set up your YouTube channel with keyword-rich About section, channel trailer, and playlists organised by ${kw} subtopic — this optimises discoverability before your first video even goes live`,
        AFFILIATE_MARKETING: `Join 2–3 ${kw} affiliate programs this week (Amazon, PartnerStack, or direct brand programs) and add affiliate-ready links to your channel description before publishing your first review`,
        SPONSORSHIPS: `Build a basic one-page media kit with your channel focus, target audience profile, and planned content schedule — reach out to 5 ${kw} brands in week two`,
        COURSES: `Create a free ${kw} resource (checklist, template, or starter guide) to collect emails from day one — your course waitlist starts with your very first subscriber`,
        DIGITAL_PRODUCTS: `Design a simple ${kw} template or cheat sheet in Canva this week — offer it as a free download to grow your email list before you have any significant video views`,
        COACHING: `Set up a Calendly booking page for free 20-minute ${kw} strategy calls — early free calls build case studies and referrals before you launch paid coaching`,
        SAAS_TOOLS: `Create a landing page for your ${kw} tool with a waitlist email capture this week — visibility from your first videos should feed directly into user signups`,
        PHYSICAL_PRODUCTS: `Source samples from 3 ${kw} product suppliers and start your product comparison research — your first review video becomes the foundation of your store`,
    };
    wins.push(
        revenueSetupMap[topRevenue] ??
        `Configure your channel's About section, playlists, and channel art to communicate clearly that you are a ${kw} authority — first impressions matter before you have a back-catalogue`
    );

    return wins.slice(0, 5);
}
