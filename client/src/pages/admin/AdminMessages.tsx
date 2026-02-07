import { useEffect, useMemo, useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type {
  AdminContactMessage,
  AdminContactMessagesResponse,
} from "../../types/adminTypes";

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

const snippet = (value: string, max = 140) => {
  const v = String(value ?? "").trim().replace(/\s+/g, " ");
  if (v.length <= max) return v;
  return v.slice(0, max - 1) + "…";
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(
    () => messages.find((m) => m.id === activeId) ?? null,
    [messages, activeId],
  );

  const refresh = async (opts?: { query?: string }) => {
    try {
      setLoading(true);
      const res = await instance.get("/admin/contacts", {
        params: { limit: 200, q: opts?.query ?? q },
      });
      const payload = res.data as AdminContactMessagesResponse;
      setMessages(payload.messages ?? []);
      setTotal(payload.total ?? 0);
      setError(null);
      setActiveId((prev) =>
        prev && (payload.messages ?? []).some((m) => m.id === prev) ? prev : null,
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load messages");
      setMessages([]);
      setTotal(0);
      setActiveId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 bg-white rounded-2xl p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="mt-2 text-gray-600">
              Contact form submissions. Total:{" "}
              <span className="font-semibold">{total}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => refresh()}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
            placeholder="Search name/email/message…"
          />
          <button
            type="button"
            onClick={() => refresh({ query: q })}
            className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
            disabled={loading}
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : messages.length === 0 ? (
        <div className="text-gray-600">No messages yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
          <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 text-sm font-semibold text-gray-900">
              Latest
            </div>
            <div className="divide-y divide-gray-100">
              {messages.map((m) => {
                const isActive = m.id === activeId;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 ${isActive ? "bg-gray-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {m.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {m.email}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-500 shrink-0">
                        {formatWhen(m.createdAt)}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      {snippet(m.message)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-gray-200 bg-white rounded-2xl p-8">
            {!active ? (
              <div className="text-gray-600">Select a message to view.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-semibold text-gray-600">From</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">
                    {active.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    <a
                      href={`mailto:${active.email}`}
                      className="text-amber-700 font-semibold hover:underline underline-offset-4"
                    >
                      {active.email}
                    </a>
                    <span className="text-gray-400"> • </span>
                    <span className="text-gray-600">{formatWhen(active.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-600">Message</div>
                  <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
                    {active.message}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${active.email}?subject=${encodeURIComponent("Re: Portfolio message")}`}
                    className="px-5 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400"
                  >
                    Reply by email
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(active.message);
                        alert("Copied message");
                      } catch {
                        alert("Copy failed");
                      }
                    }}
                    className="px-5 py-3 rounded-xl border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50"
                  >
                    Copy message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;

