/** @type {import('tailwindcss').Config} */

/**
 * Unified Tailwind Config for PulseAgent Landing Page Templates
 * Extracted from 27 UXMagic Copilot templates
 *
 * This config includes all color palettes, fonts, and utilities
 * used across all landing page templates.
 */

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/templates/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Insurance/Corporate (i1)
        'i1': '#5C6AC4',
        'i1l': '#EEF0FF',
        'i1d': '#2D2D3A',

        // Finance/Trust (f2)
        'f2': '#7DAF8A',
        'f2l': '#EAF4EC',
        'f2g': '#C9A84C',
        'f2gl': '#F7EDD0',
        'f2d': '#2A3240',

        // Wellness/Spa (w3)
        'w3': '#FAF7F2',
        'w3r': '#D4A5A5',
        'w3t': '#C47C5A',

        // Real Estate/Neutral (r4)
        'r4': '#C4B49A',
        'r4g': '#2D5016',
        'r4s': '#F5EFE4',

        // Legal/Professional (l5)
        'l5': '#4A6FA5',
        'l5l': '#E8EEF7',
        'l5d': '#1E2A3A',

        // E-commerce/Warm (e6)
        'e6': '#FDFAF6',
        'e6t': '#D4B896',
        'e6b': '#E8C4B8',
        'e6e': '#2C1A0E',

        // Education/Bright (ed7)
        'ed7': '#F5A623',
        'ed7l': '#FEF3DC',
        'ed7s': '#4A90D9',
        'ed7sl': '#E8F2FC',

        // Travel/Adventure (t8)
        't8': '#2E86AB',
        't8l': '#E0F0F7',
        't8s': '#E8D5B0',
        't8c': '#F4845F',

        // Healthcare/Medical (h9)
        'h9': '#E8614A',
        'h9l': '#FDECEA',
        'h9g': '#F5F3F0',
        'h9d': '#1C1C1E',

        // Chiropractic/Wellness (c10)
        'c10': '#3D6B4F',
        'c10l': '#E8F0EB',
        'c10s': '#A8C5DA',
        'c10a': '#DDD0B8',
        'c10b': '#FAFAF7',

        // Healthcare (hc)
        'hc': '#2E86AB',
        'hcl': '#E0F4F8',
        'hcd': '#0D2B3E',

        // Healthcare Green (hg)
        'hg': '#3D9970',
        'hgl': '#E6F5EE',

        // Organic/Earth (eo)
        'eo': '#C8622A',
        'eol': '#FDF0E8',
        'eod': '#1E0E06',
        'eom': '#8B3A1A',
        'eos': '#F5E6D3',
        'eog': '#D4A853',
        'eogl': '#FBF3DC',
        'eob': '#FAF5EF',

        // Hexagonal/Modern (hx)
        'hx': '#8B7355',
        'hxl': '#F5F0E8',
        'hxd': '#1A1410',
        'hxm': '#5C4A32',
        'hxs': '#EDE8DF',
        'hxg': '#B8A898',
        'hxc': '#2C2420',
        'hxw': '#FAF8F5',

        // Brutalist (brut)
        'brut-black': '#0A0A0A',
        'brut-white': '#F5F5F0',
        'brut-yellow': '#FFE500',
        'brut-gray': '#1A1A1A',
        'brut-mid': '#3A3A3A',

        // Luxury (lx)
        'lx-navy': '#0F1C2E',
        'lx-navym': '#1A2D45',
        'lx-navyl': '#243650',
        'lx-gold': '#C9A84C',
        'lx-goldl': '#F7EDD0',
        'lx-goldd': '#9E7A2A',
        'lx-cream': '#FAF8F3',
        'lx-creams': '#F2EDE3',
        'lx-slate': '#4A5568',
        'lx-slatel': '#EDF2F7',

        // Kids/Playful (k)
        'k-purple': '#A855F7',
        'k-purplel': '#F3E8FF',
        'k-pink': '#EC4899',
        'k-pinkl': '#FCE7F3',
        'k-blue': '#3B82F6',
        'k-bluel': '#DBEAFE',
        'k-green': '#10B981',
        'k-greenl': '#D1FAE5',
        'k-yellow': '#F59E0B',
        'k-yellowl': '#FEF3C7',
        'k-bg': '#FFFBF5',

        // Neon/Modern (n)
        'n-cyan': '#00D9FF',
        'n-magenta': '#FF006E',
        'n-purple': '#8338EC',
        'n-bg': '#0A0B0D',
        'n-card': '#131416',

        // Retro (retro)
        'retro-orange': '#FF6B35',
        'retro-yellow': '#F7C331',
        'retro-cream': '#FFF8E7',
        'retro-brown': '#3D2817',
        'retro-tan': '#D4A373',

        // Pastel Wellness (pw)
        'pw-mint': '#B8E6D5',
        'pw-lavender': '#D5C6E0',
        'pw-peach': '#FFD3BA',
        'pw-cream': '#FFFAEB',
        'pw-gray': '#8B9A9C',

        // Green Tech (gt)
        'gt-green': '#00C896',
        'gt-greenl': '#E6FAF5',
        'gt-dark': '#0A2E2C',
        'gt-lime': '#A4DE02',
        'gt-bg': '#F9FAFB',

        // SaaS Modern (sm)
        'sm-blue': '#3B82F6',
        'sm-bluel': '#EFF6FF',
        'sm-indigo': '#6366F1',
        'sm-purple': '#8B5CF6',
        'sm-gray': '#F9FAFB',
        'sm-dark': '#111827',

        // Food/Restaurant (fd)
        'fd-red': '#DC2626',
        'fd-redl': '#FEE2E2',
        'fd-orange': '#F97316',
        'fd-cream': '#FFFBEB',
        'fd-dark': '#1C1917',

        // Automotive (auto)
        'auto-black': '#0F0F0F',
        'auto-red': '#DC2626',
        'auto-silver': '#D4D4D8',
        'auto-blue': '#1E40AF',
      },

      fontFamily: {
        // Serif fonts
        'pf': ['"Playfair Display"', 'serif'],
        'cg': ['"Cormorant Garamond"', 'serif'],
        'lb': ['"Libre Baskerville"', 'serif'],
        'lor': ['Lora', 'serif'],

        // Sans-serif fonts
        'sg': ['"Space Grotesk"', 'sans-serif'],
        'bar': ['Barlow', 'sans-serif'],
        'barc': ['"Barlow Condensed"', 'sans-serif'],
        'nun': ['Nunito', 'sans-serif'],
        'man': ['Manrope', 'sans-serif'],
        'int': ['Inter', 'sans-serif'],
        'lat': ['Lato', 'sans-serif'],

        // Display fonts
        'beb': ['"Bebas Neue"', 'sans-serif'],

        // Monospace
        'sm': ['"Space Mono"', 'monospace'],
      },

      boxShadow: {
        // Standard shadows
        'sm2': '0 2px 8px rgba(0,0,0,0.06)',
        'md2': '0 8px 30px rgba(0,0,0,0.08)',
        'lg2': '0 20px 60px rgba(0,0,0,0.12)',

        // Warm shadows
        'warm': '0 8px 30px rgba(139,115,85,0.18)',
        'warm-lg': '0 20px 60px rgba(139,115,85,0.15)',

        // Brutalist shadows
        'brut': '6px 6px 0px #0A0A0A',
        'brut-y': '6px 6px 0px #FFE500',
        'brut-hover': '3px 3px 0px #0A0A0A',

        // Luxury shadows
        'gold': '0 8px 30px rgba(201,168,76,0.25)',
        'gold-lg': '0 20px 60px rgba(201,168,76,0.2)',
        'navy': '0 8px 30px rgba(15,28,46,0.3)',

        // Glow effects
        'glow-cyan': '0 0 30px rgba(0,217,255,0.3)',
        'glow-magenta': '0 0 30px rgba(255,0,110,0.3)',
        'glow-purple': '0 0 30px rgba(131,56,236,0.3)',
      },

      // Additional utilities
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
