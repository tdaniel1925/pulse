/**
 * Content Generation Types
 */

export type Platform = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube';

export type ModerationStatus = 'approved' | 'pending' | 'flagged';

export type BrandVoice = 'professional' | 'casual' | 'friendly' | 'authoritative';

export type Industry =
  | 'insurance'
  | 'real-estate'
  | 'legal'
  | 'healthcare'
  | 'home-services'
  | 'fitness';

export interface SocialPost {
  postCopy: string;
  hashtags?: string;
  imagePrompt: string;
  topics?: string[];
}

export interface GenerateSocialPostsParams {
  businessName: string;
  industry: Industry;
  platform: Platform;
  count: number;
  excludeTopics?: string[];
  brandVoice?: BrandVoice;
}

export interface LandingPageContent {
  headline: string;
  subheadline: string;
  bodyCopy: string[];
  ctaPrimary: string;
  ctaSecondary?: string;
  seoTitle: string;
  seoDescription: string;
  heroImagePrompt: string;
}

export interface GenerateLandingPageParams {
  businessName: string;
  industry: Industry;
  coreOffer: string;
  targetCustomer: string;
  differentiator: string;
  brandVoice?: BrandVoice;
  targetKeyword?: string;
}

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  categoryScores: Record<string, number>;
}
