-- PulseAgent Database Schema
-- Version: 1.0
-- Created: March 25, 2026
-- Based on PROJECT-SPEC.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
CREATE TABLE clients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users ON DELETE CASCADE,

  -- Business profile
  business_name         text NOT NULL,
  rep_code              text UNIQUE,
  referred_by           text,
  industry              text NOT NULL,
  niche                 text,
  target_customer       text,
  location_city         text,
  location_state        text,
  timezone              text DEFAULT 'America/Chicago',
  core_offer            text,
  differentiator        text,
  brand_voice           text DEFAULT 'professional',
  primary_goal          text DEFAULT 'leads',
  logo_url              text,
  brand_primary         text,
  brand_secondary       text,
  phone                 text,
  website               text,
  calendly_url          text,

  -- Apex integration
  apex_rep_id           text,
  apex_rank             text,
  apex_affiliate_link   text,

  -- Platform config
  selected_platforms    text[] DEFAULT '{}',
  post_approval_mode    text DEFAULT 'email',
  podcast_cadence       text DEFAULT 'weekly',
  podcast_format        text DEFAULT 'solo',
  podcast_voice_id      text,

  -- Billing (Square Payments)
  square_customer_id    text,
  square_subscription_id text,
  square_setup_fee_payment_id text,
  setup_fee_paid        bool DEFAULT false,
  plan                  text DEFAULT 'starter',
  plan_status           text DEFAULT 'trialing',
  trial_ends_at         timestamptz DEFAULT now() + interval '14 days',

  -- Email preferences (CAN-SPAM compliance)
  email_preferences     jsonb DEFAULT '{"daily_posts": true, "monthly_report": true, "product_updates": true}'::jsonb,
  unsubscribed_at       timestamptz,

  -- State
  onboarding_complete   bool DEFAULT false,
  provisioning_complete bool DEFAULT false,
  content_generated_at  timestamptz,

  -- Moderation
  moderation_required   bool DEFAULT true,
  moderation_exempt_at  timestamptz DEFAULT now() + interval '30 days',

  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- LANDING PAGES
-- ─────────────────────────────────────────
CREATE TABLE landing_pages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid REFERENCES clients ON DELETE CASCADE,

  -- Config
  page_type         text NOT NULL,
  target_keyword    text,
  target_audience   text,
  unique_offer      text,
  slug              text NOT NULL,

  -- Generated content
  headline          text,
  subheadline       text,
  body_copy         jsonb,
  cta_primary       text,
  cta_secondary     text,
  seo_title         text,
  seo_description   text,

  -- Assets
  hero_image_url    text,
  og_image_url      text,
  template_id       text,

  -- State
  published         bool DEFAULT false,
  published_url     text,
  is_primary        bool DEFAULT false,

  -- Moderation
  moderation_status text DEFAULT 'pending',
  moderation_flags  jsonb,
  moderation_score  float,
  reviewed_by       text,
  reviewed_at       timestamptz,

  created_at        timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- SOCIAL POSTS
-- ─────────────────────────────────────────
CREATE TABLE social_posts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid REFERENCES clients ON DELETE CASCADE,

  -- Content
  platform          text NOT NULL,
  post_copy         text NOT NULL,
  hashtags          text,
  image_prompt      text,

  -- Images
  image_url_raw     text,
  image_url_fb      text,
  image_url_ig      text,
  image_url_li      text,
  image_url_tw      text,
  image_url_yt      text,

  -- Share URLs
  share_url_facebook  text,
  share_url_linkedin  text,
  share_url_twitter   text,
  relay_page_url      text,

  -- Scheduling
  scheduled_date    date,
  scheduled_time    time DEFAULT '09:00',
  email_sent_at     timestamptz,
  batch_month       text,

  -- State
  status            text DEFAULT 'ready',
  topics            text[],

  -- Moderation
  moderation_status text DEFAULT 'pending',
  moderation_flags  jsonb,
  moderation_score  float,
  reviewed_by       text,
  reviewed_at       timestamptz,

  created_at        timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- PODCAST EPISODES
-- ─────────────────────────────────────────
CREATE TABLE podcast_episodes (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid REFERENCES clients ON DELETE CASCADE,

  episode_number        int NOT NULL,
  title                 text,
  description           text,
  show_notes            text,
  intro_script          text,
  full_script           text,
  outro_script          text,
  outline               jsonb,
  topics_covered        text[],
  keywords              text[],

  audio_url             text,
  cover_art_url         text,

  status                text DEFAULT 'draft',
  published_at          timestamptz,

  -- Moderation
  moderation_status     text DEFAULT 'pending',
  moderation_flags      jsonb,
  moderation_score      float,
  reviewed_by           text,
  reviewed_at           timestamptz,

  created_at            timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- YOUTUBE CONTENT
-- ─────────────────────────────────────────
CREATE TABLE youtube_content (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid REFERENCES clients ON DELETE CASCADE,

  content_type      text NOT NULL,
  video_number      int,
  title             text,
  description       text,
  thumbnail_concept text,
  script_outline    text,
  keywords          text[],
  tags              text[],
  thumbnail_url     text,

  scheduled_date    date,
  status            text DEFAULT 'draft',

  -- Moderation
  moderation_status text DEFAULT 'pending',
  moderation_flags  jsonb,
  moderation_score  float,
  reviewed_by       text,
  reviewed_at       timestamptz,

  created_at        timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- PROMPT TEMPLATES
-- ─────────────────────────────────────────
CREATE TABLE prompt_templates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key      text UNIQUE NOT NULL,
  category          text NOT NULL,
  industry          text,
  platform          text,
  system_prompt     text NOT NULL,
  user_prompt       text NOT NULL,
  output_schema     jsonb,
  design_direction  jsonb,
  version           int DEFAULT 1,
  active            bool DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- PROVISION LOG
-- ─────────────────────────────────────────
CREATE TABLE provision_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid REFERENCES clients ON DELETE CASCADE,
  source            text NOT NULL,
  event_type        text NOT NULL,
  payload           jsonb,
  status            text DEFAULT 'pending',
  error             text,
  started_at        timestamptz DEFAULT now(),
  completed_at      timestamptz
);

-- ─────────────────────────────────────────
-- GENERATION LOG
-- ─────────────────────────────────────────
CREATE TABLE generation_log (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid REFERENCES clients ON DELETE CASCADE,
  job_type              text NOT NULL,
  inngest_run_id        text,
  claude_tokens_in      int DEFAULT 0,
  claude_tokens_out     int DEFAULT 0,
  dalle_calls           int DEFAULT 0,
  ideogram_calls        int DEFAULT 0,
  sharp_operations      int DEFAULT 0,
  emails_sent           int DEFAULT 0,
  status                text DEFAULT 'running',
  error                 text,
  started_at            timestamptz DEFAULT now(),
  completed_at          timestamptz
);

-- ─────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_content ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own data
CREATE POLICY "clients_own_data" ON clients FOR ALL USING (user_id = auth.uid());

CREATE POLICY "pages_own_data" ON landing_pages FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);

CREATE POLICY "posts_own_data" ON social_posts FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);

CREATE POLICY "podcast_own_data" ON podcast_episodes FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);

CREATE POLICY "youtube_own_data" ON youtube_content FOR ALL USING (
  client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
);

-- Admin-only tables (no client access)
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE provision_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_log ENABLE ROW LEVEL SECURITY;

-- No policies = only service role can access

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_rep_code ON clients(rep_code);
CREATE INDEX idx_clients_timezone ON clients(timezone);
CREATE INDEX idx_clients_plan_status ON clients(plan_status);

CREATE INDEX idx_landing_pages_client_id ON landing_pages(client_id);
CREATE INDEX idx_landing_pages_moderation_status ON landing_pages(moderation_status);

CREATE INDEX idx_social_posts_client_id ON social_posts(client_id);
CREATE INDEX idx_social_posts_scheduled_date ON social_posts(scheduled_date);
CREATE INDEX idx_social_posts_batch_month ON social_posts(batch_month);
CREATE INDEX idx_social_posts_moderation_status ON social_posts(moderation_status);
CREATE INDEX idx_social_posts_email_sent_at ON social_posts(email_sent_at);

CREATE INDEX idx_generation_log_client_id ON generation_log(client_id);
CREATE INDEX idx_generation_log_job_type ON generation_log(job_type);

-- ─────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('social', 'social', true),
  ('landing-pages', 'landing-pages', true),
  ('podcasts', 'podcasts', true);

-- Storage RLS policies
CREATE POLICY "Public access to social images" ON storage.objects FOR SELECT USING (bucket_id = 'social');
CREATE POLICY "Public access to landing page images" ON storage.objects FOR SELECT USING (bucket_id = 'landing-pages');
CREATE POLICY "Public access to podcast covers" ON storage.objects FOR SELECT USING (bucket_id = 'podcasts');
