import { useEffect, useMemo, useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type { AdminAnalyticsResponse } from "../../types/adminTypes";

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

const formatWhen = (iso: string | null) => {
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

const StatCard = (props: {
  label: string;
  value: string;
  hint?: string;
}) => {
  return (
    <div className="border border-gray-200 bg-white rounded-2xl p-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {props.label}
      </div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{props.value}</div>
      {props.hint ? (
        <div className="mt-1 text-sm text-gray-600">{props.hint}</div>
      ) : null}
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/admin/analytics");
      setData(res.data as AdminAnalyticsResponse);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currency = data?.revenue.currency ?? "INR";
  const revenueTotal = useMemo(
    () => formatMoney(data?.revenue.totalMinor ?? 0, currency),
    [data?.revenue.totalMinor, currency],
  );
  const revenue30d = useMemo(
    () => formatMoney(data?.revenue.last30dMinor ?? 0, currency),
    [data?.revenue.last30dMinor, currency],
  );

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 bg-white rounded-2xl p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Quick stats for calls, contacts, and revenue.
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {data?.generatedAt ? `Updated: ${formatWhen(data.generatedAt)}` : null}
            </div>
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
      </div>

      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !data ? (
        <div className="text-gray-600">No data.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <StatCard
            label="Contact Messages"
            value={String(data.contacts.total)}
            hint={`Last 7 days: ${data.contacts.last7d} • Last: ${formatWhen(data.contacts.lastAt)}`}
          />
          <StatCard
            label="Call Bookings"
            value={String(data.calls.total)}
            hint={`Upcoming: ${data.calls.upcoming} • Last: ${formatWhen(data.calls.lastAt)}`}
          />
          <StatCard
            label="Revenue (Total)"
            value={revenueTotal}
            hint={`Last 30 days: ${revenue30d} • ${data.timeZone}`}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

