# PulseAgent Project Structure

This document outlines the organized file structure of the PulseAgent codebase.

## Directory Overview

```
pulseagent/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Authentication route group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Protected dashboard route group
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   ├── pages/
│   │   ├── relay/
│   │   ├── settings/
│   │   ├── social/
│   │   ├── unsubscribe/
│   │   ├── layout.tsx       # Dashboard layout with sidebar
│   │   └── loading.tsx      # Dashboard loading state
│   ├── api/                 # API routes
│   │   ├── email/
│   │   │   └── preferences/ # Email preference management
│   │   ├── generate/
│   │   │   └── page/        # Landing page generation
│   │   ├── inngest/         # Background job registration
│   │   └── webhooks/        # Webhook handlers
│   │       ├── apex/        # Apex provisioning webhooks
│   │       └── square/      # Square payment webhooks
│   ├── components/          # Reusable React components
│   │   ├── ui/              # UI primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── index.ts     # Barrel export
│   │   ├── auth/            # Authentication components (future)
│   │   ├── dashboard/       # Dashboard-specific components (future)
│   │   ├── forms/           # Form components (future)
│   │   └── index.ts         # Barrel export
│   ├── p/[postId]/          # Public post relay pages
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Root loading state
│   └── page.tsx             # Marketing homepage
├── lib/                     # Business logic and utilities
│   ├── config/              # Configuration
│   │   ├── plans.ts         # Plan limits and features
│   │   └── index.ts         # Barrel export
│   ├── inngest/             # Background jobs (Inngest)
│   │   ├── apex-provision.ts
│   │   ├── cleanup-old-images.ts
│   │   ├── daily-email.ts
│   │   ├── monthly-generation.ts
│   │   ├── client.ts        # Inngest client
│   │   └── index.ts         # Barrel export
│   ├── services/            # External service integrations
│   │   ├── claude.ts        # Anthropic Claude AI
│   │   ├── dalle.ts         # OpenAI DALL-E
│   │   ├── ideogram.ts      # Ideogram image generation
│   │   ├── moderation.ts    # Content moderation
│   │   ├── resend.ts        # Email service
│   │   ├── sharp-resize.ts  # Image processing
│   │   ├── square.ts        # Square payments
│   │   └── index.ts         # Barrel export
│   ├── supabase/            # Supabase clients
│   │   ├── admin.ts         # Admin client (service role)
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client (SSR)
│   │   └── index.ts         # Barrel export
│   ├── templates/           # Landing page templates
│   │   ├── components/      # Template components
│   │   ├── configs/         # Template configurations
│   │   ├── generator.tsx    # Template generator
│   │   └── types.ts         # Template types
│   └── types/               # TypeScript type definitions
│       ├── client.ts        # Client and plan types
│       ├── content.ts       # Content generation types
│       ├── database.ts      # Database types (Supabase)
│       ├── payments.ts      # Payment types (Square)
│       └── index.ts         # Barrel export
├── docs/                    # Documentation
│   ├── E2E-TEST-SPEC.md
│   ├── INSTALLATION-GUIDE.md
│   ├── PHASE-*.md           # Implementation phase docs
│   ├── PROJECT-STRUCTURE.md # This file
│   ├── README.md            # Main readme
│   ├── RUN-MIGRATION.md
│   ├── SESSION-*.md
│   └── SETUP-AUTH.md
├── scripts/                 # Utility scripts
│   ├── run-migration.js
│   └── test-db-connection.js
├── supabase/               # Supabase configuration
│   └── migrations/         # Database migrations
├── middleware.ts           # Next.js middleware (auth)
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Key Architectural Decisions

### 1. Route Groups
We use Next.js route groups to organize pages by authentication state:
- `(auth)` - Public authentication pages (login, signup)
- `(dashboard)` - Protected dashboard pages requiring auth

### 2. Component Organization
Components are organized by type and domain:
- `app/components/ui/` - Reusable UI primitives (Button, Card, Badge, etc.)
- `app/components/auth/` - Authentication-specific components (future)
- `app/components/dashboard/` - Dashboard-specific components (future)
- `app/components/forms/` - Reusable form components (future)

### 3. Barrel Exports
We use barrel exports (`index.ts`) for clean imports:
```typescript
// Before
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

// After
import { Button, Card } from '@/app/components/ui';
```

### 4. Type Organization
TypeScript types are organized by domain in `lib/types/`:
- `client.ts` - Client and plan types
- `content.ts` - Content generation types
- `database.ts` - Supabase database types
- `payments.ts` - Payment service types

### 5. Service Layer
All external service integrations are in `lib/services/`:
- AI services (Claude, DALL-E, Ideogram)
- Payment processing (Square)
- Email (Resend)
- Content moderation (OpenAI)
- Image processing (Sharp)

### 6. API Route Organization
API routes use the `export const dynamic = 'force-dynamic'` directive to prevent static generation:
- `/api/generate/*` - Content generation
- `/api/webhooks/*` - External webhook handlers
- `/api/email/*` - Email management
- `/api/inngest` - Background job registration

## Import Patterns

### Recommended Imports

```typescript
// Components
import { Button, Card, Badge } from '@/app/components/ui';

// Types
import type { Client, PlanTier, Platform } from '@/lib/types';

// Services
import { generateSocialPosts, moderateText } from '@/lib/services';

// Config
import { getPostsPerPlatform, canCreateLandingPage } from '@/lib/config';

// Supabase
import { createClient, createAdminClient } from '@/lib/supabase';
```

## Testing Structure

Tests are co-located with their source files in `__tests__` directories:
```
lib/
├── services/
│   ├── __tests__/
│   │   └── moderation.test.ts
│   └── moderation.ts
```

## Future Improvements

1. **Component Library Expansion**
   - Add Input, Select, Checkbox, Radio components
   - Create FormField wrapper for consistent form UX
   - Add Toast notification system

2. **Feature-Based Organization**
   - Consider grouping by feature (e.g., `features/social-posts/`, `features/landing-pages/`)
   - Move related components, services, and types together

3. **Shared Utilities**
   - Create `lib/utils/` for helper functions
   - Add date formatting, string manipulation utilities

4. **Testing**
   - Expand test coverage for all services
   - Add E2E tests with Playwright
   - Add component tests with React Testing Library

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```
