type CreatePayPalOrderInput = {
  amountValue: string;
  currencyCode: string;
  description: string;
  customId: string;
  returnUrl: string;
  cancelUrl: string;
};

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalEnvironment = (process.env.PAYPAL_ENVIRONMENT || "sandbox").trim().toLowerCase();

function getPayPalBaseUrl() {
  return paypalEnvironment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function getPayPalClientCredentials() {
  if (!paypalClientId || !paypalClientSecret) {
    throw new Error("PayPal server environment variables are missing.");
  }

  return {
    clientId: paypalClientId,
    clientSecret: paypalClientSecret
  };
}

async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalClientCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with PayPal.");
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error("PayPal access token is missing.");
  }

  return payload.access_token;
}

export function hasPayPalServerEnv() {
  return Boolean(paypalClientId && paypalClientSecret);
}

export async function createPayPalOrder(input: CreatePayPalOrderInput) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: input.customId,
          description: input.description,
          amount: {
            currency_code: input.currencyCode,
            value: input.amountValue
          }
        }
      ],
      application_context: {
        user_action: "PAY_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl
      }
    })
  });

  if (!response.ok) {
    throw new Error("Unable to create PayPal checkout order.");
  }

  const payload = (await response.json()) as {
    id?: string;
    links?: Array<{ rel?: string; href?: string }>;
  };

  const orderId = payload.id?.trim();
  const approveUrl =
    payload.links?.find((link) => link.rel === "approve" && typeof link.href === "string")?.href?.trim() || "";

  if (!orderId || !approveUrl) {
    throw new Error("PayPal order response is missing required fields.");
  }

  return {
    orderId,
    approveUrl,
    raw: payload
  };
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      typeof payload.message === "string" && payload.message.trim()
        ? payload.message
        : "Unable to capture PayPal payment."
    );
  }

  return payload;
}
