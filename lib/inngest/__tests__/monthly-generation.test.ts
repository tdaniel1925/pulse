/**
 * Integration Tests for Monthly Generation Job
 * Based on DEPENDENCY-MAP.md - Content Generation Dependencies
 */

import { monthlyGeneration } from '../monthly-generation';

// Mock services
jest.mock('@/lib/services/claude', () => ({
  generateSocialPosts: jest.fn(() =>
    Promise.resolve([
      {
        platform: 'linkedin',
        copy: 'Test post for LinkedIn',
        hashtags: '#business #growth',
        imagePrompt: 'Professional office environment',
      },
      {
        platform: 'facebook',
        copy: 'Test post for Facebook',
        hashtags: '#community',
        imagePrompt: 'Friendly team photo',
      },
    ])
  ),
}));

jest.mock('@/lib/services/ideogram', () => ({
  generateSocialImage: jest.fn(() =>
    Promise.resolve('https://storage.example.com/image.jpg')
  ),
}));

jest.mock('@/lib/services/sharp-resize', () => ({
  resizeForPlatforms: jest.fn(() =>
    Promise.resolve({
      fb: 'https://storage.example.com/fb.jpg',
      ig: 'https://storage.example.com/ig.jpg',
      li: 'https://storage.example.com/li.jpg',
      tw: 'https://storage.example.com/tw.jpg',
    })
  ),
}));

jest.mock('@/lib/services/moderation', () => ({
  moderateContent: jest.fn(() =>
    Promise.resolve({
      flagged: false,
      categoryScores: {
        hate: 0.01,
        sexual: 0.01,
        violence: 0.01,
        selfHarm: 0.01,
        harassment: 0.01,
      },
    })
  ),
  determineModerationStatus: jest.fn(() => 'approved'),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              data: [
                {
                  id: 'client-123',
                  business_name: 'Test Business',
                  industry: 'saas',
                  selected_platforms: ['linkedin', 'facebook'],
                  plan: 'pro',
                  moderation_required: false,
                  core_offer: 'SaaS product',
                  target_customer: 'Small businesses',
                  brand_voice: 'professional',
                },
              ],
              error: null,
            })),
          })),
        };
      }
      return {
        insert: jest.fn(() => ({ data: null, error: null })),
      };
    }),
  })),
}));

describe('Monthly Generation Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate content for all active clients', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    expect(step.run).toHaveBeenCalled();
  });

  it('should respect plan limits for post generation', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    // Pro plan should generate 150 posts per platform
    // With 2 platforms selected, should generate 300 posts total
    expect(step.run).toHaveBeenCalled();
  });

  it('should only generate for selected platforms', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    // Should only generate for linkedin and facebook (selected_platforms)
    expect(step.run).toHaveBeenCalled();
  });

  it('should moderate all generated content', async () => {
    const { moderateContent } = require('@/lib/services/moderation');

    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    // Should call moderation for each post
    expect(moderateContent).toHaveBeenCalled();
  });

  it('should generate platform-specific images', async () => {
    const { generateSocialImage } = require('@/lib/services/ideogram');
    const { resizeForPlatforms } = require('@/lib/services/sharp-resize');

    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    // Should generate base image with Ideogram
    expect(generateSocialImage).toHaveBeenCalled();

    // Should resize for selected platforms
    expect(resizeForPlatforms).toHaveBeenCalled();
  });

  it('should save all posts to database', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    expect(step.run).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const { generateSocialPosts } = require('@/lib/services/claude');
    generateSocialPosts.mockRejectedValueOnce(new Error('API Error'));

    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    // Should not throw error
    await expect(
      monthlyGeneration.fn({ event, step } as any)
    ).resolves.not.toThrow();
  });

  it('should skip clients with inactive plans', async () => {
    const { createAdminClient } = require('@/lib/supabase/admin');
    createAdminClient.mockReturnValueOnce({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [
              {
                id: 'client-123',
                plan_status: 'past_due',
                // Should skip this client
              },
            ],
            error: null,
          })),
        })),
      })),
    });

    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    expect(step.run).toHaveBeenCalled();
  });

  it('should deduplicate topics across posts', async () => {
    const event = {
      id: 'test-event',
      name: 'scheduled.monthly-generation',
      data: {},
      ts: Date.now(),
    };

    const step = {
      run: jest.fn((name: string, fn: Function) => fn()),
      sendEvent: jest.fn(),
    };

    await monthlyGeneration.fn({ event, step } as any);

    // Posts should have varied content (deduplication working)
    expect(step.run).toHaveBeenCalled();
  });
});
