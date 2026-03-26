import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Generate landing page content with Claude
 * Based on STORE-CONTRACTS.md - Claude service contract
 */
export async function generateLandingPageContent(params: {
  businessName: string;
  industry: string;
  coreOffer: string;
  targetCustomer: string;
  differentiator: string;
  brandVoice: string;
  targetKeyword?: string;
}) {
  const systemPrompt = `You are an expert conversion copywriter specializing in landing pages for ${params.industry} businesses.

Your writing style is ${params.brandVoice}. You write compelling, benefit-driven copy that converts visitors into leads.

Return ONLY valid JSON with this exact structure:
{
  "headline": "string (6-10 words, benefit-driven)",
  "subheadline": "string (15-25 words, expand on benefit)",
  "bodyCopy": {
    "benefits": ["string (3 key benefits, each 10-15 words)"],
    "faq": [{"q": "string", "a": "string (5-7 FAQ pairs)"}],
    "socialProof": "string (testimonial-style proof statement)",
    "sections": [{"title": "string", "content": "string (3-4 content sections)"}]
  },
  "ctaPrimary": "string (action-oriented, 2-4 words)",
  "ctaSecondary": "string (softer ask, 2-4 words)",
  "seoTitle": "string (50-60 characters)",
  "seoDescription": "string (150-160 characters)",
  "heroImagePrompt": "string (detailed DALL-E prompt for hero image)"
}`;

  const userPrompt = `Generate landing page content for:

Business: ${params.businessName}
Industry: ${params.industry}
Core Offer: ${params.coreOffer}
Target Customer: ${params.targetCustomer}
Differentiator: ${params.differentiator}
${params.targetKeyword ? `Target Keyword: ${params.targetKeyword}` : ''}

Focus on the unique differentiator. Make the headline benefit-driven and memorable.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}

/**
 * Generate social media posts for a platform
 * Based on STORE-CONTRACTS.md - Claude service contract
 */
export async function generateSocialPosts(params: {
  businessName: string;
  industry: string;
  platform: string;
  count: number;
  excludeTopics: string[];
  brandVoice: string;
}) {
  const platformGuidelines = {
    linkedin: 'Professional tone. Thought leadership. Industry insights. 1300 char max.',
    facebook: 'Conversational. Community-building. Ask questions. 500 char optimal.',
    instagram: 'Visual-first. Lifestyle. Behind-scenes. 125 char caption + story in comments.',
    twitter: 'Concise. Punchy. Thread-worthy. 280 char max.',
    google_business: 'Local focus. Service highlights. Call-to-action. 1500 char max.',
  };

  const systemPrompt = `You are a social media content strategist for ${params.industry} businesses.

Brand voice: ${params.brandVoice}
Platform: ${params.platform}
Guidelines: ${platformGuidelines[params.platform as keyof typeof platformGuidelines]}

AVOID these topics (already covered): ${params.excludeTopics.join(', ')}

Generate ${params.count} unique posts. Return ONLY valid JSON array:
[
  {
    "postCopy": "string (platform-optimized copy)",
    "hashtags": "string (3-5 relevant hashtags)",
    "imagePrompt": "string (detailed Ideogram prompt)",
    "topics": ["string (2-3 topic tags for deduplication)"]
  }
]`;

  const userPrompt = `Generate ${params.count} ${params.platform} posts for ${params.businessName}.

Focus on: value, education, engagement. Mix content types: tips, questions, stories, offers.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}

/**
 * Generate podcast episode content
 * Based on STORE-CONTRACTS.md - Claude service contract
 */
export async function generatePodcastEpisode(params: {
  businessName: string;
  industry: string;
  episodeNumber: number;
  excludeTopics: string[];
  format: string;
}) {
  const systemPrompt = `You are a podcast content creator for ${params.industry} professionals.

Episode format: ${params.format}
Episode number: ${params.episodeNumber}

AVOID these topics: ${params.excludeTopics.join(', ')}

Return ONLY valid JSON:
{
  "title": "string (compelling episode title)",
  "description": "string (2-3 sentence episode description)",
  "showNotes": "string (formatted show notes with timestamps)",
  "introScript": "string (30-45 second intro)",
  "segments": [
    {
      "timestamp": "string (MM:SS)",
      "segment": "string (segment title)",
      "duration": number (minutes),
      "script": "string (conversational script)"
    }
  ],
  "outroScript": "string (30-45 second outro with CTA)",
  "topicsCovered": ["string (3-5 topics)"],
  "keywords": ["string (5-7 SEO keywords)"]
}`;

  const userPrompt = `Generate podcast episode ${params.episodeNumber} for ${params.businessName}.

Create engaging, educational content. Include actionable takeaways.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return JSON.parse(content.text);
}
