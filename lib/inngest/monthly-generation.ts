import { inngest } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSocialPosts } from '@/lib/services/claude';
import { generateSocialImage } from '@/lib/services/ideogram';
import { resizeForPlatforms } from '@/lib/services/sharp-resize';
import { moderateText, determineModerationStatus } from '@/lib/services/moderation';
import { getPostsPerPlatform } from '@/lib/config/plans';

/**
 * Monthly Social Content Generation
 * Based on DEPENDENCY-MAP.md - Content Generation Dependencies (Section 2)
 *
 * Trigger: Cron - 1st of every month, 6am client timezone
 * What it does:
 * 1. Pull client profile
 * 2. Dedup last 60 days topics
 * 3. Generate posts per platform (count based on plan)
 * 4. Generate images
 * 5. Moderate content
 * 6. Resize for all selected platforms
 * 7. Build share URLs
 * 8. Save to database
 */
export const monthlyGeneration = inngest.createFunction(
  {
    id: 'social-monthly-generation',
    name: 'Generate Monthly Social Content',
    retries: 3,
  },
  {
    // Cron: 1st of month at 6am in various timezones
    // TODO: Implement timezone-aware scheduling (run multiple times for different TZ)
    cron: '0 6 1 * *',
  },
  async ({ event, step }) => {
    const supabase = createAdminClient();

    // Step 1: Get all active clients
    const { data: clients, error: clientsError } = await step.run(
      'load-active-clients',
      async () => {
        return supabase
          .from('clients')
          .select('*')
          .eq('plan_status', 'active')
          .eq('provisioning_complete', true);
      }
    );

    if (clientsError || !clients) {
      throw new Error(`Failed to load clients: ${clientsError?.message}`);
    }

    // Step 2: Process each client
    for (const client of clients) {
      await step.run(`generate-content-${client.id}`, async () => {
        // Sub-step 1: Load last 60 days topics for deduplication
        const { data: recentPosts } = await supabase
          .from('social_posts')
          .select('topics')
          .eq('client_id', client.id)
          .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());

        const excludeTopics = recentPosts
          ?.flatMap((p) => p.topics || [])
          .filter(Boolean) || [];

        // Sub-step 2: Calculate post count based on plan
        const postsPerPlatform = getPostsPerPlatform(client.plan);
        const platforms = client.selected_platforms;

        // Sub-step 3: Generate posts for each platform
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const allPosts: any[] = [];

        for (const platform of platforms) {
          const posts = await generateSocialPosts({
            businessName: client.business_name,
            industry: client.industry,
            platform,
            count: postsPerPlatform,
            excludeTopics,
            brandVoice: client.brand_voice,
          });

          // Sub-step 4: For each post - moderate, generate image, resize
          for (let i = 0; i < posts.length; i++) {
            const post = posts[i];

            // Moderate content
            const moderation = await moderateText(
              `${post.postCopy}\n${post.hashtags || ''}`
            );
            const moderationStatus = determineModerationStatus(
              moderation,
              client.moderation_required
            );

            // Generate image (only if not flagged)
            let imageUrls: any = {};
            if (moderationStatus !== 'flagged') {
              try {
                const rawImageUrl = await generateSocialImage(
                  post.imagePrompt,
                  platform
                );

                // Download and upload raw image to Supabase Storage
                const rawResponse = await fetch(rawImageUrl);
                const rawBuffer = Buffer.from(await rawResponse.arrayBuffer());

                const rawPath = `${client.id}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/raw/${crypto.randomUUID()}.jpg`;
                const { data: rawUpload } = await supabase.storage
                  .from('social')
                  .upload(rawPath, rawBuffer, {
                    contentType: 'image/jpeg',
                  });

                const { data: rawUrlData } = supabase.storage
                  .from('social')
                  .getPublicUrl(rawUpload!.path);

                imageUrls.raw = rawUrlData.publicUrl;

                // Resize for selected platforms
                const resizedUrls = await resizeForPlatforms(
                  imageUrls.raw,
                  platforms,
                  client.id,
                  crypto.randomUUID(),
                  currentMonth
                );

                imageUrls = { ...imageUrls, ...resizedUrls };
              } catch (error) {
                console.error('Image generation failed:', error);
                // Continue without images - admin can regenerate
              }
            }

            // Calculate scheduled date (spread posts across month)
            const dayOffset = Math.floor(i / platforms.length);
            const scheduledDate = new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              dayOffset + 1
            );

            // Build share URLs
            const relayPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${crypto.randomUUID()}`;
            const shareUrls = {
              facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(relayPageUrl)}`,
              linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(relayPageUrl)}`,
              twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.postCopy)}&url=${encodeURIComponent(relayPageUrl)}`,
            };

            allPosts.push({
              client_id: client.id,
              platform,
              post_copy: post.postCopy,
              hashtags: post.hashtags,
              image_prompt: post.imagePrompt,
              image_url_raw: imageUrls.raw || null,
              image_url_fb: imageUrls.fb || null,
              image_url_ig: imageUrls.ig || null,
              image_url_li: imageUrls.li || null,
              image_url_tw: imageUrls.tw || null,
              image_url_yt: imageUrls.yt || null,
              share_url_facebook: shareUrls.facebook,
              share_url_linkedin: shareUrls.linkedin,
              share_url_twitter: shareUrls.twitter,
              relay_page_url: relayPageUrl,
              scheduled_date: scheduledDate.toISOString().split('T')[0],
              scheduled_time: '09:00',
              batch_month: currentMonth,
              status: 'ready',
              topics: post.topics,
              moderation_status: moderationStatus,
              moderation_flags: moderation.categories,
              moderation_score: Math.max(...Object.values(moderation.categoryScores)),
            });
          }
        }

        // Sub-step 5: Bulk insert all posts
        const { error: insertError } = await supabase
          .from('social_posts')
          .insert(allPosts);

        if (insertError) {
          throw new Error(`Failed to insert posts: ${insertError.message}`);
        }

        // Sub-step 6: Log generation
        await supabase.from('generation_log').insert({
          client_id: client.id,
          job_type: 'monthly_social',
          inngest_run_id: event.id,
          claude_tokens_in: 0, // TODO: Track from API responses
          claude_tokens_out: 0,
          dalle_calls: 0,
          ideogram_calls: allPosts.length,
          sharp_operations: allPosts.length * platforms.length,
          emails_sent: 0,
          status: 'complete',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

        return { postsGenerated: allPosts.length };
      });
    }

    return { clientsProcessed: clients.length };
  }
);
