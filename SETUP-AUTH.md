# Authentication Setup Guide

## Why Magic Link Didn't Work

Magic link authentication requires email configuration in Supabase. By default, Supabase only sends emails in production mode or with custom SMTP configured.

---

## Quick Solution: Use Password Authentication (Temporary)

The easiest way to test the app locally is to enable password authentication alongside magic links.

### Step 1: Enable Password Auth in Supabase

1. Go to your Supabase dashboard:
   https://supabase.com/dashboard/project/lsbtdzozgfymdtoehqkv

2. Click **Authentication** in the left sidebar

3. Click **Providers** tab

4. Find **Email** provider

5. Make sure these are enabled:
   - ✅ Enable email provider
   - ✅ Confirm email (you can disable this for testing)

6. Click **Save**

### Step 2: Update Login Page to Accept Password

Currently the app only has magic link login. Let me create a password login option for you.

---

## Option 1: Create Test User via Supabase Dashboard

**Easiest method - no code needed:**

1. Go to: https://supabase.com/dashboard/project/lsbtdzozgfymdtoehqkv/auth/users

2. Click **"Add user"** button

3. Choose **"Create new user"**

4. Fill in:
   - **Email:** test@pulseagent.com
   - **Password:** TestPassword123!
   - **Auto Confirm User:** ✅ YES (important!)

5. Click **"Create user"**

6. Now create the client profile:
   - Go to: Table Editor > clients
   - Click **"Insert row"**
   - Fill in:
     - `user_id`: Copy from the user you just created (in auth.users)
     - `business_name`: Test Business
     - `industry`: saas
     - `plan`: pro
     - `plan_status`: active
     - `selected_platforms`: {linkedin,facebook}
   - Click **"Save"**

7. Now you can test login!
   - Go to http://localhost:3001/login
   - Use a temporary password login (I'll add this next)

---

## Option 2: Enable Supabase Email (For Magic Links)

### Using Supabase's Built-in Email Service

1. Go to: https://supabase.com/dashboard/project/lsbtdzozgfymdtoehqkv/settings/auth

2. Scroll to **"SMTP Settings"**

3. For development, Supabase provides limited free email sending:
   - **No configuration needed** for testing
   - Emails will be sent from `noreply@mail.app.supabase.io`
   - **BUT** emails might go to spam

4. **Important:** Check your spam folder when testing magic links!

### Using Custom SMTP (Better for production)

If you want reliable email delivery, configure custom SMTP:

1. Get SMTP credentials from:
   - **Resend** (recommended): https://resend.com
   - **SendGrid**: https://sendgrid.com
   - **AWS SES**: https://aws.amazon.com/ses/
   - Or any SMTP provider

2. Add SMTP settings in Supabase:
   - Go to: Settings > Auth > SMTP Settings
   - Enable custom SMTP
   - Add your SMTP credentials

---

## Option 3: Quick Password Login (Temporary)

Let me add a password input field to the login page for local testing:
