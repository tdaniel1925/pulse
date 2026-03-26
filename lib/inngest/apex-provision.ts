import { inngest } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSocialPosts } from '@/lib/services/claude';
import { generateSocialImage } from '@/lib/services/ideogram';
import { resizeForPlatforms } from '@/lib/services/sharp-resize';
import { moderateText, determineModerationStatus } from '@/lib/services/moderation';
import { sendWelcomeEmail } from '@/lib/services/resend';
import { generateLandingPageContent } from '@/lib/services/claude';
import { generateHeroImage, downloadAndUploadImage } from '@/lib/services/dalle';
import { resizeForOG } from '@/lib/services/sharp-resize';

/**
 * Apex Rep Provisioning
 * Based on DEPENDENCY-MAP.md - Inngest Job Dependencies (Section 9)
 *
 * Trigger: Inngest event after setup fee paid
 * What it does:
 * 1. Validate client and setup fee
 * 2. Generate initial 30 social posts per platform
 * 3. Generate welcome landing page
 * 4. Create relay pages and share URLs
 * 5. Send welcome email with dashboard link + referral link
 * 6. Mark provisioning complete
 */
export const apexProvision = inngest.createFunction(
  {
    id: 'apex-rep-provision',
    name: 'Provision New Apex Rep Client',
    retries: 3,
  },
  { event: 'apex/rep.provision' },
  async ({ event, step }) => {
    const { client_id } = event.data;
    const supabase = createAdminClient();

    // Step 1: Validate client
    const client = await step.run('validate-client', async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*, user:user_id(email)')
        .eq('id', client_id)
        .maybeSingle();

      if (error || !data) {
        throw new Error(`Client not found: ${client_id}`);
      }

      if (!data.setup_fee_paid) {
        throw new Error('Setup fee not paid');
      }

      return data;
    });

    // Log provisioning start
    await step.run('log-provision-start', async () => {
      await supabase.from('provision_log').insert({
        client_id,
        source: 'apex_webhook',
        event_type: 'rep.provision',
        status: 'running',
        started_at: new Date().toISOString(),
      });
    });

    // Step 2: Generate initial social posts (30 per platform for starter plan)
    const posts = await step.run('generate-initial-posts', async () => {
      const platforms = client.selected_platforms;
      const allPosts: any[] = [];
      const currentMonth = new Date().toISOString().slice(0, 7);

      for (const platform of platforms) {
        const generatedPosts = await generateSocialPosts({
          businessName: client.business_name,
          industry: client.industry,
          platform,
          count: 30, // Starter plan default
          excludeTopics: [],
          brandVoice: client.brand_voice,
        });

        // Process each post
        for (let i = 0; i < generatedPosts.length; i++) {
          const post = generatedPosts[i];

          // Moderate
          const moderation = await moderateText(
            `${post.postCopy}\n${post.hashtags || ''}`
          );
          const moderationStatus = determineModerationStatus(
            moderation,
            client.moderation_required
          );

          // Generate image
          let imageUrls: any = {};
          if (moderationStatus !== 'flagged') {
            try {
              const rawImageUrl = await generateSocialImage(
                post.imagePrompt,
                platform
              );

              // Download and upload
              const rawResponse = await fetch(rawImageUrl);
              const rawBuffer = Buffer.from(await rawResponse.arrayBuffer());
              const rawPath = `${client.id}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/raw/${crypto.randomUUID()}.jpg`;

              const { data: rawUpload } = await supabase.storage
                .from('social')
                .upload(rawPath, rawBuffer, { contentType: 'image/jpeg' });

              const { data: rawUrlData } = supabase.storage
                .from('social')
                .getPublicUrl(rawUpload!.path);

              imageUrls.raw = rawUrlData.publicUrl;

              // Resize for platforms
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
            }
          }

          // Calculate scheduled date
          const dayOffset = Math.floor(i / platforms.length);
          const scheduledDate = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + dayOffset
          );

          // Build share URLs
          const relayPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${crypto.randomUUID()}`;

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
            relay_page_url: relayPageUrl,
            share_url_facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(relayPageUrl)}`,
            share_url_linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(relayPageUrl)}`,
            share_url_twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.postCopy)}&url=${encodeURIComponent(relayPageUrl)}`,
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

      // Insert all posts
      const { error: insertError } = await supabase
        .from('social_posts')
        .insert(allPosts);

      if (insertError) {
        throw new Error(`Failed to insert posts: ${insertError.message}`);
      }

      return allPosts;
    });

    // Step 3: Generate welcome landing page
    await step.run('generate-welcome-page', async () => {
      const content = await generateLandingPageContent({
        businessName: client.business_name,
        industry: client.industry,
        coreOffer: client.core_offer || 'Professional services',
        targetCustomer: client.target_customer || 'Local customers',
        differentiator: client.differentiator || 'Trusted expertise',
        brandVoice: client.brand_voice,
      });

      // Generate hero image
      const heroImageTempUrl = await generateHeroImage(
        content.heroImagePrompt,
        '1792x1024'
      );

      const pageId = crypto.randomUUID();
      const heroImageUrl = await downloadAndUploadImage(
        heroImageTempUrl,
        `${client.id}/${pageId}/hero.jpg`
      );

      const ogImageUrl = await resizeForOG(heroImageUrl, client.id, pageId);

      // Moderate
      const moderation = await moderateText(
        `${content.headline}\n${content.subheadline}`
      );
      const moderationStatus = determineModerationStatus(
        moderation,
        client.moderation_required
      );

      // Save page
      await supabase.from('landing_pages').insert({
        client_id: client.id,
        page_type: 'main',
        slug: 'home',
        headline: content.headline,
        subheadline: content.subheadline,
        body_copy: content.bodyCopy,
        cta_primary: content.ctaPrimary,
        seo_title: content.seoTitle,
        seo_description: content.seoDescription,
        hero_image_url: heroImageUrl,
        og_image_url: ogImageUrl,
        is_primary: true,
        moderation_status: moderationStatus,
        moderation_flags: moderation.categories,
        moderation_score: Math.max(...Object.values(moderation.categoryScores)),
      });
    });

    // Step 4: Send welcome email
    await step.run('send-welcome-email', async () => {
      const userEmail = (client.user as any)?.email;
      if (!userEmail) {
        throw new Error('No email found for client');
      }

      const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${client.rep_code}`;

      await sendWelcomeEmail({
        to: userEmail,
        clientName: client.business_name,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        referralLink,
      });
    });

    // Step 5: Mark provisioning complete
    await step.run('mark-complete', async () => {
      await supabase
        .from('clients')
        .update({
          provisioning_complete: true,
          content_generated_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      await supabase
        .from('provision_log')
        .update({
          status: 'complete',
          completed_at: new Date().toISOString(),
        })
        .eq('client_id', client.id)
        .eq('status', 'running');
    });

    // Step 6: Log generation
    await step.run('log-generation', async () => {
      await supabase.from('generation_log').insert({
        client_id: client.id,
        job_type: 'apex_provision',
        inngest_run_id: event.id,
        claude_tokens_in: 0,
        claude_tokens_out: 0,
        dalle_calls: 1,
        ideogram_calls: posts.length,
        sharp_operations: posts.length * client.selected_platforms.length,
        emails_sent: 1,
        status: 'complete',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    });

    return {
      client_id,
      postsGenerated: posts.length,
      pagesGenerated: 1,
      emailsSent: 1,
    };
  }
);
