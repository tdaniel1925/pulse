import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generate hero image with DALL-E 3
 * Based on STORE-CONTRACTS.md - DALL-E service contract
 */
export async function generateHeroImage(
  prompt: string,
  size: '1792x1024' | '1024x1024' = '1792x1024'
): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    size,
    quality: 'hd',
    n: 1,
  });

  const imageUrl = response.data[0].url;
  if (!imageUrl) {
    throw new Error('No image URL returned from DALL-E');
  }

  return imageUrl;
}

/**
 * Download image from URL and upload to Supabase Storage
 * Returns Supabase Storage public URL
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  storagePath: string
): Promise<string> {
  // Download image from DALL-E URL (expires in 1 hour)
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  // Upload to Supabase Storage
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from('landing-pages')
    .upload(storagePath, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('landing-pages')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
