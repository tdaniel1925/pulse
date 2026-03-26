/**
 * PulseAgent Landing Page Template System - TypeScript Types
 * Production-grade template configuration and component types
 */

export type Industry =
  | 'healthcare'
  | 'legal'
  | 'real-estate'
  | 'fintech'
  | 'fitness'
  | 'restaurant'
  | 'saas'
  | 'ecommerce'
  | 'travel'
  | 'education'
  | 'automotive'
  | 'other';

export type NavVariant = 'sticky' | 'glass' | 'solid' | 'minimal' | 'luxury';
export type HeroVariant = 'gradient-split' | 'image-background' | 'centered' | 'split-image' | 'full-width';
export type FeaturesVariant = 'grid-2' | 'grid-3' | 'grid-4' | 'list' | 'cards';
export type TestimonialsVariant = 'carousel' | 'grid-2' | 'grid-3' | 'single-large';
export type CTAVariant = 'full-width' | 'centered' | 'split' | 'banner';
export type FooterVariant = 'simple' | 'multi-column' | 'centered' | 'minimal';

export interface ColorScheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary?: string;
  secondaryLight?: string;
  accent?: string;
  background: string;
  text: string;
  textLight: string;
  border?: string;
}

export interface FontConfig {
  heading: string;
  body: string;
  accent?: string;
  mono?: string;
}

export interface NavConfig {
  variant: NavVariant;
  logo: {
    type: 'text' | 'icon' | 'image';
    text?: string;
    iconColor?: string;
  };
  links: Array<{
    label: string;
    href: string;
  }>;
  cta: {
    label: string;
    href: string;
  };
  sticky?: boolean;
}

export interface HeroConfig {
  variant: HeroVariant;
  headline: string;
  subheadline: string;
  cta: {
    primary: string;
    secondary?: string;
  };
  backgroundGradient?: string;
  image?: {
    url: string;
    position: 'left' | 'right' | 'background';
  };
}

export interface Feature {
  icon?: string;
  title: string;
  description: string;
}

export interface FeaturesConfig {
  variant: FeaturesVariant;
  headline: string;
  subheadline?: string;
  features: Feature[];
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
}

export interface TestimonialsConfig {
  variant: TestimonialsVariant;
  headline: string;
  testimonials: Testimonial[];
}

export interface CTAConfig {
  variant: CTAVariant;
  headline: string;
  subheadline?: string;
  buttonText: string;
  buttonHref: string;
  backgroundGradient?: string;
}

export interface FooterConfig {
  variant: FooterVariant;
  companyName: string;
  tagline?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
  social?: Array<{
    platform: 'facebook' | 'linkedin' | 'twitter' | 'instagram';
    url: string;
  }>;
  copyright?: string;
}

export interface SectionConfig {
  type: 'nav' | 'hero' | 'features' | 'testimonials' | 'cta' | 'footer';
  enabled: boolean;
  config: NavConfig | HeroConfig | FeaturesConfig | TestimonialsConfig | CTAConfig | FooterConfig;
}

export interface TemplateConfig {
  id: string;
  name: string;
  industry: Industry;
  description: string;
  colorScheme: ColorScheme;
  fonts: FontConfig;
  sections: SectionConfig[];
  customCSS?: string;
}

export interface BusinessProfile {
  businessName: string;
  industry: Industry;
  tagline?: string;
  coreOffer: string;
  targetCustomer: string;
  differentiator: string;
  location?: {
    city: string;
    state: string;
  };
  phone?: string;
  website?: string;
  brandVoice?: 'professional' | 'friendly' | 'bold' | 'calm' | 'witty';
  brandColors?: {
    primary?: string;
    secondary?: string;
  };
  logoUrl?: string;
}

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  bodyCopy: {
    benefits: string[];
    faq: Array<{ q: string; a: string }>;
    socialProof: string;
    sections: any[];
  };
  ctaPrimary: string;
  ctaSecondary?: string;
  seoTitle: string;
  seoDescription: string;
  heroImagePrompt: string;
}

export interface TemplateGeneratorOptions {
  templateId: string;
  business: BusinessProfile;
  generatedContent: GeneratedContent;
  heroImageUrl?: string;
  customizations?: {
    colorOverrides?: Partial<ColorScheme>;
    fontOverrides?: Partial<FontConfig>;
    sectionsToHide?: string[];
  };
}
