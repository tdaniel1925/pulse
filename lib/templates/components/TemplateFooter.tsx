/**
 * TemplateFooter - Footer Section Component
 * Supports: simple, multi-column, centered, minimal
 */

import React from 'react';
import { FooterConfig, ColorScheme, FontConfig } from '../types';

interface TemplateFooterProps {
  config: FooterConfig;
  colors: ColorScheme;
  fonts: FontConfig;
}

export const TemplateFooter: React.FC<TemplateFooterProps> = ({ config, colors, fonts }) => {
  const { variant, companyName, tagline, links, social, copyright } = config;

  // Social Icons
  const socialIcons = {
    facebook: (
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    ),
    linkedin: (
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" />
    ),
    twitter: (
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    ),
    instagram: (
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01 M6.5 3h11A3.5 3.5 0 0121 6.5v11a3.5 3.5 0 01-3.5 3.5h-11A3.5 3.5 0 013 17.5v-11A3.5 3.5 0 016.5 3z" />
    ),
  };

  // Multi-Column Variant - Comprehensive
  if (variant === 'multi-column') {
    return (
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Company Info */}
            <div>
              <h3 className={`text-2xl font-bold text-white mb-3 font-${fonts.heading}`}>
                {companyName}
              </h3>
              {tagline && <p className={`text-gray-400 mb-4 font-${fonts.body}`}>{tagline}</p>}

              {/* Social Links */}
              {social && social.length > 0 && (
                <div className="flex gap-3 mt-6">
                  {social.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                      aria-label={item.platform}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        {socialIcons[item.platform]}
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Links Columns */}
            {links && links.length > 0 && (
              <>
                <div>
                  <h4 className={`text-white font-semibold mb-4 font-${fonts.heading}`}>Services</h4>
                  <ul className="space-y-2">
                    {links.slice(0, Math.ceil(links.length / 3)).map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.href}
                          className={`hover:text-white transition-colors font-${fonts.body}`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={`text-white font-semibold mb-4 font-${fonts.heading}`}>Company</h4>
                  <ul className="space-y-2">
                    {links.slice(Math.ceil(links.length / 3), Math.ceil(links.length * 2 / 3)).map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.href}
                          className={`hover:text-white transition-colors font-${fonts.body}`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className={`text-white font-semibold mb-4 font-${fonts.heading}`}>Legal</h4>
                  <ul className="space-y-2">
                    {links.slice(Math.ceil(links.length * 2 / 3)).map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.href}
                          className={`hover:text-white transition-colors font-${fonts.body}`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p className={`font-${fonts.body}`}>
              {copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Centered Variant - Simple & Clean
  if (variant === 'centered') {
    return (
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className={`text-xl font-bold mb-2 font-${fonts.heading}`} style={{ color: colors.text }}>
            {companyName}
          </h3>
          {tagline && (
            <p className={`text-gray-600 mb-6 font-${fonts.body}`}>{tagline}</p>
          )}

          {/* Links */}
          {links && links.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`text-sm text-gray-600 hover:text-gray-900 transition-colors font-${fonts.body}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Social */}
          {social && social.length > 0 && (
            <div className="flex justify-center gap-4 mb-6">
              {social.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={item.platform}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {socialIcons[item.platform]}
                  </svg>
                </a>
              ))}
            </div>
          )}

          <p className={`text-sm text-gray-500 font-${fonts.body}`}>
            {copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
          </p>
        </div>
      </footer>
    );
  }

  // Minimal Variant - Ultra Clean
  if (variant === 'minimal') {
    return (
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className={`text-sm text-gray-600 font-${fonts.body}`}>
              {copyright || `© ${new Date().getFullYear()} ${companyName}`}
            </p>

            {links && links.length > 0 && (
              <div className="flex gap-6">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className={`text-sm text-gray-600 hover:text-gray-900 transition-colors font-${fonts.body}`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Simple Variant - Default
  return (
    <footer className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div>
            <h3 className={`text-2xl font-bold mb-2 font-${fonts.heading}`} style={{ color: colors.text }}>
              {companyName}
            </h3>
            {tagline && (
              <p className={`text-gray-600 font-${fonts.body}`}>{tagline}</p>
            )}
          </div>

          {links && links.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`text-gray-600 hover:text-gray-900 transition-colors font-${fonts.body}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {social && social.length > 0 && (
          <div className="flex gap-4 mb-6">
            {social.map((item, index) => (
              <a
                key={index}
                href={item.url}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={item.platform}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {socialIcons[item.platform]}
                </svg>
              </a>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <p className={`text-sm text-gray-500 font-${fonts.body}`}>
            {copyright || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default TemplateFooter;
