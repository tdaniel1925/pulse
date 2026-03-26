# PulseAgent Store Contracts

**Version:** 1.0
**Created:** March 25, 2026
**Purpose:** Define what each service/store exposes

> **CodeBakers V5 Phase 2**
> This document defines the public interface of every service and data store.
> Use this to understand what each component provides and requires.

---

## Overview

PulseAgent uses:
- **Supabase** as the primary database (PostgreSQL + RLS)
- **Service modules** for external APIs (Claude, DALL-E, Square, etc.)
- **Inngest** for background job orchestration
- **Next.js API routes** for client-facing endpoints

---

## 1. Database Contracts (Supabase)

### `clients` Table

**Purpose:** Store client business profiles and settings

**Public Interface:**
```typescript
interface Client {
  // Identity
  id: string;                    // UUID primary key
  user_id: string;               // Supabase Auth user ID

  // Business Profile
  business_name: string;
  rep_code: string | null;       // Unique referral code
  referred_by: string | null;
  industry: string;              // insurance | legal | chiro | accounting | ...
  niche: string | null;
  target_customer: string | null;
  location_city: string | null;
  location_state: string | null;
  timezone: string;              // IANA timezone (default: America/Chicago)
  core_offer: string | null;
  differentiator: string | null;
  brand_voice: string;           // professional | friendly | bold | calm | witty
  primary_goal: string;          // leads | appointments | awareness | sales

  // Branding
  logo_url: string | null;
  brand_primary: string | null;  // Hex color
  brand_secondary: string | null;

  // Contact
  phone: string | null;
  website: string | null;
  calendly_url: string | null;

  // Apex Integration
  apex_rep_id: string | null;
  apex_rank: string | null;
  apex_affiliate_link: string | null;

  // Platform Config
  selected_platforms: string[];  // ['linkedin', 'facebook', ...]
  post_approval_mode: string;    // email | auto | dashboard
  podcast_cadence: string;       // daily | 3x | weekly | biweekly
  podcast_format: string;        // solo | interview | mixed
  podcast_voice_id: string | null;

  // Billing (Square)
  square_customer_id: string | null;
  square_subscription_id: string | null;
  square_setup_fee_payment_id: string | null;
  setup_fee_paid: boolean;
  plan: string;                  // starter | growth | pro | authority
  plan_status: string;           // trialing | active | past_due | cancelled
  trial_ends_at: Date;

  // Email Preferences
  email_preferences: {
    daily_posts: boolean;
    monthly_report: boolean;
    product_updates: boolean;
  };
  unsubscribed_at: Date | null;

  // State
  onboarding_complete: boolean;
  provisioning_complete: boolean;
  content_generated_at: Date | null;

  // Moderation
  moderation_required: boolean;  // true for first 30 days
  moderation_exempt_at: Date;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}
```

**Read Operations:**
- `getClientByUserId(user_id)` - Load current user's client
- `getClientById(id)` - Load by client ID
- `getClientByRepCode(rep_code)` - Load by referral code
- `getClientsInTimezone(timezone)` - For daily email cron
- `getClientsPastDue()` - For billing alerts

**Write Operations:**
- `createClient(data)` - New signup/Apex provision
- `updateClientProfile(id, data)` - Settings updates
- `updateEmailPreferences(id, preferences)` - Unsubscribe management
- `updateBillingStatus(id, status)` - Square webhook updates

**Dependencies:**
- Reads: None (root entity)
- Writes to: All other tables (via client_id foreign key)

---

### `landing_pages` Table

**Purpose:** Store AI-generated landing pages

**Public Interface:**
```typescript
interface LandingPage {
  id: string;
  client_id: string;             // FK to clients

  // Config
  page_type: string;             // main | service | audience | campaign | location
  target_keyword: string | null;
  target_audience: string | null;
  unique_offer: string | null;
  slug: string;

  // Generated Content
  headline: string | null;
  subheadline: string | null;
  body_copy: {
    benefits: string[];
    faq: Array<{ q: string; a: string }>;
    social_proof: string;
    sections: Array<{ title: string; content: string }>;
  } | null;
  cta_primary: string | null;
  cta_secondary: string | null;
  seo_title: string | null;
  seo_description: string | null;

  // Assets
  hero_image_url: string | null;
  og_image_url: string | null;
  template_id: string | null;

  // State
  published: boolean;
  published_url: string | null;
  is_primary: boolean;

  // Moderation
  moderation_status: string;     // pending | approved | flagged | rejected
  moderation_flags: any | null;
  moderation_score: number | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;

  created_at: Date;
}
```

**Read Operations:**
- `getLandingPagesByClient(client_id)` - Dashboard listing
- `getLandingPageById(id)` - Single page view
- `getPublishedPages(client_id)` - Count for plan limits
- `getPendingModeration()` - Admin review queue

**Write Operations:**
- `createLandingPage(client_id, data)` - New page generation
- `updateLandingPage(id, data)` - Edit content
- `publishLandingPage(id, url)` - Publish action
- `updateModerationStatus(id, status)` - Admin review

**Dependencies:**
- Reads: clients (for profile context)
- Writes: None
- Storage: hero_image_url, og_image_url in Supabase Storage

---

### `social_posts` Table

**Purpose:** Store 30-day social media content batches

**Public Interface:**
```typescript
interface SocialPost {
  id: string;
  client_id: string;

  // Content
  platform: string;              // linkedin | instagram | facebook | twitter | google_business
  post_copy: string;
  hashtags: string | null;
  image_prompt: string | null;

  // Images (platform-specific sizes)
  image_url_raw: string | null;
  image_url_fb: string | null;   // 1200×630
  image_url_ig: string | null;   // 1080×1080
  image_url_li: string | null;   // 1200×627
  image_url_tw: string | null;   // 1600×900
  image_url_yt: string | null;   // 1280×720

  // Share URLs
  share_url_facebook: string | null;
  share_url_linkedin: string | null;
  share_url_twitter: string | null;
  relay_page_url: string | null;

  // Scheduling
  scheduled_date: Date;
  scheduled_time: string;        // HH:MM format
  email_sent_at: Date | null;
  batch_month: string;           // YYYY-MM

  // State
  status: string;                // ready | emailed | posted | skipped
  topics: string[];              // For deduplication

  // Moderation
  moderation_status: string;     // pending | approved | flagged | rejected
  moderation_flags: any | null;
  moderation_score: number | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;

  created_at: Date;
}
```

**Read Operations:**
- `getSocialPostsByClient(client_id, month)` - Dashboard calendar
- `getTodaysPosts(client_id, date)` - Daily email
- `getPostsForModeration()` - Admin review queue
- `getOldPosts(days_ago)` - Cleanup job
- `getTopicsForDedup(client_id)` - Monthly generation

**Write Operations:**
- `createSocialPosts(client_id, posts[])` - Monthly batch insert
- `updateEmailSent(post_id)` - Mark as sent
- `skipPost(post_id)` - User skips today's post
- `updateModerationStatus(id, status)` - Admin review
- `deleteOldImages(post_id)` - Cleanup job

**Dependencies:**
- Reads: clients (for profile, timezone, email preferences)
- Writes: None
- Storage: Multiple image URLs in Supabase Storage

---

### `podcast_episodes` Table

**Purpose:** Store podcast scripts and metadata (Pro+ only)

**Public Interface:**
```typescript
interface PodcastEpisode {
  id: string;
  client_id: string;

  episode_number: number;
  title: string | null;
  description: string | null;
  show_notes: string | null;
  intro_script: string | null;
  full_script: string | null;
  outro_script: string | null;
  outline: Array<{
    timestamp: string;
    segment: string;
    duration: number;
    script: string;
  }> | null;
  topics_covered: string[];
  keywords: string[];

  audio_url: string | null;
  cover_art_url: string | null;

  status: string;                // draft | approved | published
  published_at: Date | null;

  // Moderation
  moderation_status: string;
  moderation_flags: any | null;
  moderation_score: number | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;

  created_at: Date;
}
```

**Read Operations:**
- `getPodcastEpisodesByClient(client_id)` - Dashboard listing
- `getLatestEpisodes(client_id, limit)` - For deduplication
- `getDraftEpisodes()` - Pending approval

**Write Operations:**
- `createPodcastEpisode(client_id, data)` - Generate new episode
- `updateEpisodeStatus(id, status)` - Approve/publish
- `deleteOldDraftCovers(days_ago)` - Cleanup job

**Dependencies:**
- Reads: clients (for podcast settings)
- Writes: None
- Storage: audio_url, cover_art_url

---

### `prompt_templates` Table

**Purpose:** Store AI prompts (admin-managed, versioned)

**Public Interface:**
```typescript
interface PromptTemplate {
  id: string;
  template_key: string;          // Unique: 'landing_page_insurance'
  category: string;              // landing_page | social | podcast | youtube | image
  industry: string | null;       // null = all industries
  platform: string | null;       // null = not platform-specific
  system_prompt: string;
  user_prompt: string;           // Uses {{variable}} syntax
  output_schema: any | null;     // Expected JSON shape
  design_direction: any | null;  // For image generation
  version: number;
  active: boolean;
  created_at: Date;
}
```

**Read Operations:**
- `getPromptTemplate(category, industry?, platform?)` - Load for generation
- `getAllTemplates()` - Admin management

**Write Operations:**
- `createPromptTemplate(data)` - Admin creates new
- `updatePromptTemplate(id, data)` - Admin edits
- `deactivateOldVersion(template_key)` - Versioning

**Dependencies:**
- Reads: None (referenced by generation jobs)
- Writes: None

---

## 2. Service Contracts

### `lib/services/claude.ts` - AI Content Generation

**Purpose:** Generate landing page copy, social posts, podcast scripts

**Public Interface:**
```typescript
// Landing page content
export async function generateLandingPageContent(params: {
  businessName: string;
  industry: string;
  coreOffer: string;
  targetCustomer: string;
  differentiator: string;
  brandVoice: string;
  targetKeyword?: string;
}): Promise<{
  headline: string;
  subheadline: string;
  bodyCopy: {
    benefits: string[];
    faq: Array<{ q: string; a: string }>;
    socialProof: string;
    sections: Array<{ title: string; content: string }>;
  };
  ctaPrimary: string;
  ctaSecondary: string;
  seoTitle: string;
  seoDescription: string;
  heroImagePrompt: string;
}>;

// Social posts
export async function generateSocialPosts(params: {
  businessName: string;
  industry: string;
  platform: string;
  count: number;
  excludeTopics: string[];
  brandVoice: string;
}): Promise<Array<{
  postCopy: string;
  hashtags: string;
  imagePrompt: string;
  topics: string[];
}>>;

// Podcast episode
export async function generatePodcastEpisode(params: {
  businessName: string;
  industry: string;
  episodeNumber: number;
  excludeTopics: string[];
  format: string;
}): Promise<{
  title: string;
  description: string;
  showNotes: string;
  introScript: string;
  segments: Array<{ timestamp: string; segment: string; duration: number; script: string }>;
  outroScript: string;
  topicsCovered: string[];
  keywords: string[];
}>;
```

**Dependencies:**
- Requires: `ANTHROPIC_API_KEY`
- Model: `claude-sonnet-4-20250514`
- Returns: Structured JSON (validated with Zod)

---

### `lib/services/dalle.ts` - Hero Image Generation

**Purpose:** Generate landing page hero images

**Public Interface:**
```typescript
export async function generateHeroImage(
  prompt: string,
  size: '1792x1024' | '1024x1024' = '1792x1024'
): Promise<string>;  // Returns image URL

export async function downloadAndUploadImage(
  imageUrl: string,
  storagePath: string
): Promise<string>;  // Returns Supabase Storage URL
```

**Dependencies:**
- Requires: `OPENAI_API_KEY`
- Model: `dall-e-3`
- Output: High-quality image URL (temporary, expires in 1 hour)

---

### `lib/services/ideogram.ts` - Social Image Generation

**Purpose:** Generate social post graphics with text overlay

**Public Interface:**
```typescript
export async function generateSocialImage(
  prompt: string,
  platform: string
): Promise<string>;  // Returns raw image URL (2048×2048 typically)
```

**Dependencies:**
- Requires: `IDEOGRAM_API_KEY`
- Output: High-res image (needs resizing)

---

### `lib/services/sharp-resize.ts` - Image Processing

**Purpose:** Resize images to exact platform dimensions

**Public Interface:**
```typescript
export async function resizeForPlatforms(
  sourceUrl: string,
  platforms: string[],
  outputPrefix: string
): Promise<{
  fb?: string;   // 1200×630
  ig?: string;   // 1080×1080
  li?: string;   // 1200×627
  tw?: string;   // 1600×900
  yt?: string;   // 1280×720
}>;

export async function resizeForOG(
  sourceUrl: string,
  outputPath: string
): Promise<string>;  // 1200×630 OG image
```

**Dependencies:**
- Requires: `sharp` package
- Input: Image URL or buffer
- Output: Supabase Storage URLs

---

### `lib/services/moderation.ts` - Content Moderation

**Purpose:** Check content for policy violations

**Public Interface:**
```typescript
export async function moderateText(
  text: string
): Promise<{
  flagged: boolean;
  categories: {
    sexual: boolean;
    hate: boolean;
    violence: boolean;
    selfHarm: boolean;
    harassment: boolean;
  };
  categoryScores: {
    sexual: number;
    hate: number;
    violence: number;
    selfHarm: number;
    harassment: number;
  };
}>;

export function determineModerationStatus(
  moderation: ModerationResult,
  clientModerationRequired: boolean
): 'approved' | 'pending' | 'flagged';
```

**Dependencies:**
- Requires: `OPENAI_API_KEY`
- API: OpenAI Moderation API
- Thresholds: Configurable per client age

---

### `lib/services/square.ts` - Payment Processing

**Purpose:** Handle Square Payments API

**Public Interface:**
```typescript
export async function createCustomer(params: {
  email: string;
  givenName: string;
  familyName?: string;
}): Promise<{ customerId: string }>;

export async function createSubscription(params: {
  customerId: string;
  planId: string;
  locationId: string;
}): Promise<{ subscriptionId: string }>;

export async function updateSubscription(
  subscriptionId: string,
  newPlanId: string
): Promise<void>;

export async function cancelSubscription(
  subscriptionId: string
): Promise<void>;

export async function verifyWebhookSignature(
  body: string,
  signature: string
): boolean;
```

**Dependencies:**
- Requires: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`
- SDK: `square` npm package
- Environment: production or sandbox

---

### `lib/services/resend.ts` - Email Delivery

**Purpose:** Send transactional and marketing emails

**Public Interface:**
```typescript
export async function sendDailyPostEmail(params: {
  to: string;
  clientName: string;
  posts: SocialPost[];
  unsubscribeToken: string;
}): Promise<void>;

export async function sendWelcomeEmail(params: {
  to: string;
  clientName: string;
  dashboardUrl: string;
  referralLink: string;
}): Promise<void>;

export async function sendMonthlyReport(params: {
  to: string;
  clientName: string;
  stats: MonthlyStats;
}): Promise<void>;
```

**Dependencies:**
- Requires: `RESEND_API_KEY`
- From: `noreply@pulseagent.ai`
- Templates: React Email components

---

## 3. Inngest Job Contracts

### `lib/inngest/apex-provision.ts`

**Purpose:** Provision new Apex rep clients

**Trigger:** `apex/rep.provision` event

**Input:**
```typescript
{
  client_id: string;
}
```

**Steps:**
1. Validate setup fee paid
2. Generate 30 social posts per platform
3. Generate welcome landing page
4. Send welcome email
5. Mark provisioning complete

**Output:** Updates `clients.provisioning_complete = true`

---

### `lib/inngest/monthly-generation.ts`

**Purpose:** Generate monthly social content

**Trigger:** Cron - 1st of month, 6am client timezone

**Input:** Runs for all active clients

**Steps:**
1. Load client profile
2. Dedup last 60 days topics
3. Generate posts (count based on plan)
4. Generate images
5. Moderate content
6. Save to database

**Output:** Creates 30-150 `social_posts` records per platform

---

### `lib/inngest/daily-email.ts`

**Purpose:** Send daily 8am emails

**Trigger:** Cron - Every hour at :00

**Steps:**
1. Calculate which clients are at 8am now
2. Get today's approved posts
3. Build and send email
4. Mark posts as sent

**Output:** Updates `social_posts.email_sent_at`

---

### `lib/inngest/cleanup-old-images.ts`

**Purpose:** Delete old images from storage

**Trigger:** Cron - Weekly (Sunday 3am UTC)

**Steps:**
1. Find social posts > 90 days old
2. Delete images from Supabase Storage
3. NULL out image URLs
4. Delete unpublished drafts > 30 days

**Output:** Frees storage space

---

## 4. API Route Contracts

### `POST /api/generate/page`

**Purpose:** Generate new landing page

**Auth:** Required (Supabase session)

**Input:**
```typescript
{
  page_type: string;
  target_keyword?: string;
  target_audience?: string;
  unique_offer?: string;
}
```

**Output:**
```typescript
{
  page_id: string;
  preview_url: string;
}
```

**Side Effects:**
- Creates `landing_pages` record
- Uploads 2 images to Storage
- Creates `generation_log` entry

---

### `POST /api/webhooks/square`

**Purpose:** Handle Square payment webhooks

**Auth:** Signature verification

**Events:**
- `payment.created`
- `subscription.created`
- `subscription.updated`
- `invoice.payment_made`
- `invoice.payment_failed`

**Side Effects:**
- Updates `clients` billing fields
- Triggers Inngest provisioning
- Sends notification emails

---

### `POST /api/webhooks/apex`

**Purpose:** Handle Apex rep provisioning

**Auth:** Shared secret header

**Input:**
```typescript
{
  event: 'rep.created';
  rep_id: string;
  rep_code: string;
  name: string;
  email: string;
  rank: string;
}
```

**Side Effects:**
- Creates `clients` record
- Creates Supabase Auth user
- Triggers provisioning job

---

### `POST /api/email/preferences`

**Purpose:** Update email preferences

**Auth:** JWT token (from unsubscribe link)

**Input:**
```typescript
{
  token: string;  // JWT
  preferences: {
    daily_posts: boolean;
    monthly_report: boolean;
    product_updates: boolean;
  };
}
```

**Output:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Side Effects:**
- Updates `clients.email_preferences`

---

## 5. Storage Contracts

### Supabase Storage Buckets

**`social` bucket:**
```
/social/{client_id}/{year}/{month}/
  ├── raw/{post_id}.jpg        # Original Ideogram output
  ├── fb/{post_id}.jpg         # 1200×630
  ├── ig/{post_id}.jpg         # 1080×1080
  ├── li/{post_id}.jpg         # 1200×627
  ├── tw/{post_id}.jpg         # 1600×900
  └── yt/{post_id}.jpg         # 1280×720
```

**`landing-pages` bucket:**
```
/landing-pages/{client_id}/{page_id}/
  ├── hero.jpg                 # 1792×1024
  └── og.jpg                   # 1200×630
```

**`podcasts` bucket:**
```
/podcasts/{client_id}/episodes/{episode_id}/
  ├── cover.jpg                # 3000×3000
  └── audio.mp3                # ElevenLabs output
```

---

## Summary: Service Architecture

```
┌─────────────────────────────────────────────┐
│           Client (Browser/Email)            │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────▼─────────┐
        │   Next.js App     │
        │   (API Routes)    │
        └─────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌───▼────┐
│Claude │   │ DALL-E  │   │Square  │
│  API  │   │   API   │   │  API   │
└───────┘   └─────────┘   └────────┘
                  │
        ┌─────────▼─────────┐
        │   Supabase DB     │
        │   + Storage       │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │  Inngest Jobs     │
        │  (Background)     │
        └───────────────────┘
```

**Data Flows:**
1. User action → API route → Service → Database → Inngest (if needed)
2. Cron → Inngest → Service → Database → Email
3. Webhook → API route → Database → Inngest

**Key Principles:**
- All external API calls go through service modules
- All database access uses Supabase client (RLS enforced)
- All background work goes through Inngest (retry + observability)
- All file storage goes to Supabase Storage (unified management)

---

*PulseAgent Store Contracts - Complete*
*Created March 25, 2026 - CodeBakers V5 Phase 2*
