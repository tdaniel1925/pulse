/**
 * TemplateNav - Navigation Component with Multiple Variants
 * Supports: sticky, glass, solid, minimal, luxury
 */

import React from 'react';
import { NavConfig, ColorScheme } from '../types';

interface TemplateNavProps {
  config: NavConfig;
  colors: ColorScheme;
}

export const TemplateNav: React.FC<TemplateNavProps> = ({ config, colors }) => {
  const { variant, logo, links, cta, sticky = true } = config;

  // Variant-specific styles
  const variantStyles = {
    sticky: {
      nav: `bg-white border-b border-gray-100 ${sticky ? 'sticky top-0' : ''} z-40 shadow-sm2`,
      container: 'max-w-7xl mx-auto px-6 h-20 flex items-center justify-between',
      link: 'text-sm font-medium text-gray-500 hover:text-gray-900 font-int transition-colors',
      cta: 'text-white text-sm font-semibold px-5 py-2.5 rounded-full font-int transition-colors min-h-[44px]',
    },
    glass: {
      nav: `backdrop-blur-xl bg-white/80 border-b border-white/20 ${sticky ? 'sticky top-0' : ''} z-40`,
      container: 'max-w-7xl mx-auto px-8 py-4 flex items-center justify-between',
      link: 'text-sm font-medium text-gray-700 hover:text-gray-900 font-int transition-colors',
      cta: 'text-white text-sm font-semibold px-6 py-3 rounded-full font-int transition-all hover:shadow-lg',
    },
    solid: {
      nav: `${sticky ? 'sticky top-0' : ''} z-40`,
      container: 'max-w-7xl mx-auto px-6 py-5 flex items-center justify-between',
      link: 'text-sm font-medium font-int transition-colors',
      cta: 'text-sm font-semibold px-6 py-3 rounded-lg font-int transition-all',
    },
    minimal: {
      nav: `border-b ${sticky ? 'sticky top-0' : ''} z-40 bg-white`,
      container: 'max-w-6xl mx-auto px-4 py-6 flex items-center justify-between',
      link: 'text-sm font-medium text-gray-600 hover:text-gray-900 font-man transition-colors',
      cta: 'text-sm font-semibold px-5 py-2 border-2 rounded font-man transition-all',
    },
    luxury: {
      nav: `${sticky ? 'fixed top-14 left-0 right-0' : ''} z-40`,
      container: 'max-w-7xl mx-auto px-6 mt-4',
      link: 'text-sm font-medium uppercase tracking-wide font-lb transition-colors',
      cta: 'text-sm font-semibold px-8 py-3 border font-lb transition-all uppercase tracking-wider',
    },
  };

  const styles = variantStyles[variant];

  // Logo rendering
  const renderLogo = () => {
    if (logo.type === 'text') {
      return (
        <div className="flex items-center gap-2.5">
          {logo.iconColor && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primaryDark})` }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          <span
            className={`font-bold ${variant === 'luxury' ? 'text-2xl font-cg tracking-widest' : 'text-xl font-lor'}`}
            style={{ color: colors.text }}
          >
            {logo.text}
          </span>
        </div>
      );
    }

    if (logo.type === 'image') {
      return <img src="/logo.png" alt={logo.text || 'Logo'} className="h-10" />;
    }

    return null;
  };

  return (
    <nav className={styles.nav} style={variant === 'solid' ? { background: colors.primaryDark } : {}}>
      <div className={styles.container}>
        {renderLogo()}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className={styles.link}
              style={
                variant === 'solid' || variant === 'luxury'
                  ? { color: variant === 'luxury' ? colors.accent || colors.primary : 'white' }
                  : {}
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <button
            className={styles.cta}
            style={{
              background: variant === 'minimal' ? 'transparent' : colors.primary,
              borderColor: variant === 'minimal' || variant === 'luxury' ? colors.primary : 'transparent',
              color: variant === 'minimal' || variant === 'luxury' ? colors.primary : 'white',
            }}
          >
            {cta.label}
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" aria-label="Menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TemplateNav;
