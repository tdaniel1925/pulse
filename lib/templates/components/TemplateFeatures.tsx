/**
 * TemplateFeatures - Features/Benefits Section Component
 * Supports: grid-2, grid-3, grid-4, list, cards
 */

import React from 'react';
import { FeaturesConfig, ColorScheme, FontConfig } from '../types';

interface TemplateFeaturesProps {
  config: FeaturesConfig;
  colors: ColorScheme;
  fonts: FontConfig;
}

export const TemplateFeatures: React.FC<TemplateFeaturesProps> = ({ config, colors, fonts }) => {
  const { variant, headline, subheadline, features } = config;

  // Icon rendering - simple SVG placeholder icons
  const renderIcon = (index: number) => {
    const icons = [
      // Check/Shield icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,

      // Lightning/Speed icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,

      // Star icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,

      // Heart icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,

      // Chart icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,

      // Clock icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    ];

    return icons[index % icons.length];
  };

  // Grid 3 Variant - Most Common
  if (variant === 'grid-3') {
    return (
      <section className="py-20 lg:py-28" style={{ background: colors.background }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2
              className={`text-4xl lg:text-5xl font-bold mb-4 font-${fonts.heading}`}
              style={{ color: colors.text }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p className={`text-lg text-gray-600 font-${fonts.body}`}>{subheadline}</p>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                {/* Icon */}
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                  style={{ background: `${colors.primaryLight}` }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: colors.primary }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {renderIcon(index)}
                  </svg>
                </div>

                {/* Title */}
                <h3
                  className={`text-xl font-semibold mb-3 font-${fonts.heading}`}
                  style={{ color: colors.text }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p className={`text-gray-600 leading-relaxed font-${fonts.body}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Grid 2 Variant - Larger Cards
  if (variant === 'grid-2') {
    return (
      <section className="py-20 lg:py-28" style={{ background: colors.background }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2
              className={`text-4xl lg:text-5xl font-bold mb-4 font-${fonts.heading}`}
              style={{ color: colors.text }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p className={`text-lg text-gray-600 font-${fonts.body}`}>{subheadline}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm2 hover:shadow-md2 transition-shadow"
              >
                <div
                  className="w-14 h-14 mb-5 rounded-xl flex items-center justify-center"
                  style={{ background: colors.primaryLight }}
                >
                  <svg
                    className="w-7 h-7"
                    style={{ color: colors.primary }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {renderIcon(index)}
                  </svg>
                </div>

                <h3
                  className={`text-2xl font-semibold mb-3 font-${fonts.heading}`}
                  style={{ color: colors.text }}
                >
                  {feature.title}
                </h3>

                <p className={`text-gray-600 leading-relaxed font-${fonts.body}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Grid 4 Variant - Compact
  if (variant === 'grid-4') {
    return (
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2
              className={`text-4xl lg:text-5xl font-bold mb-4 font-${fonts.heading}`}
              style={{ color: colors.text }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p className={`text-lg text-gray-600 font-${fonts.body}`}>{subheadline}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div
                  className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                  style={{ background: colors.primaryLight }}
                >
                  <svg
                    className="w-6 h-6"
                    style={{ color: colors.primary }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {renderIcon(index)}
                  </svg>
                </div>

                <h3
                  className={`text-lg font-semibold mb-2 font-${fonts.heading}`}
                  style={{ color: colors.text }}
                >
                  {feature.title}
                </h3>

                <p className={`text-sm text-gray-600 font-${fonts.body}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Cards Variant - Premium Look
  if (variant === 'cards') {
    return (
      <section className="py-20 lg:py-28" style={{ background: colors.background }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2
              className={`text-4xl lg:text-5xl font-bold mb-4 font-${fonts.heading}`}
              style={{ color: colors.text }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p className={`text-lg text-gray-600 font-${fonts.body}`}>{subheadline}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg2 hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div
                  className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primaryDark})`,
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {renderIcon(index)}
                  </svg>
                </div>

                <h3
                  className={`text-xl font-bold mb-3 font-${fonts.heading}`}
                  style={{ color: colors.text }}
                >
                  {feature.title}
                </h3>

                <p className={`text-gray-600 leading-relaxed font-${fonts.body}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // List Variant - Simple/Minimal
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h2
            className={`text-4xl lg:text-5xl font-bold mb-4 font-${fonts.heading}`}
            style={{ color: colors.text }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p className={`text-lg text-gray-600 font-${fonts.body}`}>{subheadline}</p>
          )}
        </div>

        <div className="space-y-8">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-5">
              <div
                className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: colors.primaryLight }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: colors.primary }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {renderIcon(index)}
                </svg>
              </div>

              <div>
                <h3
                  className={`text-xl font-semibold mb-2 font-${fonts.heading}`}
                  style={{ color: colors.text }}
                >
                  {feature.title}
                </h3>
                <p className={`text-gray-600 leading-relaxed font-${fonts.body}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplateFeatures;
