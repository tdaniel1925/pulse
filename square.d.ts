/**
 * Type declarations for Square SDK
 * Since @types/square doesn't exist, we declare the module here
 */
declare module 'square' {
  export class Client {
    constructor(config: {
      accessToken: string;
      environment: Environment;
    });

    customersApi: CustomersApi;
    subscriptionsApi: SubscriptionsApi;
  }

  export enum Environment {
    Production = 'production',
    Sandbox = 'sandbox',
  }

  export interface CustomersApi {
    createCustomer(body: {
      emailAddress?: string;
      givenName?: string;
      familyName?: string;
    }): Promise<{
      result: {
        customer?: {
          id: string;
        };
      };
    }>;
  }

  export interface SubscriptionsApi {
    createSubscription(body: {
      locationId: string;
      customerId: string;
      planVariationId: string;
    }): Promise<{
      result: {
        subscription?: {
          id: string;
        };
      };
    }>;

    updateSubscription(
      subscriptionId: string,
      body: {
        subscription: {
          planVariationId: string;
        };
      }
    ): Promise<any>;

    cancelSubscription(subscriptionId: string): Promise<any>;
  }
}
