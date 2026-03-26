import { inngest } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendDailyPostEmail } from '@/lib/services/resend';
import jwt from 'jsonwebtoken';

/**
 * Daily Email - Timezone-Aware Social Post Delivery
 * Based on DEPENDENCY-MAP.md - Email & Notification Dependencies (Section 5)
 *
 * Trigger: Cron - Every hour at :00
 * What it does:
 * 1. Calculate which clients are at 8:00am RIGHT NOW (timezone-aware)
 * 2. Get today's approved posts for those clients
 * 3. Filter by email preferences (respect unsubscribe)
 * 4. Build and send email with platform-specific posts
 * 5. Mark posts as sent
 * 6. Log email delivery
 */
export const dailyEmail = inngest.createFunction(
  {
    id: 'social-daily-email',
    name: 'Send Daily Social Post Emails',
    retries: 2,
  },
  {
    // Runs every hour at :00
    cron: '0 * * * *',
  },
  async ({ event, step }) => {
    const supabase = createAdminClient();

    // Step 1: Calculate current UTC time and determine target timezones
    const now = new Date();
    const currentHour = now.getUTCHours();

    // Map of UTC hours to IANA timezones that are at 8:00am
    // This is a simplified mapping - production should use proper timezone library
    const timezoneMap: Record<number, string[]> = {
      13: ['America/New_York', 'America/Detroit'],
      14: ['America/Chicago', 'America/Mexico_City'],
      15: ['America/Denver', 'America/Phoenix'],
      16: ['America/Los_Angeles', 'America/Vancouver'],
      // Add more timezone mappings as needed
    };

    const targetTimezones = timezoneMap[currentHour] || [];

    if (targetTimezones.length === 0) {
      // No timezones at 8am for this hour
      return { message: 'No timezones at 8am for this hour', sent: 0 };
    }

    // Step 2: Get clients in target timezones with email preferences enabled
    const { data: clients, error: clientsError } = await step.run(
      'load-clients-at-8am',
      async () => {
        return supabase
          .from('clients')
          .select('*, user:user_id(email)')
          .in('timezone', targetTimezones)
          .eq('plan_status', 'active')
          .eq('provisioning_complete', true);
      }
    );

    if (clientsError || !clients) {
      throw new Error(`Failed to load clients: ${clientsError?.message}`);
    }

    // Filter by email preferences (check daily_posts = true)
    const eligibleClients = clients.filter(
      (client) => client.email_preferences?.daily_posts === true
    );

    let emailsSent = 0;

    // Step 3: Process each client
    for (const client of eligibleClients) {
      await step.run(`send-email-${client.id}`, async () => {
        // Get today's posts (approved only)
        const today = now.toISOString().split('T')[0];

        const { data: posts, error: postsError } = await supabase
          .from('social_posts')
          .select('*')
          .eq('client_id', client.id)
          .eq('scheduled_date', today)
          .eq('moderation_status', 'approved')
          .is('email_sent_at', null);

        if (postsError) {
          console.error(`Failed to load posts for ${client.id}:`, postsError);
          return;
        }

        // If no posts, skip
        if (!posts || posts.length === 0) {
          return;
        }

        // Generate unsubscribe token (JWT)
        const unsubscribeToken = jwt.sign(
          { clientId: client.id },
          process.env.JWT_SECRET!,
          { expiresIn: '90d' }
        );

        // Get user email
        const userEmail = (client.user as any)?.email;
        if (!userEmail) {
          console.error(`No email found for client ${client.id}`);
          return;
        }

        // Send email
        try {
          await sendDailyPostEmail({
            to: userEmail,
            clientName: client.business_name,
            posts: posts as any[],
            unsubscribeToken,
          });

          // Mark posts as sent
          const postIds = posts.map((p) => p.id);
          await supabase
            .from('social_posts')
            .update({ email_sent_at: now.toISOString() })
            .in('id', postIds);

          emailsSent++;
        } catch (error) {
          console.error(`Failed to send email to ${userEmail}:`, error);
          // Continue to next client
        }
      });
    }

    // Step 4: Log email job
    await step.run('log-email-job', async () => {
      await supabase.from('generation_log').insert({
        client_id: null, // Global job
        job_type: 'daily_email',
        inngest_run_id: event.id,
        claude_tokens_in: 0,
        claude_tokens_out: 0,
        dalle_calls: 0,
        ideogram_calls: 0,
        sharp_operations: 0,
        emails_sent: emailsSent,
        status: 'complete',
        started_at: now.toISOString(),
        completed_at: new Date().toISOString(),
      });
    });

    return {
      timezones: targetTimezones,
      clientsChecked: eligibleClients.length,
      emailsSent,
    };
  }
);
