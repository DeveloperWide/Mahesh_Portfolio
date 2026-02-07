import { useEffect, useMemo, useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type { AdminRefundRequestsResponse, RefundRequest } from "../../types/refundTypes";

const formatWhen = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
};

const statusBadge = (status: string) => {
  if (status === "requested") return "bg-amber-50 text-amber-800 border-amber-200";
  if (status === "refunded") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (status === "rejected") return "bg-gray-50 text-gray-700 border-gray-200";
  if (status === "failed") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const formatMoney = (amountMinor: number, currency: string) => {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${major.toFixed(2)} ${currency}`;
  }
};

const AdminRefunds = () => {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("");

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/admin/refunds", {
        params: { limit: 200, status: status || undefined },
      });
      const payload = res.data as AdminRefundRequestsResponse;
      setRequests(payload.requests ?? []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load refund requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const totals = useMemo(() => {
    const t = { requested: 0, refunded: 0, rejected: 0, failed: 0 };
    for (const r of requests) {
      if (r.status === "requested") t.requested += 1;
      else if (r.status === "refunded") t.refunded += 1;
      else if (r.status === "rejected") t.rejected += 1;
      else if (r.status === "failed") t.failed += 1;
    }
    return t;
  }, [requests]);

  const approve = async (id: string) => {
    const ok = confirm("Approve and initiate refund now?");
    if (!ok) return;
    try {
      await instance.post(`/admin/refunds/${id}/approve`, {});
      await refresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Approve failed");
    }
  };

  const reject = async (id: string) => {
    const note = prompt("Reject note (optional):") ?? "";
    const ok = confirm("Reject this refund request?");
    if (!ok) return;
    try {
      await instance.post(`/admin/refunds/${id}/reject`, { note });
      await refresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Reject failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 bg-white rounded-2xl p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
            <p className="mt-2 text-gray-600">
              Refund requests from the Refund Policy page.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800"
          >
            <option value="">All statuses</option>
            <option value="requested">Requested</option>
            <option value="refunded">Refunded</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-800 font-semibold">
              Requested: {totals.requested}
            </span>
            <span className="text-xs px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold">
              Refunded: {totals.refunded}
            </span>
            <span className="text-xs px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-semibold">
              Rejected: {totals.rejected}
            </span>
            <span className="text-xs px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 font-semibold">
              Failed: {totals.failed}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-600">No refund requests yet.</div>
      ) : (
        <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">Requests</div>
            <div className="text-sm text-gray-500">{requests.length} shown</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">When</th>
                  <th className="text-left font-semibold px-4 py-3">Email</th>
                  <th className="text-left font-semibold px-4 py-3">Payment ID</th>
                  <th className="text-left font-semibold px-4 py-3">Order ID</th>
                  <th className="text-left font-semibold px-4 py-3">Amount</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-left font-semibold px-4 py-3">Note</th>
                  <th className="text-right font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {formatWhen(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      <a
                        href={`mailto:${r.email}`}
                        className="text-amber-700 font-semibold hover:underline underline-offset-4"
                      >
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono">
                      {r.razorpayPaymentId || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono">
                      {r.razorpayOrderId || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {typeof r.amountMinor === "number" && r.currency
                        ? formatMoney(r.amountMinor, r.currency)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${statusBadge(
                          r.status,
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[360px] truncate">
                      {r.adminNote || r.reason || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === "requested" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => approve(r.id)}
                              className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => reject(r.id)}
                              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 text-xs font-semibold hover:bg-gray-50"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;

