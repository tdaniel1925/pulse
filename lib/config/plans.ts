/**
 * Plan limits and configuration
 * Based on PROJECT-SPEC.md and DEPENDENCY-MAP.md
 */

export const PLAN_LIMITS = {
  starter: {
    posts_per_platform: 30,
    landing_pages: 3,
    podcast: false,
    youtube: false,
    price_monthly: 79,
    setup_fee: 297,
  },
  growth: {
    posts_per_platform: 50,
    landing_pages: 5,
    podcast: false,
    youtube: false,
    price_monthly: 129,
    setup_fee: 497,
  },
  pro: {
    posts_per_platform: 150,
    landing_pages: 10,
    podcast: true,
    youtube: false,
    price_monthly: 299,
    setup_fee: 697,
  },
  authority: {
    posts_per_platform: 150,
    landing_pages: -1, // Unlimited
    podcast: true,
    youtube: true,
    price_monthly: 499,
    setup_fee: 997,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

/**
 * Check if plan allows feature
 * Based on DEPENDENCY-MAP.md - Plan tier feature gates
 */
export function planAllows(plan: Plan, feature: 'podcast' | 'youtube'): boolean {
  return PLAN_LIMITS[plan][feature];
}

/**
 * Check if client can create more landing pages
 * Returns { allowed: boolean, limit: number, current: number }
 */
export function canCreateLandingPage(plan: Plan, currentCount: number): {
  allowed: boolean;
  limit: number;
  current: number;
} {
  const limit = PLAN_LIMITS[plan].landing_pages;

  if (limit === -1) {
    // Unlimited
    return { allowed: true, limit: -1, current: currentCount };
  }

  return {
    allowed: currentCount < limit,
    limit,
    current: currentCount,
  };
}

/**
 * Get posts per platform for plan
 */
export function getPostsPerPlatform(plan: Plan): number {
  return PLAN_LIMITS[plan].posts_per_platform;
}
