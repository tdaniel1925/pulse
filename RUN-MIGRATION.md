# Run Database Migration

## Quick Steps (2 minutes)

### 1. Open Supabase SQL Editor

Go to: **https://supabase.com/dashboard/project/lsbtdzozgfymdtoehqkv/sql/new**

(Or navigate to: Dashboard > SQL Editor > New query)

### 2. Copy Migration SQL

The migration file is located at:
```
supabase/migrations/001_initial_schema.sql
```

**Quick copy:** Open the file in your code editor and copy ALL 349 lines

### 3. Paste and Run

1. Paste the SQL into the Supabase SQL Editor
2. Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
3. Wait 5-10 seconds for completion

### 4. Verify Success

You should see:
- ✅ "Success. No rows returned" message
- Go to "Table Editor" tab
- You should see 8 new tables:
  - `clients`
  - `landing_pages`
  - `social_posts`
  - `podcast_episodes`
  - `youtube_content`
  - `prompt_templates`
  - `provision_log`
  - `generation_log`

### 5. Check Storage Buckets

Go to: **Storage** tab

You should see 3 new buckets:
- `social` (public)
- `landing-pages` (public)
- `podcasts` (public)

---

## What the Migration Creates

### Tables (8 total)

1. **clients** - Business profiles and settings
   - User authentication link
   - Business details (name, industry, location)
   - Platform selection
   - Plan and billing info
   - Email preferences (CAN-SPAM)
   - Moderation settings

2. **landing_pages** - AI-generated landing pages
   - SEO content
   - Hero images
   - Moderation status
   - Publishing state

3. **social_posts** - Social media content
   - Platform-specific posts
   - Multi-platform images
   - Scheduling info
   - Email tracking
   - Moderation status

4. **podcast_episodes** - Podcast scripts
   - Episode metadata
   - Full scripts
   - Show notes
   - Audio files

5. **youtube_content** - YouTube content
   - Video scripts
   - Thumbnails
   - SEO metadata

6. **prompt_templates** - Versioned AI prompts
   - System prompts
   - User prompts
   - Output schemas

7. **provision_log** - Setup tracking
   - New client provisioning
   - Webhook events
   - Error tracking

8. **generation_log** - AI usage tracking
   - Token consumption
   - API call counts
   - Job status

### Security Features

- **Row Level Security (RLS)** enabled on all user tables
- **Policies** ensure users only see their own data
- **Service role** bypass for admin operations
- **Storage buckets** with public read, service role write

### Indexes

Optimized queries for:
- User lookup by email
- Scheduled posts by date
- Moderation queue filtering
- Monthly batch queries
- Timezone-based filtering

---

## Troubleshooting

### Error: "Extension uuid-ossp does not exist"

**Solution:** Extensions are enabled by default in Supabase. If you see this error, the migration should still continue and succeed.

### Error: "Permission denied"

**Solution:** Make sure you're logged into the correct Supabase project. The project ref should be: `lsbtdzozgfymdtoehqkv`

### Error: "Relation already exists"

**Solution:** Tables already created! Check "Table Editor" to verify. You can skip the migration.

### Error: "Syntax error"

**Solution:**
1. Make sure you copied the ENTIRE migration file
2. Don't modify the SQL before running
3. Make sure there are no extra characters at start/end

---

## After Migration

Once migration completes successfully, you can:

1. **Test local development:**
   ```bash
   npm run dev
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Configure API keys** in `.env.local`

4. **Deploy to Vercel** (See INSTALLATION-GUIDE.md)

---

*Database migration for PulseAgent - Phase 6 Deployment*
