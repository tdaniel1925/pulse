/**
 * Integration Tests for Square Webhook API
 * Based on DEPENDENCY-MAP.md - Payment & Plan Dependencies
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock Square service
jest.mock('@/lib/services/square', () => ({
  verifyWebhookSignature: jest.fn((body: string, signature: string) => {
    return signature === 'valid-signature';
  }),
}));

// Mock Supabase
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn((table: string) => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      insert: jest.fn(() => ({
        data: null,
        error: null,
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'client-123', plan: 'starter' },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe('Square Webhook API', () => {
  describe('POST /api/webhooks/square', () => {
    it('should reject webhooks with invalid signature', async () => {
      const webhookBody = JSON.stringify({
        type: 'payment.created',
        data: {
          object: {
            payment: {
              id: 'payment-123',
              amount_money: { amount: 7900, currency: 'USD' },
            },
          },
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'invalid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error', 'Invalid signature');
    });

    it('should accept webhooks with valid signature', async () => {
      const webhookBody = JSON.stringify({
        type: 'payment.created',
        data: {
          object: {
            payment: {
              id: 'payment-123',
              amount_money: { amount: 7900, currency: 'USD' },
              customer_id: 'customer-123',
            },
          },
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle payment.created event', async () => {
      const webhookBody = JSON.stringify({
        type: 'payment.created',
        data: {
          object: {
            payment: {
              id: 'payment-123',
              amount_money: { amount: 29700, currency: 'USD' }, // $297 setup fee
              customer_id: 'customer-123',
            },
          },
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle subscription.created event', async () => {
      const webhookBody = JSON.stringify({
        type: 'subscription.created',
        data: {
          object: {
            subscription: {
              id: 'subscription-123',
              customer_id: 'customer-123',
              plan_variation_id: 'plan-starter',
            },
          },
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle subscription.updated event', async () => {
      const webhookBody = JSON.stringify({
        type: 'subscription.updated',
        data: {
          object: {
            subscription: {
              id: 'subscription-123',
              customer_id: 'customer-123',
              status: 'ACTIVE',
              plan_variation_id: 'plan-pro',
            },
          },
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle invoice.payment_made event', async () => {
      const webhookBody = JSON.stringify({
        type: 'invoice.payment_made',
        data: {
          object: {
            invoice: {
              id: 'invoice-123',
              subscription_id: 'subscription-123',
              status: 'PAID',
            },
          },
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should handle invoice.payment_failed event', async () => {
      const webhookBody = JSON.stringify({
        type: 'invoice.payment_failed',
        data: {
          object: {
            invoice: {
              id: 'invoice-123',
              subscription_id: 'subscription-123',
              status: 'PAYMENT_PENDING',
            },
          },
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should ignore unknown event types', async () => {
      const webhookBody = JSON.stringify({
        type: 'unknown.event',
        data: {},
      });

      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: webhookBody,
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should return 400 for malformed JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/webhooks/square',
        {
          method: 'POST',
          headers: {
            'x-square-signature': 'valid-signature',
          },
          body: 'invalid json',
        }
      );

      const response = await POST(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
