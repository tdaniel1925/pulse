/**
 * Unit Tests for Moderation Service
 * Based on DEPENDENCY-MAP.md - Moderation Flow Dependencies
 */

import { determineModerationStatus } from '../moderation';

describe('Moderation Service', () => {
  describe('determineModerationStatus', () => {
    it('should return "pending" for new clients with clean content', () => {
      const moderation = {
        flagged: false,
        categoryScores: {
          hate: 0.1,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, true);
      expect(result).toBe('pending');
    });

    it('should return "flagged" for new clients with high scores', () => {
      const moderation = {
        flagged: false,
        categoryScores: {
          hate: 0.75,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, true);
      expect(result).toBe('flagged');
    });

    it('should return "flagged" when OpenAI flags content for new clients', () => {
      const moderation = {
        flagged: true,
        categoryScores: {
          hate: 0.3,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, true);
      expect(result).toBe('flagged');
    });

    it('should return "approved" for established clients with clean content', () => {
      const moderation = {
        flagged: false,
        categoryScores: {
          hate: 0.1,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, false);
      expect(result).toBe('approved');
    });

    it('should return "approved" for established clients with moderate scores', () => {
      const moderation = {
        flagged: false,
        categoryScores: {
          hate: 0.8,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, false);
      expect(result).toBe('approved');
    });

    it('should return "flagged" for established clients with extreme scores', () => {
      const moderation = {
        flagged: false,
        categoryScores: {
          hate: 0.95,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, false);
      expect(result).toBe('flagged');
    });

    it('should return "flagged" when OpenAI flags content for established clients', () => {
      const moderation = {
        flagged: true,
        categoryScores: {
          hate: 0.3,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, false);
      expect(result).toBe('flagged');
    });

    it('should handle edge case at exactly 0.7 threshold for new clients', () => {
      const moderation = {
        flagged: false,
        categoryScores: {
          hate: 0.7,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, true);
      expect(result).toBe('pending');
    });

    it('should handle edge case at exactly 0.9 threshold for established clients', () => {
      const moderation = {
        flagged: false,
        categoryScores: {
          hate: 0.9,
          sexual: 0.05,
          violence: 0.02,
          selfHarm: 0.01,
          harassment: 0.03,
        },
      };

      const result = determineModerationStatus(moderation, false);
      expect(result).toBe('approved');
    });
  });
});
