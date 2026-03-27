/**
 * Square Payment Types
 * Proper type definitions for Square SDK
 */

export interface SquareCustomer {
  id: string;
  emailAddress?: string;
  givenName?: string;
  familyName?: string;
}

export interface SquareSubscription {
  id: string;
  locationId: string;
  customerId: string;
  planVariationId: string;
  status?: 'ACTIVE' | 'CANCELED' | 'PAUSED';
}

export interface SquarePayment {
  id: string;
  customerId?: string;
  amountMoney?: {
    amount: number;
    currency: string;
  };
  status?: string;
}

export interface CreateCustomerParams {
  email: string;
  givenName: string;
  familyName?: string;
}

export interface CreateSubscriptionParams {
  customerId: string;
  planId: string;
  locationId: string;
}

export interface SquareWebhookEvent {
  type: string;
  data: {
    object: {
      payment?: SquarePayment;
      subscription?: SquareSubscription;
      invoice?: {
        id: string;
        subscriptionId?: string;
      };
    };
  };
}
