import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';

// Import all Inngest functions
import { monthlyGeneration } from '@/lib/inngest/monthly-generation';
import { dailyEmail } from '@/lib/inngest/daily-email';
import { apexProvision } from '@/lib/inngest/apex-provision';
import { cleanupOldImages } from '@/lib/inngest/cleanup-old-images';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Inngest API route
 * Registers all background job functions
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    monthlyGeneration,
    dailyEmail,
    apexProvision,
    cleanupOldImages,
  ],
});
