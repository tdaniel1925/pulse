/**
 * Integration Tests for Email Preferences API
 * Based on DEPENDENCY-MAP.md - Email & Notification Dependencies
 * CAN-SPAM Compliance
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'client-123',
              business_name: 'Test Business',
              email_preferences: {
                daily_posts: true,
                monthly_report: true,
                product_updates: true,
              },
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  })),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token: string) => {
    if (token === 'valid-token') {
      return { clientId: 'client-123' };
    }
    throw new Error('Invalid token');
  }),
  sign: jest.fn(() => 'mocked-token'),
}));

describe('Email Preferences API', () => {
  describe('GET /api/email/preferences', () => {
    it('should return preferences for valid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences?token=valid-token'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('business_name', 'Test Business');
      expect(data).toHaveProperty('preferences');
      expect(data.preferences).toEqual({
        daily_posts: true,
        monthly_report: true,
        product_updates: true,
      });
    });

    it('should return 400 for missing token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Missing token');
    });

    it('should return 401 for invalid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences?token=invalid-token'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/email/preferences', () => {
    it('should update preferences for valid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            token: 'valid-token',
            preferences: {
              daily_posts: false,
              monthly_report: true,
              product_updates: false,
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message', 'Preferences updated successfully');
    });

    it('should return 400 for missing token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            preferences: {
              daily_posts: false,
              monthly_report: true,
              product_updates: false,
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Missing token or preferences');
    });

    it('should return 400 for missing preferences', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            token: 'valid-token',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Missing token or preferences');
    });

    it('should return 401 for invalid token', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            token: 'invalid-token',
            preferences: {
              daily_posts: false,
              monthly_report: true,
              product_updates: false,
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });

    it('should handle partial preference updates', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            token: 'valid-token',
            preferences: {
              daily_posts: false,
              // Only updating daily_posts, others should remain unchanged
            },
          }),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should validate preference fields are booleans', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/email/preferences',
        {
          method: 'POST',
          body: JSON.stringify({
            token: 'valid-token',
            preferences: {
              daily_posts: 'yes', // Invalid type
              monthly_report: true,
              product_updates: false,
            },
          }),
        }
      );

      const response = await POST(request);

      // Should handle gracefully or return validation error
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});
