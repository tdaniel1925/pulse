/**
 * Unit Tests for Plan Configuration
 * Based on DEPENDENCY-MAP.md - Payment & Plan Dependencies
 */

import {
  PLAN_LIMITS,
  canCreateLandingPage,
  canCreatePodcast,
  canCreateYouTube,
  getPostsPerPlatform,
} from '../plans';

describe('Plan Configuration', () => {
  describe('PLAN_LIMITS', () => {
    it('should have correct limits for starter plan', () => {
      expect(PLAN_LIMITS.starter).toEqual({
        posts_per_platform: 30,
        landing_pages: 3,
        podcast: false,
        youtube: false,
      });
    });

    it('should have correct limits for growth plan', () => {
      expect(PLAN_LIMITS.growth).toEqual({
        posts_per_platform: 50,
        landing_pages: 5,
        podcast: false,
        youtube: false,
      });
    });

    it('should have correct limits for pro plan', () => {
      expect(PLAN_LIMITS.pro).toEqual({
        posts_per_platform: 150,
        landing_pages: 10,
        podcast: true,
        youtube: false,
      });
    });

    it('should have correct limits for authority plan', () => {
      expect(PLAN_LIMITS.authority).toEqual({
        posts_per_platform: 150,
        landing_pages: -1, // unlimited
        podcast: true,
        youtube: true,
      });
    });
  });

  describe('canCreateLandingPage', () => {
    it('should allow creation if under limit for starter plan', () => {
      const result = canCreateLandingPage('starter', 2);
      expect(result).toEqual({
        allowed: true,
        limit: 3,
        current: 2,
      });
    });

    it('should deny creation if at limit for starter plan', () => {
      const result = canCreateLandingPage('starter', 3);
      expect(result).toEqual({
        allowed: false,
        limit: 3,
        current: 3,
      });
    });

    it('should deny creation if over limit for starter plan', () => {
      const result = canCreateLandingPage('starter', 5);
      expect(result).toEqual({
        allowed: false,
        limit: 3,
        current: 5,
      });
    });

    it('should allow creation if under limit for growth plan', () => {
      const result = canCreateLandingPage('growth', 4);
      expect(result).toEqual({
        allowed: true,
        limit: 5,
        current: 4,
      });
    });

    it('should allow creation if under limit for pro plan', () => {
      const result = canCreateLandingPage('pro', 9);
      expect(result).toEqual({
        allowed: true,
        limit: 10,
        current: 9,
      });
    });

    it('should allow unlimited creation for authority plan', () => {
      const result = canCreateLandingPage('authority', 100);
      expect(result).toEqual({
        allowed: true,
        limit: -1,
        current: 100,
      });
    });

    it('should deny creation for unknown plan', () => {
      const result = canCreateLandingPage('unknown', 0);
      expect(result).toEqual({
        allowed: false,
        limit: 0,
        current: 0,
      });
    });
  });

  describe('canCreatePodcast', () => {
    it('should deny podcast for starter plan', () => {
      expect(canCreatePodcast('starter')).toBe(false);
    });

    it('should deny podcast for growth plan', () => {
      expect(canCreatePodcast('growth')).toBe(false);
    });

    it('should allow podcast for pro plan', () => {
      expect(canCreatePodcast('pro')).toBe(true);
    });

    it('should allow podcast for authority plan', () => {
      expect(canCreatePodcast('authority')).toBe(true);
    });

    it('should deny podcast for unknown plan', () => {
      expect(canCreatePodcast('unknown')).toBe(false);
    });
  });

  describe('canCreateYouTube', () => {
    it('should deny YouTube for starter plan', () => {
      expect(canCreateYouTube('starter')).toBe(false);
    });

    it('should deny YouTube for growth plan', () => {
      expect(canCreateYouTube('growth')).toBe(false);
    });

    it('should deny YouTube for pro plan', () => {
      expect(canCreateYouTube('pro')).toBe(false);
    });

    it('should allow YouTube for authority plan', () => {
      expect(canCreateYouTube('authority')).toBe(true);
    });

    it('should deny YouTube for unknown plan', () => {
      expect(canCreateYouTube('unknown')).toBe(false);
    });
  });

  describe('getPostsPerPlatform', () => {
    it('should return 30 posts for starter plan', () => {
      expect(getPostsPerPlatform('starter')).toBe(30);
    });

    it('should return 50 posts for growth plan', () => {
      expect(getPostsPerPlatform('growth')).toBe(50);
    });

    it('should return 150 posts for pro plan', () => {
      expect(getPostsPerPlatform('pro')).toBe(150);
    });

    it('should return 150 posts for authority plan', () => {
      expect(getPostsPerPlatform('authority')).toBe(150);
    });

    it('should return 0 posts for unknown plan', () => {
      expect(getPostsPerPlatform('unknown')).toBe(0);
    });
  });
});
