import { useEffect, useMemo, useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type { AdminCallBookingsResponse, CallBooking } from "../../types/callTypes";

const formatInTimeZone = (
  iso: string,
  timeZone: string,
  opts: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat(undefined, { timeZone, ...opts }).format(new Date(iso));

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

const statusBadge = (status: string) => {
  if (status === "scheduled") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled") return "bg-gray-50 text-gray-700 border-gray-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const AdminCalls = () => {
  const [bookings, setBookings] = useState<CallBooking[]>([]);
  const [timeZone, setTimeZone] = useState<string>("UTC");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"upcoming" | "all">("upcoming");
  const [status, setStatus] = useState<"" | "scheduled" | "completed" | "cancelled">(
    "",
  );

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/admin/calls/bookings", {
        params: {
          view,
          status: status || undefined,
        },
      });
      const payload = res.data as AdminCallBookingsResponse;
      setBookings(payload.bookings ?? []);
      setTimeZone(payload.timeZone ?? "UTC");
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, status]);

  const counts = useMemo(() => {
    const c = { scheduled: 0, completed: 0, cancelled: 0 };
    for (const b of bookings) {
      if (b.status === "scheduled") c.scheduled += 1;
      else if (b.status === "completed") c.completed += 1;
      else if (b.status === "cancelled") c.cancelled += 1;
    }
    return c;
  }, [bookings]);

  const updateStatus = async (id: string, nextStatus: "completed" | "cancelled") => {
    try {
      await instance.patch(`/admin/calls/bookings/${id}`, { status: nextStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b)),
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 bg-white rounded-2xl p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
            <p className="mt-2 text-gray-600">
              Upcoming and historical call bookings.
              <span className="text-gray-400"> ({timeZone})</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800"
            >
              <option value="upcoming">Upcoming</option>
              <option value="all">All</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-800"
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

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

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-semibold">
            Scheduled: {counts.scheduled}
          </span>
          <span className="text-xs px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold">
            Completed: {counts.completed}
          </span>
          <span className="text-xs px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-semibold">
            Cancelled: {counts.cancelled}
          </span>
        </div>
      </div>

      <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">
            {view === "upcoming" ? "Upcoming bookings" : "All bookings"}
          </div>
          <div className="text-sm text-gray-500">{bookings.length} total</div>
        </div>

        {loading ? (
          <div className="p-4 text-gray-600">Loading…</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-gray-600">
            No bookings yet.
            <div className="mt-1 text-sm text-gray-500">
              New bookings from the Call Slots page will appear here.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">When</th>
                  <th className="text-left font-semibold px-4 py-3">Duration</th>
                  <th className="text-left font-semibold px-4 py-3">Amount</th>
                  <th className="text-left font-semibold px-4 py-3">Title</th>
                  <th className="text-left font-semibold px-4 py-3">Topic</th>
                  <th className="text-left font-semibold px-4 py-3">Name</th>
                  <th className="text-left font-semibold px-4 py-3">Email</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-right font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => {
                  const when = formatInTimeZone(b.startAt, timeZone, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                        {when}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {b.durationMinutes}m
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {typeof b.amount === "number" && b.currency
                          ? formatMoney(b.amount, b.currency)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-900 max-w-[280px] truncate">
                        {b.title}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                        {b.topic}
                      </td>
                      <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                        {b.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {b.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${statusBadge(
                            b.status,
                          )}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === "scheduled" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => updateStatus(b.id, "completed")}
                                className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                              >
                                Mark done
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStatus(b.id, "cancelled")}
                                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 text-xs font-semibold hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCalls;
