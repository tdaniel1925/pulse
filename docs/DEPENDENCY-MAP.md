# PulseAgent Dependency Map

Complete visual map of all dependencies, data flows, and integration points in the PulseAgent system.

---

## Table of Contents
1. [External Service Dependencies](#external-service-dependencies)
2. [NPM Package Dependencies](#npm-package-dependencies)
3. [Internal Module Dependencies](#internal-module-dependencies)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Authentication Flow](#authentication-flow)
6. [Content Generation Flow](#content-generation-flow)
7. [Payment & Provisioning Flow](#payment--provisioning-flow)
8. [API Route Dependencies](#api-route-dependencies)
9. [Background Job Dependencies](#background-job-dependencies)

---

## External Service Dependencies

### Core Infrastructure
```
PulseAgent Application
├── Supabase (Database + Auth)
│   ├── PostgreSQL Database
│   ├── Auth (Magic Link + Password)
│   ├── Storage (Images)
│   └── Row Level Security (RLS)
│
├── Vercel (Hosting)
│   ├── Next.js 14 App Router
│   ├── Edge Functions
│   └── Serverless Functions
│
└── Inngest (Background Jobs)
    ├── Cron Schedules
    ├── Event-Driven Jobs
    └── Retries + Error Handling
```

### AI Services
```
Content Generation Pipeline
├── Anthropic Claude (Text Generation)
│   ├── Social post copy
│   ├── Landing page content
│   ├── SEO metadata
│   └── Brand voice adaptation
│
├── OpenAI
│   ├── DALL-E 3 (Hero images for landing pages)
│   └── Moderation API (Content safety)
│
└── Ideogram (Social media images)
    └── Platform-specific image generation
```

### Payment & Communication
```
External Integrations
├── Square Payments
│   ├── Customer management
│   ├── One-time payments (setup fees)
│   ├── Recurring subscriptions
│   └── Webhooks (payment events)
│
├── Resend (Email)
│   ├── Welcome emails
│   ├── Daily post emails
│   ├── Monthly reports
│   └── Transactional emails
│
└── Apex Affinity Group (Partner)
    └── Webhooks (rep provisioning)
```

### Image Processing
```
Sharp (Server-Side)
└── Image resizing for platforms
    ├── Facebook: 1200×630
    ├── Instagram: 1080×1080
    ├── LinkedIn: 1200×627
    ├── Twitter: 1200×675
    ├── YouTube: 1280×720
    └── OG Tags: 1200×630
```

---

## NPM Package Dependencies

### Core Framework
```json
{
  "next": "14.1.0",           // Next.js App Router
  "react": "18.2.0",          // UI framework
  "react-dom": "18.2.0"       // DOM rendering
}
```

### Database & Auth
```json
{
  "@supabase/supabase-js": "2.39.7",  // Supabase client
  "@supabase/ssr": "0.1.0"            // Server-side auth
}
```

### AI Services
```json
{
  "@anthropic-ai/sdk": "0.20.0",  // Claude AI
  "openai": "4.28.0"              // GPT-4, DALL-E, Moderation
}
```

### Payment & Background Jobs
```json
{
  "square": "33.0.0",    // Square Payments SDK
  "inngest": "3.15.0"    // Background job orchestration
}
```

### Utilities
```json
{
  "sharp": "0.33.2",           // Image processing
  "resend": "3.2.0",           // Email service
  "jsonwebtoken": "9.0.3",     // JWT tokens for unsubscribe
  "zod": "3.22.4",             // Schema validation
  "lucide-react": "1.7.0"      // Icon components
}
```

### Development
```json
{
  "typescript": "5.3.3",
  "tailwindcss": "3.4.1",
  "@testing-library/react": "14.2.1",
  "jest": "29.7.0"
}
```

---

## Internal Module Dependencies

### Component Layer
```
app/components/
├── ui/
│   ├── Button.tsx          → No dependencies
│   ├── Card.tsx            → No dependencies
│   ├── Badge.tsx           → No dependencies
│   └── Loading.tsx         → No dependencies
│
├── auth/ (future)
├── dashboard/ (future)
└── forms/ (future)
```

### Page Layer
```
app/
├── (auth)/
│   ├── login/              → Supabase client, UI components
│   └── signup/             → Supabase client, UI components
│
├── (dashboard)/
│   ├── layout.tsx          → Supabase server, middleware auth
│   ├── dashboard/          → Supabase server, config/plans
│   ├── onboarding/         → Supabase client, UI components
│   ├── pages/              → Supabase server
│   ├── social/             → Supabase server
│   ├── settings/           → Supabase client
│   └── unsubscribe/        → Supabase client
│
└── api/
    ├── generate/page/      → All AI services, Supabase admin
    ├── email/preferences/  → Supabase admin, jsonwebtoken
    ├── inngest/            → Inngest client, all jobs
    └── webhooks/
        ├── square/         → Square service, Inngest, Supabase
        └── apex/           → Square service, Supabase
```

### Service Layer
```
lib/services/
├── claude.ts               → @anthropic-ai/sdk
├── dalle.ts                → openai, Supabase storage
├── ideogram.ts             → fetch API
├── moderation.ts           → openai
├── resend.ts               → resend
├── sharp-resize.ts         → sharp, Supabase storage
└── square.ts               → square, crypto
```

### Business Logic Layer
```
lib/
├── config/
│   └── plans.ts            → lib/types
│
├── inngest/
│   ├── client.ts           → inngest
│   ├── monthly-generation.ts  → All services, Supabase
│   ├── daily-email.ts         → Supabase, resend
│   ├── apex-provision.ts      → All services, Supabase
│   └── cleanup-old-images.ts  → Supabase storage
│
├── supabase/
│   ├── admin.ts            → @supabase/supabase-js
│   ├── client.ts           → @supabase/supabase-js
│   └── server.ts           → @supabase/ssr
│
└── types/
    ├── database.ts         → Supabase generated types
    ├── client.ts           → content.ts
    ├── content.ts          → No dependencies
    └── payments.ts         → No dependencies
```

---

## Data Flow Patterns

### 1. Client-Side Data Flow (Browser)
```
User Browser
    ↓
┌─────────────────────────────────────┐
│ Next.js Client Component            │
│ (login, signup, onboarding)         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Supabase Client                     │
│ lib/supabase/client.ts              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Supabase Cloud                      │
│ - Auth                              │
│ - Database (RLS enforced)           │
└─────────────────────────────────────┘
```

### 2. Server-Side Data Flow (SSR)
```
Next.js Server Component
    ↓
┌─────────────────────────────────────┐
│ Supabase Server Client              │
│ lib/supabase/server.ts              │
│ (handles cookies, SSR auth)         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Supabase Cloud                      │
│ - Auth (validates session)          │
│ - Database (RLS enforced)           │
└─────────────────────────────────────┘
    ↓
Rendered HTML sent to browser
```

### 3. API Route Data Flow
```
API Request
    ↓
┌─────────────────────────────────────┐
│ API Route Handler                   │
│ app/api/*/route.ts                  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Supabase Admin Client               │
│ lib/supabase/admin.ts               │
│ (bypasses RLS)                      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ External Services                   │
│ - Claude, DALL-E, Ideogram          │
│ - Square, Resend                    │
└─────────────────────────────────────┘
    ↓
JSON Response
```

### 4. Background Job Data Flow
```
Trigger (Cron or Event)
    ↓
┌─────────────────────────────────────┐
│ Inngest Cloud                       │
│ - Receives event                    │
│ - Schedules execution               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Inngest Function                    │
│ lib/inngest/*.ts                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Services + Supabase Admin           │
│ - Generate content                  │
│ - Store in database                 │
│ - Send emails                       │
└─────────────────────────────────────┘
```

---

## Authentication Flow

### Magic Link Flow
```
1. User enters email
   ↓
2. app/(auth)/login/page.tsx
   │ supabase.auth.signInWithOtp()
   ↓
3. Supabase Auth
   │ Generates magic link
   │ Sends email via Supabase
   ↓
4. User clicks link
   ↓
5. Supabase validates token
   ↓
6. Redirect to /dashboard
```

### Password Flow
```
1. User enters email + password
   ↓
2. app/(auth)/login/page.tsx
   │ supabase.auth.signInWithPassword()
   ↓
3. Supabase Auth
   │ Validates credentials
   │ Creates session
   ↓
4. Session stored in cookie
   ↓
5. Redirect to /dashboard
```

### Session Management
```
middleware.ts
    ↓
Check if route requires auth
    ↓
If protected:
    ├─→ Check Supabase session cookie
    ├─→ Valid: Allow access
    └─→ Invalid: Redirect to /login
```

---

## Content Generation Flow

### Monthly Social Posts (Automated)
```
Trigger: Cron (1st of month, 6am)
    ↓
lib/inngest/monthly-generation.ts
    ↓
For each active client:
    │
    ├─→ 1. Load client profile from Supabase
    │   │   - business_name, industry, brand_voice
    │   │   - selected_platforms
    │   │   - plan tier
    │
    ├─→ 2. Fetch recent topics (60 days)
    │   │   - Avoid duplication
    │
    ├─→ 3. lib/services/claude.ts
    │   │   - generateSocialPosts()
    │   │   - Count based on plan (30/60/90 per platform)
    │
    ├─→ 4. lib/services/moderation.ts
    │   │   - moderateText()
    │   │   - Flag inappropriate content
    │
    ├─→ 5. lib/services/ideogram.ts
    │   │   - generateSocialImage()
    │   │   - Upload to Supabase Storage
    │
    ├─→ 6. lib/services/sharp-resize.ts
    │   │   - resizeForPlatforms()
    │   │   - Create platform-specific sizes
    │
    ├─→ 7. Build share URLs
    │   │   - Facebook, LinkedIn, Twitter
    │   │   - Relay page URLs
    │
    └─→ 8. Save to social_posts table
        └─→ Status: 'ready' or 'pending' (if moderated)
```

### On-Demand Landing Page
```
User clicks "Generate Page"
    ↓
app/api/generate/page/route.ts
    ↓
1. Auth check
   │ - Validate session
   │ - Load client profile
   ↓
2. Plan limit check
   │ - lib/config/plans.ts
   │ - canCreateLandingPage()
   ↓
3. lib/services/claude.ts
   │ - generateLandingPageContent()
   │ - headline, body, SEO, CTA
   ↓
4. lib/services/dalle.ts
   │ - generateHeroImage()
   │ - Upload to Supabase Storage
   ↓
5. lib/services/sharp-resize.ts
   │ - resizeForOG()
   │ - OpenGraph image
   ↓
6. lib/services/moderation.ts
   │ - moderateMultipleFields()
   ↓
7. Save to landing_pages table
   │ - published: false (draft)
   │ - moderation_status
   ↓
8. Return page preview URL
```

---

## Payment & Provisioning Flow

### New Client Signup (Apex Rep)
```
1. Apex sends webhook
   ↓
app/api/webhooks/apex/route.ts
    ↓
    ├─→ Verify shared secret
    ├─→ Create Supabase Auth user
    ├─→ lib/services/square.ts → createCustomer()
    ├─→ Save to clients table
    │       - plan: 'starter'
    │       - plan_status: 'trialing'
    │       - provisioning_complete: false
    └─→ Log to provision_log
```

### Setup Fee Payment
```
1. Client pays setup fee via Square
   ↓
2. Square sends webhook
   ↓
app/api/webhooks/square/route.ts
    ↓
    ├─→ Verify HMAC signature
    │   lib/services/square.ts → verifyWebhookSignature()
    │
    ├─→ Mark setup_fee_paid: true
    │
    ├─→ lib/services/square.ts → createSubscription()
    │   Create monthly recurring subscription
    │
    └─→ Send Inngest event: 'apex/rep.provision'
```

### Automated Provisioning
```
Inngest receives 'apex/rep.provision' event
    ↓
lib/inngest/apex-provision.ts
    ↓
    ├─→ 1. Validate client + setup fee
    │
    ├─→ 2. Generate 30 social posts per platform
    │   │   - lib/services/claude.ts
    │   │   - lib/services/ideogram.ts
    │   │   - lib/services/sharp-resize.ts
    │   │   - lib/services/moderation.ts
    │
    ├─→ 3. Generate welcome landing page
    │   │   - lib/services/claude.ts
    │   │   - lib/services/dalle.ts
    │
    ├─→ 4. lib/services/resend.ts
    │   │   - sendWelcomeEmail()
    │   │   - Include dashboard link
    │   │   - Include referral link
    │
    └─→ 5. Mark provisioning_complete: true
```

### Subscription Events
```
Square Webhook Events:
    │
    ├─→ subscription.created
    │   └─→ Update square_subscription_id
    │
    ├─→ invoice.payment_made (monthly)
    │   └─→ Set plan_status: 'active'
    │
    ├─→ invoice.payment_failed
    │   └─→ Set plan_status: 'past_due'
    │       Send notification email
    │
    └─→ subscription.updated (plan change)
        └─→ Update plan tier
            Adjust content limits
```

---

## API Route Dependencies

### `/api/generate/page` (Landing Page Generation)
```
Dependencies:
├── @/lib/supabase/server      (Auth check)
├── @/lib/supabase/admin       (Database operations)
├── @/lib/services/claude      (Content generation)
├── @/lib/services/dalle       (Hero image)
├── @/lib/services/sharp-resize (OG image)
├── @/lib/services/moderation  (Content safety)
└── @/lib/config/plans         (Limit checking)

Environment Variables:
├── ANTHROPIC_API_KEY
├── OPENAI_API_KEY
├── NEXT_PUBLIC_SUPABASE_URL
└── SUPABASE_SERVICE_ROLE_KEY
```

### `/api/webhooks/square` (Payment Events)
```
Dependencies:
├── @/lib/supabase/admin       (Database operations)
├── @/lib/services/square      (Signature verify, subscriptions)
├── @/lib/inngest/client       (Trigger provisioning)
└── crypto                      (HMAC verification)

Environment Variables:
├── SQUARE_WEBHOOK_SIGNATURE_KEY
├── SQUARE_ACCESS_TOKEN
├── SQUARE_LOCATION_ID
└── SUPABASE_SERVICE_ROLE_KEY
```

### `/api/webhooks/apex` (Rep Provisioning)
```
Dependencies:
├── @/lib/supabase/admin       (Auth user creation, database)
├── @/lib/services/square      (Create customer)
└── @/lib/inngest/client       (Future provisioning trigger)

Environment Variables:
├── APEX_WEBHOOK_SECRET
├── SQUARE_ACCESS_TOKEN
└── SUPABASE_SERVICE_ROLE_KEY
```

### `/api/email/preferences` (Unsubscribe Management)
```
Dependencies:
├── @/lib/supabase/admin       (Database operations)
└── jsonwebtoken               (Token verification)

Environment Variables:
├── JWT_SECRET
└── SUPABASE_SERVICE_ROLE_KEY
```

### `/api/inngest` (Background Job Registration)
```
Dependencies:
├── inngest/next               (Serve handler)
├── @/lib/inngest/client       (Inngest client)
└── All background job files:
    ├── monthly-generation.ts
    ├── daily-email.ts
    ├── apex-provision.ts
    └── cleanup-old-images.ts

Environment Variables:
├── INNGEST_EVENT_KEY
└── INNGEST_SIGNING_KEY
```

---

## Background Job Dependencies

### `monthly-generation` (Cron: 1st of month, 6am)
```
Dependencies:
├── @/lib/supabase/admin
├── @/lib/services/claude       (Social posts)
├── @/lib/services/ideogram     (Images)
├── @/lib/services/sharp-resize (Platform resizing)
├── @/lib/services/moderation   (Content safety)
└── @/lib/config/plans          (Posts per platform)

Data Sources:
├── clients table (active clients)
└── social_posts table (recent topics for dedup)

Data Outputs:
├── social_posts table (bulk insert)
├── generation_log table (job tracking)
└── Supabase Storage (images)
```

### `daily-email` (Cron: Daily, 9am client timezone)
```
Dependencies:
├── @/lib/supabase/admin
└── @/lib/services/resend       (Email delivery)

Data Sources:
├── clients table (email preferences)
├── social_posts table (posts scheduled for today)
└── Supabase Storage (image URLs)

Data Outputs:
├── Email sent to client
└── generation_log table (email tracking)
```

### `apex-provision` (Event: 'apex/rep.provision')
```
Dependencies:
├── @/lib/supabase/admin
├── @/lib/services/claude       (Posts + landing page)
├── @/lib/services/ideogram     (Social images)
├── @/lib/services/dalle        (Hero image)
├── @/lib/services/sharp-resize (All resizing)
├── @/lib/services/moderation   (Content safety)
└── @/lib/services/resend       (Welcome email)

Data Sources:
├── clients table (client profile)
└── Event payload (client_id)

Data Outputs:
├── social_posts table (30 posts per platform)
├── landing_pages table (welcome page)
├── Supabase Storage (images)
├── provision_log table (status tracking)
└── Welcome email sent
```

### `cleanup-old-images` (Cron: Weekly, Sunday 2am)
```
Dependencies:
├── @/lib/supabase/admin
└── Supabase Storage API

Data Sources:
├── social_posts table (posts older than 90 days)
└── Supabase Storage (image files)

Data Outputs:
└── Deleted image files (cost optimization)
```

---

## Critical Dependency Chains

### Chain 1: User Signup → Content Ready
```
1. Apex webhook
2. Create Auth user + Square customer
3. Square setup fee payment
4. Square webhook
5. Create subscription
6. Trigger Inngest provisioning
7. Generate 30 posts × platforms
8. Generate welcome page
9. Send welcome email
10. Client receives email with login link
```
**Total Time**: 5-10 minutes
**Critical Services**: Apex, Square, Supabase, Claude, Ideogram, DALL-E, Resend, Inngest

### Chain 2: Monthly Content Generation
```
1. Cron trigger (1st of month)
2. Load all active clients
3. For each client:
   a. Generate posts (Claude)
   b. Generate images (Ideogram)
   c. Resize images (Sharp)
   d. Moderate content (OpenAI)
   e. Save to database
4. Log generation metrics
```
**Total Time**: 2-5 hours for 1000 clients
**Critical Services**: Inngest, Supabase, Claude, Ideogram, OpenAI

### Chain 3: Landing Page Generation
```
1. User request
2. Auth validation
3. Plan limit check
4. Generate content (Claude)
5. Generate hero image (DALL-E)
6. Resize OG image (Sharp)
7. Moderate content (OpenAI)
8. Save to database
9. Return preview URL
```
**Total Time**: 15-30 seconds
**Critical Services**: Supabase, Claude, DALL-E, OpenAI

---

## Environment Variable Matrix

| Service | Required Env Vars | Used By |
|---------|------------------|---------|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br>`SUPABASE_SERVICE_ROLE_KEY` | All pages, API routes, jobs |
| **Claude** | `ANTHROPIC_API_KEY` | Content generation |
| **OpenAI** | `OPENAI_API_KEY` | DALL-E, Moderation |
| **Ideogram** | `IDEOGRAM_API_KEY` | Social images |
| **Square** | `SQUARE_ACCESS_TOKEN`<br>`SQUARE_LOCATION_ID`<br>`SQUARE_WEBHOOK_SIGNATURE_KEY`<br>`SQUARE_ENVIRONMENT`<br>8× Catalog/Plan IDs | Payment webhooks, subscriptions |
| **Resend** | `RESEND_API_KEY`<br>`RESEND_FROM_EMAIL`<br>`RESEND_FROM_NAME` | Email delivery |
| **Inngest** | `INNGEST_EVENT_KEY`<br>`INNGEST_SIGNING_KEY` | Background jobs |
| **App** | `NEXT_PUBLIC_APP_URL`<br>`APEX_WEBHOOK_SECRET`<br>`JWT_SECRET` | URLs, webhooks, tokens |

---

## Failure Mode Analysis

### If Supabase is down:
- ❌ All authentication fails
- ❌ All data operations fail
- ✅ Static pages still serve

### If Claude is down:
- ❌ Content generation fails
- ✅ Existing content still accessible
- ⚠️ Use fallback prompts or queue for retry

### If DALL-E is down:
- ❌ Landing page hero images fail
- ✅ Can proceed without images (manual upload later)

### If Ideogram is down:
- ❌ Social post images fail
- ✅ Can generate text-only posts
- ⚠️ Queue images for retry

### If Square is down:
- ❌ Payment processing fails
- ❌ New signups blocked
- ✅ Existing subscriptions continue

### If Inngest is down:
- ❌ Background jobs don't run
- ✅ Can trigger manually via API
- ⚠️ Jobs will retry when service recovers

### If Resend is down:
- ❌ Emails don't send
- ✅ Content still generated
- ⚠️ Queue emails for retry

---

## Performance Optimization Points

### 1. Image Generation (Slowest)
- DALL-E: 10-30 seconds per image
- Ideogram: 5-15 seconds per image
- **Optimization**: Run in parallel, cache prompts

### 2. Content Generation
- Claude: 2-5 seconds per post
- **Optimization**: Batch requests, reuse context

### 3. Database Queries
- Supabase: 50-200ms per query
- **Optimization**: Use server components, batch inserts

### 4. Image Resizing
- Sharp: 100-500ms per image
- **Optimization**: Run in background, use CDN

---

## Security Boundaries

### Public Access
- Marketing page (/)
- Login/Signup pages
- Public relay pages (/p/[postId])

### Authenticated Access
- All dashboard pages
- Settings
- Content management

### Admin Access
- API routes (service role key)
- Background jobs (service role key)
- Webhook handlers (signature verification)

### External Access
- Webhooks (HMAC verification)
- Supabase RLS (row-level security)
- API rate limiting (future)

---

This dependency map provides a complete view of how all parts of PulseAgent connect and depend on each other. Use it for debugging, onboarding, and architecture decisions.
