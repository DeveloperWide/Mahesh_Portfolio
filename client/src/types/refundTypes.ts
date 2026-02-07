export type RefundRequest = {
  id: string;
  kind: "call" | string;
  name?: string;
  email: string;
  reason?: string;
  bookingId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amountMinor?: number;
  currency?: string;
  status: "requested" | "rejected" | "refunded" | "failed" | string;
  adminNote?: string;
  refundId?: string;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateRefundRequestResponse = {
  request: RefundRequest;
};

export type AdminRefundRequestsResponse = {
  requests: RefundRequest[];
  total: number;
  limit: number;
  skip: number;
};

