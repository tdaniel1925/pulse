# PulseAgent Comprehensive Dependency Map

**Version:** 1.0
**Created:** March 25, 2026
**Purpose:** Map ALL data flows to prevent stale UI bugs

> **CodeBakers V5 Phase 2 Critical Document**
> This document maps every dependency in PulseAgent. When X changes, what MUST update?
> Use this map BEFORE building any feature to ensure complete implementations.

---

## Table of Contents

1. [Client Profile Dependencies](#client-profile-dependencies)
2. [Content Generation Dependencies](#content-generation-dependencies)
3. [Moderation Flow Dependencies](#moderation-flow-dependencies)
4. [Payment & Plan Dependencies](#payment--plan-dependencies)
5. [Email & Notification Dependencies](#email--notification-dependencies)
6. [Storage & Cleanup Dependencies](#storage--cleanup-dependencies)
7. [UI/Dashboard Dependencies](#uidashboard-dependencies)
8. [API Route Dependencies](#api-route-dependencies)
9. [Inngest Job Dependencies](#inngest-job-dependencies)
10. [Cross-System Dependencies](#cross-system-dependencies)

---

## 1. Client Profile Dependencies

### When `clients` record is created:
**Triggers:**
- ✅ Supabase Auth user creation
- ✅ Email preferences initialization (all true by default)
- ✅ Moderation window starts (30 days)
- ✅ Trial period starts (14 days)
- ✅ Timezone auto-population from `location_state`

**Does NOT trigger (until setup fee paid):**
- ❌ Content generation
- ❌ Landing page generation
- ❌ Provisioning workflow

---

### When `clients.business_name` changes:
**Updates Required:**
- ✅ All `landing_pages` where `published = false` (drafts only)
  - Regenerate: headline, body_copy, seo_title
  - Keep: hero_image_url (expensive to regenerate)
- ✅ Future social posts (next month's generation)
- ❌ Already-generated social posts (don't regenerate past content)

**UI Updates:**
- ✅ Dashboard header business name
- ✅ Email signature
- ✅ Referral link metadata

---

### When `clients.industry` changes:
**Updates Required:**
- ✅ `landing_pages.template_id` selection (industry → template mapping)
- ✅ Prompt template selection for future generations
- ✅ Brand color recommendations (if brand colors not set)
- ✅ Social post tone/style for future posts

**Regeneration Needed:**
- ✅ All unpublished landing pages (template may change)
- ❌ Published landing pages (protected)
- ❌ Past social posts

---

### When `clients.selected_platforms` changes:
**Updates Required:**
- ✅ Next month's social generation (only generate for selected platforms)
- ✅ Daily email content (only show selected platforms)
- ✅ Dashboard platform filters

**Storage Impact:**
- ✅ Image generation: only create sizes for selected platforms
- ✅ Sharp resizing: skip unselected platform sizes

**Example:**
```typescript
// If client has ['linkedin', 'facebook'] selected:
// - Generate image_url_li (1200×627)
// - Generate image_url_fb (1200×630)
// - Skip image_url_ig, image_url_tw, image_url_yt
```

---

### When `clients.brand_primary` or `clients.brand_secondary` changes:
**Updates Required:**
- ✅ Landing page template color overrides
- ✅ Future social post image generation (pass colors to Ideogram)
- ✅ Email template brand colors

**Regeneration Needed:**
- ✅ Unpublished landing pages (hero images may need regeneration)
- ❌ Published landing pages
- ❌ Past social posts

---

### When `clients.timezone` changes:
**Critical Updates:**
- ✅ Daily email send time calculation
- ✅ Inngest cron job targeting (which hourly run sends email)
- ✅ Social post scheduling (scheduled_date + timezone)

**Calculation:**
```typescript
// Hourly cron runs at :00 every hour
// Each run calculates: which clients are at 8:00am RIGHT NOW?
const clientsToEmail = clients.filter(c => {
  const clientTime = getCurrentTimeInTimezone(c.timezone);
  return clientTime.hour === 8 && clientTime.minute < 60;
});
```

---

### When `clients.email_preferences` changes:
**Updates Required:**
- ✅ Daily email cron filtering (skip if `daily_posts = false`)
- ✅ Monthly report cron filtering (skip if `monthly_report = false`)
- ✅ Product update emails (skip if `product_updates = false`)

**Database Flow:**
```
User clicks unsubscribe link
→ Unsubscribe page loads (JWT decode)
→ User selects preferences
→ POST /api/email/preferences
→ UPDATE clients SET email_preferences = {...}
→ Next cron run reads updated preferences
→ Emails filtered accordingly
```

---

### When `clients.plan` changes (starter → growth → pro → authority):
**Plan Limits:**
```typescript
const PLAN_LIMITS = {
  starter: { posts_per_platform: 30, landing_pages: 3, podcast: false, youtube: false },
  growth: { posts_per_platform: 50, landing_pages: 5, podcast: false, youtube: false },
  pro: { posts_per_platform: 150, landing_pages: 10, podcast: true, youtube: false },
  authority: { posts_per_platform: 150, landing_pages: -1, podcast: true, youtube: true },
};
```

**Updates Required:**
- ✅ Next social generation: generate more/fewer posts
- ✅ Landing page creation: check new limit before allowing
- ✅ Dashboard UI: show/hide podcast and YouTube sections
- ✅ Feature gates: enable/disable based on plan

**UI Updates:**
- ✅ Settings page: show current plan limits
- ✅ "New Page" button: disable if at limit
- ✅ Billing page: show plan details

---

### When `clients.plan_status` changes (active → past_due → cancelled):
**Updates Required:**
- ✅ Access control: disable content generation if past_due > 7 days
- ✅ UI banners: "Payment failed - update billing" if past_due
- ✅ Inngest jobs: skip if plan_status = cancelled
- ✅ Dashboard: show reactivation flow if cancelled

**Square Webhook Flow:**
```
Square: invoice.payment_failed event
→ Webhook handler: /api/webhooks/square
→ UPDATE clients SET plan_status = 'past_due'
→ Dashboard shows banner
→ If past_due > 7 days: disable new content generation
→ User updates payment method
→ Square: invoice.payment_made event
→ UPDATE clients SET plan_status = 'active'
```

---

### When `clients.moderation_exempt_at` is reached (30 days after signup):
**Updates Required:**
- ✅ `clients.moderation_required = false`
- ✅ Future social posts: `moderation_status = 'approved'` automatically
- ✅ No admin review queue needed
- ✅ Daily emails include posts immediately (no waiting for approval)

**Lifecycle:**
```
Day 0: Client signs up
→ moderation_required = true
→ moderation_exempt_at = now() + 30 days

Day 1-30: All content goes to admin review queue
→ Social posts: moderation_status = 'pending'
→ Admin reviews in /admin/moderation
→ Approved posts appear in daily emails

Day 31+: Auto-approved
→ moderation_required = false
→ Social posts: moderation_status = 'approved' (auto)
→ No admin review needed
```

---

## 2. Content Generation Dependencies

### Landing Page Generation Flow

**Trigger:** User clicks "New Page" or Apex provisioning

**Step 1: Validation**
```
Check plan limit
→ SELECT COUNT(*) FROM landing_pages WHERE client_id = ? AND published = true
→ If count >= plan limit: BLOCK with "Upgrade plan" message
```

**Step 2: Content Generation**
```
Load client profile
→ SELECT * FROM clients WHERE id = ?
→ Load prompt template
   SELECT * FROM prompt_templates
   WHERE category = 'landing_page'
   AND industry = client.industry
   AND active = true

→ Call Claude API with:
   - business_name
   - industry
   - core_offer
   - target_customer
   - differentiator
   - brand_voice

→ Claude returns JSON:
   {
     headline: string,
     subheadline: string,
     body_copy: { benefits[], faq[], sections[] },
     cta_primary: string,
     seo_title: string,
     seo_description: string,
     hero_image_prompt: string
   }
```

**Step 3: Image Generation**
```
Call DALL-E 3 with hero_image_prompt
→ Returns image URL (1792×1024)
→ Download image
→ Upload to Supabase Storage: /landing-pages/{client_id}/{page_id}/hero.jpg

Call Sharp.js to resize for OG image
→ Input: 1792×1024 hero image
→ Output: 1200×630 OG image
→ Upload to Supabase Storage: /landing-pages/{client_id}/{page_id}/og.jpg
```

**Step 4: Moderation**
```
Call OpenAI Moderation API on:
- headline
- subheadline
- body_copy (all sections)

→ Returns moderation_flags & moderation_score
→ If client.moderation_required = true:
   - Set moderation_status = 'pending' (needs admin review)
→ If client.moderation_required = false:
   - Set moderation_status = 'approved' (auto-approved)
```

**Step 5: Database Insert**
```
INSERT INTO landing_pages (
  client_id,
  page_type,
  slug,
  headline,
  subheadline,
  body_copy,
  cta_primary,
  seo_title,
  seo_description,
  hero_image_url,
  og_image_url,
  template_id,
  moderation_status,
  moderation_flags,
  moderation_score,
  published
) VALUES (...)
```

**Dependencies Created:**
- ✅ 2 images in Supabase Storage (hero + OG)
- ✅ 1 `landing_pages` record
- ✅ 1 `generation_log` record
- ✅ If moderation pending: 1 admin review task

**What Updates If This Changes:**
- Client changes brand colors → Need to regenerate hero image (expensive)
- Client changes business name → Update headline/body copy (cheap)
- Admin rejects moderation → Delete images, show error to client

---

### Social Post Generation Flow (Monthly)

**Trigger:** Inngest cron - 1st of month, 6am client timezone

**Step 1: Deduplication**
```
Load last 60 days of topics
→ SELECT topics FROM social_posts
   WHERE client_id = ?
   AND created_at > now() - interval '60 days'

→ Build exclusion list to avoid repeating topics
```

**Step 2: Post Count Calculation**
```
Get plan limits:
const postsPerPlatform = PLAN_LIMITS[client.plan].posts_per_platform;
const platforms = client.selected_platforms;

Total posts to generate = postsPerPlatform × platforms.length

Example:
- Plan: Growth (50 posts/platform)
- Platforms: ['linkedin', 'facebook']
- Total: 50 × 2 = 100 posts
```

**Step 3: Content Generation (Per Platform)**
```
For each platform in selected_platforms:
  Load platform prompt template
  → SELECT * FROM prompt_templates
     WHERE category = 'social'
     AND platform = ?
     AND (industry = client.industry OR industry IS NULL)

  Call Claude API:
  → Input: client profile + platform guidelines + exclusion topics
  → Output: Array of posts:
    [
      {
        post_copy: string,
        hashtags: string,
        image_prompt: string,
        topics: string[]
      },
      ... (30/50/150 depending on plan)
    ]
```

**Step 4: Moderation (Per Post)**
```
For each post:
  Call OpenAI Moderation API(post_copy + hashtags)

  → Returns:
    {
      flagged: boolean,
      categories: { sexual, hate, violence, ... },
      category_scores: { sexual: 0.02, ... }
    }

  Determine moderation_status:
  If client.moderation_required = true:
    If flagged = true OR max(category_scores) > 0.7:
      → moderation_status = 'flagged'
    Else:
      → moderation_status = 'pending'

  If client.moderation_required = false:
    If flagged = true OR max(category_scores) > 0.9:
      → moderation_status = 'flagged' (extra high threshold)
    Else:
      → moderation_status = 'approved'
```

**Step 5: Image Generation (Per Post)**
```
For each post where moderation_status != 'rejected':
  Call Ideogram API(image_prompt, platform)
  → Returns raw image URL (2048×2048 typically)

  Download image
  Upload raw to Supabase Storage:
  → /social/{client_id}/{year}/{month}/raw/{post_id}.jpg

  Resize with Sharp.js for each selected platform:
  If 'facebook' in platforms:
    → Resize to 1200×630, upload to /social/.../fb/{post_id}.jpg
  If 'instagram' in platforms:
    → Resize to 1080×1080, upload to /social/.../ig/{post_id}.jpg
  If 'linkedin' in platforms:
    → Resize to 1200×627, upload to /social/.../li/{post_id}.jpg
  If 'twitter' in platforms:
    → Resize to 1600×900, upload to /social/.../tw/{post_id}.jpg
  If 'youtube' in platforms:
    → Resize to 1280×720, upload to /social/.../yt/{post_id}.jpg
```

**Step 6: Share URL Generation**
```
Create relay page URL:
→ relay_page_url = `https://pulseagent.ai/p/${post.id}`

Build platform share URLs:
→ share_url_facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(relay_page_url)}`
→ share_url_linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(relay_page_url)}`
→ share_url_twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post_copy)}&url=${encodeURIComponent(relay_page_url)}`
```

**Step 7: Scheduling**
```
Calculate scheduled dates:
const startDate = new Date(year, month, 1);
const posts = [...]; // generated posts

posts.forEach((post, index) => {
  const dayOffset = Math.floor(index / platforms.length);
  post.scheduled_date = addDays(startDate, dayOffset);
  post.scheduled_time = '09:00'; // Default post time
});

Example for Growth plan (50 posts/platform), 2 platforms:
- Day 1: Post 1 (LinkedIn), Post 2 (Facebook)
- Day 2: Post 3 (LinkedIn), Post 4 (Facebook)
- ...
- Day 50: Post 99 (LinkedIn), Post 100 (Facebook)
```

**Step 8: Database Insert**
```
INSERT INTO social_posts (
  client_id,
  platform,
  post_copy,
  hashtags,
  image_prompt,
  image_url_raw,
  image_url_fb,
  image_url_ig,
  image_url_li,
  image_url_tw,
  image_url_yt,
  share_url_facebook,
  share_url_linkedin,
  share_url_twitter,
  relay_page_url,
  scheduled_date,
  scheduled_time,
  batch_month,
  topics,
  moderation_status,
  moderation_flags,
  moderation_score
) VALUES (...) × 100 (for Growth plan example)
```

**Step 9: Admin Notification (If Needed)**
```
If client.moderation_required = true:
  Count pending/flagged posts
  → SELECT COUNT(*) FROM social_posts
     WHERE client_id = ?
     AND moderation_status IN ('pending', 'flagged')
     AND batch_month = ?

  Send notification to admin:
  → Slack webhook: "Client X has N posts in review queue"
  → Email: admin@botmakers.ai
```

**Step 10: Logging**
```
INSERT INTO generation_log (
  client_id,
  job_type: 'monthly_social',
  inngest_run_id,
  claude_tokens_in,
  claude_tokens_out,
  ideogram_calls: 100,
  sharp_operations: 200, // 100 posts × 2 sizes
  status: 'complete'
)
```

**Dependencies Created:**
- ✅ 100 `social_posts` records (example)
- ✅ 100 raw images in Storage
- ✅ 200 resized images in Storage (2 platforms × 100 posts)
- ✅ 100 relay pages (virtual routes)
- ✅ 1 `generation_log` record
- ✅ If moderation required: N admin review tasks

**What Updates If This Changes:**
- Client removes a platform → Future generations skip that platform
- Client upgrades plan → Next month generates more posts
- Admin approves post → moderation_status = 'approved', eligible for daily email
- Post > 90 days old → cleanup job deletes all images

---

### Podcast Episode Generation Flow (Pro+ only)

**Trigger:** Inngest cron per `clients.podcast_cadence`

**Step 1: Deduplication**
```
Load last 20 episode topics
→ SELECT topics_covered FROM podcast_episodes
   WHERE client_id = ?
   ORDER BY created_at DESC LIMIT 20
```

**Step 2: Content Generation**
```
Load podcast prompt template
Call Claude API:
→ Input: client profile + last topics + episode number
→ Output:
  {
    title: string,
    description: string,
    show_notes: string,
    intro_script: string,
    segments: [
      { timestamp, topic, duration, script },
      { timestamp, topic, duration, script },
      { timestamp, topic, duration, script }
    ],
    outro_script: string,
    topics_covered: string[],
    keywords: string[]
  }
```

**Step 3: Cover Art Generation**
```
Generate prompt for cover art:
→ "Podcast cover art for episode: {title}. Professional design for {industry} industry. 3000×3000."

Call DALL-E 3
Upload to Supabase Storage:
→ /podcasts/{client_id}/episodes/{episode_id}/cover.jpg
```

**Step 4: Moderation**
```
Call OpenAI Moderation API on:
- title
- description
- full_script (intro + segments + outro)

Set moderation_status based on client.moderation_required
```

**Step 5: Database Insert**
```
INSERT INTO podcast_episodes (
  client_id,
  episode_number,
  title,
  description,
  show_notes,
  intro_script,
  full_script: `${intro} ${segments.map(s => s.script).join(' ')} ${outro}`,
  outro_script,
  outline: segments,
  topics_covered,
  keywords,
  cover_art_url,
  status: client.post_approval_mode === 'auto' ? 'approved' : 'draft',
  moderation_status,
  moderation_flags,
  moderation_score
)
```

**Dependencies Created:**
- ✅ 1 `podcast_episodes` record
- ✅ 1 cover art image (3000×3000)
- ✅ 1 `generation_log` record

**What Updates If This Changes:**
- Client changes podcast_cadence → Cron schedule adjusts
- Admin approves → status = 'approved', ready for ElevenLabs
- Draft > 60 days → cleanup job deletes cover art

---

## 3. Moderation Flow Dependencies

### Moderation Lifecycle

**New Client (< 30 days old):**
```
clients.moderation_required = true
→ All content goes through review:
   - Social posts → moderation_status = 'pending' or 'flagged'
   - Landing pages → moderation_status = 'pending' or 'flagged'
   - Podcast episodes → moderation_status = 'pending' or 'flagged'

→ Admin dashboard:
   - /admin/moderation shows review queue
   - Grouped by client
   - Sorted by moderation_score DESC (highest risk first)
```

**Established Client (> 30 days):**
```
clients.moderation_required = false
→ Auto-approved unless extreme flags:
   - OpenAI Moderation score > 0.9 → 'flagged'
   - OpenAI Moderation score ≤ 0.9 → 'approved'

→ Most content auto-approved
→ Only extreme cases go to admin review
```

---

### When OpenAI Moderation API returns flagged content:

**Step 1: Save Moderation Data**
```
UPDATE social_posts SET
  moderation_flags = {
    "sexual": false,
    "hate": false,
    "violence": true,  // ← flagged
    "self-harm": false,
    ...
  },
  moderation_score = 0.85,
  moderation_status = 'flagged'
WHERE id = ?
```

**Step 2: Determine Next Steps**
```
If client.moderation_required = true:
  → Goes to admin queue immediately
  → Email sent to admin team
  → Does NOT appear in daily emails until reviewed

If client.moderation_required = false:
  → Still goes to admin queue (high score)
  → Less urgent review
  → Does NOT appear in daily emails until approved
```

---

### Admin Review Actions

**Admin clicks "Approve":**
```
UPDATE social_posts SET
  moderation_status = 'approved',
  reviewed_by = admin.email,
  reviewed_at = now()
WHERE id = ?

→ Post now eligible for daily emails
→ Post shows in client dashboard
→ Share URLs become active
```

**Admin clicks "Reject":**
```
UPDATE social_posts SET
  moderation_status = 'rejected',
  reviewed_by = admin.email,
  reviewed_at = now()
WHERE id = ?

→ Post NEVER sent in emails
→ Post hidden from client dashboard
→ Images remain in storage (for audit trail)
→ Does NOT count toward post quota

→ Optional: Send client notification
   "Some content did not meet quality standards. Regenerating replacement post..."
```

**Admin clicks "Edit & Approve":**
```
UPDATE social_posts SET
  post_copy = edited_text,
  moderation_status = 'approved',
  reviewed_by = admin.email,
  reviewed_at = now()
WHERE id = ?

→ Post sent with edits
→ Client sees edited version
```

---

### Moderation Dependencies on Other Systems

**Daily Email Filtering:**
```
SELECT * FROM social_posts
WHERE client_id = ?
AND scheduled_date = today()
AND moderation_status = 'approved'  // ← MUST be approved
AND email_sent_at IS NULL

→ Only approved posts get emailed
→ Pending/flagged posts skip daily email
→ Rejected posts never sent
```

**Dashboard Display:**
```
SELECT * FROM social_posts
WHERE client_id = ?
AND moderation_status IN ('approved', 'pending')  // Show approved + pending
ORDER BY scheduled_date

→ Client sees approved posts (can share immediately)
→ Client sees pending posts (grayed out, "Under review" badge)
→ Client NEVER sees rejected posts
```

**Relay Page Access:**
```
GET /p/[postId]

Check moderation_status:
→ If 'approved': Show full OG tags + content
→ If 'pending': Show "Content under review" message
→ If 'rejected': 404 Not Found
→ If 'flagged': 404 Not Found (until admin reviews)
```

---

## 4. Payment & Plan Dependencies

### Square Payment Webhook Flow

**Event: `payment.created` (setup fee)**
```
Webhook → /api/webhooks/square

Step 1: Verify signature
const isValid = verifySquareSignature(req.body, signature);
if (!isValid) return 401;

Step 2: Parse payment details
const { payment_id, customer_id, amount_money, status } = event.data.object;

Step 3: Match to client
const client = await supabase
  .from('clients')
  .select('*')
  .eq('square_customer_id', customer_id)
  .maybeSingle();

Step 4: Update database
UPDATE clients SET
  square_setup_fee_payment_id = payment_id,
  setup_fee_paid = true
WHERE square_customer_id = customer_id;

Step 5: Create subscription
const subscription = await squareClient.subscriptions.createSubscription({
  customer_id: client.square_customer_id,
  plan_id: PLAN_IDS[client.plan],
  price_money: { amount: PLAN_PRICES[client.plan], currency: 'USD' }
});

UPDATE clients SET
  square_subscription_id = subscription.id,
  plan_status = 'active'
WHERE id = client.id;

Step 6: Trigger provisioning
await inngest.send({
  name: 'apex/rep.provision',
  data: { client_id: client.id }
});
```

**Dependencies Triggered:**
- ✅ Provisioning Inngest job starts
- ✅ First 30 social posts generated
- ✅ Welcome email sent
- ✅ Dashboard becomes accessible

---

**Event: `invoice.payment_failed`**
```
Webhook → /api/webhooks/square

Step 1: Update plan status
UPDATE clients SET
  plan_status = 'past_due'
WHERE square_subscription_id = subscription_id;

Step 2: Check grace period
If days_past_due < 7:
  → Send "Payment failed, please update" email
  → Dashboard banner: "Update payment method"
  → Content generation continues (grace period)

If days_past_due >= 7:
  → Content generation STOPS
  → Dashboard: "Subscription suspended"
  → Daily emails STOP
```

**Dashboard Dependencies:**
```
If plan_status = 'past_due' && days_past_due >= 7:
  → Disable "New Page" button
  → Disable "Generate Content" button
  → Show billing banner (persistent, top of page)
  → Redirect all feature access to /settings/billing
```

**Inngest Job Dependencies:**
```
// In every Inngest job:
const client = await getClient(client_id);

if (client.plan_status === 'past_due') {
  const daysPastDue = differenceInDays(new Date(), client.trial_ends_at);
  if (daysPastDue >= 7) {
    throw new Error('Subscription suspended - payment required');
    // Job stops, not retried until plan_status = 'active'
  }
}
```

---

**Event: `subscription.updated` (plan change)**
```
Client upgrades: Starter → Growth

Webhook → /api/webhooks/square

UPDATE clients SET
  plan = 'growth',
  plan_status = 'active'
WHERE square_subscription_id = subscription_id;

→ Next month's generation:
  - Generates 50 posts/platform (up from 30)
  - Landing page limit: 5 (up from 3)

→ Immediate UI updates:
  - Settings page shows new plan
  - Limits update in dashboard
  - "Upgrade" prompts removed
```

---

## 5. Email & Notification Dependencies

### Daily Email Flow (Timezone-Aware)

**Inngest Cron:** Every hour at :00 (runs 24 times/day)

**Step 1: Calculate Target Clients**
```
const currentUTC = new Date();

// Find all IANA timezones currently at 8:00am
const targetTimezones = ALL_TIMEZONES.filter(tz => {
  const localTime = utcToZonedTime(currentUTC, tz);
  return localTime.getHours() === 8 && localTime.getMinutes() < 60;
});

// Get clients in those timezones
const clients = await supabase
  .from('clients')
  .select('*')
  .in('timezone', targetTimezones)
  .eq('email_preferences->daily_posts', true);  // ← Respect unsubscribe

Example:
→ 13:00 UTC: Send emails to clients in America/New_York (8am ET)
→ 14:00 UTC: Send emails to clients in America/Chicago (8am CT)
→ 15:00 UTC: Send emails to clients in America/Denver (8am MT)
→ 16:00 UTC: Send emails to clients in America/Los_Angeles (8am PT)
```

**Step 2: Get Today's Posts (Per Client)**
```
const today = format(new Date(), 'yyyy-MM-dd');

const posts = await supabase
  .from('social_posts')
  .select('*')
  .eq('client_id', client.id)
  .eq('scheduled_date', today)
  .eq('moderation_status', 'approved')  // ← MUST be approved
  .is('email_sent_at', null);            // ← Not already sent

→ Returns 1 post per platform (e.g., LinkedIn + Facebook = 2 posts)
```

**Step 3: Build Email**
```
Email structure:
┌─────────────────────────────────────┐
│ PulseAgent Logo                     │
├─────────────────────────────────────┤
│ Hi {business_name},                 │
│                                     │
│ Here's today's content:             │
├─────────────────────────────────────┤
│ Platform: LinkedIn                  │
│ ┌───────────────────────────────┐  │
│ │ [Image Preview]                │  │
│ └───────────────────────────────┘  │
│                                     │
│ {post_copy}                         │
│ {hashtags}                          │
│                                     │
│ [Share to LinkedIn] [Copy Text]     │
├─────────────────────────────────────┤
│ Platform: Facebook                  │
│ ┌───────────────────────────────┐  │
│ │ [Image Preview]                │  │
│ └───────────────────────────────┘  │
│                                     │
│ {post_copy}                         │
│                                     │
│ [Share to Facebook] [Copy Text]     │
├─────────────────────────────────────┤
│ [Skip Today] [Manage Preferences]   │
│                                     │
│ Unsubscribe                         │
└─────────────────────────────────────┘
```

**Step 4: Send Email**
```
await resend.emails.send({
  from: 'noreply@pulseagent.ai',
  to: client.user.email,
  subject: `Your social content for ${format(today, 'MMMM d')}`,
  react: DailyPostEmail({ client, posts }),
});

→ Update sent status:
UPDATE social_posts SET
  email_sent_at = now()
WHERE id IN (post_ids);
```

**Step 5: Logging**
```
INSERT INTO generation_log (
  client_id,
  job_type: 'daily_email',
  emails_sent: 1,
  status: 'complete'
)
```

**Dependencies:**
- ✅ Requires: approved social posts for today
- ✅ Requires: email_preferences.daily_posts = true
- ✅ Requires: correct timezone calculation
- ✅ Updates: social_posts.email_sent_at
- ✅ Creates: generation_log record

**What Blocks This:**
- ❌ No approved posts for today → Email not sent (silent skip)
- ❌ email_preferences.daily_posts = false → Skipped
- ❌ Timezone not set → Defaults to America/Chicago (spec)
- ❌ All posts flagged/rejected → Email not sent

---

### Email Preference Management (CAN-SPAM Compliance)

**Unsubscribe Link in Every Email:**
```
const unsubToken = jwt.sign(
  { clientId: client.id },
  process.env.JWT_SECRET,
  { expiresIn: '90d' }
);

const unsubUrl = `https://pulseagent.ai/unsubscribe?token=${unsubToken}`;
```

**User Clicks Unsubscribe:**
```
GET /unsubscribe?token={jwt}

Step 1: Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const { clientId } = decoded;

Step 2: Load current preferences
const client = await supabase
  .from('clients')
  .select('email_preferences')
  .eq('id', clientId)
  .maybeSingle();

Step 3: Show preference form
→ Checkbox: Daily social posts (default: true)
→ Checkbox: Monthly performance reports (default: true)
→ Checkbox: Product updates & announcements (default: true)
→ Button: Save preferences

Step 4: User submits form
POST /api/email/preferences
{
  token: "jwt...",
  preferences: {
    daily_posts: false,      // ← User unchecked
    monthly_report: true,
    product_updates: true
  }
}

Step 5: Update database
UPDATE clients SET
  email_preferences = {
    "daily_posts": false,
    "monthly_report": true,
    "product_updates": true
  }
WHERE id = clientId;

Step 6: Confirmation
→ Show: "Preferences updated. You will no longer receive daily post emails."
```

**Dependency Chain:**
```
User unchecks "daily_posts"
→ Database: email_preferences.daily_posts = false
→ Next daily email cron run:
   - Filters out this client
   - No email sent
→ Client still gets monthly reports
→ Client still gets product updates
→ Dashboard still works (account active)
```

**Re-subscribe Flow:**
```
Client can re-subscribe from:
1. Dashboard → Settings → Email Preferences
2. Unsubscribe page (revisit link)
3. Monthly report email (includes re-subscribe button)

→ Same flow, just check boxes again
→ Immediate effect: next day's email resumes
```

---

## 6. Storage & Cleanup Dependencies

### Cleanup Job: `storage/cleanup-old-images`

**Trigger:** Cron - Every Sunday at 3am UTC

**Purpose:** Delete old images to control Supabase storage costs

**Step 1: Find Old Social Posts**
```
const oldPosts = await supabase
  .from('social_posts')
  .select('*')
  .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));  // 90 days ago

→ Returns all social posts older than 90 days
```

**Step 2: Delete Images from Storage**
```
For each oldPost:
  const imagePaths = [
    oldPost.image_url_raw,
    oldPost.image_url_fb,
    oldPost.image_url_ig,
    oldPost.image_url_li,
    oldPost.image_url_tw,
    oldPost.image_url_yt
  ].filter(Boolean);  // Remove nulls

  await supabase.storage
    .from('social')
    .remove(imagePaths);

  → Deletes 1-6 images per post from Supabase Storage
```

**Step 3: Update Database (NULL Image URLs)**
```
UPDATE social_posts SET
  image_url_raw = NULL,
  image_url_fb = NULL,
  image_url_ig = NULL,
  image_url_li = NULL,
  image_url_tw = NULL,
  image_url_yt = NULL
WHERE id = oldPost.id;

→ Post record remains (for history)
→ Post copy remains (for archives)
→ Images gone (cost savings)
```

**Step 4: Find Old Landing Page Drafts**
```
const oldDrafts = await supabase
  .from('landing_pages')
  .select('*')
  .eq('published', false)
  .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));  // 30 days ago

→ Unpublished drafts older than 30 days
```

**Step 5: Delete Draft Images & Records**
```
For each oldDraft:
  await supabase.storage
    .from('landing-pages')
    .remove([oldDraft.hero_image_url, oldDraft.og_image_url]);

  DELETE FROM landing_pages WHERE id = oldDraft.id;

→ Complete removal (drafts are temporary)
```

**Step 6: Find Old Podcast Drafts**
```
const oldPodcastDrafts = await supabase
  .from('podcast_episodes')
  .select('*')
  .eq('status', 'draft')
  .lt('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));  // 60 days ago
```

**Step 7: Delete Podcast Cover Art**
```
For each oldPodcastDraft:
  await supabase.storage
    .from('podcasts')
    .remove([oldPodcastDraft.cover_art_url]);

  UPDATE podcast_episodes SET
    cover_art_url = NULL
  WHERE id = oldPodcastDraft.id;

→ Draft episode remains (for reference)
→ Cover art deleted (cost savings)
```

**Step 8: Logging**
```
INSERT INTO generation_log (
  job_type: 'storage_cleanup',
  sharp_operations: 0,
  status: 'complete',
  completed_at: now()
);

Log summary:
- Deleted N social post images
- Deleted M landing page drafts
- Deleted P podcast cover arts
- Storage freed: X MB
```

**Dependencies:**
- ✅ Reads: social_posts, landing_pages, podcast_episodes
- ✅ Deletes: Supabase Storage files
- ✅ Updates: Image URL fields → NULL
- ✅ Deletes: Unpublished draft records

**Safety:**
- ❌ NEVER deletes published landing pages
- ❌ NEVER deletes approved/published podcast episodes
- ❌ NEVER deletes posts created < 90 days ago
- ✅ Only deletes expired drafts and old images

---

## 7. UI/Dashboard Dependencies

### Dashboard Data Loading

**On Dashboard Load (`/dashboard`):**
```
Step 1: Load client profile
const client = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', auth.uid())
  .maybeSingle();

→ Displays: business_name, plan, plan_status
→ Checks: provisioning_complete (show progress bar if false)
```

**Step 2: Load Provisioning Status**
```
If client.provisioning_complete === false:
  const provisionLog = await supabase
    .from('provision_log')
    .select('*')
    .eq('client_id', client.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  → Show progress bar:
    - status = 'pending': "Setting up your account..." (0%)
    - status = 'running': "Generating content..." (50%)
    - status = 'complete': "Done!" (100%) → Set provisioning_complete = true
    - status = 'failed': "Setup failed. Contact support." + error message
```

**Step 3: Load Stats**
```
const stats = await supabase.rpc('get_dashboard_stats', {
  p_client_id: client.id
});

Returns:
{
  total_pages: 3,
  total_posts_this_month: 100,
  total_posts_sent: 25,
  pending_moderation: 0
}

→ Display cards:
  - "3 landing pages"
  - "100 posts this month"
  - "25 posts shared"
  - "0 pending review" (only show if > 0)
```

**Step 4: Load Recent Posts**
```
const recentPosts = await supabase
  .from('social_posts')
  .select('*')
  .eq('client_id', client.id)
  .in('moderation_status', ['approved', 'pending'])  // Hide rejected
  .order('scheduled_date', { ascending: true })
  .limit(7);

→ Display post feed:
  For each post:
    - If approved: Show with share buttons
    - If pending: Gray out, show "Under review" badge
    - If flagged: Hide (admin-only visibility)
    - If rejected: Hide completely
```

---

### Landing Pages Page (`/pages`)

**Load All Pages:**
```
const pages = await supabase
  .from('landing_pages')
  .select('*')
  .eq('client_id', client.id)
  .order('created_at', { ascending: false });
```

**Display Logic:**
```
For each page:
  - If published: Show "Published" badge + live URL
  - If not published:
    - If moderation_status = 'approved': Show "Publish" button
    - If moderation_status = 'pending': Show "Under Review" badge
    - If moderation_status = 'flagged': Show "Under Review" badge (amber color)
    - If moderation_status = 'rejected': Show "Rejected" badge + reason
```

**Create New Page Button:**
```
Check plan limit:
const publishedCount = pages.filter(p => p.published).length;
const limit = PLAN_LIMITS[client.plan].landing_pages;

If publishedCount >= limit:
  → Disable button
  → Show tooltip: "Upgrade to create more pages"
Else:
  → Enable button
  → Click → Navigate to /pages/new
```

**Dependencies:**
- ✅ Reads: landing_pages
- ✅ Checks: plan limits
- ✅ Filters by: moderation_status, published

---

### Social Posts Page (`/social`)

**Load Posts for Current Month:**
```
const currentMonth = format(new Date(), 'yyyy-MM');

const posts = await supabase
  .from('social_posts')
  .select('*')
  .eq('client_id', client.id)
  .eq('batch_month', currentMonth)
  .in('moderation_status', ['approved', 'pending'])
  .order('scheduled_date', { ascending: true });
```

**Calendar View:**
```
Group posts by date:
const postsByDate = groupBy(posts, 'scheduled_date');

Render calendar:
For each day in month:
  const dayPosts = postsByDate[day] || [];

  Display:
  - If dayPosts.length > 0:
    - Show platform icons (LinkedIn, Facebook, etc.)
    - Click → Expand to show post preview
    - If approved: Show share buttons
    - If pending: Gray out, "Under review"
```

**Platform Filter:**
```
User selects: "Show only LinkedIn"

Filter posts:
const filteredPosts = posts.filter(p => p.platform === 'linkedin');

→ Calendar updates to show only LinkedIn posts
```

**Dependencies:**
- ✅ Reads: social_posts
- ✅ Filters by: batch_month, moderation_status, platform
- ✅ Groups by: scheduled_date

---

### Settings Page (`/settings`)

**Business Profile Section:**
```
Load client:
const client = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', auth.uid())
  .maybeSingle();

Form fields:
- business_name
- industry (dropdown)
- location_city, location_state
- core_offer (textarea)
- target_customer (textarea)
- differentiator (textarea)
- brand_voice (dropdown)
- brand_primary (color picker)
- brand_secondary (color picker)
- selected_platforms (multi-select checkboxes)

On save:
→ UPDATE clients SET ... WHERE id = client.id
→ Show toast: "Saved. Changes will apply to future content."
```

**Email Preferences Section:**
```
const prefs = client.email_preferences;

Checkboxes:
- Daily social posts: {prefs.daily_posts}
- Monthly reports: {prefs.monthly_report}
- Product updates: {prefs.product_updates}

On save:
→ UPDATE clients SET email_preferences = {...}
→ Show toast: "Email preferences updated."
```

**Dependencies:**
- ✅ Reads: clients
- ✅ Updates: clients (profile + preferences)
- ✅ Triggers: Future content generation uses new settings

---

### Billing Page (`/settings/billing`)

**Load Subscription Info:**
```
const client = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', auth.uid())
  .maybeSingle();

Display:
- Current plan: {client.plan} ($XX/mo)
- Plan status: {client.plan_status}
- Setup fee: {client.setup_fee_paid ? 'Paid' : 'Pending'}
- Trial ends: {client.trial_ends_at}

If plan_status = 'past_due':
  → Show banner: "Payment failed. Update your payment method."
  → [Update Payment Method] button → Square payment form

If plan_status = 'active':
  → [Change Plan] button → Square subscription management
  → [Update Payment Method] button
```

**Plan Comparison Table:**
```
Show limits for each plan:
                 Starter  Growth  Pro      Authority
Posts/platform   30       50      150      150
Landing pages    3        5       10       Unlimited
Podcast          No       No      Yes      Yes
YouTube          No       No      No       Yes
Price            $79/mo   $129/mo $299/mo  $499/mo
```

**Upgrade Flow:**
```
User clicks "Upgrade to Growth"

→ Call Square API:
  await squareClient.subscriptions.updateSubscription({
    subscription_id: client.square_subscription_id,
    plan_id: SQUARE_SUB_GROWTH_PLAN_ID
  });

→ Square webhook: subscription.updated
→ UPDATE clients SET plan = 'growth'
→ Refresh page → Show new plan limits
```

**Dependencies:**
- ✅ Reads: clients (plan, plan_status, trial info)
- ✅ Integrates: Square Subscriptions API
- ✅ Updates: plan via webhook
- ✅ Triggers: UI limit changes

---

## 8. API Route Dependencies

### `/api/generate/page` - Landing Page Generation

**Input:**
```json
{
  "page_type": "main",
  "target_keyword": "chiropractor austin",
  "target_audience": "athletes with back pain",
  "unique_offer": "sports injury recovery"
}
```

**Dependencies:**
```
Step 1: Auth check
→ Get user from session
→ Load client profile

Step 2: Plan limit check
→ Count published pages
→ If >= limit: return 400 "Upgrade plan"

Step 3: Load prompt template
→ SELECT * FROM prompt_templates
   WHERE category = 'landing_page'
   AND industry = client.industry

Step 4: Call Claude API
→ Generate content (headline, body, CTA, SEO)

Step 5: Call DALL-E
→ Generate hero image

Step 6: Call Sharp
→ Resize to OG image

Step 7: Upload images
→ Supabase Storage

Step 8: Moderation
→ OpenAI Moderation API

Step 9: Save to database
→ INSERT landing_pages

Step 10: Return
→ { page_id, preview_url }
```

**Read Dependencies:**
- clients (profile + limits)
- prompt_templates

**Write Dependencies:**
- landing_pages (new record)
- generation_log
- Supabase Storage (2 images)

---

### `/api/webhooks/square` - Square Payment Webhooks

**Events Handled:**
- `payment.created` → Setup fee paid
- `subscription.created` → Monthly plan started
- `subscription.updated` → Plan changed
- `invoice.payment_made` → Monthly payment successful
- `invoice.payment_failed` → Payment failed

**Dependencies:**
```
All events:
Step 1: Verify signature
→ validateSquareSignature(body, signature)

Step 2: Parse event
→ const { type, data } = JSON.parse(body)

Step 3: Match client
→ SELECT * FROM clients WHERE square_customer_id = ?

Step 4: Update database based on event type

Step 5: Trigger side effects (Inngest, emails)
```

**Write Dependencies:**
- clients (plan, plan_status, payment IDs)
- provision_log (if triggering provisioning)
- Inngest events (apex/rep.provision, etc.)

---

### `/api/webhooks/apex` - Apex Provisioning Webhook

**Input from Apex:**
```json
{
  "event": "rep.created",
  "rep_id": "apex_12345",
  "rep_code": "SMITH",
  "name": "John Smith",
  "email": "john@example.com",
  "rank": "Senior Advisor",
  "affiliate_link": "https://apex.com/john"
}
```

**Dependencies:**
```
Step 1: Verify secret
→ if (req.headers['x-apex-secret'] !== APEX_WEBHOOK_SECRET) return 401

Step 2: Create client record
→ INSERT INTO clients (
    business_name: rep.name + " - Apex Advisor",
    rep_code: rep.rep_code,
    industry: 'insurance',
    apex_rep_id: rep.rep_id,
    apex_rank: rep.rank,
    apex_affiliate_link: rep.affiliate_link,
    plan: 'starter',
    plan_status: 'trialing'
  )

Step 3: Create Supabase Auth user
→ supabase.auth.admin.createUser({
    email: rep.email,
    email_confirm: false  // Send magic link
  })

Step 4: Send magic link email
→ resend.emails.send({
    to: rep.email,
    subject: "Welcome to PulseAgent",
    template: WelcomeEmail({ rep, magicLink })
  })

Step 5: Trigger provisioning
→ inngest.send({
    name: 'apex/rep.provision',
    data: { client_id: newClient.id }
  })

Step 6: Log
→ INSERT INTO provision_log (
    client_id,
    source: 'apex_webhook',
    event_type: 'rep.created',
    status: 'pending'
  )
```

**Write Dependencies:**
- clients (new record)
- auth.users (Supabase Auth)
- provision_log
- Inngest event trigger

---

### `/api/email/preferences` - Update Email Preferences

**Input:**
```json
{
  "token": "jwt...",
  "preferences": {
    "daily_posts": false,
    "monthly_report": true,
    "product_updates": true
  }
}
```

**Dependencies:**
```
Step 1: Verify JWT
→ const { clientId } = jwt.verify(token, JWT_SECRET)

Step 2: Update database
→ UPDATE clients SET
    email_preferences = preferences
  WHERE id = clientId

Step 3: Return confirmation
→ { success: true, message: "Preferences updated" }
```

**Write Dependencies:**
- clients.email_preferences

**Downstream Effects:**
- Daily email cron respects new preferences immediately
- Monthly report cron respects new preferences
- Product update emails respect new preferences

---

## 9. Inngest Job Dependencies

### `apex/rep.provision` (Multi-Step Provisioning)

**Trigger:** Inngest event after setup fee paid

**Step 1: Validate Client**
```
const client = await supabase
  .from('clients')
  .select('*')
  .eq('id', client_id)
  .maybeSingle();

If !client || !client.setup_fee_paid:
  → throw Error('Setup fee not paid')
  → Job stops, not retried
```

**Step 2: Generate Initial Social Posts**
```
Call social generation logic:
→ For each platform in client.selected_platforms:
  - Generate 30 posts (starter plan default)
  - Call Ideogram for images
  - Resize with Sharp
  - Upload to Storage
  - Save to social_posts

Dependencies created:
- 30 social_posts records × platforms.length
- ~90 images in Storage (raw + 2 platform sizes)
```

**Step 3: Generate Welcome Landing Page**
```
Call landing page generation:
→ page_type = 'main'
→ Generate with Claude
→ Generate hero with DALL-E
→ Save to landing_pages

Dependencies created:
- 1 landing_pages record
- 2 images (hero + OG)
```

**Step 4: Create Relay Pages**
```
For each social post:
  → relay_page_url = `https://pulseagent.ai/p/${post.id}`
  → No database record needed (Next.js dynamic route)
  → Build share URLs with relay URL
```

**Step 5: Send Welcome Email**
```
await resend.emails.send({
  to: client.user.email,
  subject: "Your PulseAgent is ready!",
  template: WelcomeEmail({
    client,
    dashboardUrl: 'https://pulseagent.ai/dashboard',
    referralLink: `https://pulseagent.ai/signup?ref=${client.rep_code}`,
    firstWeekPosts: posts.slice(0, 7)
  })
});
```

**Step 6: Mark Complete**
```
UPDATE clients SET
  provisioning_complete = true,
  content_generated_at = now()
WHERE id = client.id;

UPDATE provision_log SET
  status = 'complete',
  completed_at = now()
WHERE client_id = client.id
ORDER BY started_at DESC
LIMIT 1;
```

**Total Dependencies:**
- Reads: clients
- Writes: social_posts, landing_pages, generation_log, provision_log
- Creates: ~90+ images in Storage
- Sends: 1 email

**Error Handling:**
- Each step is idempotent (checks if already done)
- On error: log to provision_log.error
- Retry: 3 times with exponential backoff
- Final failure: Send admin alert

---

### `social/monthly-generation`

**Covered in Section 2 - Content Generation Dependencies**

Summary dependencies:
- Reads: clients, prompt_templates, social_posts (last 60 days for dedup)
- Writes: social_posts (30-150 records), generation_log
- Creates: 60-300+ images in Storage
- Calls: Claude API, Ideogram API, OpenAI Moderation API, Sharp

---

### `social/daily-email`

**Covered in Section 5 - Email & Notification Dependencies**

Summary dependencies:
- Reads: clients (timezone + email_preferences), social_posts (today's approved posts)
- Updates: social_posts.email_sent_at
- Writes: generation_log
- Sends: 1 email per client

---

### `storage/cleanup-old-images`

**Covered in Section 6 - Storage & Cleanup Dependencies**

Summary dependencies:
- Reads: social_posts, landing_pages, podcast_episodes
- Deletes: Supabase Storage files
- Updates: Image URL fields → NULL
- Writes: generation_log

---

## 10. Cross-System Dependencies

### Client Profile → All Systems

**When client profile changes, these systems check it:**

| System | Fields Used | Purpose |
|--------|-------------|---------|
| Content Generation | industry, brand_voice, core_offer | Prompt context |
| Template Selection | industry | Pick template_id |
| Image Generation | brand_primary, brand_secondary | Color schemes |
| Email Sending | timezone, email_preferences | Send time + filtering |
| Plan Limits | plan | Feature gates |
| Moderation | moderation_required | Auto-approve vs review |
| Dashboard UI | business_name, plan, plan_status | Display + access control |

**Key insight:** Client profile is the central source of truth. All systems read from it, few systems write to it.

---

### Moderation Status → Multiple Consumers

**A post's `moderation_status` affects:**

| Status | Daily Email | Dashboard | Relay Page | Admin Queue |
|--------|-------------|-----------|------------|-------------|
| pending | ❌ Skip | ⚠️ Show grayed | ⚠️ "Under review" | ✅ Show |
| approved | ✅ Send | ✅ Show active | ✅ Show full | ❌ Hide |
| flagged | ❌ Skip | ⚠️ Show grayed | ❌ 404 | ✅ Show (priority) |
| rejected | ❌ Never send | ❌ Hide | ❌ 404 | ✅ Show (audit) |

**Key insight:** Moderation status is a critical filter. Multiple systems must check it before displaying/sending content.

---

### Plan Tier → Feature Availability

**Plan determines access to features:**

| Feature | Starter | Growth | Pro | Authority |
|---------|---------|--------|-----|-----------|
| Social posts/platform | 30 | 50 | 150 | 150 |
| Landing pages | 3 | 5 | 10 | Unlimited |
| Podcast generation | ❌ | ❌ | ✅ | ✅ |
| YouTube content | ❌ | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |

**Systems that check plan:**
- Content generation (how many posts to create)
- Dashboard UI (show/hide features)
- API routes (enforce limits)
- Billing page (upsell messaging)

**Key insight:** Plan is a feature flag system. Check it before allowing any premium action.

---

### Email Preferences → Email Filtering

**Email types respect preferences:**

| Email Type | Preference Key | Can Disable? |
|------------|----------------|--------------|
| Daily social posts | `daily_posts` | ✅ Yes |
| Monthly reports | `monthly_report` | ✅ Yes |
| Product updates | `product_updates` | ✅ Yes |
| Transactional (welcome, password reset) | N/A | ❌ No (required) |

**Key insight:** Always check `email_preferences` before sending marketing emails. Transactional emails ignore preferences (CAN-SPAM compliant).

---

### Storage Limits → Cleanup Strategy

**Image retention policy:**

| Content Type | Retention | Cleanup Trigger |
|--------------|-----------|-----------------|
| Social post images | 90 days | Weekly cron |
| Landing page drafts | 30 days | Weekly cron |
| Landing page published | Permanent | Never |
| Podcast draft cover | 60 days | Weekly cron |
| Podcast published cover | Permanent | Never |

**Key insight:** Published content is permanent. Drafts and old images are temporary (cost control).

---

## Summary: Critical Dependency Patterns

### 1. **Central Source of Truth: `clients` table**
   - All systems read from it
   - Changes propagate to future content
   - Past content generally protected

### 2. **Moderation is a Gate**
   - Check `moderation_status` before showing/sending
   - Multiple systems must respect it
   - Admin review is the unlock mechanism

### 3. **Plan is a Feature Flag**
   - Check plan before allowing actions
   - Enforce limits consistently
   - UI reflects current plan capabilities

### 4. **Email Preferences are Binary Filters**
   - Check before every marketing email
   - Transactional emails ignore preferences
   - Update immediately affects next cron run

### 5. **Timezone Drives Email Timing**
   - Hourly cron checks which timezones are at 8am
   - Client timezone auto-populated from location
   - Critical for user experience (8am local time)

### 6. **Images are Ephemeral (Except Published)**
   - Old images deleted to save costs
   - Published content images permanent
   - Drafts are temporary

### 7. **Idempotency in All Inngest Jobs**
   - Each step checks if already complete
   - Safe to retry on failure
   - No duplicate side effects

### 8. **RLS Protects Client Data**
   - Clients only see their own data
   - Admin tools use service role
   - Supabase enforces at database level

---

## Next Steps: Store Contracts

With this complete dependency map, we can now:
1. ✅ Create STORE-CONTRACTS.md (what each store/service exposes)
2. ✅ Define API contracts (inputs/outputs)
3. ✅ Build features with complete knowledge of dependencies
4. ✅ Prevent stale UI bugs from day 1

**This dependency map ensures every feature is implemented completely - no missing updates, no stale data, no broken flows.**

---

*PulseAgent Dependency Map - Complete*
*Created March 25, 2026 - CodeBakers V5 Phase 2*
