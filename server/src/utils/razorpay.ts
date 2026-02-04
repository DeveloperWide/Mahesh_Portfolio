import crypto from "crypto";

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

const getRazorpayKeyId = () => (process.env.RAZORPAY_KEY_ID || "").trim();
const getRazorpayKeySecret = () => (process.env.RAZORPAY_KEY_SECRET || "").trim();

export const razorpayIsConfigured = () =>
  Boolean(getRazorpayKeyId() && getRazorpayKeySecret());

export const createRazorpayOrder = async (payload: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (missing env vars).");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: payload.amount,
      currency: payload.currency,
      receipt: payload.receipt,
      notes: payload.notes ?? {},
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create Razorpay order");
  }

  const data = (await res.json()) as RazorpayOrder;
  return data;
};

export const getRazorpayPublicConfig = () => {
  const keyId = getRazorpayKeyId();
  if (!keyId) {
    throw new Error("Razorpay is not configured (missing key id).");
  }
  return { keyId };
};

export const verifyRazorpaySignature = (payload: {
  orderId: string;
  paymentId: string;
  signature: string;
}) => {
  const keySecret = getRazorpayKeySecret();
  if (!keySecret) {
    throw new Error("Razorpay is not configured (missing key secret).");
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${payload.orderId}|${payload.paymentId}`)
    .digest("hex");

  return expected === payload.signature;
};

