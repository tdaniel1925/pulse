# PulseAgent — PROJECT-SPEC.md
> **CodeBakers V5 Format** · MCP-Enforced · BotMakers Inc.
> Version: 2.0 · March 2026
> Owner: Daniel / BotMakers Inc.
> Repo: github.com/botmakers-ai/pulseagent

---

## CLAUDE.md HOOK

```markdown
# 🚀 PulseAgent — AI-Powered Done-For-You Digital Presence Platform

**CodeBakers V5 — MCP-Enforced Development**

## ⚠️ MANDATORY SESSION START PROTOCOL

**EVERY session, BEFORE responding to user:**

1. **MUST call MCP tool:**
   ```
   codebakers_get_context
   ```
   This detects:
   - Current phase (0-6)
   - Project state (new/existing/mid-build)
   - Blockers
   - Next steps

2. **IF project exists, MUST call:**
   ```
   codebakers_init_session
   ```
   Loads BUILD-STATE.md for session resume.

3. **Respond based on context:**
   - New project → Guide through Phase 0
   - Blockers → Offer solutions
   - Suggestions → Present them proactively
   - Mid-build → Resume from exact point

**DO NOT skip step 1. Context detection is MANDATORY.**

---

## 🛡️ ENFORCEMENT RULES

**Before building ANY feature:**
1. ✅ MUST call: `codebakers_check_scope(feature_description)`
   - Verifies feature is in PROJECT-SPEC.md
   - Blocks if out of scope

2. ✅ MUST call: `codebakers_enforce_feature(feature_name)`
   - Enforces FULL atomic unit protocol
   - Ensures: migration → API → store → UI → tests
   - Blocks if dependencies missing

**Before advancing to next phase:**
- ✅ MUST call: `codebakers_check_gate(current_phase)`
- Verifies all gate criteria met
- Blocks if verification fails

**The MCP tools WILL BLOCK you if you violate protocol.**

---

## 📋 TECH STACK (Non-Negotiable)

- **Stack:** Supabase + Next.js 14 + Vercel only
- **Auth:** Supabase Auth (no NextAuth, no OAuth libs)
- **Versions:** `pnpm add --save-exact` (no ^ or ~)
- **Queries:** `.maybeSingle()` always (`.single()` banned)
- **Mutations:** Filter by BOTH `id` AND `user_id`
- **TypeScript:** strict mode always
- **Zod First:** Define schemas, derive types with `z.infer`

---

**This is CodeBakers V5. The tools enforce. You execute.**
```

---

## PRODUCT OVERVIEW

PulseAgent is a fully automated done-for-you digital presence platform built by BotMakers Inc. and distributed through the Apex Affinity Group rep network.

A client or Apex rep signs up, fills in their business profile one time, and ContentOS:
- Generates their landing pages with AI copy + AI images
- Writes 30 days of platform-specific social posts with correctly sized images
- Sends a daily 8am email with that day's post + one-tap share buttons to FB, LinkedIn, X
- Generates podcast scripts, YouTube content calendar, email sequences
- Auto-provisions everything when an Apex rep signs up via webhook

Zero OAuth. Zero platform approvals. Zero client effort after onboarding.

### Distribution Channels
- **Primary:** Apex Affinity Group webhook — auto-provision on rep signup, reps get referral link (pulseagent.ai/signup?ref=repcode)
- **Secondary:** Direct signup at pulseagent.ai
- **Tertiary:** BotMakers rep sales with custom referral codes

### Pricing
| Plan | Price | Setup Fee | Hosting |
|------|-------|-----------|---------|
| Starter | $79/mo | $297 one-time | $10/mo |
| Growth | $129/mo | $497 one-time | $10/mo |
| Pro | $299/mo | $697 one-time | $10/mo |
| Authority | $499/mo | $997 one-time | $10/mo |

---

## TECH STACK

| Layer | Service | Purpose |
|-------|---------|---------|
| Frontend | Next.js 14 App Router + TypeScript | Dashboard + marketing site + relay pages |
| Database | Supabase PostgreSQL | All data, auth, file storage |
| Background Jobs | Inngest | All cron jobs + event-driven automation |
| Payments | Square | Subscriptions + one-time setup fees via Square Subscriptions API |
| AI Copy | Anthropic Claude API (claude-sonnet-4-20250514) | All content generation |
| AI Images (hero) | OpenAI DALL-E 3 | Landing page hero images |
| AI Images (social) | Ideogram API | Social post graphics with text overlay |
| Content Moderation | OpenAI Moderation API | Auto-flag inappropriate content |
| Image Resizing | Sharp.js | Resize to exact platform dimensions |
| Email | Resend | Daily share emails + transactional |
| Hosting | Vercel | Frontend + API routes + relay pages |
| DNS/CDN | Cloudflare | Custom domains + SSL |
| Styling | Tailwind CSS | All UI |
| ORM | N/A — Supabase client direct | Keep it simple |

### Image Size Targets (Sharp.js outputs per post)
| Platform | Dimensions | Format |
|----------|-----------|--------|
| Facebook feed | 1200×630 | JPG |
| Instagram square | 1080×1080 | JPG |
| Instagram story | 1080×1920 | JPG |
| LinkedIn | 1200×627 | JPG |
| Twitter/X | 1600×900 | JPG |
| YouTube thumbnail | 1280×720 | JPG |
| Podcast cover | 3000×3000 | JPG |

---

## FILE STRUCTURE

```
pulseagent/
├── .codebakers/
│   ├── BRAIN.md              ← Session state + decisions
│   ├── BUILD-LOG.md          ← Every completed task logged
│   └── ERROR-LOG.md          ← Every error + resolution
├── .claude/
│   └── settings.json
├── PROJECT-SPEC.md           ← This file
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── pages/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── social/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── podcast/page.tsx
│   │   ├── youtube/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   └── billing/page.tsx
│   │   └── admin/                ← Admin-only routes (BotMakers team)
│   │       └── moderation/
│   │           └── page.tsx      ← Review queue for flagged content
│   ├── (marketing)/
│   │   ├── page.tsx          ← Marketing homepage
│   │   ├── pricing/page.tsx
│   │   └── signup/page.tsx   ← Signup with ?ref= tracking
│   ├── unsubscribe/
│   │   └── page.tsx          ← Email preference management (CAN-SPAM compliance)
│   ├── p/
│   │   └── [postId]/page.tsx  ← Social share relay pages (OG tags: pulseagent.ai/p/[id])
│   └── api/
│       ├── webhooks/
│       │   ├── square/route.ts        ← Square webhook handler
│       │   └── apex/route.ts          ← Apex AgentPulse webhook
│       ├── generate/
│       │   ├── page/route.ts
│       │   ├── social/route.ts
│       │   ├── podcast/route.ts
│       │   └── youtube/route.ts
│       ├── email/
│       │   └── preferences/route.ts  ← Update email preferences
│       ├── posts/
│       │   └── [id]/skip/route.ts    ← Skip today's post
│       └── inngest/route.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── generators/
│   │   ├── landing-page.ts
│   │   ├── social.ts
│   │   ├── podcast.ts
│   │   └── youtube.ts
│   ├── services/
│   │   ├── dalle.ts
│   │   ├── ideogram.ts
│   │   ├── sharp-resize.ts
│   │   ├── resend.ts
│   │   ├── square.ts                ← Square Payments API wrapper
│   │   └── moderation.ts            ← OpenAI Moderation API wrapper
│   ├── inngest/
│   │   ├── client.ts
│   │   ├── daily-email.ts
│   │   ├── monthly-generation.ts
│   │   ├── apex-provision.ts
│   │   └── cleanup-old-images.ts      ← Storage cost optimization
│   ├── prompts/
│   │   ├── landing-page.ts
│   │   ├── platforms/
│   │   │   ├── linkedin.ts
│   │   │   ├── instagram.ts
│   │   │   ├── facebook.ts
│   │   │   ├── twitter.ts
│   │   │   └── google-business.ts
│   │   └── industries/
│   │       ├── insurance.ts
│   │       ├── legal.ts
│   │       ├── chiropractic.ts
│   │       ├── accounting.ts
│   │       ├── real-estate.ts
│   │       └── fitness.ts
│   └── templates/
│       └── email/
│           ├── daily-post.tsx
│           ├── welcome.tsx
│           └── monthly-report.tsx
├── components/
│   ├── ui/                   ← Reusable UI primitives
│   ├── dashboard/            ← Dashboard-specific components
│   ├── landing/              ← Marketing page sections
│   └── email/                ← Resend email components
├── inngest.config.ts
└── middleware.ts
```

---

## DATABASE SCHEMA

```sql
-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
CREATE TABLE clients (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users ON DELETE CASCADE,

  -- Business profile
  business_name         text NOT NULL,
  rep_code              text UNIQUE,           -- Apex rep code → used in referral link (?ref=repcode)
  referred_by           text,                  -- rep_code of referring rep (if signed up via referral)
  industry              text NOT NULL,         -- insurance | legal | chiro | accounting | realestate | fitness | restaurant | other
  niche                 text,
  target_customer       text,
  location_city         text,
  location_state        text,
  timezone              text DEFAULT 'America/Chicago', -- IANA timezone (auto-detected from location_state)
  core_offer            text,
  differentiator        text,
  brand_voice           text DEFAULT 'professional', -- professional | friendly | bold | calm | witty
  primary_goal          text DEFAULT 'leads',  -- leads | appointments | awareness | sales
  logo_url              text,
  brand_primary         text,                  -- hex color
  brand_secondary       text,                  -- hex color
  phone                 text,
  website               text,
  calendly_url          text,

  -- Apex integration
  apex_rep_id           text,
  apex_rank             text,
  apex_affiliate_link   text,

  -- Platform config
  selected_platforms    text[] DEFAULT '{}',   -- ['linkedin','facebook','instagram','twitter','google_business']
  post_approval_mode    text DEFAULT 'email',  -- email | auto | dashboard
  podcast_cadence       text DEFAULT 'weekly', -- daily | 3x | weekly | biweekly
  podcast_format        text DEFAULT 'solo',   -- solo | interview | mixed
  podcast_voice_id      text,                  -- ElevenLabs voice ID

  -- Billing (Square Payments)
  square_customer_id    text,                  -- Square Customer ID
  square_subscription_id text,                 -- Square Subscription ID
  square_setup_fee_payment_id text,            -- Square Payment ID for setup fee
  setup_fee_paid        bool DEFAULT false,
  plan                  text DEFAULT 'starter', -- starter | growth | pro | authority
  plan_status           text DEFAULT 'trialing', -- trialing | active | past_due | cancelled
  trial_ends_at         timestamptz DEFAULT now() + interval '14 days',

  -- Email preferences (CAN-SPAM compliance)
  email_preferences     jsonb DEFAULT '{"daily_posts": true, "monthly_report": true, "product_updates": true}'::jsonb,
  unsubscribed_at       timestamptz,

  -- State
  onboarding_complete   bool DEFAULT false,
  provisioning_complete bool DEFAULT false,
  content_generated_at  timestamptz,

  -- Moderation (first 30 days require manual review)
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
  page_type         text NOT NULL,  -- main | service | audience | campaign | location
  target_keyword    text,
  target_audience   text,
  unique_offer      text,
  slug              text NOT NULL,  -- used in client's custom landing pages

  -- Generated content
  headline          text,
  subheadline       text,
  body_copy         jsonb,          -- { benefits[], faq[], social_proof, sections[] }
  cta_primary       text,
  cta_secondary     text,
  seo_title         text,
  seo_description   text,

  -- Assets (unpublished drafts auto-deleted after 30 days by cleanup job)
  hero_image_url    text,           -- Supabase Storage URL
  og_image_url      text,           -- 1200×630 for social sharing
  template_id       text,           -- which Envato template used

  -- State
  published         bool DEFAULT false,
  published_url     text,
  is_primary        bool DEFAULT false,  -- the main rep/client page

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
  platform          text NOT NULL,  -- linkedin | instagram | facebook | twitter | google_business
  post_copy         text NOT NULL,
  hashtags          text,
  image_prompt      text,           -- prompt used to generate image

  -- Images (one per platform size) — AUTO-DELETED after 90 days by storage/cleanup-old-images job
  image_url_raw     text,           -- original Ideogram output
  image_url_fb      text,           -- 1200×630
  image_url_ig      text,           -- 1080×1080
  image_url_li      text,           -- 1200×627
  image_url_tw      text,           -- 1600×900
  image_url_yt      text,           -- 1280×720 (if YouTube short)

  -- Share URLs (pre-built, no OAuth needed)
  share_url_facebook  text,         -- facebook.com/sharer?...
  share_url_linkedin  text,         -- linkedin.com/sharing?...
  share_url_twitter   text,         -- twitter.com/intent/tweet?...
  relay_page_url      text,         -- pulseagent.ai/p/[id]

  -- Scheduling
  scheduled_date    date,
  scheduled_time    time DEFAULT '09:00',
  email_sent_at     timestamptz,
  batch_month       text,           -- '2026-04' — which generation batch

  -- State
  status            text DEFAULT 'ready', -- ready | emailed | posted | skipped
  topics            text[],              -- for dedup on next generation

  -- Moderation (OpenAI Moderation API + manual review)
  moderation_status text DEFAULT 'pending', -- pending | approved | flagged | rejected
  moderation_flags  jsonb,                  -- OpenAI moderation categories flagged
  moderation_score  float,                  -- 0.0-1.0 confidence score
  reviewed_by       text,                   -- admin user who reviewed (if manual)
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
  outline               jsonb,       -- [{ timestamp, segment, duration, script }]
  topics_covered        text[],      -- for dedup
  keywords              text[],

  audio_url             text,        -- ElevenLabs output in Supabase Storage
  cover_art_url         text,        -- 3000×3000 (draft cover art auto-deleted after 60 days)

  status                text DEFAULT 'draft', -- generating | draft | approved | published
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

  content_type      text NOT NULL,   -- channel_setup | video | short
  video_number      int,
  title             text,
  description       text,
  thumbnail_concept text,
  script_outline    text,
  keywords          text[],
  tags              text[],
  thumbnail_url     text,            -- 1280×720

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
-- PROMPT TEMPLATES (editable per industry/platform)
-- ─────────────────────────────────────────
CREATE TABLE prompt_templates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key      text UNIQUE NOT NULL, -- 'landing_page_insurance', 'social_linkedin', etc
  category          text NOT NULL,        -- landing_page | social | podcast | youtube | image
  industry          text,                 -- null = applies to all industries
  platform          text,                 -- null = not platform-specific
  system_prompt     text NOT NULL,
  user_prompt       text NOT NULL,        -- uses {{variable}} syntax
  output_schema     jsonb,               -- expected JSON shape
  design_direction  jsonb,               -- font, colors, aesthetic for image gen
  version           int DEFAULT 1,
  active            bool DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────
-- PROVISION LOG (Apex webhook + setup tracking)
-- ─────────────────────────────────────────
CREATE TABLE provision_log (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid REFERENCES clients ON DELETE CASCADE,
  source            text NOT NULL,    -- apex_webhook | direct_signup | manual
  event_type        text NOT NULL,    -- rep.created | payment.setup_fee | content.generated
  payload           jsonb,
  status            text DEFAULT 'pending', -- pending | running | complete | failed
  error             text,
  started_at        timestamptz DEFAULT now(),
  completed_at      timestamptz
);

-- ─────────────────────────────────────────
-- GENERATION LOG (AI usage tracking)
-- ─────────────────────────────────────────
CREATE TABLE generation_log (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             uuid REFERENCES clients ON DELETE CASCADE,
  job_type              text NOT NULL,   -- monthly_social | new_page | podcast | youtube | daily_email
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
-- (use supabase admin client in all Inngest functions and admin operations)
```

---

## ENVIRONMENT VARIABLES

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Square Payments
SQUARE_ACCESS_TOKEN=                   # Square API access token
SQUARE_LOCATION_ID=                    # Square location ID for payments
SQUARE_WEBHOOK_SIGNATURE_KEY=          # Square webhook signature verification key
SQUARE_ENVIRONMENT=production          # production or sandbox

# Square Catalog IDs (created in Square Dashboard)
SQUARE_SETUP_FEE_STARTER_ID=          # $297 one-time
SQUARE_SETUP_FEE_GROWTH_ID=           # $497 one-time
SQUARE_SETUP_FEE_PRO_ID=              # $697 one-time
SQUARE_SETUP_FEE_AUTHORITY_ID=        # $997 one-time

# Square Subscription Plan IDs
SQUARE_SUB_STARTER_PLAN_ID=           # $79/mo subscription plan
SQUARE_SUB_GROWTH_PLAN_ID=            # $129/mo subscription plan
SQUARE_SUB_PRO_PLAN_ID=               # $299/mo subscription plan
SQUARE_SUB_AUTHORITY_PLAN_ID=         # $499/mo subscription plan
SQUARE_HOSTING_PLAN_ID=               # $10/mo hosting add-on

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=                        # DALL-E 3 + Moderation API
IDEOGRAM_API_KEY=                      # Social post images

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@pulseagent.ai
RESEND_FROM_NAME=PulseAgent

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# App
NEXT_PUBLIC_APP_URL=https://pulseagent.ai
APEX_WEBHOOK_SECRET=                   # shared secret for Apex webhook verification
JWT_SECRET=                            # for unsubscribe token generation (CAN-SPAM compliance)
```

---

## INNGEST JOB REGISTRY

### `apex/rep.provision`
**Trigger:** Apex webhook POST to `/api/webhooks/apex`
**What it does:**
1. Create `clients` record from Apex rep data (includes rep_code)
2. Create Supabase auth user, send magic link
3. Generate first 30 social posts for selected platforms
4. Generate all images, resize to all platform sizes
5. Create relay pages for each post
6. Build share URLs for each post
7. Send welcome email with:
   - Dashboard login link
   - Referral link: pulseagent.ai/signup?ref=[repcode]
   - First week post preview
8. Log to `provision_log`

**Error Handling & Retry Logic:**

Inngest configuration:
- Max retries: 3 per step
- Backoff: Exponential (1min, 5min, 15min)
- Timeout: 10min per step
- Each step is idempotent (checks if already complete before running)

Step-by-step behavior:
1. Each step updates `provision_log.status` and `provision_log.payload`
2. On failure: logs to `provision_log.error`, retries automatically
3. On final failure (after 3 retries): marks `provision_log.status = 'failed'`, sends admin Slack alert

Client communication:
- **Success (<60s)**: "Your site is ready!" email with site URL
- **Delayed (>5min)**: "Setup in progress..." email with estimated completion time
- **Failed (after retries)**: "Setup delayed, our team has been notified" email + manual admin intervention

Dashboard handling:
- Show provision progress bar if `clients.provisioning_complete = false`
- Display `provision_log.error` if present with "Contact support" CTA
- Admin dashboard: "Retry provision" button to re-fire Inngest event

---

### `social/monthly-generation`
**Trigger:** Cron — 1st of every month, 6am, per client timezone
**What it does:**
1. Pull client profile from Supabase
2. Pull last 60 days of topics from `social_posts` (dedup)
3. For each platform the client has selected:
   - Generate posts for the month (30/50/150 by plan)
   - **Moderate each post via OpenAI Moderation API**
   - Set moderation_status (approved/flagged/rejected based on scores + client age)
   - Generate image prompt per post
   - Call Ideogram API for each image
   - Resize via Sharp to all platform sizes
   - Upload all images to Supabase Storage
   - Build relay page URL + share URLs
   - Save all posts to `social_posts` with scheduled dates + moderation data
4. If client < 30 days old: Send admin notification of new content in review queue
5. Log to `generation_log`

---

### `social/daily-email`
**Trigger:** Cron — Every hour at :00, sends to clients currently at 8:00am in their timezone
**How timezone handling works:**
- Cron runs hourly (e.g., 13:00 UTC, 14:00 UTC, etc.)
- Each run checks: which clients are currently at 8:00am based on their `clients.timezone`?
- Only sends emails to clients at their local 8am
- `clients.timezone` auto-populated from `location_state` during onboarding

**What it does:**
1. Get current UTC time, calculate which timezones are at 8:00am right now
2. Pull clients in those timezones who:
   - Haven't received today's email yet
   - Have `email_preferences.daily_posts = true` (respect unsubscribe)
3. For each client: pull today's posts from `social_posts` (one per platform)
   - Only posts where `moderation_status = 'approved'`
   - Skip flagged/rejected posts automatically
4. Build daily email with:
   - Post copy (copyable text)
   - Inline image (platform-correct size)
   - Share to Facebook button (opens FB share dialog)
   - Share to LinkedIn button (opens LI share dialog)
   - Share to X button (opens X compose)
   - Skip today link
   - Unsubscribe link in footer (CAN-SPAM required)
5. Send via Resend
6. Update `social_posts.email_sent_at`

**Share URL Pattern:**
```javascript
// Facebook — opens share dialog (pulls copy from OG tags)
const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(relayPageUrl)}`

// LinkedIn
const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(relayPageUrl)}`

// X / Twitter
const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postCopy)}&url=${encodeURIComponent(relayPageUrl)}`

// Note: Instagram does not support web share URLs
// Users must manually post to Instagram or use mobile share sheet
```

**Unsubscribe Flow (CAN-SPAM Compliance):**
```javascript
// Generate secure unsubscribe token (JWT with client.id)
const unsubToken = jwt.sign({ clientId: client.id }, JWT_SECRET, { expiresIn: '90d' })

// Unsubscribe URL in email footer
const unsubUrl = `https://pulseagent.ai/unsubscribe?token=${unsubToken}`

// On unsubscribe page:
// - Decode JWT to get client.id
// - Show checkboxes: Daily posts, Monthly reports, Product updates
// - POST to /api/email/preferences with selections
// - Update clients.email_preferences jsonb field
// - Show confirmation: "Preferences updated"
```

**Email Preference Options:**
- `daily_posts`: Daily social post emails (default: true)
- `monthly_report`: Monthly performance reports (default: true)
- `product_updates`: New features and updates (default: true)

**Behavior:**
- Unsubscribe from daily posts → daily email cron skips them
- Unsubscribe from all → account/dashboard still active
- Re-subscribe anytime via dashboard settings or unsubscribe page

---

### `pages/generate`
**Trigger:** Event — client requests new landing page
**What it does:**
1. Check plan page limit (3/5/10/unlimited)
2. Pull industry prompt template from `prompt_templates`
3. Generate copy via Claude
4. Generate hero image via DALL-E 3 (1792×1024)
5. Resize to 1200×630 OG image via Sharp
6. Inject into HTML template
7. Deploy to Vercel route `contentos.ai/[repcode]/[slug]`
8. Save to `landing_pages`

---

### `podcast/generate-episode`
**Trigger:** Cron — per client's chosen podcast cadence (Pro+ only)
**What it does:**
1. Pull last 20 episode topics (dedup)
2. Generate full episode via Claude:
   - Title, description, show notes
   - Intro script, 3 segments, outro script
   - Social posts for this episode
3. Save to `podcast_episodes` as draft
4. If approval_mode = auto → mark approved
5. Log to `generation_log`

---

### `square/payment-completed`
**Trigger:** Square webhook — `payment.created` for setup fee
**What it does:**
1. Verify payment via Square Payments API
2. Mark `clients.setup_fee_paid = true`
3. Create Square subscription for monthly plan
4. Fire `apex/rep.provision` Inngest event
5. Send "Your setup is starting" email

**Square Webhook Events:**
- `payment.created` → Setup fee received
- `subscription.created` → Monthly subscription started
- `subscription.updated` → Plan change or payment method update
- `invoice.payment_made` → Monthly payment successful
- `invoice.payment_failed` → Payment failed (update plan_status to 'past_due')

---

### `storage/cleanup-old-images`
**Trigger:** Cron — Weekly (every Sunday at 3am UTC)
**Purpose:** Delete old images to control Supabase storage costs
**What it does:**
1. Find all `social_posts` where `created_at < 90 days ago`
2. For each old post:
   - Delete images from Supabase Storage:
     - `image_url_raw` (original Ideogram)
     - `image_url_fb`, `image_url_ig`, `image_url_li`, `image_url_tw`, `image_url_yt`
   - Keep the post record (for history/analytics)
   - Set image URLs to null in database
3. Find all `landing_pages` where `published = false` AND `created_at < 30 days ago`
   - Delete unpublished draft page images (hero + OG)
4. Find all `podcast_episodes` where `status = 'draft'` AND `created_at < 60 days ago`
   - Delete draft podcast cover art
5. Log cleanup stats to `generation_log`:
   - Images deleted count
   - Storage freed (GB)
   - Estimated cost savings

**Storage Retention Policy:**
- Social post images: 90 days
- Landing page drafts: 30 days
- Published landing pages: Keep forever (client may be using them)
- Podcast drafts: 60 days
- Approved podcasts: Keep forever

**Cost Impact:**
- Without cleanup: ~1GB/client/year
- With cleanup: ~0.25GB/client/year (75% reduction)
- At 500 clients: Saves ~$63/mo in storage costs

---

## CONTENT MODERATION SYSTEM

**Two-Layer Approach:** Auto-moderation (OpenAI) + Manual review (first 30 days)

### Layer 1: Auto-Moderation (OpenAI Moderation API)

**Applied to:** All generated content (social posts, landing pages, podcasts, YouTube)

**Process:**
1. Content generated by Claude
2. Before saving to database → send to OpenAI Moderation API
3. API returns:
   - `flagged`: boolean (true if any category triggered)
   - `categories`: object of categories and true/false (hate, sexual, violence, self-harm, etc.)
   - `category_scores`: confidence scores 0.0-1.0

4. Store results in `moderation_flags` and `moderation_score` fields
5. Set `moderation_status`:
   - If `flagged = false` AND client not new → `approved` (auto-approve)
   - If `flagged = true` OR client is new → `flagged` (requires manual review)
   - If score > 0.8 in any category → `rejected` (auto-reject, don't show to client)

**Implementation:**
```typescript
// lib/services/moderation.ts
export async function moderateContent(text: string) {
  const response = await openai.moderations.create({
    input: text
  })

  const result = response.results[0]

  return {
    flagged: result.flagged,
    categories: result.categories,
    scores: result.category_scores,
    status: determineStatus(result, clientAge)
  }
}
```

### Layer 2: Manual Review (First 30 Days)

**Who needs manual review:**
- All clients where `created_at < 30 days ago`
- Clients with `moderation_required = true`
- After 30 days: auto-set `moderation_required = false`

**Manual review queue:**
- Route: `/dashboard/admin/moderation`
- Shows all content where `moderation_status = 'flagged'`
- Filters:
  - New clients (< 30 days)
  - AI flagged content
  - High-risk categories (hate, sexual, violence)
- Actions per item:
  - Approve (set `moderation_status = 'approved'`, mark `reviewed_by`)
  - Reject (set to 'rejected', regenerate content automatically)
  - Edit (admin can fix minor issues, then approve)

**Daily email behavior:**
- Only sends posts where `moderation_status = 'approved'`
- Flagged posts skipped automatically
- Client sees "Content under review" in dashboard

**Graduation (after 30 days):**
```typescript
// Inngest cron: daily at 1am
// Find clients where created_at = 30 days ago exactly
// Set moderation_required = false
// Future content auto-approved (unless flagged by AI)
```

### Moderation Thresholds

**Auto-approve:**
- All moderation scores < 0.3
- Client older than 30 days
- No category flagged

**Flag for review:**
- Any score 0.3 - 0.8
- OR client < 30 days old

**Auto-reject:**
- Any score > 0.8
- Categories: hate, sexual/minors, violence/graphic

### Cost Impact

**OpenAI Moderation API:**
- Free tier: 100 requests/min, unlimited total
- Cost: $0.00 per request
- **No cost impact** ✅

**Manual review time:**
- Estimated: 2-3 min per flagged item
- Flag rate: ~5% of generated content
- 100 new clients/month × 30 posts × 5% = ~150 items/month
- Review time: ~7.5 hours/month
- **Can be handled by VA or part-time moderator**

---

### `moderation/graduate-clients`
**Trigger:** Cron — Daily at 1:00am UTC
**Purpose:** Auto-graduate clients from manual review after 30 days
**What it does:**
1. Find all clients where:
   - `moderation_required = true`
   - `created_at <= 30 days ago`
   - `moderation_exempt_at <= now()`
2. For each client:
   - Set `moderation_required = false`
   - Send congratulatory email: "Your content is now auto-approved!"
3. Auto-approve all pending content for graduated clients:
   - Find all their posts/pages/podcasts where `moderation_status = 'flagged'`
   - If AI moderation score was < 0.3 → change to `approved`
   - If score was 0.3-0.8 → keep flagged (still needs review, but lower priority)
4. Log graduation count to `generation_log`

**Graduation email:**
```
Subject: Welcome to Auto-Approved Status! 🎉

Hi {client_name},

Great news! After 30 days of quality content, your account has been upgraded to auto-approved status.

What this means:
✅ Your future content will publish immediately (no review delay)
✅ Our AI still checks for quality and safety
✅ You can focus on growing your business

Keep up the great work!

The PulseAgent Team
```

---

## GATE 0 — SCAFFOLD & INFRASTRUCTURE
**Exit criteria:** App boots, auth works, DB connected, Square connected, deploys to Vercel

### Tasks
- [ ] `npx create-next-app@latest pulseagent --typescript --tailwind --app`
- [ ] Install deps: `@supabase/supabase-js @supabase/ssr inngest resend square sharp`
- [ ] Supabase project created — run full schema SQL above
- [ ] RLS policies applied and tested
- [ ] Square catalog items created — 4 subscription plans + 4 setup fees + hosting = 9 items
- [ ] Square webhook configured → `/api/webhooks/square`
- [ ] Supabase auth configured — email magic link + password
- [ ] Middleware — protect `/dashboard/*` routes
- [ ] `.codebakers/` directory created with V5 structure:
  - BUILD-STATE.md (replaces BRAIN.md in V4)
  - BUILD-LOG.md (auto-updated by MCP tools)
  - ERROR-LOG.md (auto-updated by MCP tools)
  - DEPENDENCY-MAP.md (generated in Phase 2)
  - PROJECT-SPEC.md (this file)
- [ ] Vercel project created, all env vars set
- [ ] GitHub repo created at `botmakers-ai/pulseagent`
- [ ] CI/CD: push to main → auto deploy to Vercel
- [ ] **V5 Verification:** Call `codebakers_check_gate(0)` to verify completion
- [ ] Smoke test: signup → login → dashboard shell renders

**BUILD-STATE.md after Gate 0:**
```markdown
Phase: 0 COMPLETE ✓
Next: Phase 1 — Onboarding & Apex Webhook

Key Decisions:
- Using Supabase auth (email magic link + password)
- All Inngest jobs use Supabase admin client (bypasses RLS)
- Sharp runs in Vercel serverless (confirmed compatible)
- MCP enforcement active (codebakers tools operational)

V5 Enforcement Status:
- codebakers_get_context: WORKING ✓
- codebakers_check_gate(0): PASSED ✓
```

---

## GATE 1 — ONBOARDING & APEX WEBHOOK
**Exit criteria:** Client can complete onboarding. Apex webhook provisions a rep in under 60 seconds.

### Tasks
- [ ] Multi-step onboarding wizard — 5 steps:
  ```
  Step 1: Business basics
    - business_name, industry (select), location_city, location_state, phone
    - Auto-populate clients.timezone from location_state selection (using lib/utils/timezone.ts)
  
  Step 2: Your offer
    - core_offer (textarea), target_customer (textarea), differentiator (textarea)
  
  Step 3: Brand voice
    - brand_voice (select), primary_goal (select)
    - logo upload → Supabase Storage → clients.logo_url
    - brand_primary color picker (optional)
  
  Step 4: Social platforms
    - Checkbox: LinkedIn, Facebook, Instagram, Twitter/X, Google Business
    - Gated by plan (Starter: 2, Growth: 4, Pro+: all)
    - post_approval_mode: Email daily / Auto-publish / Dashboard only
  
  Step 5: Preferences
    - Podcast cadence (Pro+): Daily / 3x week / Weekly / Biweekly
    - Confirm + Launch button
  ```
- [ ] On onboarding complete → fire `onboarding.complete` Inngest event
- [ ] Signup page at `/signup/page.tsx` with referral tracking
  - Capture `?ref=` parameter from URL
  - Store in session/localStorage during signup flow
  - On account creation, populate `clients.referred_by` field
  - Show "Referred by [Rep Name]" banner if ref parameter present
- [ ] Apex webhook handler at `/api/webhooks/apex/route.ts`
  - Verify `APEX_WEBHOOK_SECRET` header
  - Map Apex rep fields to `clients` schema (including rep_code)
  - Create Supabase auth user
  - Send magic link email
  - Fire `apex/rep.provision` Inngest event
- [ ] `apex/rep.provision` Inngest function — full provisioning flow
- [ ] Plan feature gate utility: `lib/utils/plan-gates.ts`
  ```typescript
  export function getPlanLimits(plan: string) {
    return {
      starter:   { pages: 3,  posts: 30,  platforms: 2, podcast: false, youtube: false },
      growth:    { pages: 5,  posts: 50,  platforms: 4, podcast: false, youtube: false },
      pro:       { pages: 10, posts: 150, platforms: 6, podcast: true,  youtube: false },
      authority: { pages: 999,posts: 999, platforms: 6, podcast: true,  youtube: true  },
    }[plan]
  }
  ```
- [ ] Welcome email via Resend on provisioning complete
  - Login link to dashboard
  - Referral link: `pulseagent.ai/signup?ref=[repcode]`
  - Instructions: "Share this link to earn referral credit"
  - First week post preview
- [ ] Smoke test: POST to `/api/webhooks/apex` with sample rep → verify referral link in email → test signup with ?ref= parameter

---

## GATE 2 — DEPENDENCY MAPPING & SCHEMA DESIGN

**Exit criteria:** Complete dependency map exists. Database schema derived from data flows. Landing page generation works.

**CRITICAL V5 PHASE:** This phase prevents stale UI bugs by mapping ALL dependencies BEFORE writing code.

### Tasks

**Phase 2A: Dependency Mapping (V5 CRITICAL)**
- [ ] **Run MCP tool: `codebakers_map_dependencies`**
  - Maps all data flows in the application
  - Identifies: What updates when X changes?
  - Generates DEPENDENCY-MAP.md with complete graph
  - Example dependencies to map:
    - When `clients.selected_platforms` changes → regenerate social posts
    - When `social_posts` created → update calendar UI
    - When `square_subscription_id` changes → check plan limits
    - When `email_preferences` changes → update cron filters
    - When `moderation_status` changes → update dashboard badges
- [ ] Review DEPENDENCY-MAP.md with checklist:
  - All database tables mapped
  - All state changes identified
  - All UI update paths documented
  - All cron job triggers listed
- [ ] Generate STORE-CONTRACTS.md
  - What each Zustand store exposes
  - Which components consume which stores
  - Update patterns for each mutation

**Phase 2B: Schema & Landing Pages**
- [ ] `lib/prompts/industries/[industry].ts` — one file per industry
  ```typescript
  // lib/prompts/industries/insurance.ts
  export const insurancePagePrompt = {
    designDirection: {
      fonts: ['Cormorant Garamond', 'Outfit'],
      palette: { primary: '#1A2542', accent: '#B8922A', background: '#F4F2EE' },
      aesthetic: 'refined professional, light mode, trust-first, no gimmicks',
      avoid: 'dark backgrounds, neon, heavy animations, stock photo feel'
    },
    systemPrompt: `You are an expert conversion copywriter for insurance professionals...`,
    userPrompt: `Business: {{business_name}}
Location: {{location}}
Offer: {{core_offer}}
Target: {{target_customer}}
Differentiator: {{differentiator}}
Page type: {{page_type}}
Target keyword: {{target_keyword}}
Return JSON only. No markdown...`,
    outputSchema: {
      headline: 'string',
      subheadline: 'string',
      benefits: 'string[6]',
      faq: '{ q: string, a: string }[3]',
      social_proof: 'string',
      cta_primary: 'string',
      cta_secondary: 'string',
      hero_image_prompt: 'string (DALL-E prompt)',
      seo_title: 'string',
      seo_description: 'string',
      url_slug: 'string'
    }
  }
  ```
- [ ] Same prompt files for: legal, chiropractic, accounting, real-estate, fitness, restaurant, general
- [ ] `lib/generators/landing-page.ts`
  - Pull prompt template by industry
  - Call Claude → parse JSON output
  - Call DALL-E 3 with hero_image_prompt at 1792×1024
  - Resize to 1200×630 OG image via Sharp
  - Upload both to Supabase Storage
  - Save to `landing_pages`
  - Return published URL
- [ ] `lib/services/dalle.ts` — wrapper with error handling + retry
- [ ] `lib/services/sharp-resize.ts` — resize to all target dimensions
- [ ] Landing pages stored in database, viewable in dashboard
  - Client can generate custom pages for their business
  - Export as HTML for embedding on their own website
  - Or share via dashboard preview link
- [ ] Dashboard: `/dashboard/pages` — list, generate new, view, regenerate, export HTML
- [ ] Plan limit enforcement — show upgrade prompt if at limit
- [ ] Smoke test: generate landing page for test client → verify HTML export works + OG image correct

---

## GATE 3 — SOCIAL POST ENGINE + IMAGE GENERATION
**Exit criteria:** System generates 30 platform-specific posts with correctly sized images. Share URLs work. Relay pages render correct OG tags.

### Tasks
- [ ] `lib/prompts/platforms/` — one file per platform
  ```typescript
  // lib/prompts/platforms/linkedin.ts
  export const linkedinPrompt = {
    systemPrompt: `You write LinkedIn posts for business professionals...`,
    rules: [
      '150-200 words',
      'No emojis',
      'Insight-led, thought leadership angle',
      'End with an engagement question',
      '3-5 hashtags max, on separate line',
      'Format: Hook → Context → Insight → Question'
    ],
    imageStyle: 'professional, minimal, navy and gold, text overlay with headline',
    imageAspectRatio: 'ASPECT_16_9'   // Ideogram param → outputs 1200×627 equivalent
  }
  ```
- [ ] Same for: instagram, facebook, twitter, google_business
- [ ] `lib/services/ideogram.ts` — Ideogram API wrapper
  ```typescript
  async function generateSocialImage(prompt: string, aspectRatio: string): Promise<string>
  // Returns: public image URL
  // Uploads to Supabase Storage
  // Returns: storage URL
  ```
- [ ] `lib/services/moderation.ts` — OpenAI Moderation API wrapper
  ```typescript
  export async function moderateContent(text: string) {
    const response = await openai.moderations.create({ input: text })
    const result = response.results[0]
    return {
      flagged: result.flagged,
      categories: result.categories,
      scores: result.category_scores
    }
  }
  ```
- [ ] `lib/generators/social.ts`
  - Loop platforms × posts per month
  - Generate copy via Claude (batch where possible)
  - **Moderate content via OpenAI Moderation API**
  - **Determine moderation_status (approved/flagged/rejected)**
  - Generate image via Ideogram
  - Resize all images to all platform sizes via Sharp
  - Upload all to Supabase Storage
  - Calculate scheduled_date (space evenly across month)
  - Build relay page URL for each post
  - Build share URLs for each post
  - Save all to `social_posts` with moderation data
- [ ] Relay pages at `app/p/[postId]/page.tsx`
  ```typescript
  // OG tags pull from social_posts record
  export async function generateMetadata({ params }) {
    const post = await getPost(params.postId)
    return {
      openGraph: {
        title: post.client.business_name,
        description: post.post_copy.slice(0, 200),
        images: [{ url: post.image_url_fb, width: 1200, height: 630 }]
      }
    }
  }
  // Page body: brief description + "Share your story with PulseAgent"
  // This is what Facebook/LinkedIn scrapes for preview
  ```
- [ ] `social/monthly-generation` Inngest function — full implementation with moderation
- [ ] Dashboard: `/dashboard/social` — calendar view, post list, image preview
  - Show moderation status badge (Approved / Under Review / Rejected)
  - For clients: hide flagged/rejected posts
- [ ] Admin moderation dashboard: `/dashboard/admin/moderation`
  - Shows all content where moderation_status = 'flagged'
  - Filter by: new clients, AI flags, content type
  - Actions: Approve, Reject, Edit
  - Track reviewed_by and reviewed_at
- [ ] Post detail: show all platform images side by side, copy text, share URLs
- [ ] Smoke test:
  - Generate 30 posts for test client
  - Verify moderation runs on all posts
  - Verify approved posts appear in dashboard
  - Verify flagged posts appear in admin queue
  - Verify all images correct sizes
  - Verify FB share dialog opens with correct image

---

## GATE 4 — DAILY EMAIL + SHARE FLOW
**Exit criteria:** Client receives daily 8am email. All three share buttons open correct platform dialogs pre-populated. Skip works.

### Tasks
- [ ] `lib/inngest/daily-email.ts` — Inngest cron function
  ```typescript
  export const dailyEmailJob = inngest.createFunction(
    { id: 'social/daily-email' },
    { cron: '0 * * * *' },  // Every hour at :00
    async ({ step }) => {
      // Get clients currently at 8:00am in their timezone
      const clientsAt8am = await step.run('find-clients-at-8am', async () => {
        return getClientsAtLocalHour(8)
      })

      // Send email to each client
      await step.run('send-emails', async () => {
        for (const client of clientsAt8am) {
          const todaysPosts = await getTodaysPosts(client.id)
          await sendDailyEmail(client, todaysPosts)
        }
      })
    }
  )
  ```
- [ ] `lib/utils/timezone.ts` — Helper to detect timezone from state
  ```typescript
  const STATE_TO_TIMEZONE = {
    'CA': 'America/Los_Angeles',
    'NY': 'America/New_York',
    'TX': 'America/Chicago',
    // ... all 50 states
  }

  export function getTimezoneFromState(state: string): string {
    return STATE_TO_TIMEZONE[state] || 'America/Chicago'
  }

  export function getClientsAtLocalHour(targetHour: number): Promise<Client[]> {
    // Returns clients where:
    // - Current time in their timezone = targetHour
    // - email_preferences.daily_posts = true (respect unsubscribe)
    // - Haven't received email today yet
  }
  ```
- [ ] `lib/templates/email/daily-post.tsx` — Resend React email template
  ```
  Layout:
  ─────────────────────────────────
  PulseAgent logo + date

  "Good morning [Name]! Here's today's post."
  
  Platform: LinkedIn (or whatever today's platform is)
  
  [Post image — inline, correct size for platform]
  
  [Post copy in a styled box — easy to read and copy]
  [Copy Text button]
  
  [Share to Facebook] [Share to LinkedIn] [Share to X]
  
  ─ Optional ─
  [Skip today] · [View all this week's posts]
  ─────────────────────────────────
  Powered by PulseAgent

  Unsubscribe | Manage Preferences
  ```
- [ ] Skip endpoint: `GET /api/posts/[id]/skip` → marks post as skipped
- [ ] Unsubscribe page at `/unsubscribe/page.tsx`
  - Accepts `?token=` JWT parameter
  - Decodes token to get client.id
  - Shows email preference checkboxes (daily posts, monthly reports, updates)
  - Allows granular unsubscribe or re-subscribe
  - No login required (token-based access)
- [ ] Email preferences API at `/api/email/preferences/route.ts`
  - POST: Updates `clients.email_preferences` jsonb field
  - Validates JWT token
  - Returns updated preferences
- [ ] Dashboard settings: Email preferences section
  - Shows current subscription status
  - Toggle each email type
  - Save preferences (same API endpoint)
- [ ] Email open/click tracking via Resend webhooks (optional v2)
- [ ] Timezone handling: auto-populated from location_state, hourly cron checks which clients are at 8am
- [ ] Smoke test:
  - Create test clients in different timezones (CA, NY, TX)
  - Trigger daily email cron manually
  - Verify only clients at 8am local time receive emails
  - Verify all share buttons open correct dialogs
  - Verify correct image in each platform
  - Test unsubscribe flow:
    - Click unsubscribe link in email
    - Uncheck "Daily posts"
    - Verify client stops receiving daily emails
    - Re-subscribe via dashboard settings
    - Verify emails resume

---

## GATE 5 — PODCAST ENGINE (Pro+)
**Exit criteria:** Podcast episode generates on schedule. Full script produced. Topics don't repeat.

### Tasks
- [ ] `lib/generators/podcast.ts`
  - Pull last 20 episode topics from DB (dedup)
  - Generate via Claude:
    - Title, description (Spotify format)
    - Show notes with timestamps
    - Intro script (word-for-word, 300 words)
    - 3 segment scripts (600 words each)
    - Outro script with CTA (300 words)
    - Social post for episode announcement
    - Email subject + body for list announcement
  - Save to `podcast_episodes`
- [ ] Podcast cover art — Ideogram 3000×3000
- [ ] `podcast/generate-episode` Inngest function
  - Fires per client cadence (daily/weekly/etc)
  - Generates episode
  - Sends "New episode script ready" email
  - If auto mode → marks approved
- [ ] Dashboard: `/dashboard/podcast`
  - Episode list with status
  - Episode detail — full script readable, downloadable as PDF
  - Show stats (total episodes, cadence)
  - Voice settings (Pro+)
- [ ] Smoke test: trigger episode generation → verify script complete → verify no topic repeat

---

## GATE 6 — YOUTUBE ENGINE (Authority)
**Exit criteria:** YouTube channel setup + 20-video calendar generated on signup. Weekly new video concept generates automatically.

### Tasks
- [ ] `lib/generators/youtube.ts`
  - Channel setup: name, tagline, about section, positioning, monetization path
  - 20-video content calendar
  - Per video: title, description, outline, thumbnail concept, keywords, tags, upload day/time
  - YouTube Shorts scripts (repurposed from social content)
- [ ] `youtube/weekly-content` Inngest cron — fires weekly, generates 1 new video + 2 Shorts
- [ ] Dashboard: `/dashboard/youtube`
  - Channel overview
  - Video calendar
  - Video detail with full outline
- [ ] Smoke test: trigger YouTube generation → verify 20 videos → verify SEO fields populated

---

## GATE 7 — POLISH, BILLING PORTAL, MOBILE, LAUNCH
**Exit criteria:** All flows work end-to-end. Mobile responsive. Billing portal works. Ready to show Apex.

### Tasks
- [ ] Square billing portal → `/dashboard/settings/billing`
  - Current plan display
  - Usage this month (pages used, posts sent, emails sent)
  - Upgrade/downgrade flow
  - Cancel flow
- [ ] Monthly report email (1st of month via Inngest)
  - Total posts sent, reach summary, pages live, episodes published
- [ ] Storage cleanup job (`storage/cleanup-old-images`)
  - Weekly cron: deletes images older than 90 days
  - Keeps post records for analytics
  - Reduces storage costs by ~75%
  - Logs cleanup stats to generation_log
- [ ] Mobile responsive audit — all dashboard pages
- [ ] Error boundaries on all generator flows
- [ ] Rate limiting on `/api/generate/*` routes
- [ ] Apex demo account seeded with sample data
- [ ] Marketing site final polish
- [ ] `pulseagent.ai` domain connected on Vercel + Cloudflare
- [ ] Smoke test: full end-to-end — signup → onboard → generate all → receive daily email → click share → post to Facebook
- [ ] Smoke test: Apex webhook → rep site live in under 60 seconds

---

## CODEBAKERS V5 SESSION PLAN

**Using MCP-Enforced Tools**

| Session | Gate | Focus | V5 Workflow |
|---------|------|-------|-------------|
| 1 | 0 | Scaffold, DB, auth, Square, deploy | Start: `codebakers_get_context` → Build all tasks → End: `codebakers_check_gate(0)` |
| 2 | 1 | Onboarding wizard + Apex webhook | Start: `codebakers_get_context` → Build → End: `codebakers_check_gate(1)` |
| 3 | 2a | Dependency mapping + schema design | **CRITICAL**: `codebakers_map_dependencies` → Generate schema |
| 4 | 2b | Landing page generator + DALL-E + Sharp | Build with `codebakers_enforce_feature` → End: `codebakers_check_gate(2)` |
| 5 | 3a | Social prompts + Ideogram + moderation | Build → Add moderation layer → Test |
| 6 | 3b | Social generation + relay pages + share URLs | Build → End: `codebakers_check_gate(3)` |
| 7 | 4 | Daily email + Inngest cron + unsubscribe flow | Build → End: `codebakers_check_gate(4)` |
| 8 | 5 | Podcast generator + moderation + dashboard | Build → End: `codebakers_check_gate(5)` |
| 9 | 6 | YouTube engine + moderation + dashboard | Build → End: `codebakers_check_gate(6)` |
| 10 | 7 | Polish, billing, cleanup jobs, launch | Build → `codebakers_check_gate(7)` → Deploy |

**Estimated build time: 20-25 hours** (V5 enforcement reduces rework)

**V5 Improvements:**
- Automatic context detection (no manual state tracking)
- Dependency mapping BEFORE building (prevents stale UI bugs)
- MCP tools block invalid actions (can't skip phases)
- Built-in scope enforcement (prevents feature creep)

**Session Start Protocol (EVERY session):**
1. Call `codebakers_get_context` (MANDATORY)
2. Call `codebakers_init_session` if project exists
3. Read suggestions, check for blockers
4. Build according to current phase
5. Call `codebakers_check_gate(N)` before advancing

---

## .codebakers/BUILD-STATE.md TEMPLATE

**Note:** In V5, this file is called BUILD-STATE.md (not BRAIN.md) and is automatically loaded by `codebakers_init_session`.

```markdown
# PulseAgent — BUILD-STATE.md
**Version:** CodeBakers V5
**Last updated:** [AUTO-UPDATED BY MCP TOOLS]
**Current phase:** [AUTO-DETECTED BY codebakers_get_context]

---

## Phase Status (Auto-Updated)

- [x] Phase 0 — Scaffold & Infrastructure
- [ ] Phase 1 — Onboarding & Apex Webhook
- [ ] Phase 2 — Dependency Mapping & Schema Design
- [ ] Phase 3 — Social Post Engine + Landing Pages
- [ ] Phase 4 — Daily Email + Share Flow
- [ ] Phase 5 — Podcast Engine
- [ ] Phase 6 — YouTube Engine
- [ ] Phase 7 — Polish & Launch

**Current Phase:** [NUMBER]
**Phase Started:** [DATE]
**Estimated Completion:** [DATE]

---

## Key Technical Decisions

**Stack:**
- Auth: Supabase Auth (email magic link + password)
- Database: Supabase PostgreSQL with RLS
- Jobs: Inngest (all cron + events use admin client to bypass RLS)
- Images: DALL-E for heroes, Ideogram for social posts with text overlay
- Moderation: OpenAI Moderation API (auto + manual review first 30 days)
- Storage: 90-day cleanup job (75% cost reduction)

**Architecture:**
- Share flow: Relay pages + native platform share URLs (no OAuth)
- Apex provisioning: Webhook → Inngest event → async provision with retry
- Referral system: Query param tracking (`?ref=repcode`)
- Timezone: Hourly cron checks which clients at 8am local time
- Email: Unsubscribe via JWT tokens (CAN-SPAM compliant)

**V5 Enforcement:**
- Dependency mapping completed: [YES/NO/IN PROGRESS]
- DEPENDENCY-MAP.md location: `.codebakers/DEPENDENCY-MAP.md`
- Store contracts defined: [YES/NO/IN PROGRESS]
- All features scoped in PROJECT-SPEC.md: [YES/NO]

---

## Active Work (Current Session)

**Focus:** [What you're building now]
**Tasks Remaining:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Blockers:**
[Any blockers — empty if none]

**Decisions Made This Session:**
- [Decision 1]
- [Decision 2]

---

## Environment Status

- [ ] All env vars set in Vercel
- [ ] All env vars in .env.local
- [ ] Supabase project created
- [ ] Square catalog items created (4 subscription plans + 4 setup fees + hosting)
- [ ] GitHub repo: `botmakers-ai/pulseagent`
- [ ] Domain: pulseagent.ai (Vercel + Cloudflare)

---

## MCP Tool Usage Log

**Last Session Tools Called:**
1. `codebakers_get_context` → Result: [SUMMARY]
2. `codebakers_init_session` → Loaded BUILD-STATE.md
3. `codebakers_check_scope("feature-name")` → [IN SCOPE/OUT OF SCOPE]
4. `codebakers_enforce_feature("feature-name")` → [RESULT]
5. `codebakers_check_gate(N)` → [PASSED/FAILED]

**Next Session:**
- Must call `codebakers_get_context` FIRST
- Expected next phase: [NUMBER]
- Expected next gate check: [NUMBER]

---

**This file is auto-updated by MCP tools. Manual edits may be overwritten.**
```

---

## UNIT ECONOMICS

| Plan | Revenue | Claude | Ideogram | DALL-E | Sharp | Inngest | Resend | Storage | Infra | Net/Client |
|------|---------|--------|----------|--------|-------|---------|--------|---------|-------|-----------|
| Starter $79 | $79 | ~$2 | ~$3 | ~$1 | $0 | ~$0.50 | ~$0.30 | ~$0.20 | ~$1 | ~$71 |
| Growth $129 | $129 | ~$3 | ~$5 | ~$1 | $0 | ~$0.50 | ~$0.50 | ~$0.40 | ~$1 | ~$118 |
| Pro $299 | $299 | ~$8 | ~$12 | ~$2 | $0 | ~$1 | ~$1 | ~$0.50 | ~$2 | ~$272 |
| Authority $499 | $499 | ~$15 | ~$18 | ~$3 | $0 | ~$2 | ~$2 | ~$0.60 | ~$3 | ~$455 |

**Storage Calculation:**
- Per client: ~1GB/year (360 posts × 5 platform sizes × 500KB avg)
- Starter (30 posts/mo): ~900MB/year = $0.02/GB/mo × 0.9GB = ~$0.20/mo
- Growth (50 posts/mo): ~1.5GB/year = ~$0.40/mo
- Pro (150 posts/mo + podcast): ~2GB/year = ~$0.50/mo
- Authority (unlimited + podcast + YT): ~2.5GB/year = ~$0.60/mo
- **Note:** 90-day auto-cleanup keeps storage costs low (see storage/cleanup-old-images job)

### Apex Network Projections
| Reps | Mix | MRR | Setup Fees | Monthly Costs | Storage | Net |
|------|-----|-----|-----------|--------------|---------|-----|
| 50 | 40S/10G | $3,960 | $14,850 one-time | ~$400 | ~$12 | $3,548/mo |
| 100 | 60S/30G/10P | $9,870 | $35k one-time | ~$900 | ~$30 | $8,940/mo |
| 250 | 130S/80G/30P/10A | $24,320 | $85k one-time | ~$2,200 | ~$75 | $22,045/mo |
| 500 | 250S/150G/75P/25A | $49,600 | $170k one-time | ~$4,500 | ~$150 | $44,950/mo |

**Storage at Scale:**
- 50 reps: ~50GB storage (within Supabase free tier 100GB)
- 100 reps: ~100GB = $25/mo base (100GB included in Pro plan)
- 250 reps: ~250GB = $25 + (150GB × $0.021/GB) = ~$28/mo + cleanup overhead = ~$75/mo
- 500 reps: ~500GB = $25 + (400GB × $0.021/GB) = ~$33/mo + cleanup overhead = ~$150/mo
- **With 90-day cleanup:** Costs reduced by ~60% (only keep 3 months of images vs. 12 months)

---

## V4 → V5 MIGRATION GUIDE

**What Changed from V4 to V5:**

### 1. File Naming
- ❌ V4: `.codebakers/BRAIN.md`
- ✅ V5: `.codebakers/BUILD-STATE.md`

### 2. Session Start Protocol
**V4 (Manual):**
```
Read .codebakers/BRAIN.md
Check current gate manually
Proceed with building
```

**V5 (MCP-Enforced):**
```
Call: codebakers_get_context (MANDATORY)
Call: codebakers_init_session (if project exists)
Read suggestions from tool output
Build according to phase
Call: codebakers_check_gate(N) before advancing
```

### 3. Feature Building
**V4 (Manual):**
```
User: "Build feature X"
AI: Writes code directly
Risk: May skip tests, miss dependencies, work outside scope
```

**V5 (Enforced):**
```
User: "Build feature X"
AI: Calls codebakers_check_scope("feature X")
Tool: Verifies in PROJECT-SPEC.md
AI: Calls codebakers_enforce_feature("feature X")
Tool: Enforces full atomic unit (migration→API→store→UI→tests)
Result: Complete feature, impossible to skip steps
```

### 4. Phase Advancement
**V4 (Trust-Based):**
```
AI: "Gate N complete, moving to Gate N+1"
Risk: May advance with incomplete work
```

**V5 (Verified):**
```
AI: Calls codebakers_check_gate(N)
Tool: Verifies ALL gate criteria met
If pass: Advance
If fail: BLOCKS advancement, shows missing items
```

### 5. Dependency Tracking
**V4 (Manual):**
```
Developer tracks dependencies in head
Frequent stale UI bugs from missed updates
```

**V5 (Mapped):**
```
Phase 2: codebakers_map_dependencies
Generates: DEPENDENCY-MAP.md with complete graph
Code generation: Uses map to ensure all updates happen
Result: Zero stale UI bugs from moment 1
```

### 6. Key Improvements

| Feature | V4 | V5 |
|---------|----|----|
| Context detection | Manual (read BRAIN.md) | Automatic (MCP tool) |
| Scope enforcement | Trust-based | Technical blocking |
| Phase verification | Manual checklist | Automated gate checks |
| Dependency mapping | Not included | Core Phase 2 requirement |
| Feature completeness | Variable | Enforced atomic units |
| State persistence | Manual updates | Auto-updated by tools |
| Can skip steps? | Yes (mistake-prone) | No (tools block) |

### 7. Migration Steps (If Upgrading Existing V4 Project)

1. **Rename files:**
   ```bash
   mv .codebakers/BRAIN.md .codebakers/BUILD-STATE.md
   ```

2. **Install MCP server:**
   ```bash
   cd codebakers-v2/codebakers-mcp-server
   npm install && npm run build
   npx . install
   ```

3. **Restart Claude Desktop** (loads MCP tools)

4. **First session after migration:**
   ```
   Call: codebakers_get_context
   Tool will detect existing project and current phase
   Call: codebakers_init_session
   Tool loads BUILD-STATE.md
   Continue from where V4 left off
   ```

5. **If in Phase 2 or later:**
   ```
   Call: codebakers_map_dependencies
   Review generated DEPENDENCY-MAP.md
   Verify no stale UI bugs exist
   Update code if dependencies were missed
   ```

### 8. V5 Benefits Summary

✅ **Can't skip phases** (tools block invalid actions)
✅ **Can't work outside scope** (check_scope enforces boundaries)
✅ **Can't skip tests** (enforce_feature requires them)
✅ **Can't miss dependencies** (dependency map prevents stale UI)
✅ **Can't lose state** (auto-updated BUILD-STATE.md)
✅ **Faster builds** (less rework from enforcement)
✅ **Higher quality** (automated verification gates)

**V5 is "trust but verify" → "technically enforce"**

---

*PulseAgent · Built by BotMakers Inc. · botmakers.ai · Katy, TX*
*CodeBakers V5 Format · MCP-Enforced · github.com/botmakers-ai/pulseagent*
