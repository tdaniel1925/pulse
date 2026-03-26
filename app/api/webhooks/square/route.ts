import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature, createSubscription, getSubscriptionPlanId } from '@/lib/services/square';
import { inngest } from '@/lib/inngest/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/square
 * Handle Square payment webhooks
 *
 * Based on:
 * - STORE-CONTRACTS.md - Square webhook contract
 * - DEPENDENCY-MAP.md - Payment & Plan Dependencies (Section 4)
 *
 * Events:
 * - payment.created → Setup fee paid
 * - subscription.created → Monthly subscription started
 * - subscription.updated → Plan changed
 * - invoice.payment_made → Monthly payment successful
 * - invoice.payment_failed → Payment failed
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-square-hmacsha256-signature');

    // Step 1: Verify webhook signature
    if (!signature || !verifyWebhookSignature(body, signature)) {
      console.error('Invalid Square webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = createAdminClient();

    // Step 2: Handle event based on type
    switch (event.type) {
      case 'payment.created': {
        // Setup fee payment received
        const payment = event.data.object.payment;
        const customerId = payment.customer_id;
        const paymentId = payment.id;

        // Find client by Square customer ID
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('square_customer_id', customerId)
          .maybeSingle();

        if (!client) {
          console.error(`Client not found for Square customer: ${customerId}`);
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Update client - mark setup fee as paid
        await supabase
          .from('clients')
          .update({
            square_setup_fee_payment_id: paymentId,
            setup_fee_paid: true,
          })
          .eq('id', client.id);

        // Create subscription for monthly plan
        try {
          const planId = getSubscriptionPlanId(client.plan);
          const subscription = await createSubscription({
            customerId: customerId,
            planId: planId,
            locationId: process.env.SQUARE_LOCATION_ID!,
          });

          await supabase
            .from('clients')
            .update({
              square_subscription_id: subscription.subscriptionId,
              plan_status: 'active',
            })
            .eq('id', client.id);
        } catch (error) {
          console.error('Failed to create subscription:', error);
          // Log error but don't fail webhook
        }

        // Trigger provisioning
        await inngest.send({
          name: 'apex/rep.provision',
          data: { client_id: client.id },
        });

        break;
      }

      case 'subscription.created': {
        const subscription = event.data.object.subscription;
        const customerId = subscription.customer_id;

        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('square_customer_id', customerId)
          .maybeSingle();

        if (client) {
          await supabase
            .from('clients')
            .update({
              square_subscription_id: subscription.id,
              plan_status: 'active',
            })
            .eq('id', client.id);
        }

        break;
      }

      case 'subscription.updated': {
        // Plan change (upgrade/downgrade)
        const subscription = event.data.object.subscription;

        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('square_subscription_id', subscription.id)
          .maybeSingle();

        if (client) {
          // Determine new plan from subscription variation ID
          // This is simplified - production needs proper plan ID mapping
          const newPlan = client.plan; // Keep current for now

          await supabase
            .from('clients')
            .update({
              plan: newPlan,
              plan_status: subscription.status === 'ACTIVE' ? 'active' : 'cancelled',
            })
            .eq('id', client.id);
        }

        break;
      }

      case 'invoice.payment_made': {
        // Monthly payment successful
        const invoice = event.data.object.invoice;
        const subscriptionId = invoice.subscription_id;

        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('square_subscription_id', subscriptionId)
          .maybeSingle();

        if (client) {
          await supabase
            .from('clients')
            .update({
              plan_status: 'active',
            })
            .eq('id', client.id);
        }

        break;
      }

      case 'invoice.payment_failed': {
        // Monthly payment failed
        const invoice = event.data.object.invoice;
        const subscriptionId = invoice.subscription_id;

        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('square_subscription_id', subscriptionId)
          .maybeSingle();

        if (client) {
          await supabase
            .from('clients')
            .update({
              plan_status: 'past_due',
            })
            .eq('id', client.id);

          // TODO: Send payment failed email
        }

        break;
      }

      default:
        console.log(`Unhandled Square webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Square webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
