# PulseAgent Landing Page Template System

Production-grade, component-based landing page system extracted from 27 professional UXMagic Copilot templates.

## 📁 Structure

```
template-system/
├── types.ts                    # TypeScript type definitions
├── components/                 # React components
│   ├── TemplateNav.tsx        # Navigation (5 variants)
│   ├── TemplateHero.tsx       # Hero section (5 variants)
│   ├── TemplateFeatures.tsx   # Features/benefits (5 variants)
│   ├── TemplateCTA.tsx        # Call-to-action (4 variants)
│   ├── TemplateFooter.tsx     # Footer (4 variants)
│   └── index.ts               # Component exports
├── configs/                    # Template JSON configurations
│   ├── healthcare-01.json
│   ├── legal-01.json
│   ├── realestate-01.json
│   └── ... (27 total)
└── generator.tsx              # Template generation engine
```

## 🎨 Component Variants

### TemplateNav (5 variants)
- `sticky` - Standard sticky nav with shadow
- `glass` - Glassmorphism effect with blur
- `solid` - Solid color background
- `minimal` - Clean, minimal design
- `luxury` - Premium aesthetic with borders

### TemplateHero (5 variants)
- `gradient-split` - Gradient background, content + image split
- `centered` - Centered content with image below
- `split-image` - 50/50 content and image split
- `image-background` - Full-width image with overlay
- `full-width` - Full-width content block

### TemplateFeatures (5 variants)
- `grid-2` - 2-column grid with large cards
- `grid-3` - 3-column grid (most common)
- `grid-4` - 4-column compact grid
- `cards` - Premium card design with shadows
- `list` - Vertical list layout

### TemplateCTA (4 variants)
- `full-width` - Bold, full-width section
- `centered` - Centered content
- `split` - Content + button split
- `banner` - Compact banner style

### TemplateFooter (4 variants)
- `simple` - Basic footer with links
- `multi-column` - Comprehensive multi-column
- `centered` - Centered minimal design
- `minimal` - Ultra-clean single line

## 🚀 Usage

### Basic Usage

```typescript
import { TemplateGenerator } from './template-system/generator';

const Page = () => {
  return (
    <TemplateGenerator
      templateId="healthcare-01"
      business={{
        businessName: "MediCare Plus",
        industry: "healthcare",
        coreOffer: "Comprehensive primary care",
        targetCustomer: "Families seeking quality healthcare",
        differentiator: "Same-day appointments and 24/7 support",
      }}
      generatedContent={{
        headline: "Your health, our priority. Always.",
        subheadline: "Compassionate, world-class healthcare when you need it most",
        ctaPrimary: "Book Appointment",
        bodyCopy: { /* ... */ },
        seoTitle: "MediCare Plus - Quality Healthcare",
        seoDescription: "...",
        heroImagePrompt: "...",
      }}
      heroImageUrl="/images/hero.jpg"
    />
  );
};
```

### Generate Static HTML

```typescript
import { generateHTML } from './template-system/generator';

const html = await generateHTML({
  templateId: "legal-01",
  business: { /* ... */ },
  generatedContent: { /* ... */ },
  heroImageUrl: "/images/hero.jpg",
});

// Returns complete HTML document ready to serve
```

### Template Selection

```typescript
import { getRecommendedTemplates } from './template-system/generator';

const templates = getRecommendedTemplates('healthcare');
// Returns: ['healthcare-01', 'healthcare-02', 'modern-medical-clinic']
```

### Custom Color Overrides

```typescript
<TemplateGenerator
  templateId="healthcare-01"
  business={business}
  generatedContent={content}
  customizations={{
    colorOverrides: {
      primary: '#FF5733',
      primaryLight: '#FFE5E0',
    },
    sectionsToHide: ['testimonials'],
  }}
/>
```

## 📋 Template Configuration Format

Each template is defined by a JSON config:

```json
{
  "id": "healthcare-01",
  "name": "Healthcare Landing Page",
  "industry": "healthcare",
  "colorScheme": {
    "primary": "#2E86AB",
    "primaryLight": "#E0F4F8",
    "primaryDark": "#0D2B3E",
    "background": "#FFFFFF",
    "text": "#0D2B3E"
  },
  "fonts": {
    "heading": "lor",
    "body": "int",
    "accent": "pf"
  },
  "sections": [
    {
      "type": "nav",
      "enabled": true,
      "config": { /* NavConfig */ }
    },
    {
      "type": "hero",
      "enabled": true,
      "config": { /* HeroConfig */ }
    }
    // ... more sections
  ]
}
```

### Variable Replacement

Templates support variable placeholders:

- `{{businessName}}` - Business name
- `{{tagline}}` - Business tagline
- `{{headline}}` - AI-generated headline
- `{{subheadline}}` - AI-generated subheadline
- `{{ctaPrimary}}` - Primary CTA text
- `{{heroImageUrl}}` - Hero image URL

## 🎯 Industry-Specific Templates

| Industry | Template IDs | Color Scheme |
|----------|-------------|--------------|
| Healthcare | healthcare-01, healthcare-02, modern-medical-clinic | Blue + Green |
| Legal | legal-01 | Navy + Gold |
| Real Estate | realestate-01, luxury-realestate | Earth tones |
| Fintech | fintech-01, fintech-02, neon-fintech | Professional blue/purple |
| Fitness | fitness-wellness-01, pastel-wellness | Energetic colors |
| Restaurant | food-restaurant-01, food-delivery, organic-food | Warm tones |
| SaaS | saas-01, minimal-saas | Tech blue |
| E-Commerce | ecommerce-01 | Commerce red |
| Travel | travel-adventure-01, vibrant-travel | Adventure colors |
| Education | online-education-01, kids-education | Educational blue |
| Automotive | automotive-01 | Auto industry |

## 🔧 Integration with PulseAgent

### Step 1: Copy to PulseAgent Repo

```bash
# Copy template system to PulseAgent lib/
cp -r designs/template-system pulseagent/lib/templates

# Copy unified Tailwind config
cp designs/tailwind.config.unified.js pulseagent/tailwind.config.js
```

### Step 2: Update Landing Page Generator

```typescript
// lib/generators/landing-page.ts
import { generateHTML, getRecommendedTemplates } from '@/lib/templates/generator';
import { BusinessProfile, GeneratedContent } from '@/lib/templates/types';

export async function generateLandingPage(
  client: Client,
  pageType: string,
): Promise<string> {
  // 1. Select template based on industry
  const templates = getRecommendedTemplates(client.industry);
  const templateId = templates[0]; // Use first recommended, or let user choose

  // 2. Generate copy via Claude
  const content = await generateCopyWithClaude(client, pageType);

  // 3. Generate hero image via DALL-E
  const heroImageUrl = await generateHeroImage(content.heroImagePrompt);

  // 4. Generate HTML
  const html = await generateHTML({
    templateId,
    business: {
      businessName: client.business_name,
      industry: client.industry,
      coreOffer: client.core_offer,
      targetCustomer: client.target_customer,
      differentiator: client.differentiator,
      tagline: `${client.core_offer} in ${client.location_city}`,
    },
    generatedContent: content,
    heroImageUrl,
    customizations: {
      colorOverrides: client.brand_primary ? {
        primary: client.brand_primary,
        secondary: client.brand_secondary,
      } : undefined,
    },
  });

  return html;
}
```

### Step 3: Add Template Selection UI

```typescript
// app/(dashboard)/pages/new/page.tsx
import { getRecommendedTemplates } from '@/lib/templates/generator';

export default function NewPagePage() {
  const client = useClient();
  const templates = getRecommendedTemplates(client.industry);

  return (
    <div>
      <h2>Choose a Template</h2>
      <div className="grid grid-cols-3 gap-4">
        {templates.map(templateId => (
          <TemplatePreview key={templateId} templateId={templateId} />
        ))}
      </div>
    </div>
  );
}
```

## 🎨 Design System

### Colors (268 total)
All extracted from UXMagic templates and organized by theme:
- Healthcare: `hc`, `hg`
- Legal: `lx-navy`, `lx-gold`
- Real Estate: `r4`
- Fintech: `f2`
- And 20+ more theme groups

### Fonts
- **Serif:** Playfair Display, Cormorant Garamond, Libre Baskerville, Lora
- **Sans-Serif:** Space Grotesk, Barlow, Nunito, Manrope, Inter, Lato
- **Display:** Bebas Neue
- **Mono:** Space Mono

### Shadows
- Standard: sm2, md2, lg2
- Warm: warm, warm-lg
- Luxury: gold, gold-lg, navy
- Brutalist: brut, brut-y

## 📊 Coverage

- **27 templates** covering 14+ industries
- **5 component types** with 23 total variants
- **268 color definitions** from professional designs
- **13 font families** optimized for readability
- **Production-ready** TypeScript + React + Tailwind

## 🔄 Workflow

1. **User onboards** → Industry selected
2. **Template recommended** → Based on industry mapping
3. **Content generated** → Claude API creates copy
4. **Image generated** → DALL-E creates hero image
5. **Page assembled** → Generator combines all elements
6. **HTML exported** → Static HTML ready to deploy

## 🚢 Deployment

Generated HTML pages can be:
- Served directly from Vercel routes
- Exported for client download
- Embedded in client websites
- Previewed in dashboard

---

**Status:** Production-ready component library
**Templates:** 27 professional designs
**Coverage:** All PulseAgent industries
**Next Step:** Integrate into PulseAgent repo

*Built for PulseAgent - March 2026*
