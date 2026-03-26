import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateLandingPageContent } from '@/lib/services/claude';
import { generateHeroImage, downloadAndUploadImage } from '@/lib/services/dalle';
import { resizeForOG } from '@/lib/services/sharp-resize';
import { moderateMultipleFields, determineModerationStatus } from '@/lib/services/moderation';
import { canCreateLandingPage } from '@/lib/config/plans';

// Force dynamic rendering - prevents static generation at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/generate/page
 * Generate new landing page
 *
 * Based on:
 * - STORE-CONTRACTS.md - API route contract
 * - DEPENDENCY-MAP.md - Landing Page Generation Flow (Section 2)
 *
 * Flow:
 * 1. Auth check
 * 2. Load client profile
 * 3. Check plan limit
 * 4. Generate content with Claude
 * 5. Generate hero image with DALL-E
 * 6. Resize for OG image
 * 7. Moderate content
 * 8. Save to database
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Auth check
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 2: Load client profile
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client profile not found' },
        { status: 404 }
      );
    }

    // Step 3: Parse request body
    const body = await req.json();
    const {
      page_type,
      target_keyword,
      target_audience,
      unique_offer,
    } = body;

    // Step 4: Check plan limit
    const { data: existingPages } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('client_id', client.id)
      .eq('published', true);

    const { allowed, limit, current } = canCreateLandingPage(
      client.plan,
      existingPages?.length || 0
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Page limit reached',
          limit,
          current,
          message: 'Upgrade your plan to create more pages',
        },
        { status: 403 }
      );
    }

    // Step 5: Generate content with Claude
    const content = await generateLandingPageContent({
      businessName: client.business_name,
      industry: client.industry,
      coreOffer: client.core_offer || '',
      targetCustomer: client.target_customer || '',
      differentiator: client.differentiator || '',
      brandVoice: client.brand_voice,
      targetKeyword: target_keyword,
    });

    // Step 6: Generate hero image with DALL-E
    const heroImageTempUrl = await generateHeroImage(
      content.heroImagePrompt,
      '1792x1024'
    );

    // Step 7: Upload hero image to Supabase Storage
    const pageId = crypto.randomUUID();
    const heroImageUrl = await downloadAndUploadImage(
      heroImageTempUrl,
      `${client.id}/${pageId}/hero.jpg`
    );

    // Step 8: Resize for OG image
    const ogImageUrl = await resizeForOG(
      heroImageUrl,
      client.id,
      pageId
    );

    // Step 9: Moderate content
    const moderation = await moderateMultipleFields([
      content.headline,
      content.subheadline,
      JSON.stringify(content.bodyCopy),
    ]);

    const moderationStatus = determineModerationStatus(
      moderation,
      client.moderation_required
    );

    // Step 10: Create slug from headline
    const slug = content.headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);

    // Step 11: Save to database
    const { data: newPage, error: insertError } = await supabase
      .from('landing_pages')
      .insert({
        client_id: client.id,
        page_type,
        target_keyword,
        target_audience,
        unique_offer,
        slug,
        headline: content.headline,
        subheadline: content.subheadline,
        body_copy: content.bodyCopy,
        cta_primary: content.ctaPrimary,
        cta_secondary: content.ctaSecondary,
        seo_title: content.seoTitle,
        seo_description: content.seoDescription,
        hero_image_url: heroImageUrl,
        og_image_url: ogImageUrl,
        template_id: null, // TODO: Select template based on industry
        published: false,
        moderation_status: moderationStatus,
        moderation_flags: moderation.categories,
        moderation_score: Math.max(...Object.values(moderation.categoryScores)),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save page', details: insertError.message },
        { status: 500 }
      );
    }

    // Step 12: Log generation
    await supabase.from('generation_log').insert({
      client_id: client.id,
      job_type: 'new_page',
      claude_tokens_in: 0, // TODO: Track from API
      claude_tokens_out: 0,
      dalle_calls: 1,
      ideogram_calls: 0,
      sharp_operations: 1,
      emails_sent: 0,
      status: 'complete',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    // Step 13: Return success
    return NextResponse.json({
      page_id: newPage.id,
      preview_url: `/pages/${newPage.id}`,
      moderation_status: moderationStatus,
      message:
        moderationStatus === 'pending'
          ? 'Page created and pending review'
          : moderationStatus === 'flagged'
          ? 'Page created but flagged for review'
          : 'Page created successfully',
    });
  } catch (error: any) {
    console.error('Landing page generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
