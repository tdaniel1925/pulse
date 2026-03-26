/**
 * Unit Tests for Template Generator
 * Based on DEPENDENCY-MAP.md - Content Generation Dependencies
 */

import { generateTemplate } from '../generator';
import { INDUSTRY_CONFIGS } from '../configs';

describe('Template Generator', () => {
  describe('generateTemplate', () => {
    it('should generate valid template for healthcare industry', () => {
      const result = generateTemplate({
        industry: 'healthcare',
        businessName: 'HealthCare Plus',
        headline: 'Expert Medical Care',
        subheadline: 'Compassionate healthcare for your family',
        features: [
          {
            icon: 'heart',
            title: '24/7 Emergency Care',
            description: 'Round the clock medical support',
          },
          {
            icon: 'users',
            title: 'Expert Physicians',
            description: 'Board certified specialists',
          },
          {
            icon: 'shield',
            title: 'Insurance Accepted',
            description: 'Most major plans accepted',
          },
        ],
        testimonials: [
          {
            name: 'Jane Smith',
            role: 'Patient',
            content: 'Outstanding care and service',
            image: 'https://example.com/jane.jpg',
          },
        ],
        faqs: [
          {
            question: 'What are your hours?',
            answer: 'We are open 24/7 for emergency care',
          },
        ],
        ctaPrimary: 'Book Appointment',
        ctaSecondary: 'Learn More',
        heroImage: 'https://example.com/hero.jpg',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('template');
      expect(result.props.config).toBe(INDUSTRY_CONFIGS.healthcare);
      expect(result.props.content.businessName).toBe('HealthCare Plus');
      expect(result.props.content.headline).toBe('Expert Medical Care');
      expect(result.props.content.features).toHaveLength(3);
    });

    it('should generate valid template for legal industry', () => {
      const result = generateTemplate({
        industry: 'legal',
        businessName: 'Smith & Associates',
        headline: 'Your Legal Advocates',
        subheadline: 'Experienced attorneys fighting for you',
        features: [],
        testimonials: [],
        faqs: [],
        ctaPrimary: 'Free Consultation',
        heroImage: 'https://example.com/legal-hero.jpg',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('template');
      expect(result.props.config).toBe(INDUSTRY_CONFIGS.legal);
      expect(result.props.content.businessName).toBe('Smith & Associates');
    });

    it('should generate valid template for saas industry', () => {
      const result = generateTemplate({
        industry: 'saas',
        businessName: 'CloudFlow',
        headline: 'Workflow Automation Made Easy',
        subheadline: 'Save time and boost productivity',
        features: [],
        testimonials: [],
        faqs: [],
        ctaPrimary: 'Start Free Trial',
        ctaSecondary: 'View Pricing',
        heroImage: 'https://example.com/saas-hero.jpg',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('template');
      expect(result.props.config).toBe(INDUSTRY_CONFIGS.saas);
    });

    it('should use default config for unknown industry', () => {
      const result = generateTemplate({
        industry: 'unknown',
        businessName: 'Test Business',
        headline: 'Test Headline',
        subheadline: 'Test Subheadline',
        features: [],
        testimonials: [],
        faqs: [],
        ctaPrimary: 'Get Started',
        heroImage: 'https://example.com/hero.jpg',
      });

      expect(result).toBeDefined();
      expect(result.type).toBe('template');
      // Should fallback to first config
      expect(result.props.config).toBeDefined();
    });

    it('should handle empty features array', () => {
      const result = generateTemplate({
        industry: 'healthcare',
        businessName: 'Test',
        headline: 'Test',
        subheadline: 'Test',
        features: [],
        testimonials: [],
        faqs: [],
        ctaPrimary: 'Click',
        heroImage: 'https://example.com/hero.jpg',
      });

      expect(result.props.content.features).toEqual([]);
    });

    it('should handle empty testimonials array', () => {
      const result = generateTemplate({
        industry: 'legal',
        businessName: 'Test',
        headline: 'Test',
        subheadline: 'Test',
        features: [],
        testimonials: [],
        faqs: [],
        ctaPrimary: 'Click',
        heroImage: 'https://example.com/hero.jpg',
      });

      expect(result.props.content.testimonials).toEqual([]);
    });

    it('should handle optional ctaSecondary', () => {
      const result = generateTemplate({
        industry: 'realestate',
        businessName: 'Test Realty',
        headline: 'Find Your Dream Home',
        subheadline: 'Expert real estate guidance',
        features: [],
        testimonials: [],
        faqs: [],
        ctaPrimary: 'Search Homes',
        heroImage: 'https://example.com/hero.jpg',
      });

      expect(result.props.content.ctaSecondary).toBeUndefined();
    });

    it('should preserve all industry config properties', () => {
      const result = generateTemplate({
        industry: 'healthcare',
        businessName: 'Test',
        headline: 'Test',
        subheadline: 'Test',
        features: [],
        testimonials: [],
        faqs: [],
        ctaPrimary: 'Click',
        heroImage: 'https://example.com/hero.jpg',
      });

      const config = result.props.config;
      expect(config).toHaveProperty('colors');
      expect(config).toHaveProperty('fonts');
      expect(config).toHaveProperty('sections');
      expect(config.colors).toHaveProperty('primary');
      expect(config.colors).toHaveProperty('accent');
      expect(config.fonts).toHaveProperty('heading');
      expect(config.fonts).toHaveProperty('body');
    });
  });
});
