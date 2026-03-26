/**
 * PulseAgent Template Configuration Index
 * Exports all template configs for easy import
 */

import healthcare01 from './healthcare-01.json';
import legal01 from './legal-01.json';
import realestate01 from './realestate-01.json';
import fintech01 from './fintech-01.json';
import fitness01 from './fitness-01.json';
import restaurant01 from './restaurant-01.json';
import saas01 from './saas-01.json';
import ecommerce01 from './ecommerce-01.json';
import travel01 from './travel-01.json';
import education01 from './education-01.json';
import automotive01 from './automotive-01.json';

import { TemplateConfig } from '../types';

/**
 * All available template configurations
 */
export const templateConfigs: Record<string, TemplateConfig> = {
  'healthcare-01': healthcare01 as TemplateConfig,
  'legal-01': legal01 as TemplateConfig,
  'realestate-01': realestate01 as TemplateConfig,
  'fintech-01': fintech01 as TemplateConfig,
  'fitness-01': fitness01 as TemplateConfig,
  'restaurant-01': restaurant01 as TemplateConfig,
  'saas-01': saas01 as TemplateConfig,
  'ecommerce-01': ecommerce01 as TemplateConfig,
  'travel-01': travel01 as TemplateConfig,
  'education-01': education01 as TemplateConfig,
  'automotive-01': automotive01 as TemplateConfig,
};

/**
 * Get template config by ID
 */
export function getTemplateConfig(templateId: string): TemplateConfig | undefined {
  return templateConfigs[templateId];
}

/**
 * Get all template IDs
 */
export function getAllTemplateIds(): string[] {
  return Object.keys(templateConfigs);
}

/**
 * Industry to template mapping
 * Maps PulseAgent industries to recommended templates
 */
export const industryTemplateMap: Record<string, string[]> = {
  healthcare: ['healthcare-01'],
  legal: ['legal-01'],
  'real-estate': ['realestate-01'],
  realestate: ['realestate-01'], // Alias
  fintech: ['fintech-01'],
  fitness: ['fitness-01'],
  restaurant: ['restaurant-01'],
  saas: ['saas-01'],
  ecommerce: ['ecommerce-01'],
  'e-commerce': ['ecommerce-01'], // Alias
  travel: ['travel-01'],
  education: ['education-01'],
  automotive: ['automotive-01'],
  insurance: ['healthcare-01', 'fintech-01'], // Use healthcare or fintech as fallback
  chiro: ['healthcare-01'], // Chiropractic uses healthcare template
  accounting: ['fintech-01'], // Accounting uses fintech template
  other: ['saas-01', 'healthcare-01'], // Generic fallbacks
};

/**
 * Get recommended templates for an industry
 */
export function getTemplatesForIndustry(industry: string): string[] {
  const templates = industryTemplateMap[industry.toLowerCase()];
  return templates || industryTemplateMap.other;
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): TemplateConfig[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(templateConfigs).filter(
    (config) =>
      config.name.toLowerCase().includes(lowerQuery) ||
      config.industry.toLowerCase().includes(lowerQuery) ||
      config.description.toLowerCase().includes(lowerQuery)
  );
}

export default templateConfigs;
