import { Client as SquareClient, Environment } from 'square';
import crypto from 'crypto';
import type { CreateCustomerParams, CreateSubscriptionParams } from '@/lib/types/payments';

const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
});

/**
 * Square Payments API service
 * Based on STORE-CONTRACTS.md - Square service contract
 */

/**
 * Create Square customer
 */
export async function createCustomer(params: CreateCustomerParams) {
  const response = await squareClient.customersApi.createCustomer({
    emailAddress: params.email,
    givenName: params.givenName,
    familyName: params.familyName,
  });

  if (!response.result.customer) {
    throw new Error('Failed to create Square customer');
  }

  return { customerId: response.result.customer.id };
}

/**
 * Create Square subscription for monthly plan
 */
export async function createSubscription(params: CreateSubscriptionParams) {
  const response = await squareClient.subscriptionsApi.createSubscription({
    locationId: params.locationId,
    customerId: params.customerId,
    planVariationId: params.planId,
  });

  if (!response.result.subscription) {
    throw new Error('Failed to create Square subscription');
  }

  return { subscriptionId: response.result.subscription.id };
}

/**
 * Update subscription to new plan (upgrade/downgrade)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPlanId: string
) {
  await squareClient.subscriptionsApi.updateSubscription(subscriptionId, {
    subscription: {
      planVariationId: newPlanId,
    },
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  await squareClient.subscriptionsApi.cancelSubscription(subscriptionId);
}

/**
 * Verify Square webhook signature
 * Security: Ensures webhook requests actually come from Square
 *
 * Based on DEPENDENCY-MAP.md - Square webhook flow
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;

  // Square uses HMAC-SHA256
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  hmac.update(body);
  const hash = hmac.digest('base64');

  return hash === signature;
}

/**
 * Get plan ID from plan name
 * Uses environment variables for catalog IDs
 */
export function getSubscriptionPlanId(plan: string): string {
  const planIds: Record<string, string> = {
    starter: process.env.SQUARE_SUB_STARTER_PLAN_ID!,
    growth: process.env.SQUARE_SUB_GROWTH_PLAN_ID!,
    pro: process.env.SQUARE_SUB_PRO_PLAN_ID!,
    authority: process.env.SQUARE_SUB_AUTHORITY_PLAN_ID!,
  };

  const planId = planIds[plan];
  if (!planId) {
    throw new Error(`Unknown plan: ${plan}`);
  }

  return planId;
}

/**
 * Get setup fee catalog item ID from plan name
 */
export function getSetupFeeCatalogId(plan: string): string {
  const setupFeeIds: Record<string, string> = {
    starter: process.env.SQUARE_SETUP_FEE_STARTER_ID!,
    growth: process.env.SQUARE_SETUP_FEE_GROWTH_ID!,
    pro: process.env.SQUARE_SETUP_FEE_PRO_ID!,
    authority: process.env.SQUARE_SETUP_FEE_AUTHORITY_ID!,
  };

  const feeId = setupFeeIds[plan];
  if (!feeId) {
    throw new Error(`Unknown plan: ${plan}`);
  }

  return feeId;
}
