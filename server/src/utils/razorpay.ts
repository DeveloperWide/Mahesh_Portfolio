import crypto from "crypto";

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

type RazorpayRefund = {
  id: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
};

type RazorpayPayment = {
  id: string;
  entity?: string;
  amount: number;
  currency: string;
  status: string;
  order_id?: string | null;
  captured?: boolean;
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

export const createRazorpayRefund = async (payload: {
  paymentId: string;
  amount: number;
  notes?: Record<string, string>;
}): Promise<RazorpayRefund> => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (missing env vars).");
  }

  const paymentId = payload.paymentId.trim();
  if (!paymentId) throw new Error("paymentId is required");

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: payload.amount,
        notes: payload.notes ?? {},
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create Razorpay refund");
  }

  const data = (await res.json()) as RazorpayRefund;
  return data;
};

export const getRazorpayPayment = async (
  paymentIdRaw: string,
): Promise<RazorpayPayment> => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured (missing env vars).");
  }

  const paymentId = paymentIdRaw.trim();
  if (!paymentId) throw new Error("paymentId is required");

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        authorization: `Basic ${auth}`,
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch Razorpay payment");
  }

  const data = (await res.json()) as RazorpayPayment;
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
