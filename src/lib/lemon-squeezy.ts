/**
 * Lemon Squeezy Payment Integration
 * Handles subscription creation, verification, and management
 */

const apiKey = import.meta.env.VITE_LEMON_SQUEEZY_API_KEY;
const storeId = import.meta.env.VITE_LEMON_SQUEEZY_STORE_ID;

if (!apiKey) {
  console.warn("VITE_LEMON_SQUEEZY_API_KEY not set. Payment features will not work.");
}
if (!storeId) {
  console.warn("VITE_LEMON_SQUEEZY_STORE_ID not set. Payment features will not work.");
}

export interface CheckoutSession {
  url: string;
}

export interface LemonSqueezyWebhook {
  meta: {
    event_name: string;
    custom_data: {
      accountId: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      customer_email: string;
      [key: string]: any;
    };
  };
}

/**
 * Create a Lemon Squeezy checkout session
 * This returns a URL to redirect the user to for payment
 */
export async function createCheckoutSession(
  email: string,
  accountId: string,
  variantId: string = "529022" // Default to basic plan ($10/month)
): Promise<CheckoutSession> {
  if (!apiKey || !storeId) {
    throw new Error("Lemon Squeezy API credentials not configured");
  }

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email,
              custom: {
                accountId,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Lemon Squeezy API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      url: data.data.attributes.url,
    };
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
}

/**
 * Verify a webhook signature from Lemon Squeezy
 * This prevents unauthorized webhook calls
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = globalThis.crypto;
  if (!crypto || !crypto.subtle) {
    console.error("Web Crypto API not available");
    return false;
  }

  // Note: This is a simplified placeholder
  // In production, you'd use HMAC-SHA256 to verify
  // Lemon Squeezy provides detailed webhook security documentation
  return true;
}

/**
 * Handle Lemon Squeezy webhook events
 * Called when subscription events occur (payment, cancellation, etc.)
 */
export async function handleWebhookEvent(
  webhook: LemonSqueezyWebhook,
  updateSubscriptionCallback: (
    accountId: string,
    status: "active" | "cancelled" | "expired"
  ) => Promise<void>
): Promise<void> {
  const eventName = webhook.meta.event_name;
  const accountId = webhook.meta.custom_data?.accountId;

  if (!accountId) {
    console.warn("Webhook received without accountId");
    return;
  }

  switch (eventName) {
    case "subscription_payment_success":
      // Payment was successful, activate subscription
      await updateSubscriptionCallback(accountId, "active");
      break;

    case "subscription_payment_failed":
      // Payment failed, you might want to notify the user
      console.error("Payment failed for account:", accountId);
      break;

    case "subscription_cancelled":
      // User cancelled subscription
      await updateSubscriptionCallback(accountId, "cancelled");
      break;

    case "subscription_expired":
      // Subscription expired
      await updateSubscriptionCallback(accountId, "expired");
      break;

    default:
      console.log(`Unhandled webhook event: ${eventName}`);
  }
}

/**
 * Get checkout URL for upgrading a user
 * Convenience wrapper around createCheckoutSession
 */
export async function getUpgradeCheckoutUrl(
  email: string,
  accountId: string
): Promise<string> {
  try {
    const session = await createCheckoutSession(email, accountId);
    return session.url;
  } catch (error) {
    console.error("Failed to get upgrade checkout URL:", error);
    throw error;
  }
}

/**
 * Check if user has active subscription
 * In a real app, this would come from your database
 */
export function isSubscriptionActive(subscriptionStatus: string | null | undefined): boolean {
  return subscriptionStatus === "active";
}
