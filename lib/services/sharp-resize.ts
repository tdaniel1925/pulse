import sharp from 'sharp';

/**
 * Image resizing service using Sharp
 * Based on STORE-CONTRACTS.md - Sharp service contract
 */

const PLATFORM_SIZES = {
  fb: { width: 1200, height: 630 },
  ig: { width: 1080, height: 1080 },
  li: { width: 1200, height: 627 },
  tw: { width: 1600, height: 900 },
  yt: { width: 1280, height: 720 },
} as const;

/**
 * Resize image for multiple social platforms
 * Only creates sizes for platforms client has selected
 */
export async function resizeForPlatforms(
  sourceUrl: string,
  platforms: string[],
  clientId: string,
  postId: string,
  batchMonth: string
): Promise<{
  fb?: string;
  ig?: string;
  li?: string;
  tw?: string;
  yt?: string;
}> {
  // Download source image
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download source image: ${response.statusText}`);
  }

  const sourceBuffer = Buffer.from(await response.arrayBuffer());
  const results: Record<string, string> = {};

  // Import Supabase admin client
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const supabase = createAdminClient();

  // Resize for each selected platform
  for (const platform of platforms) {
    const platformKey = platform === 'facebook' ? 'fb' :
                       platform === 'instagram' ? 'ig' :
                       platform === 'linkedin' ? 'li' :
                       platform === 'twitter' ? 'tw' :
                       platform === 'youtube' ? 'yt' : null;

    if (!platformKey || !(platformKey in PLATFORM_SIZES)) continue;

    const size = PLATFORM_SIZES[platformKey as keyof typeof PLATFORM_SIZES];

    // Resize image
    const resizedBuffer = await sharp(sourceBuffer)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Supabase Storage
    const [year, month] = batchMonth.split('-');
    const storagePath = `${clientId}/${year}/${month}/${platformKey}/${postId}.jpg`;

    const { error } = await supabase.storage
      .from('social')
      .upload(storagePath, resizedBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${platformKey} image:`, error);
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('social')
      .getPublicUrl(storagePath);

    results[platformKey] = urlData.publicUrl;
  }

  return results;
}

/**
 * Resize image for Open Graph (1200×630)
 * Used for landing page social sharing
 */
export async function resizeForOG(
  sourceUrl: string,
  clientId: string,
  pageId: string
): Promise<string> {
  // Download source image
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download source image: ${response.statusText}`);
  }

  const sourceBuffer = Buffer.from(await response.arrayBuffer());

  // Resize to OG size
  const resizedBuffer = await sharp(sourceBuffer)
    .resize(1200, 630, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 90 })
    .toBuffer();

  // Upload to Supabase Storage
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const supabase = createAdminClient();

  const storagePath = `${clientId}/${pageId}/og.jpg`;

  const { error } = await supabase.storage
    .from('landing-pages')
    .upload(storagePath, resizedBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload OG image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('landing-pages')
    .getPublicUrl(storagePath);

  return urlData.publicUrl;
}
