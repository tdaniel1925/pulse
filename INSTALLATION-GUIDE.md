# PulseAgent Installation Guide

**Phase 6: Deployment Setup**
**Date:** March 25, 2026

---

## ✅ Step 1: Supabase Configuration (COMPLETE)

Your Supabase credentials have been configured in `.env.local`:

- **Project URL:** https://lsbtdzozgfymdtoehqkv.supabase.co
- **Status:** ✅ Environment variables configured

---

## 📊 Step 2: Run Database Migration

### Option A: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/lsbtdzozgfymdtoehqkv
   - Login with your Supabase account

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the migration:**
   - Open `supabase/migrations/001_initial_schema.sql` in your code editor
   - Copy ALL contents (349 lines)
   - Paste into the SQL Editor

4. **Execute the migration:**
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for completion (should take 5-10 seconds)

5. **Verify success:**
   - You should see "Success. No rows returned"
   - Check "Table Editor" tab - you should see 8 new tables:
     - `clients`
     - `landing_pages`
     - `social_posts`
     - `podcast_episodes`
     - `youtube_content`
     - `prompt_templates`
     - `provision_log`
     - `generation_log`

### Option B: Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref lsbtdzozgfymdtoehqkv

# Run migration
supabase db push
```

---

## 📦 Step 3: Install Dependencies

```bash
cd pulseagent
npm install
```

This will install:
- Next.js 14
- Supabase client
- Testing libraries (Jest, React Testing Library)
- AI service SDKs (Anthropic, OpenAI)
- And 20+ other dependencies

**Expected time:** 2-3 minutes

---

## 🔑 Step 4: Configure API Keys

You need to obtain API keys for the following services:

### Required Services:

1. **Anthropic Claude** (for content generation)
   - Sign up: https://console.anthropic.com
   - Create API key
   - Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`

2. **OpenAI** (for DALL-E 3 and moderation)
   - Sign up: https://platform.openai.com
   - Create API key
   - Add to `.env.local`: `OPENAI_API_KEY=sk-...`

3. **Ideogram** (for social post images)
   - Sign up: https://ideogram.ai/api
   - Create API key
   - Add to `.env.local`: `IDEOGRAM_API_KEY=...`

4. **Resend** (for email delivery)
   - Sign up: https://resend.com
   - Create API key
   - Add to `.env.local`: `RESEND_API_KEY=re_...`

5. **Inngest** (for background jobs)
   - Sign up: https://www.inngest.com
   - Create new app
   - Copy Event Key and Signing Key
   - Add to `.env.local`:
     ```
     INNGEST_EVENT_KEY=...
     INNGEST_SIGNING_KEY=signkey-...
     ```

### Optional Services:

6. **Square** (for payments - optional for testing)
   - Sign up: https://squareup.com/signup
   - Get sandbox credentials
   - Add to `.env.local`

---

## 🧪 Step 5: Test Local Development

```bash
# Start development server
npm run dev

# Server should start on http://localhost:3000
```

### Quick Tests:

1. **Homepage loads:**
   - Open http://localhost:3000
   - Should see PulseAgent landing page

2. **Authentication works:**
   - Go to http://localhost:3000/signup
   - Enter email and business details
   - Check Supabase Auth dashboard for magic link email

3. **Database connection:**
   - After signup, check Supabase Table Editor
   - Should see new row in `clients` table

---

## ✅ Step 6: Run Tests

```bash
# Run all tests
npm test

# Expected: 99 tests passing
# Test suites: 8 passed
# Tests: 99 passed
# Time: ~15-30 seconds
```

---

## 🚀 Step 7: Deploy to Vercel

### Prerequisites:
- GitHub account
- Vercel account (free tier is fine)

### Steps:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial PulseAgent setup"
   gh repo create pulseagent --private --source=. --remote=origin --push
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure environment variables (copy from `.env.local`)
   - Click "Deploy"

3. **Environment Variables in Vercel:**

   Copy these from `.env.local` to Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ANTHROPIC_API_KEY
   OPENAI_API_KEY
   IDEOGRAM_API_KEY
   RESEND_API_KEY
   INNGEST_EVENT_KEY
   INNGEST_SIGNING_KEY
   JWT_SECRET
   NEXT_PUBLIC_APP_URL (change to your Vercel URL)
   ```

4. **Post-Deployment Configuration:**

   After deployment completes:

   a. **Register Inngest Functions:**
   ```bash
   curl https://your-app.vercel.app/api/inngest
   ```

   b. **Configure Inngest Webhook:**
   - Go to Inngest dashboard
   - Add webhook URL: `https://your-app.vercel.app/api/inngest`

   c. **Configure Square Webhooks (if using):**
   - Go to Square dashboard > Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/square`
   - Subscribe to events:
     - `payment.created`
     - `subscription.created`
     - `subscription.updated`
     - `invoice.payment_made`
     - `invoice.payment_failed`

---

## 🎯 Step 8: Smoke Test Production

Test critical paths:

1. **Authentication:**
   - Visit your Vercel URL
   - Sign up with test email
   - Verify magic link received
   - Login successfully

2. **Content Generation:**
   - Go to Pages
   - Click "Create New Page"
   - Enter target keyword
   - Verify page generates successfully

3. **Dashboard:**
   - View stats on dashboard
   - Check social posts calendar
   - Verify settings save correctly

4. **Background Jobs (via Inngest dashboard):**
   - Trigger "Monthly Generation" manually
   - Verify posts created in database
   - Check Inngest logs for success

---

## 📋 Deployment Checklist

- [ ] Database migration run successfully
- [ ] All dependencies installed (`npm install`)
- [ ] All API keys configured in `.env.local`
- [ ] Local dev server running (`npm run dev`)
- [ ] All tests passing (`npm test`)
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Inngest functions registered
- [ ] Production smoke tests passed

---

## 🐛 Troubleshooting

### Database Connection Errors

**Error:** "Failed to connect to database"

**Solution:**
1. Verify credentials in `.env.local`
2. Check Supabase project is not paused
3. Verify RLS policies are enabled

### API Key Errors

**Error:** "Invalid API key"

**Solution:**
1. Check API key format (no extra spaces)
2. Verify key is active in provider dashboard
3. Check rate limits not exceeded

### Build Errors

**Error:** "Module not found"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Test Failures

**Error:** Tests failing locally

**Solution:**
1. Ensure all env vars in `jest.setup.js` are set
2. Run tests in isolation: `npm test -- --runInBand`
3. Check mock data validity

---

## 📞 Support

If you encounter issues:

1. Check `.codebakers/BUILD-LOG.md` for build history
2. Review `E2E-TEST-SPEC.md` for expected behavior
3. Verify dependency map in `.codebakers/DEPENDENCY-MAP.md`

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ All database tables created
- ✅ Local development server running
- ✅ All 99 tests passing
- ✅ Production deployment live
- ✅ Authentication flow working
- ✅ Content generation working
- ✅ Background jobs scheduled

---

*Installation Guide - Phase 6 Deployment*
*PulseAgent - Built with CodeBakers V5*
