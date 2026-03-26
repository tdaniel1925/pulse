# End-to-End Test Specifications

**PulseAgent - Phase 5 Testing**
**Based on:** DEPENDENCY-MAP.md - Complete Flow Testing
**Created:** March 25, 2026

---

## Overview

This document outlines end-to-end test scenarios for PulseAgent. Each test validates complete user journeys through the application, ensuring all dependencies from DEPENDENCY-MAP.md are correctly implemented.

---

## Test Framework Recommendation

### Playwright (Recommended)

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Why Playwright:**
- Cross-browser testing (Chrome, Firefox, Safari)
- Auto-wait for elements
- Network interception
- Screenshot/video recording
- Parallel execution

---

## E2E Test Scenarios

### 1. User Authentication Flow

**Test:** `e2e/auth/signup-login.spec.ts`

**Scenario:** New user signs up and logs in

**Steps:**
1. Navigate to `/signup`
2. Enter email: `test@example.com`
3. Enter business name: `Test Business`
4. Select industry: `saas`
5. Submit form
6. Verify "Check your email" message
7. Open magic link (mock email)
8. Verify redirect to `/dashboard`
9. Verify session cookie set
10. Verify user sees dashboard

**Expected Results:**
- ✅ User created in `auth.users`
- ✅ Client created in `clients` table
- ✅ Session established
- ✅ Dashboard loads with empty state

**Dependencies Tested:**
- Auth → Client creation
- Session management
- Protected route middleware

---

### 2. Landing Page Generation Flow

**Test:** `e2e/content/landing-page-generation.spec.ts`

**Scenario:** User generates their first landing page

**Steps:**
1. Login as existing user
2. Navigate to `/dashboard/pages`
3. Click "Create New Page"
4. Fill form:
   - Target keyword: `saas workflow automation`
   - Additional context: `Focus on small business productivity`
5. Submit form
6. Wait for generation (loading state)
7. Verify success message
8. Verify page appears in list
9. Click to view page
10. Verify content rendered

**Expected Results:**
- ✅ API call to `/api/generate/page`
- ✅ Claude API called for content
- ✅ DALL-E API called for hero image
- ✅ Hero image uploaded to storage
- ✅ OG image resized (1200×630)
- ✅ Content moderated
- ✅ Landing page saved with `moderation_status`
- ✅ generation_log entry created
- ✅ Page shown with correct status badge

**Dependencies Tested:**
- Content generation → AI services
- Image generation → Storage
- Moderation → Status display
- Plan limits → Create button state

---

### 3. Social Posts Calendar Flow

**Test:** `e2e/content/social-calendar.spec.ts`

**Scenario:** User views social posts calendar

**Steps:**
1. Login as client with posts
2. Navigate to `/dashboard/social`
3. Verify posts grouped by date
4. Verify platform badges
5. Verify moderation status badges
6. Filter by platform: `linkedin`
7. Verify only LinkedIn posts shown
8. Click "Share" on approved post
9. Verify relay URL copied
10. Open relay URL in new tab
11. Verify Open Graph tags loaded

**Expected Results:**
- ✅ Posts loaded from `social_posts`
- ✅ Grouped by `scheduled_date`
- ✅ Platform filter works
- ✅ Moderation badges correct
- ✅ Share button only on approved posts
- ✅ Relay page loads at `/p/[postId]`
- ✅ OG tags match platform
- ✅ Platform-specific image shown

**Dependencies Tested:**
- Dashboard → Database query
- Moderation status → UI display
- Selected platforms → Filter options
- Relay pages → OG tag generation

---

### 4. Email Preferences Flow

**Test:** `e2e/email/preferences-management.spec.ts`

**Scenario:** User manages email preferences (CAN-SPAM compliance)

**Steps:**
1. Login as existing user
2. Navigate to `/dashboard/settings`
3. Scroll to email preferences
4. Uncheck "Daily social posts"
5. Verify auto-save indicator
6. Wait for save confirmation
7. Logout
8. Open unsubscribe link (mock email)
9. Verify current preferences shown
10. Toggle "Monthly performance reports"
11. Click "Save Preferences"
12. Verify success message
13. Login again
14. Navigate to settings
15. Verify preferences persisted

**Expected Results:**
- ✅ Settings page loads preferences
- ✅ Auto-save triggers on change
- ✅ Preferences updated in `clients.email_preferences`
- ✅ JWT token valid for unsubscribe page
- ✅ Unsubscribe page loads preferences
- ✅ POST to `/api/email/preferences` succeeds
- ✅ Preferences persist across sessions
- ✅ Daily email job respects `daily_posts` preference

**Dependencies Tested:**
- Email preferences → Daily email job
- JWT token → Unsubscribe page
- Settings UI → Database update
- CAN-SPAM compliance

---

### 5. Monthly Content Generation Flow

**Test:** `e2e/jobs/monthly-generation.spec.ts`

**Scenario:** Monthly content generation job runs

**Steps:**
1. Trigger Inngest job manually (dev mode)
2. Wait for job completion
3. Verify logs show:
   - Clients loaded
   - Posts generated per platform
   - Images created
   - Moderation completed
   - Posts saved
4. Check database:
   - `social_posts` has new posts
   - `generation_log` has entries
   - Posts have correct `batch_month`
5. Verify post count matches plan limit
6. Verify only selected platforms generated

**Expected Results:**
- ✅ Job runs successfully
- ✅ Posts generated = plan limit × selected platforms
- ✅ All posts have moderation status
- ✅ All posts have platform-specific images
- ✅ Relay URLs built correctly
- ✅ No duplicate topics
- ✅ generation_log tracks API usage

**Dependencies Tested:**
- Plan limits → Post count
- Selected platforms → Generation
- Moderation → Status assignment
- Image generation → Storage
- Batch month → Filtering

---

### 6. Daily Email Delivery Flow

**Test:** `e2e/jobs/daily-email-delivery.spec.ts`

**Scenario:** Daily email job sends posts at 8am local time

**Steps:**
1. Set up test client:
   - Timezone: `America/New_York`
   - Email preferences: all enabled
   - Has approved posts for today
2. Mock current time to 8:00 AM EST
3. Trigger Inngest job
4. Verify email sent via Resend
5. Check email content:
   - Platform-specific posts
   - Correct images
   - Share buttons present
   - Unsubscribe link present
6. Verify `email_sent_at` updated
7. Change client timezone to `Europe/London`
8. Run job again
9. Verify no email sent (not 8am in London)

**Expected Results:**
- ✅ Timezone calculation correct
- ✅ Only clients at 8am receive emails
- ✅ Email contains approved posts only
- ✅ Platform images match platform
- ✅ Share URLs correct
- ✅ Unsubscribe link has valid JWT
- ✅ `email_sent_at` timestamp saved
- ✅ Preference `daily_posts=false` prevents send

**Dependencies Tested:**
- Timezone → Email timing
- Moderation status → Email content
- Email preferences → Send decision
- Scheduled date → Post selection

---

### 7. Payment Webhook Flow

**Test:** `e2e/webhooks/square-payment.spec.ts`

**Scenario:** Square payment webhook updates subscription

**Steps:**
1. Create test client with `plan_status='pending'`
2. Send POST to `/api/webhooks/square`:
   - Event: `subscription.created`
   - Customer ID matches client
   - Plan: `pro`
3. Verify webhook signature validation
4. Verify response 200
5. Check database:
   - `plan` updated to `pro`
   - `plan_status` = `active`
   - `subscription_id` saved
6. Send invoice.payment_failed webhook
7. Check database:
   - `plan_status` = `past_due`
8. Login as client
9. Verify past_due banner shown

**Expected Results:**
- ✅ Signature validation passes
- ✅ Client updated correctly
- ✅ Plan change triggers UI update
- ✅ Past due status shows banner
- ✅ Invalid signature rejected (401)

**Dependencies Tested:**
- Payment → Plan update
- Plan status → Dashboard banner
- Plan → Feature availability
- Webhook security → Signature verification

---

### 8. Apex Provisioning Flow

**Test:** `e2e/webhooks/apex-provision.spec.ts`

**Scenario:** Apex webhook provisions new client

**Steps:**
1. Send POST to `/api/webhooks/apex`:
   - Business name: `New Apex Client`
   - Email: `apex@example.com`
   - Plan: `growth`
   - Rep email: `rep@apex.com`
2. Verify response 200
3. Check database:
   - Client created
   - Auth user created
   - Square customer created
   - Provision log entry created
4. Verify Inngest job triggered
5. Wait for provisioning complete
6. Check database:
   - 50 posts per platform created (growth plan)
   - Welcome landing page created
   - Email sent to client
7. Open magic link (mock email)
8. Verify client can login

**Expected Results:**
- ✅ Complete client setup
- ✅ Auth user created
- ✅ Initial content generated
- ✅ Welcome email sent
- ✅ Magic link works
- ✅ Client can access dashboard

**Dependencies Tested:**
- Webhook → Client creation
- Provisioning → Content generation
- Plan → Initial post count
- Auth → Magic link

---

### 9. Content Moderation Flow

**Test:** `e2e/moderation/content-review.spec.ts`

**Scenario:** Content goes through moderation workflow

**Steps:**
1. Create client with `moderation_required=true`
2. Generate landing page
3. Verify page has `moderation_status='pending'`
4. Verify page NOT shown in public list
5. Login as admin (future feature)
6. View moderation queue
7. Approve page
8. Verify `moderation_status='approved'`
9. Login as client
10. Verify page now visible
11. Generate post with flagged content
12. Verify post has `moderation_status='flagged'`
13. Verify post NOT in daily email
14. Verify relay page shows "under review"

**Expected Results:**
- ✅ New clients require manual review
- ✅ Pending content hidden from public
- ✅ Approved content shown
- ✅ Flagged content quarantined
- ✅ Daily email skips unapproved posts
- ✅ Relay pages respect moderation status

**Dependencies Tested:**
- Moderation required → Status assignment
- Moderation status → UI visibility
- Moderation status → Email inclusion
- Moderation status → Relay page display

---

### 10. Plan Limits and Upgrades

**Test:** `e2e/plans/limit-enforcement.spec.ts`

**Scenario:** Plan limits enforced across features

**Steps:**
1. Login as starter plan client
2. Navigate to `/dashboard/pages`
3. Create 3 landing pages (starter limit)
4. Verify "Create New Page" button disabled
5. Verify upgrade prompt shown
6. Navigate to `/dashboard/podcast`
7. Verify 404 or forbidden (no podcast on starter)
8. Simulate plan upgrade to pro via webhook
9. Refresh dashboard
10. Verify "Create New Page" enabled again
11. Navigate to `/dashboard/podcast`
12. Verify podcast page accessible
13. Trigger monthly generation
14. Verify 150 posts per platform generated (pro limit)

**Expected Results:**
- ✅ Starter: 3 pages max enforced
- ✅ Starter: No podcast access
- ✅ Upgrade unlocks features
- ✅ Pro: 10 pages max
- ✅ Pro: Podcast enabled
- ✅ Pro: 150 posts per platform
- ✅ Authority: Unlimited pages
- ✅ Authority: YouTube enabled

**Dependencies Tested:**
- Plan → Feature availability
- Plan → Content limits
- Plan change → UI update
- Plan → Monthly generation count

---

## Test Data Setup

### Test Users

```typescript
// Seed test database
const testUsers = [
  {
    email: 'starter@test.com',
    plan: 'starter',
    plan_status: 'active',
    moderation_required: false,
    selected_platforms: ['linkedin', 'facebook'],
  },
  {
    email: 'growth@test.com',
    plan: 'growth',
    plan_status: 'active',
    moderation_required: false,
    selected_platforms: ['linkedin', 'facebook', 'instagram'],
  },
  {
    email: 'pro@test.com',
    plan: 'pro',
    plan_status: 'active',
    moderation_required: false,
    selected_platforms: ['linkedin', 'facebook', 'instagram', 'x'],
  },
  {
    email: 'authority@test.com',
    plan: 'authority',
    plan_status: 'active',
    moderation_required: false,
    selected_platforms: ['linkedin', 'facebook', 'instagram', 'x', 'youtube'],
  },
  {
    email: 'newclient@test.com',
    plan: 'starter',
    plan_status: 'active',
    moderation_required: true, // Requires manual review
    selected_platforms: ['linkedin'],
  },
];
```

### Test Posts

```typescript
// Generate test social posts
const testPosts = [
  {
    platform: 'linkedin',
    scheduled_date: new Date().toISOString().split('T')[0],
    moderation_status: 'approved',
    email_sent_at: null,
  },
  {
    platform: 'facebook',
    scheduled_date: new Date().toISOString().split('T')[0],
    moderation_status: 'pending',
    email_sent_at: null,
  },
  {
    platform: 'instagram',
    scheduled_date: new Date().toISOString().split('T')[0],
    moderation_status: 'flagged',
    email_sent_at: null,
  },
];
```

---

## Running E2E Tests

### Setup

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Set up test database
# Use separate Supabase project for testing
export TEST_SUPABASE_URL=your-test-supabase-url
export TEST_SUPABASE_ANON_KEY=your-test-anon-key
```

### Run Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth/signup-login.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          TEST_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Coverage Goals

### Unit Tests
- ✅ Service layer: 80%+ coverage
- ✅ Utilities: 90%+ coverage
- ✅ Configuration: 100% coverage

### Integration Tests
- ✅ API routes: 100% coverage (all endpoints)
- ✅ Inngest jobs: 100% coverage (all jobs)

### Component Tests
- ✅ Critical components: 80%+ coverage
- ✅ Forms: 100% coverage
- ✅ Auth pages: 100% coverage

### E2E Tests
- ✅ Critical user journeys: 100% coverage
- ✅ Happy paths: 100% coverage
- ✅ Error scenarios: 80%+ coverage

---

## Success Criteria

Phase 5 (Testing) is complete when:

1. ✅ All unit tests pass
2. ✅ All integration tests pass
3. ✅ All component tests pass
4. ✅ All E2E test scenarios documented
5. ✅ Test coverage meets goals
6. ✅ CI/CD pipeline configured
7. ✅ Test database seeded
8. ✅ Zero critical bugs found

---

**Next Phase:** Phase 6 - Deployment
