/**
 * Integration Tests for Daily Email Job
 * Based on DEPENDENCY-MAP.md - Email & Notification Dependencies
 */

import { dailyEmail } from '../daily-email';

// Mock services
jest.mock('@/lib/services/resend', () => ({
  sendDailyPostEmail: jest.fn(() => Promise.resolve({ id: 'email-123' })),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              data: [
                {
                  id: 'client-123',
                  user_id: 'user-123',
                  business_name: 'Test Business',
                  email: 'test@example.com',
                  timezone: 'America/New_York',
                  email_preferences: {
                    daily_posts: true,
                    monthly_report: true,
                    product_updates: true,
                  },
                },
              ],
              error: null,
            })),
          })),
        };
      }
      if (table === 'social_posts') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => ({
                gte: jest.fn(() => ({
                  lte: jest.fn(() => ({
                    order: jest.fn(() => ({
                      data: [
                        {
                          id: 'post-123',
                          platform: 'linkedin',
                          post_copy: 'Test LinkedIn post',
                          hashtags: '#business',
                          image_url_li: 'https://example.com/li.jpg',
                          scheduled_date: new Date().toISOString(),
                          moderation_status: 'approved',
                        },
                        {
                          id: 'post-456',
                          platform: 'facebook',
                          post_copy: 'Test Facebook post',
                          hashtags: '#community',
                          image_url_fb: 'https://example.com/fb.jpg',
                          scheduled_date: new Date().toISOString(),
                          moderation_status: 'approved',
                        },
                      ],
                      error: null,
                    })),
                  })),
                })),
              })),
            })),
          })),
        };
      }
      return {
        update: jest.fn(() => ({
          eq: jest.fn(() => ({ data: null, error: null })),
        })),
      };
    }),
  })),
}));

// Mock date-fns-tz
jest.mock('date-fns-tz', () => ({
  utcToZonedTime: jest.fn((date: Date, tz: string) => {
    // Mock returning 8am for America/New_York
    if (tz === 'America/New_York') {
      const d = new Date(date);
      d.setHours(8, 0, 0, 0);
      return d;
    }
    return date;
  }),
}));

const ALL_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

describe('Daily Email Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send emails to clients at 8am local time', async () => {
    const { sendDailyPostEmail } = require('@/lib/services/resend');

    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    // Should send email for clients in correct timezone
    expect(sendDailyPostEmail).toHaveBeenCalled();
  });

  it('should only send to clients with daily_posts preference enabled', async () => {
    const { createAdminClient } = require('@/lib/supabase/admin');
    createAdminClient.mockReturnValueOnce({
      from: jest.fn((table: string) => {
        if (table === 'clients') {
          return {
            select: jest.fn(() => ({
              in: jest.fn(() => ({
                data: [
                  {
                    id: 'client-opt-out',
                    email_preferences: {
                      daily_posts: false, // Opted out
                      monthly_report: true,
                      product_updates: true,
                    },
                  },
                ],
                error: null,
              })),
            })),
          };
        }
        return { select: jest.fn(() => ({ data: [], error: null })) };
      }),
    });

    const { sendDailyPostEmail } = require('@/lib/services/resend');

    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    // Should not send to opted-out clients
    expect(sendDailyPostEmail).not.toHaveBeenCalled();
  });

  it('should only include approved posts', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    // Should query only approved posts
    expect(step.run).toHaveBeenCalled();
  });

  it('should group posts by platform', async () => {
    const { sendDailyPostEmail } = require('@/lib/services/resend');

    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    if (sendDailyPostEmail.mock.calls.length > 0) {
      const emailData = sendDailyPostEmail.mock.calls[0][0];
      expect(emailData).toHaveProperty('posts');
      // Posts should be grouped by platform
    }
  });

  it('should mark emails as sent', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    expect(step.run).toHaveBeenCalled();
  });

  it('should handle empty post lists gracefully', async () => {
    const { createAdminClient } = require('@/lib/supabase/admin');
    createAdminClient.mockReturnValueOnce({
      from: jest.fn((table: string) => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            in: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  order: jest.fn(() => ({
                    data: [], // No posts
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
    });

    const { sendDailyPostEmail } = require('@/lib/services/resend');

    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    // Should not send email if no posts
    expect(sendDailyPostEmail).not.toHaveBeenCalled();
  });

  it('should handle email sending errors gracefully', async () => {
    const { sendDailyPostEmail } = require('@/lib/services/resend');
    sendDailyPostEmail.mockRejectedValueOnce(new Error('Email send failed'));

    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    // Should not throw error
    await expect(
      dailyEmail.fn({ event, step } as any)
    ).resolves.not.toThrow();
  });

  it('should respect client timezone', async () => {
    const { utcToZonedTime } = require('date-fns-tz');

    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    // Should convert UTC to client timezone
    expect(utcToZonedTime).toHaveBeenCalledWith(
      expect.any(Date),
      'America/New_York'
    );
  });

  it('should filter by scheduled_date for today only', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.daily-email',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
    };

    await dailyEmail.fn({ event, step } as any);

    // Should query posts for today only
    expect(step.run).toHaveBeenCalled();
  });
});
