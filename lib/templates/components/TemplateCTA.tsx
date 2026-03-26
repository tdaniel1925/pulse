/**
 * TemplateCTA - Call-to-Action Section Component
 * Supports: full-width, centered, split, banner
 */

import React from 'react';
import { CTAConfig, ColorScheme, FontConfig } from '../types';

interface TemplateCTAProps {
  config: CTAConfig;
  colors: ColorScheme;
  fonts: FontConfig;
}

export const TemplateCTA: React.FC<TemplateCTAProps> = ({ config, colors, fonts }) => {
  const { variant, headline, subheadline, buttonText, buttonHref, backgroundGradient } = config;

  // Full Width Variant - Bold Impact
  if (variant === 'full-width') {
    return (
      <section
        className="py-20 lg:py-28"
        style={{
          background:
            backgroundGradient ||
            `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primaryDark})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className={`text-4xl lg:text-5xl font-bold text-white mb-6 font-${fonts.heading}`}>
              {headline}
            </h2>

            {subheadline && (
              <p className={`text-xl text-white/90 mb-10 font-${fonts.body}`}>{subheadline}</p>
            )}

            <button className="bg-white text-lg font-semibold px-10 py-5 rounded-full hover:shadow-2xl transition-all">
              <span style={{ color: colors.primary }}>{buttonText}</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Centered Variant - Clean & Simple
  if (variant === 'centered') {
    return (
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className={`text-4xl lg:text-5xl font-bold mb-6 font-${fonts.heading}`}
            style={{ color: colors.text }}
          >
            {headline}
          </h2>

          {subheadline && (
            <p className={`text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-${fonts.body}`}>
              {subheadline}
            </p>
          )}

          <button
            className="text-white text-lg font-semibold px-10 py-5 rounded-lg hover:shadow-xl transition-all"
            style={{ background: colors.primary }}
          >
            {buttonText}
          </button>
        </div>
      </section>
    );
  }

  // Split Variant - Content + CTA Side by Side
  if (variant === 'split') {
    return (
      <section
        className="py-20 lg:py-28"
        style={{ background: backgroundGradient || colors.primaryLight }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2
                className={`text-4xl lg:text-5xl font-bold mb-6 font-${fonts.heading}`}
                style={{ color: colors.text }}
              >
                {headline}
              </h2>

              {subheadline && (
                <p className={`text-lg text-gray-700 font-${fonts.body}`}>{subheadline}</p>
              )}
            </div>

            {/* Right: CTA */}
            <div className="lg:text-right">
              <button
                className="text-white text-lg font-semibold px-10 py-5 rounded-lg hover:shadow-xl transition-all"
                style={{ background: colors.primary }}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Banner Variant - Compact Header/Footer
  if (variant === 'banner') {
    return (
      <section
        className="py-12"
        style={{
          background:
            backgroundGradient ||
            `linear-gradient(90deg, ${colors.primary}, ${colors.secondary || colors.primaryDark})`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className={`text-2xl lg:text-3xl font-bold text-white mb-2 font-${fonts.heading}`}>
                {headline}
              </h3>
              {subheadline && (
                <p className={`text-white/90 font-${fonts.body}`}>{subheadline}</p>
              )}
            </div>

            <button className="bg-white text-lg font-semibold px-8 py-4 rounded-full hover:shadow-xl transition-all flex-shrink-0">
              <span style={{ color: colors.primary }}>{buttonText}</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Default: Full Width
  return (
    <section className="py-20" style={{ background: colors.primary }}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className={`text-4xl font-bold text-white mb-6 font-${fonts.heading}`}>{headline}</h2>
        {subheadline && <p className={`text-xl text-white/90 mb-8 font-${fonts.body}`}>{subheadline}</p>}
        <button className="bg-white font-semibold px-8 py-4 rounded-lg" style={{ color: colors.primary }}>
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default TemplateCTA;
