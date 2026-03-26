/**
 * TemplateHero - Hero Section Component with Multiple Variants
 * Supports: gradient-split, image-background, centered, split-image, full-width
 */

import React from 'react';
import { HeroConfig, ColorScheme, FontConfig } from '../types';

interface TemplateHeroProps {
  config: HeroConfig;
  colors: ColorScheme;
  fonts: FontConfig;
}

export const TemplateHero: React.FC<TemplateHeroProps> = ({ config, colors, fonts }) => {
  const { variant, headline, subheadline, cta, backgroundGradient, image } = config;

  // Gradient Split Variant - Healthcare/Professional
  if (variant === 'gradient-split') {
    return (
      <section
        className="relative overflow-hidden"
        style={{
          background: backgroundGradient || `linear-gradient(160deg, ${colors.primaryLight} 0%, ${colors.background} 40%, #F0F8FF 100%)`,
          paddingTop: '80px',
          paddingBottom: '80px',
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg className="absolute -top-10 -right-20 w-[600px] h-[600px] opacity-[0.07]" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="200" stroke={colors.primary} strokeWidth="1.5" fill="none" />
            <circle cx="250" cy="250" r="150" stroke={colors.secondary || colors.primary} strokeWidth="1" fill="none" />
            <circle cx="250" cy="250" r="100" stroke={colors.primary} strokeWidth="1" fill="none" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <h1
                className={`text-5xl lg:text-6xl font-bold leading-tight font-${fonts.heading}`}
                style={{ color: colors.text }}
              >
                {headline.split(' ').map((word, i) => {
                  // Highlight last word or keyword
                  if (i === headline.split(' ').length - 1) {
                    return (
                      <React.Fragment key={i}>
                        <em style={{ color: colors.primary, fontStyle: 'normal' }}>{word}</em>{' '}
                      </React.Fragment>
                    );
                  }
                  return <span key={i}>{word} </span>;
                })}
              </h1>

              <p className={`text-xl text-gray-600 leading-relaxed font-${fonts.body} max-w-xl`}>{subheadline}</p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
                  style={{ background: colors.primary }}
                >
                  {cta.primary}
                </button>
                {cta.secondary && (
                  <button
                    className="px-8 py-4 rounded-full font-semibold transition-all border-2"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    {cta.secondary}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Image/Illustration */}
            <div className="relative">
              {image?.url && (
                <img src={image.url} alt="Hero" className="rounded-2xl shadow-lg2 w-full h-auto" />
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Centered Variant - SaaS/Tech
  if (variant === 'centered') {
    return (
      <section
        className="relative overflow-hidden py-24 lg:py-32"
        style={{
          background: backgroundGradient || `linear-gradient(to bottom, ${colors.background}, white)`,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h1
            className={`text-5xl lg:text-7xl font-bold leading-tight mb-6 font-${fonts.heading}`}
            style={{ color: colors.text }}
          >
            {headline}
          </h1>

          <p className={`text-xl lg:text-2xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto font-${fonts.body}`}>
            {subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className="px-10 py-5 rounded-lg font-semibold text-white text-lg transition-all hover:shadow-xl"
              style={{ background: colors.primary }}
            >
              {cta.primary}
            </button>
            {cta.secondary && (
              <button
                className="px-10 py-5 rounded-lg font-semibold text-lg transition-all border-2"
                style={{ borderColor: colors.border || '#e5e7eb', color: colors.text }}
              >
                {cta.secondary}
              </button>
            )}
          </div>

          {/* Hero Image Below */}
          {image?.url && (
            <div className="mt-16">
              <img
                src={image.url}
                alt="Hero"
                className="rounded-xl shadow-2xl w-full max-w-4xl mx-auto"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // Split Image Variant - Real Estate/Luxury
  if (variant === 'split-image') {
    return (
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {/* Left: Image */}
          {image?.position === 'left' && (
            <div
              className="relative bg-cover bg-center"
              style={{ backgroundImage: image?.url ? `url(${image.url})` : 'none' }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}

          {/* Content */}
          <div className="flex items-center px-8 lg:px-16 py-20" style={{ background: colors.background }}>
            <div className="max-w-xl">
              <h1
                className={`text-5xl lg:text-6xl font-bold leading-tight mb-6 font-${fonts.heading}`}
                style={{ color: colors.text }}
              >
                {headline}
              </h1>

              <p className={`text-lg text-gray-600 leading-relaxed mb-8 font-${fonts.body}`}>{subheadline}</p>

              <button
                className="px-8 py-4 font-semibold text-white transition-all hover:shadow-gold-lg"
                style={{ background: colors.primary }}
              >
                {cta.primary}
              </button>
            </div>
          </div>

          {/* Right: Image */}
          {image?.position === 'right' && (
            <div
              className="relative bg-cover bg-center"
              style={{ backgroundImage: image?.url ? `url(${image.url})` : 'none' }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Full Width Image Background Variant - Travel/Adventure
  if (variant === 'image-background') {
    return (
      <section
        className="relative overflow-hidden min-h-[700px] flex items-center"
        style={{
          backgroundImage: image?.url ? `url(${image.url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <h1 className={`text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white font-${fonts.heading}`}>
              {headline}
            </h1>

            <p className={`text-xl lg:text-2xl text-white/90 leading-relaxed mb-10 font-${fonts.body}`}>
              {subheadline}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                className="px-10 py-5 rounded-full font-semibold text-white text-lg transition-all hover:shadow-xl"
                style={{ background: colors.primary }}
              >
                {cta.primary}
              </button>
              {cta.secondary && (
                <button className="px-10 py-5 rounded-full font-semibold text-white text-lg border-2 border-white transition-all hover:bg-white hover:text-gray-900">
                  {cta.secondary}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default to Full Width variant
  return (
    <section
      className="py-20 lg:py-32"
      style={{
        background: backgroundGradient || colors.background,
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h1 className={`text-5xl lg:text-6xl font-bold mb-6 font-${fonts.heading}`} style={{ color: colors.text }}>
          {headline}
        </h1>
        <p className={`text-xl text-gray-600 mb-8 max-w-2xl font-${fonts.body}`}>{subheadline}</p>
        <button
          className="px-8 py-4 rounded-lg font-semibold text-white"
          style={{ background: colors.primary }}
        >
          {cta.primary}
        </button>
      </div>
    </section>
  );
};

export default TemplateHero;
