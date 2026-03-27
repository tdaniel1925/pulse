/**
 * Client and Plan Types
 */

import { Platform, BrandVoice, Industry } from './content';

export type PlanTier = 'starter' | 'growth' | 'pro' | 'authority';

export type PlanStatus = 'active' | 'trialing' | 'past_due' | 'cancelled';

export type PrimaryGoal = 'leads' | 'appointments' | 'brand-awareness';

export interface EmailPreferences {
  daily_posts: boolean;
  monthly_report: boolean;
  product_updates: boolean;
}

export interface Client {
  id: string;
  user_id: string;
  business_name: string;
  industry: Industry;
  plan: PlanTier;
  plan_status: PlanStatus;
  selected_platforms: Platform[];
  brand_voice: BrandVoice;
  primary_goal?: PrimaryGoal;
  timezone: string;

  // Apex fields
  rep_code?: string;
  apex_rep_id?: string;
  apex_rank?: string;
  apex_affiliate_link?: string;

  // Square fields
  square_customer_id?: string;
  square_subscription_id?: string;
  square_setup_fee_payment_id?: string;
  setup_fee_paid: boolean;

  // Profile fields
  core_offer?: string;
  target_customer?: string;
  differentiator?: string;

  // Status fields
  provisioning_complete: boolean;
  moderation_required: boolean;
  email_preferences: EmailPreferences;
  content_generated_at?: string;
  unsubscribed_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  postsPerPlatform: number;
  landingPages: number;
  platforms: number;
  customBranding: boolean;
  prioritySupport: boolean;
}
