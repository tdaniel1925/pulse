import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Content moderation using OpenAI Moderation API
 * Based on STORE-CONTRACTS.md - Moderation service contract
 */

interface ModerationResult {
  flagged: boolean;
  categories: {
    sexual: boolean;
    hate: boolean;
    violence: boolean;
    selfHarm: boolean;
    harassment: boolean;
  };
  categoryScores: {
    sexual: number;
    hate: number;
    violence: number;
    selfHarm: number;
    harassment: number;
  };
}

/**
 * Check text content for policy violations
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  const response = await openai.moderations.create({
    model: 'text-moderation-latest',
    input: text,
  });

  const result = response.results[0];

  return {
    flagged: result.flagged,
    categories: {
      sexual: result.categories.sexual,
      hate: result.categories.hate,
      violence: result.categories.violence,
      selfHarm: result.categories['self-harm'],
      harassment: result.categories.harassment,
    },
    categoryScores: {
      sexual: result.category_scores.sexual,
      hate: result.category_scores.hate,
      violence: result.category_scores.violence,
      selfHarm: result.category_scores['self-harm'],
      harassment: result.category_scores.harassment,
    },
  };
}

/**
 * Determine moderation status based on result and client settings
 * Based on DEPENDENCY-MAP.md - Moderation Flow Dependencies
 *
 * Logic:
 * - New clients (< 30 days): Manual review required
 *   - Flagged OR score > 0.7 → 'flagged' (high priority review)
 *   - Otherwise → 'pending' (normal review queue)
 *
 * - Established clients (> 30 days): Auto-approved
 *   - Only flagged if score > 0.9 (extreme threshold)
 *   - Otherwise → 'approved' (auto-approved)
 */
export function determineModerationStatus(
  moderation: ModerationResult,
  clientModerationRequired: boolean
): 'approved' | 'pending' | 'flagged' {
  const maxScore = Math.max(...Object.values(moderation.categoryScores));

  if (clientModerationRequired) {
    // New client - manual review
    if (moderation.flagged || maxScore > 0.7) {
      return 'flagged'; // High priority review
    }
    return 'pending'; // Normal review queue
  } else {
    // Established client - auto-approve unless extreme
    if (moderation.flagged || maxScore > 0.9) {
      return 'flagged'; // Only flag extreme cases
    }
    return 'approved'; // Auto-approved
  }
}

/**
 * Moderate multiple text fields and return combined result
 * Useful for landing pages with multiple content sections
 */
export async function moderateMultipleFields(
  fields: string[]
): Promise<ModerationResult> {
  // Combine all fields with separator
  const combinedText = fields.join('\n\n---\n\n');

  return moderateText(combinedText);
}
