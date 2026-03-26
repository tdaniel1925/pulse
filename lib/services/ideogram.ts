/**
 * Ideogram API for social post image generation
 * Based on STORE-CONTRACTS.md - Ideogram service contract
 */

/**
 * Generate social post image with Ideogram
 * Returns raw image URL (typically 2048×2048, needs resizing)
 */
export async function generateSocialImage(
  prompt: string,
  platform: string
): Promise<string> {
  const response = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.IDEOGRAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: 'ASPECT_1_1', // Square by default, resize later
      model: 'V_2',
      magic_prompt_option: 'AUTO',
    }),
  });

  if (!response.ok) {
    throw new Error(`Ideogram API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error('No image returned from Ideogram');
  }

  return data.data[0].url;
}
