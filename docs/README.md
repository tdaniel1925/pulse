# PulseAgent

**AI-Powered Done-For-You Digital Presence Platform**

PulseAgent automatically generates landing pages, social media content, podcast scripts, and YouTube content for businesses. Built with Next.js 14, Supabase, and AI services.

---

## 🚀 Features

### Content Generation
- **Landing Pages**: AI-generated landing pages with hero images (Claude + DALL-E 3)
- **Social Posts**: 30-150 posts/month per platform with platform-specific images (Claude + Ideogram)
- **Podcast Scripts**: Full episode scripts with show notes (Claude)
- **YouTube Content**: Video scripts, thumbnails, and descriptions (Pro+ plans)

### Automation
- **Daily Emails**: Timezone-aware 8am delivery of social content
- **Monthly Generation**: Automatic content creation on 1st of month
- **Auto-Moderation**: OpenAI Moderation API + manual review for new clients
- **Storage Cleanup**: Automatic deletion of old images (90-day retention)

### Integrations
- **Square Payments**: Subscriptions + one-time setup fees
- **Apex Affinity Group**: Automatic rep provisioning via webhook
- **Resend**: Transactional and marketing emails
- **Inngest**: Background job processing

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- API keys for:
  - Anthropic Claude
  - OpenAI (DALL-E 3 + Moderation)
  - Ideogram
  - Square Payments
  - Resend
  - Inngest

---

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd pulseagent
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all required values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-openai-key
IDEOGRAM_API_KEY=your-ideogram-key

# Square Payments
SQUARE_ACCESS_TOKEN=your-square-access-token
SQUARE_LOCATION_ID=your-location-id
SQUARE_ENVIRONMENT=sandbox  # or production

# Resend Email
RESEND_API_KEY=re_your_key

# Inngest
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-random-jwt-secret-at-least-32-chars
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration
5. Verify tables were created in Table Editor

### 4. Configure Square Payments

1. Create Square account at [squareup.com](https://squareup.com)
2. Create catalog items for setup fees ($297, $497, $697, $997)
3. Create subscription plans ($79, $129, $299, $499/month + $10 hosting)
4. Add catalog IDs to `.env.local`
5. Set up webhook endpoint (after deployment)

### 5. Set Up Inngest

1. Create account at [inngest.com](https://inngest.com)
2. Create new app
3. Copy event key and signing key to `.env.local`
4. After deployment, register functions at `/api/inngest`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
pulseagent/
├── .codebakers/              # CodeBakers V5 documentation
│   ├── DEPENDENCY-MAP.md     # Complete dependency mapping
│   ├── STORE-CONTRACTS.md    # Service contracts
│   └── BUILD-STATE.md        # Build progress tracking
│
├── lib/                      # Business logic
│   ├── supabase/             # Database clients
│   ├── services/             # AI & external APIs
│   ├── inngest/              # Background jobs
│   ├── templates/            # Landing page templates
│   ├── types/                # TypeScript types
│   └── config/               # App configuration
│
├── app/                      # Next.js App Router
│   ├── (auth)/               # Login, signup
│   ├── (dashboard)/          # Dashboard pages
│   ├── api/                  # API routes
│   ├── p/[postId]/           # Social relay pages
│   └── unsubscribe/          # Email preferences
│
└── supabase/
    └── migrations/           # Database schema
```

---

## 🔧 Development Workflow

### CodeBakers V5 Methodology

This project follows CodeBakers V5 methodology:

1. **Phase 0**: Specification (✅ Complete)
2. **Phase 1**: Template System (✅ Complete)
3. **Phase 2**: Dependency Mapping (✅ Complete)
4. **Phase 3**: Foundation Build (✅ Complete)
5. **Phase 4**: Feature Build (✅ Complete)
6. **Phase 5**: Testing
7. **Phase 6**: Deployment

See `.codebakers/DEPENDENCY-MAP.md` for complete data flow documentation.

### Key Principles

- **Dependency-First**: All dependencies mapped before building features
- **No Stale UI**: Every update triggers correct downstream changes
- **Complete Flows**: Features built atomically (migration → API → store → UI)
- **Moderation Gates**: All content flows through moderation before display

---

## 🏃 Running Background Jobs

Background jobs run via Inngest:

```bash
# Monthly content generation (runs 1st of month, 6am)
# Daily email delivery (runs hourly, sends at 8am local time)
# Storage cleanup (runs weekly, Sunday 3am UTC)
# Apex provisioning (triggered by webhook)
```

Jobs are automatically registered at `/api/inngest` endpoint.

---

## 📊 Database Schema

### Main Tables

- `clients` - Business profiles and settings
- `landing_pages` - AI-generated landing pages
- `social_posts` - Social media content (30-150/month)
- `podcast_episodes` - Podcast scripts (Pro+ only)
- `youtube_content` - YouTube content (Authority only)
- `prompt_templates` - Versioned AI prompts
- `provision_log` - Setup tracking
- `generation_log` - AI usage tracking

### Security

- Row Level Security (RLS) enabled on all user tables
- Policies ensure users can only access their own data
- Service role bypasses RLS for admin operations
- Storage buckets have public read, service role write

---

## 🎨 Template System

11 industry-specific templates included:

- Healthcare
- Legal
- Real Estate
- Fintech
- Fitness
- Restaurant
- SaaS
- E-Commerce
- Travel
- Education
- Automotive

Each template includes:
- Color scheme (primary, accent, neutral)
- Font pairings (heading + body)
- 5+ section configurations
- Component variants (Hero, Features, CTA, Testimonials, FAQ)

See `lib/templates/TEMPLATE-CATALOG.md` for complete documentation.

---

## 🔐 Authentication

Magic link authentication via Supabase:
- No passwords required
- Email-only login
- Automatic session management
- Protected routes via middleware

---

## 💳 Pricing Plans

| Plan | Price | Posts/Platform | Pages | Podcast | YouTube |
|------|-------|----------------|-------|---------|---------|
| Starter | $79/mo | 30 | 3 | ❌ | ❌ |
| Growth | $129/mo | 50 | 5 | ❌ | ❌ |
| Pro | $299/mo | 150 | 10 | ✅ | ❌ |
| Authority | $499/mo | 150 | Unlimited | ✅ | ✅ |

All plans include $10/mo hosting and one-time setup fee.

---

## 📧 Email Features

### Daily Emails (CAN-SPAM Compliant)
- Sent at 8am local time (timezone-aware)
- Platform-specific post previews
- One-tap share buttons (Facebook, LinkedIn, X)
- Unsubscribe link in footer
- Preference management

### Email Preferences
- Daily social posts
- Monthly performance reports
- Product updates

Users can manage preferences via:
- Dashboard settings
- Unsubscribe page (JWT token)

---

## 🔗 API Routes

### Public
- `POST /api/webhooks/square` - Square payment webhooks
- `POST /api/webhooks/apex` - Apex provisioning
- `GET/POST /api/email/preferences` - Email preferences

### Authenticated
- `POST /api/generate/page` - Generate landing page
- `GET /api/inngest` - Inngest function registration

---

## 🧪 Testing

```bash
# Run TypeScript type check
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables

All `.env.local` variables must be added to Vercel:
- Supabase credentials
- AI API keys
- Square credentials
- Inngest keys
- Application secrets

### Post-Deployment

1. Register Inngest functions: `https://your-app.vercel.app/api/inngest`
2. Set up Square webhook: `https://your-app.vercel.app/api/webhooks/square`
3. Set up Apex webhook: `https://your-app.vercel.app/api/webhooks/apex`
4. Test auth flow
5. Test content generation

---

## 📖 Documentation

- `.codebakers/DEPENDENCY-MAP.md` - Complete dependency mapping (600+ lines)
- `.codebakers/STORE-CONTRACTS.md` - Service contracts (400+ lines)
- `lib/templates/TEMPLATE-CATALOG.md` - Template documentation
- `PHASE-2-COMPLETE.md` - Phase 2 completion report
- `PHASE-3-COMPLETE.md` - Phase 3 completion report

---

## 🤝 Contributing

This project follows CodeBakers V5 methodology. Before contributing:

1. Read `.codebakers/DEPENDENCY-MAP.md`
2. Understand data flow dependencies
3. Follow atomic unit protocol (migration → API → store → UI)
4. Update dependency map for new features

---

## 📄 License

Proprietary - BotMakers Inc.

---

## 🆘 Support

For issues or questions:
- Check `.codebakers/DEPENDENCY-MAP.md` for data flow questions
- Review `lib/services/` for API integration examples
- Check `app/api/` for endpoint implementations

---

**Built with CodeBakers V5 Methodology**
*Dependency-First Development - Zero Stale UI Bugs*
