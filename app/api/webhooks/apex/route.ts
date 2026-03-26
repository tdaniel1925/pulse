import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCustomer } from '@/lib/services/square';
import { inngest } from '@/lib/inngest/client';

/**
 * POST /api/webhooks/apex
 * Handle Apex Affinity Group provisioning webhooks
 *
 * Based on:
 * - STORE-CONTRACTS.md - Apex webhook contract
 * - DEPENDENCY-MAP.md - API Route Dependencies (Section 8)
 *
 * Flow:
 * 1. Verify shared secret
 * 2. Create client record
 * 3. Create Supabase Auth user
 * 4. Create Square customer
 * 5. Send magic link email
 * 6. Log provisioning event
 *
 * Note: Provisioning job (content generation) triggers when setup fee is paid
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Verify shared secret
    const secret = req.headers.get('x-apex-secret');

    if (!secret || secret !== process.env.APEX_WEBHOOK_SECRET) {
      console.error('Invalid Apex webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { event, rep_id, rep_code, name, email, rank, affiliate_link } = body;

    if (event !== 'rep.created') {
      return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Step 2: Check if client already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('apex_rep_id', rep_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        message: 'Client already exists',
        client_id: existing.id,
      });
    }

    // Step 3: Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // Will send magic link
      user_metadata: {
        name,
        rep_code,
        source: 'apex_webhook',
      },
    });

    if (authError || !authUser) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    // Step 4: Create Square customer
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const { customerId } = await createCustomer({
      email,
      givenName: firstName,
      familyName: lastName || undefined,
    });

    // Step 5: Create client record
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authUser.user.id,
        business_name: `${name} - Insurance Advisor`,
        rep_code: rep_code,
        industry: 'insurance',
        apex_rep_id: rep_id,
        apex_rank: rank,
        apex_affiliate_link: affiliate_link,
        square_customer_id: customerId,
        plan: 'starter',
        plan_status: 'trialing',
        timezone: 'America/Chicago', // Default, can update later
        brand_voice: 'professional',
        primary_goal: 'leads',
        selected_platforms: ['linkedin', 'facebook'],
        moderation_required: true,
        email_preferences: {
          daily_posts: true,
          monthly_report: true,
          product_updates: true,
        },
      })
      .select()
      .single();

    if (clientError) {
      throw new Error(`Failed to create client: ${clientError.message}`);
    }

    // Step 6: Send magic link (Supabase handles this automatically)
    // User will receive email with login link

    // Step 7: Log provisioning event
    await supabase.from('provision_log').insert({
      client_id: newClient.id,
      source: 'apex_webhook',
      event_type: 'rep.created',
      payload: body,
      status: 'pending',
      started_at: new Date().toISOString(),
    });

    // Step 8: Return success
    // Note: Actual provisioning (content generation) happens when setup fee is paid
    return NextResponse.json({
      success: true,
      client_id: newClient.id,
      user_id: authUser.user.id,
      square_customer_id: customerId,
      message: 'Client created. Awaiting setup fee payment to begin provisioning.',
    });
  } catch (error: any) {
    console.error('Apex webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
