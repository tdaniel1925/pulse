import { inngest } from './client';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Cleanup Old Images - Storage Cost Optimization
 * Based on DEPENDENCY-MAP.md - Storage & Cleanup Dependencies (Section 6)
 *
 * Trigger: Cron - Weekly (Sunday at 3am UTC)
 * What it does:
 * 1. Find social posts > 90 days old
 * 2. Delete images from Supabase Storage
 * 3. NULL out image URLs in database
 * 4. Find unpublished landing page drafts > 30 days old
 * 5. Delete draft images and records
 * 6. Find podcast draft covers > 60 days old
 * 7. Delete draft covers
 * 8. Log storage freed
 */
export const cleanupOldImages = inngest.createFunction(
  {
    id: 'storage-cleanup-old-images',
    name: 'Cleanup Old Images',
    retries: 1,
  },
  {
    // Every Sunday at 3am UTC
    cron: '0 3 * * 0',
  },
  async ({ event, step }) => {
    const supabase = createAdminClient();
    let totalDeleted = 0;

    // Step 1: Find and clean old social posts
    const socialStats = await step.run('cleanup-social-posts', async () => {
      // Find posts > 90 days old
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const { data: oldPosts, error } = await supabase
        .from('social_posts')
        .select('*')
        .lt('created_at', ninetyDaysAgo.toISOString());

      if (error || !oldPosts) {
        console.error('Failed to load old posts:', error);
        return { deleted: 0 };
      }

      let deletedCount = 0;

      // Delete images for each post
      for (const post of oldPosts) {
        const imagePaths = [
          post.image_url_raw,
          post.image_url_fb,
          post.image_url_ig,
          post.image_url_li,
          post.image_url_tw,
          post.image_url_yt,
        ]
          .filter(Boolean)
          .map((url) => {
            // Extract path from public URL
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            return pathParts.slice(pathParts.indexOf('social') + 1).join('/');
          });

        if (imagePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('social')
            .remove(imagePaths);

          if (!deleteError) {
            deletedCount += imagePaths.length;
          }
        }

        // NULL out image URLs
        await supabase
          .from('social_posts')
          .update({
            image_url_raw: null,
            image_url_fb: null,
            image_url_ig: null,
            image_url_li: null,
            image_url_tw: null,
            image_url_yt: null,
          })
          .eq('id', post.id);
      }

      return { deleted: deletedCount, posts: oldPosts.length };
    });

    totalDeleted += socialStats.deleted;

    // Step 2: Find and clean landing page drafts
    const landingStats = await step.run('cleanup-landing-drafts', async () => {
      // Find unpublished drafts > 30 days old
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: oldDrafts, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('published', false)
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (error || !oldDrafts) {
        console.error('Failed to load old drafts:', error);
        return { deleted: 0 };
      }

      let deletedCount = 0;

      // Delete images and records
      for (const draft of oldDrafts) {
        const imagePaths = [draft.hero_image_url, draft.og_image_url]
          .filter(Boolean)
          .map((url) => {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            return pathParts.slice(pathParts.indexOf('landing-pages') + 1).join('/');
          });

        if (imagePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from('landing-pages')
            .remove(imagePaths);

          if (!deleteError) {
            deletedCount += imagePaths.length;
          }
        }

        // Delete record
        await supabase.from('landing_pages').delete().eq('id', draft.id);
      }

      return { deleted: deletedCount, drafts: oldDrafts.length };
    });

    totalDeleted += landingStats.deleted;

    // Step 3: Find and clean podcast draft covers
    const podcastStats = await step.run('cleanup-podcast-drafts', async () => {
      // Find draft episodes > 60 days old
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const { data: oldDrafts, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('status', 'draft')
        .lt('created_at', sixtyDaysAgo.toISOString());

      if (error || !oldDrafts) {
        console.error('Failed to load old podcast drafts:', error);
        return { deleted: 0 };
      }

      let deletedCount = 0;

      // Delete cover art only (keep episode record)
      for (const draft of oldDrafts) {
        if (draft.cover_art_url) {
          const urlObj = new URL(draft.cover_art_url);
          const pathParts = urlObj.pathname.split('/');
          const imagePath = pathParts.slice(pathParts.indexOf('podcasts') + 1).join('/');

          const { error: deleteError } = await supabase.storage
            .from('podcasts')
            .remove([imagePath]);

          if (!deleteError) {
            deletedCount++;
          }

          // NULL out cover art URL
          await supabase
            .from('podcast_episodes')
            .update({ cover_art_url: null })
            .eq('id', draft.id);
        }
      }

      return { deleted: deletedCount, drafts: oldDrafts.length };
    });

    totalDeleted += podcastStats.deleted;

    // Step 4: Log cleanup
    await step.run('log-cleanup', async () => {
      await supabase.from('generation_log').insert({
        client_id: null, // Global job
        job_type: 'storage_cleanup',
        inngest_run_id: event.id,
        claude_tokens_in: 0,
        claude_tokens_out: 0,
        dalle_calls: 0,
        ideogram_calls: 0,
        sharp_operations: 0,
        emails_sent: 0,
        status: 'complete',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    });

    return {
      totalImagesDeleted: totalDeleted,
      socialPosts: socialStats,
      landingPages: landingStats,
      podcasts: podcastStats,
    };
  }
);
