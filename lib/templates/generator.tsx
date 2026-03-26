/**
 * PulseAgent Template Generator
 * Dynamically generates landing pages from template configs + AI content
 */

import React from 'react';
import {
  TemplateNav,
  TemplateHero,
  TemplateFeatures,
  TemplateCTA,
  TemplateFooter,
} from './components';
import {
  TemplateConfig,
  TemplateGeneratorOptions,
  NavConfig,
  HeroConfig,
  FeaturesConfig,
  CTAConfig,
  FooterConfig,
} from './types';

// Template variable replacement
function replaceVariables(str: string, variables: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Deep replace variables in config objects
function replaceConfigVariables(config: any, variables: Record<string, string>): any {
  if (typeof config === 'string') {
    return replaceVariables(config, variables);
  }

  if (Array.isArray(config)) {
    return config.map(item => replaceConfigVariables(item, variables));
  }

  if (typeof config === 'object' && config !== null) {
    const result: any = {};
    for (const key in config) {
      result[key] = replaceConfigVariables(config[key], variables);
    }
    return result;
  }

  return config;
}

// Main Generator Component
export const TemplateGenerator: React.FC<TemplateGeneratorOptions> = ({
  templateId,
  business,
  generatedContent,
  heroImageUrl,
  customizations,
}) => {
  // Load template config (in production, this would load from configs/)
  // For now, we'll use a placeholder - in real implementation, this loads the JSON
  const templateConfig: TemplateConfig = require(`./configs/${templateId}.json`);

  // Build variable replacement map
  const variables: Record<string, string> = {
    businessName: business.businessName,
    tagline: business.tagline || '',
    headline: generatedContent.headline,
    subheadline: generatedContent.subheadline,
    ctaPrimary: generatedContent.ctaPrimary,
    ctaSecondary: generatedContent.ctaSecondary || '',
    heroImageUrl: heroImageUrl || '/placeholder-hero.jpg',
  };

  // Apply customizations
  const colorScheme = {
    ...templateConfig.colorScheme,
    ...(customizations?.colorOverrides || {}),
  };

  const fonts = {
    ...templateConfig.fonts,
    ...(customizations?.fontOverrides || {}),
  };

  // Filter hidden sections
  const visibleSections = templateConfig.sections.filter(section => {
    if (!section.enabled) return false;
    if (customizations?.sectionsToHide?.includes(section.type)) return false;
    return true;
  });

  // Render each section
  return (
    <div className="landing-page">
      {visibleSections.map((section, index) => {
        const config = replaceConfigVariables(section.config, variables);

        switch (section.type) {
          case 'nav':
            return (
              <TemplateNav
                key={`nav-${index}`}
                config={config as NavConfig}
                colors={colorScheme}
              />
            );

          case 'hero':
            return (
              <TemplateHero
                key={`hero-${index}`}
                config={config as HeroConfig}
                colors={colorScheme}
                fonts={fonts}
              />
            );

          case 'features':
            return (
              <TemplateFeatures
                key={`features-${index}`}
                config={config as FeaturesConfig}
                colors={colorScheme}
                fonts={fonts}
              />
            );

          case 'cta':
            return (
              <TemplateCTA
                key={`cta-${index}`}
                config={config as CTAConfig}
                colors={colorScheme}
                fonts={fonts}
              />
            );

          case 'footer':
            return (
              <TemplateFooter
                key={`footer-${index}`}
                config={config as FooterConfig}
                colors={colorScheme}
                fonts={fonts}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

/**
 * Template Selector - Recommends templates based on industry
 */
export function getRecommendedTemplates(industry: string): string[] {
  const industryTemplateMap: Record<string, string[]> = {
    healthcare: ['healthcare-01', 'healthcare-02', 'modern-medical-clinic'],
    legal: ['legal-01'],
    'real-estate': ['realestate-01', 'luxury-realestate'],
    fintech: ['fintech-01', 'fintech-02', 'neon-fintech'],
    fitness: ['fitness-wellness-01', 'pastel-wellness'],
    restaurant: ['food-restaurant-01', 'food-delivery', 'organic-food'],
    saas: ['saas-01', 'minimal-saas'],
    ecommerce: ['ecommerce-01'],
    travel: ['travel-adventure-01', 'vibrant-travel'],
    education: ['online-education-01', 'kids-education'],
    automotive: ['automotive-01'],
    other: ['saas-01', 'healthcare-01'], // Fallback templates
  };

  return industryTemplateMap[industry] || industryTemplateMap.other;
}

/**
 * Generate HTML from React component (server-side only)
 * For use in PulseAgent's landing page generator
 */
export async function generateHTML(options: TemplateGeneratorOptions): Promise<string> {
  const React = require('react');
  const ReactDOMServer = require('react-dom/server');

  const component = React.createElement(TemplateGenerator, options);
  const html = ReactDOMServer.renderToStaticMarkup(component);

  // Load template config for meta tags
  const templateConfig: TemplateConfig = require(`./configs/${options.templateId}.json`);

  // Build complete HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.generatedContent.seoTitle}</title>
  <meta name="description" content="${options.generatedContent.seoDescription}">

  <!-- Open Graph / Social -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${options.generatedContent.seoTitle}">
  <meta property="og:description" content="${options.generatedContent.seoDescription}">
  ${options.heroImageUrl ? `<meta property="og:image" content="${options.heroImageUrl}">` : ''}

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: ${JSON.stringify(templateConfig.colorScheme)},
          fontFamily: {
            pf: ['"Playfair Display"', 'serif'],
            cg: ['"Cormorant Garamond"', 'serif'],
            lb: ['"Libre Baskerville"', 'serif'],
            lor: ['Lora', 'serif'],
            sg: ['"Space Grotesk"', 'sans-serif'],
            bar: ['Barlow', 'sans-serif'],
            nun: ['Nunito', 'sans-serif'],
            man: ['Manrope', 'sans-serif'],
            int: ['Inter', 'sans-serif'],
            lat: ['Lato', 'sans-serif'],
          },
          boxShadow: {
            'sm2': '0 2px 8px rgba(0,0,0,0.06)',
            'md2': '0 8px 30px rgba(0,0,0,0.08)',
            'lg2': '0 20px 60px rgba(0,0,0,0.12)',
            'gold': '0 8px 30px rgba(201,168,76,0.25)',
            'gold-lg': '0 20px 60px rgba(201,168,76,0.2)',
          }
        }
      }
    }
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;700&family=Space+Grotesk:wght@400;700&family=Barlow:wght@400;700&family=Nunito:wght@400;700&family=Manrope:wght@400;700&family=Inter:wght@400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">

  ${templateConfig.customCSS ? `<style>${templateConfig.customCSS}</style>` : ''}
</head>
<body>
  ${html}

  <!-- Analytics / Tracking -->
  <script>
    // Add analytics tracking here
    console.log('PulseAgent Landing Page - ${options.templateId}');
  </script>
</body>
</html>`;
}

export default TemplateGenerator;
