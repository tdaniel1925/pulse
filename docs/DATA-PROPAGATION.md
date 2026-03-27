# Data Propagation Map

This document shows how **changing data in one place affects other parts of the app**. It traces data changes through the entire system to show cascading effects.

---

## Table of Contents
1. [Database Table Relationships](#database-table-relationships)
2. [Data Change Cascade Effects](#data-change-cascade-effects)
3. [Critical Data Dependencies](#critical-data-dependencies)
4. [Data Consistency Rules](#data-consistency-rules)
5. [Cache Invalidation](#cache-invalidation)

---

## Database Table Relationships

### Entity Relationship Diagram
```
┌─────────────────┐
│ users (Auth)    │
└────────┬────────┘
         │ 1
         │
         │ 1
┌────────▼────────────────────┐
│ clients                     │
│ - user_id (FK)              │
│ - plan                      │
│ - plan_status               │
│ - selected_platforms[]      │
│ - square_customer_id        │
│ - square_subscription_id    │
│ - provisioning_complete     │
└────────┬────────────────────┘
         │ 1
         │
         ├─────────┬──────────┬──────────┐
         │ *       │ *        │ *        │ *
         │         │          │          │
┌────────▼──────┐ │  ┌───────▼──────┐  │  ┌──────▼──────┐
│ social_posts  │ │  │landing_pages │  │  │provision_log│
│ - client_id   │ │  │ - client_id  │  │  │ - client_id │
│ - platform    │ │  │ - slug       │  │  │ - status    │
│ - post_copy   │ │  │ - headline   │  │  │ - payload   │
│ - image_urls  │ │  │ - hero_image │  │  └─────────────┘
│ - status      │ │  │ - published  │  │
│ - batch_month │ │  └──────────────┘  │
└───────────────┘ │                    │
                  │                    │
         ┌────────▼──────┐    ┌────────▼──────┐
         │generation_log │    │ email_log     │
         │ - client_id   │    │ - client_id   │
         │ - job_type    │    │ - email_type  │
         │ - status      │    │ - sent_at     │
         └───────────────┘    └───────────────┘
```

---

## Data Change Cascade Effects

### 1. Changing `clients.plan` (Plan Upgrade/Downgrade)

**Trigger**: User upgrades from Starter → Pro

**Data Changes**:
```
clients table:
  plan: 'starter' → 'pro' ✏️

Cascading Effects:
  ↓
┌─────────────────────────────────────────────────────────┐
│ 1. Content Generation Limits Change                    │
│    - lib/config/plans.ts reads new plan                │
│    - Posts per platform: 30 → 90                       │
│    - Landing pages allowed: 3 → 10                     │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Next Monthly Generation Affected                    │
│    - lib/inngest/monthly-generation.ts                 │
│    - Will generate 90 posts instead of 30              │
│    - More AI API calls = higher cost                   │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Dashboard UI Changes                                │
│    - app/(dashboard)/dashboard/page.tsx                │
│    - Plan badge updates: "Starter" → "Pro"             │
│    - Feature availability changes (custom branding)    │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Square Subscription Update Required                 │
│    - lib/services/square.ts → updateSubscription()     │
│    - Monthly billing: $79 → $299                       │
└─────────────────────────────────────────────────────────┘
```

**Affected Areas**:
- ✅ Content generation limits (immediate)
- ✅ Dashboard display (immediate)
- ✅ Next month's content batch (future)
- ✅ Monthly billing amount (future)
- ⚠️ Existing posts NOT affected (historical data)

---

### 2. Changing `clients.selected_platforms` (Add/Remove Platform)

**Trigger**: User adds Instagram to their platforms

**Data Changes**:
```
clients table:
  selected_platforms: ['linkedin', 'facebook']
                   → ['linkedin', 'facebook', 'instagram'] ✏️

Cascading Effects:
  ↓
┌─────────────────────────────────────────────────────────┐
│ 1. Social Post Generation                              │
│    - lib/inngest/monthly-generation.ts                 │
│    - Now generates posts for 3 platforms (was 2)       │
│    - Instagram posts: 0 → 90 per month                 │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Image Resizing                                      │
│    - lib/services/sharp-resize.ts                      │
│    - Now creates Instagram size: 1080×1080             │
│    - Storage usage increases                           │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Social Calendar View                                │
│    - app/(dashboard)/social/page.tsx                   │
│    - Shows Instagram filter option                     │
│    - Posts grouped by new platform                     │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Daily Email Content                                 │
│    - lib/inngest/daily-email.ts                        │
│    - Includes Instagram posts in email                 │
│    - Email template expands for 3 platforms            │
└─────────────────────────────────────────────────────────┘
```

**Affected Areas**:
- ✅ Next monthly generation (future)
- ✅ Image storage costs (future)
- ✅ Dashboard UI (immediate)
- ✅ Daily emails (future)
- ⚠️ Existing posts for old platforms NOT removed

---

### 3. Changing `clients.brand_voice` (Tone Change)

**Trigger**: User changes brand voice from "professional" → "casual"

**Data Changes**:
```
clients table:
  brand_voice: 'professional' → 'casual' ✏️

Cascading Effects:
  ↓
┌─────────────────────────────────────────────────────────┐
│ 1. AI Content Generation Prompts                      │
│    - lib/services/claude.ts                            │
│    - System prompts change tone                        │
│    - Post copy becomes more conversational             │
│    - Emoji usage may increase                          │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Future Social Posts                                │
│    - lib/inngest/monthly-generation.ts                 │
│    - Next batch uses new voice                         │
│    - Existing posts keep old voice                     │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Landing Page Content                                │
│    - lib/services/claude.ts                            │
│    - New pages use casual tone                         │
│    - Headlines less formal                             │
│    - CTAs more friendly                                │
└─────────────────────────────────────────────────────────┘
```

**Affected Areas**:
- ✅ Future content generation (all new posts/pages)
- ❌ Existing posts (NOT regenerated)
- ❌ Historical landing pages (NOT updated)

**Important**: This is a **forward-only** change. Old content stays the same.

---

### 4. Changing `clients.plan_status` (Active ↔ Cancelled)

**Trigger**: Payment fails or subscription cancelled

**Data Changes**:
```
clients table:
  plan_status: 'active' → 'past_due' or 'cancelled' ✏️

Cascading Effects:
  ↓
┌─────────────────────────────────────────────────────────┐
│ 1. Content Generation Stops                           │
│    - lib/inngest/monthly-generation.ts                 │
│    - Client skipped: WHERE plan_status = 'active'      │
│    - No new posts generated                            │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Email Delivery Stops                               │
│    - lib/inngest/daily-email.ts                        │
│    - Client filtered out                               │
│    - No daily post emails sent                         │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Dashboard Access (View-Only)                       │
│    - app/(dashboard)/layout.tsx                        │
│    - Banner: "Your subscription is past due"           │
│    - Create buttons disabled                           │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Existing Data Still Accessible                     │
│    - social_posts table (read-only)                    │
│    - landing_pages table (read-only)                   │
│    - User can view but not create                      │
└─────────────────────────────────────────────────────────┘
```

**Affected Areas**:
- ✅ Content generation (stops)
- ✅ Email delivery (stops)
- ✅ Create/edit features (disabled)
- ✅ View-only access (still works)
- ⚠️ Existing content preserved (not deleted)

---

### 5. Changing `social_posts.status` (ready → published → archived)

**Trigger**: User publishes a post manually

**Data Changes**:
```
social_posts table:
  status: 'ready' → 'published' ✏️
  published_at: NULL → '2024-03-27T10:00:00Z' ✏️

Cascading Effects:
  ↓
┌─────────────────────────────────────────────────────────┐
│ 1. Social Calendar View                                │
│    - app/(dashboard)/social/page.tsx                   │
│    - Post moves from "Ready" → "Published" section     │
│    - Badge color changes: yellow → green               │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Dashboard Stats                                     │
│    - app/(dashboard)/dashboard/page.tsx                │
│    - "Posts Published This Month" counter +1           │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Daily Email Exclusion                              │
│    - lib/inngest/daily-email.ts                        │
│    - WHERE status = 'ready' (excludes published)       │
│    - Won't appear in tomorrow's email                  │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Monthly Report                                      │
│    - Future monthly report email                       │
│    - Includes in "Posts Published" section             │
└─────────────────────────────────────────────────────────┘
```

**Affected Areas**:
- ✅ UI badges/filters (immediate)
- ✅ Dashboard stats (immediate)
- ✅ Email delivery logic (future)
- ✅ Analytics/reports (future)

---

### 6. Changing `landing_pages.published` (draft → live)

**Trigger**: Admin approves and publishes landing page

**Data Changes**:
```
landing_pages table:
  published: false → true ✏️
  published_at: NULL → '2024-03-27T10:00:00Z' ✏️

Cascading Effects:
  ↓
┌─────────────────────────────────────────────────────────┐
│ 1. Public URL Becomes Accessible                      │
│    - Middleware checks: WHERE published = true         │
│    - Page now visible to public at /p/{slug}           │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Pages List UI                                       │
│    - app/(dashboard)/pages/page.tsx                    │
│    - Badge: "Draft" → "Live"                           │
│    - View button → public URL instead of preview       │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Plan Limits Enforced                               │
│    - lib/config/plans.ts                               │
│    - canCreateLandingPage() counts published pages     │
│    - May block new page creation if at limit           │
└─────────────────────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────────────────────┐
│ 4. SEO/Analytics Start Tracking                       │
│    - Search engines can index                          │
│    - Analytics tracking begins                         │
└─────────────────────────────────────────────────────────┘
```

**Affected Areas**:
- ✅ Public accessibility (immediate)
- ✅ Dashboard UI (immediate)
- ✅ Plan limit calculations (immediate)
- ✅ SEO indexing (future - crawlers)

---

## Critical Data Dependencies

### Client Profile → Everything
```
clients table is the CENTRAL HUB

Changes to clients.* affect:
├── Content generation (plan, brand_voice, platforms)
├── Payment processing (square_customer_id, plan_status)
├── Email delivery (email_preferences, unsubscribed_at)
├── UI display (business_name, industry)
├── Access control (provisioning_complete, plan_status)
└── Storage quotas (plan tier)
```

**Rule**: ANY change to `clients` table may have **system-wide effects**.

---

### Plan Tier → Content Limits
```
clients.plan affects:
├── lib/config/plans.ts
│   ├── postsPerPlatform (30/60/90/150)
│   ├── landingPages (3/5/10/unlimited)
│   └── platforms (2/3/5/unlimited)
│
├── lib/inngest/monthly-generation.ts
│   └── Loop count for post generation
│
├── app/api/generate/page/route.ts
│   └── Block if limit reached
│
└── All dashboard pages
    └── Display limits and usage
```

**Rule**: Changing plan tier **immediately** affects what user can create.

---

### Platform Selection → Image Pipeline
```
clients.selected_platforms affects:
├── lib/services/sharp-resize.ts
│   └── Which sizes to generate
│
├── lib/inngest/monthly-generation.ts
│   └── How many post variants
│
├── Supabase Storage
│   └── Storage usage (more platforms = more images)
│
└── app/(dashboard)/social/page.tsx
    └── Filter options
```

**Rule**: Adding platforms **increases storage and AI costs**.

---

### Moderation Status → Content Visibility
```
moderation_status ('approved' | 'pending' | 'flagged') affects:
├── Daily email delivery
│   └── Only 'approved' posts included
│
├── Auto-publish eligibility
│   └── 'flagged' requires manual review
│
├── Dashboard warnings
│   └── Shows alert for 'pending' or 'flagged'
│
└── Content generation flow
    └── Pauses if too many 'flagged'
```

**Rule**: Moderation status **controls content release**.

---

## Data Consistency Rules

### Rule 1: User → Client (One-to-One)
```sql
-- One auth user = one client record
SELECT COUNT(*) FROM clients WHERE user_id = 'user-123';
-- Result: 1 (always)
```

**Enforcement**:
- Created during signup/provisioning
- Foreign key constraint
- Unique constraint on `user_id`

**Violation Effect**: Login fails, dashboard errors

---

### Rule 2: Active Client → Active Subscription
```sql
-- Active plan status requires valid Square subscription
SELECT * FROM clients
WHERE plan_status = 'active'
  AND square_subscription_id IS NULL;
-- Result: 0 rows (should be empty)
```

**Enforcement**:
- Square webhook updates both together
- Business logic validation

**Violation Effect**: Billing issues, content generation may continue erroneously

---

### Rule 3: Published Page → Unique Slug
```sql
-- No two published pages can have same slug
SELECT slug, COUNT(*) FROM landing_pages
WHERE published = true
  AND client_id = 'client-123'
GROUP BY slug
HAVING COUNT(*) > 1;
-- Result: 0 rows (should be empty)
```

**Enforcement**:
- Slug generation with conflict handling
- Unique constraint on `(client_id, slug, published)`

**Violation Effect**: 404 errors, routing conflicts

---

### Rule 4: Post Images → Storage Files
```sql
-- Every image URL must point to valid storage file
SELECT id FROM social_posts
WHERE image_url_raw IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM storage.objects
    WHERE name = image_url_raw
  );
-- Result: 0 rows (should be empty)
```

**Enforcement**:
- Transaction: upload image → save URL
- Cleanup job removes orphaned files

**Violation Effect**: Broken images in UI/emails

---

### Rule 5: Email Preferences → Deliverability
```sql
-- Unsubscribed clients don't get emails
SELECT * FROM clients
WHERE unsubscribed_at IS NOT NULL
  AND (
    email_preferences->>'daily_posts' = 'true' OR
    email_preferences->>'monthly_report' = 'true'
  );
-- Result: 0 rows (should be empty)
```

**Enforcement**:
- Email job WHERE filter
- Preference update sets `unsubscribed_at`

**Violation Effect**: Legal issues (CAN-SPAM), user complaints

---

## Cache Invalidation

### When to Invalidate Caches

#### 1. Client Profile Changes
```
Change: clients.business_name or clients.brand_voice
Invalidate:
├── Next.js page cache for dashboard
├── Next.js route cache for /dashboard/settings
└── Any AI prompt caches (if implemented)
```

#### 2. Plan Changes
```
Change: clients.plan or clients.plan_status
Invalidate:
├── Dashboard stats cache
├── Feature availability cache
└── Billing display cache
```

#### 3. Content Status Changes
```
Change: social_posts.status or landing_pages.published
Invalidate:
├── Social calendar view cache
├── Pages list cache
├── Dashboard stats cache
└── Public page cache (if published)
```

#### 4. Platform Changes
```
Change: clients.selected_platforms
Invalidate:
├── Social calendar filters cache
├── Image generation cache
└── Email template cache
```

---

## Data Propagation Examples

### Example 1: Complete Plan Upgrade Flow
```
USER ACTION: Upgrades plan via Square
    ↓
1. Square webhook received
   ├─ app/api/webhooks/square/route.ts
   └─ Data: { subscription_id, plan_variation_id }
    ↓
2. Update clients table
   ├─ SET plan = 'pro'
   ├─ SET square_subscription_id = '...'
   └─ SET plan_status = 'active'
    ↓
3. Propagation begins:
   ├─→ lib/config/plans.ts
   │   └─ getPostsPerPlatform() now returns 90
   │
   ├─→ app/(dashboard)/dashboard/page.tsx (revalidated)
   │   └─ Shows "Pro Plan" badge
   │
   ├─→ app/(dashboard)/pages/page.tsx (revalidated)
   │   └─ Shows "7/10 pages created"
   │
   └─→ lib/inngest/monthly-generation.ts (next run)
       └─ Will generate 90 posts instead of 30
    ↓
4. User sees:
   ├─ Dashboard updates immediately
   ├─ Can create more pages immediately
   └─ Next month gets more posts
```

### Example 2: Platform Addition Ripple
```
USER ACTION: Adds Instagram to platforms
    ↓
1. Update clients table
   └─ selected_platforms = [...existing, 'instagram']
    ↓
2. Immediate effects:
   ├─→ app/(dashboard)/social/page.tsx
   │   └─ Instagram filter appears in dropdown
   │
   └─→ app/(dashboard)/settings/page.tsx
       └─ Shows Instagram in platform list
    ↓
3. Future effects (next cron):
   ├─→ lib/inngest/monthly-generation.ts
   │   ├─ Loops through 3 platforms (was 2)
   │   ├─ Calls Claude for Instagram posts
   │   ├─ Calls Ideogram for Instagram images
   │   └─ Calls Sharp for 1080×1080 resize
   │       ├─ Storage cost +33%
   │       └─ Generation time +33%
   │
   └─→ lib/inngest/daily-email.ts
       └─ Email template expands for 3 platforms
```

### Example 3: Payment Failure Cascade
```
EVENT: Square invoice payment fails
    ↓
1. Square webhook received
   └─ Event: invoice.payment_failed
    ↓
2. Update clients table
   ├─ SET plan_status = 'past_due'
   └─ SET last_payment_failed_at = NOW()
    ↓
3. Propagation (immediate):
   ├─→ app/(dashboard)/layout.tsx
   │   └─ Shows warning banner
   │
   └─→ All dashboard pages
       └─ Create buttons disabled
    ↓
4. Propagation (future cron):
   ├─→ lib/inngest/monthly-generation.ts
   │   └─ WHERE plan_status = 'active' (client filtered out)
   │   └─ No new posts generated
   │
   └─→ lib/inngest/daily-email.ts
       └─ Client skipped (no email sent)
    ↓
5. Manual intervention needed:
   └─ Client updates payment method
       └─ Square charges successfully
           └─ Webhook updates plan_status = 'active'
               └─ Everything resumes normally
```

---

## Summary: Data Propagation Principles

### 1. **Central Hub Pattern**
- `clients` table is the source of truth
- Almost all features read from clients
- Changes propagate outward

### 2. **Forward-Only Changes**
- Changing `brand_voice` doesn't update old posts
- Changing `plan` doesn't delete old content
- Historical data preserved

### 3. **Immediate vs Future Effects**
- UI changes: **Immediate** (Next.js revalidation)
- Content generation: **Future** (next cron run)
- Email delivery: **Future** (next scheduled send)

### 4. **No Cascading Deletes**
- Deleting client doesn't auto-delete posts
- Cancelling plan doesn't delete content
- Everything preserved for potential reactivation

### 5. **Status Gates**
- `plan_status` controls feature access
- `moderation_status` controls content visibility
- `published` controls public access
- `provisioning_complete` controls initial setup

---

This map shows exactly how data changes propagate through PulseAgent, enabling better:
- **Debugging**: Trace why something changed
- **Testing**: Know what to verify after changes
- **Architecture**: Understand coupling between features
- **Performance**: Predict impact of data changes
