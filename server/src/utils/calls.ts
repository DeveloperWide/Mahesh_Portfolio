import { CallSlotLock } from "../models/callSlotLock.model";

export type CallAvailabilityMode = "auto" | "manual";

export type CallConfig = {
  availabilityMode: CallAvailabilityMode;
  stepMinutes: number;
  bufferMinutes: number;
  autoDays: number;
  windowStartHour: number;
  windowEndHour: number;
  timeZone: string;
  currency: string;
  price30: number;
  price60: number;
  holdMinutes: number;
  requirePayment: boolean;
};

const clampInt = (
  value: string | undefined,
  fallback: number,
  opts?: { min?: number; max?: number },
) => {
  const n = Number.parseInt(String(value ?? ""), 10);
  const raw = Number.isFinite(n) ? n : fallback;
  const min = opts?.min ?? Number.NEGATIVE_INFINITY;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  return Math.min(max, Math.max(min, raw));
};

export const getCallConfig = (): CallConfig => {
  const availabilityMode =
    (process.env.CALL_AVAILABILITY_MODE as CallAvailabilityMode | undefined) ??
    "auto";

  const stepMinutes = clampInt(process.env.CALL_SLOT_STEP_MINUTES, 30, {
    min: 5,
    max: 60,
  });

  const bufferMinutes = clampInt(process.env.CALL_BUFFER_MINUTES, 15, {
    min: 0,
    max: 240,
  });

  const autoDays = clampInt(process.env.CALL_AUTO_DAYS, 14, {
    min: 1,
    max: 60,
  });

  const windowStartHour = clampInt(process.env.CALL_WINDOW_START_HOUR, 20, {
    min: 0,
    max: 23,
  });

  const windowEndHour = clampInt(process.env.CALL_WINDOW_END_HOUR, 9, {
    min: 0,
    max: 23,
  });

  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone?.trim() || "UTC";

  const currency = (process.env.CALL_CURRENCY || "INR").trim() || "INR";

  const price30 = clampInt(process.env.CALL_PRICE_30, 49900, { min: 0 });
  const price60 = clampInt(process.env.CALL_PRICE_60, 89900, { min: 0 });

  const holdMinutes = clampInt(process.env.CALL_HOLD_MINUTES, 10, {
    min: 1,
    max: 30,
  });

  const razorpayConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
  const requirePaymentRaw = (process.env.CALL_REQUIRE_PAYMENT ?? "").trim();
  const requirePayment =
    requirePaymentRaw === ""
      ? razorpayConfigured
      : requirePaymentRaw.toLowerCase() === "true";

  return {
    availabilityMode,
    stepMinutes,
    bufferMinutes,
    autoDays,
    windowStartHour,
    windowEndHour,
    timeZone,
    currency,
    price30,
    price60,
    holdMinutes,
    requirePayment,
  };
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export const formatLocalDateYMD = (date: Date) => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
};

export const startOfLocalDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addMinutes = (date: Date, minutes: number) => {
  return new Date(date.getTime() + minutes * 60_000);
};

export const ceilToStepLocal = (date: Date, stepMinutes: number) => {
  const d = new Date(date);
  const hadSubMinute = d.getSeconds() !== 0 || d.getMilliseconds() !== 0;
  d.setSeconds(0, 0);
  if (hadSubMinute) d.setMinutes(d.getMinutes() + 1);
  const remainder = d.getMinutes() % stepMinutes;
  if (remainder === 0) return d;
  d.setMinutes(d.getMinutes() + (stepMinutes - remainder), 0, 0);
  return d;
};

export const getNightWindowForStartDate = (
  startDate: Date,
  windowStartHour: number,
  windowEndHour: number,
) => {
  const windowStart = new Date(startDate);
  windowStart.setHours(windowStartHour, 0, 0, 0);

  const windowEnd = new Date(startDate);
  if (windowEndHour <= windowStartHour) {
    windowEnd.setDate(windowEnd.getDate() + 1);
  }
  windowEnd.setHours(windowEndHour, 0, 0, 0);

  return { windowStart, windowEnd };
};

export const isAllowedDuration = (durationMinutes: number) =>
  durationMinutes === 30 || durationMinutes === 60;

export const requiredLockBlockStarts = (
  startAt: Date,
  durationMinutes: number,
  stepMinutes: number,
) => {
  if (stepMinutes <= 0) return [];
  if (durationMinutes % stepMinutes !== 0) return [];

  const blocks: Date[] = [];
  const count = durationMinutes / stepMinutes;
  for (let i = 0; i < count; i += 1) {
    blocks.push(addMinutes(startAt, i * stepMinutes));
  }
  return blocks;
};

export type AvailabilityDay = {
  date: string; // YYYY-MM-DD, in server-local time
  windowStartAt: string;
  windowEndAt: string;
  slots: string[]; // ISO timestamps for slot startAt
};

export const listAvailableSlots = async (opts: {
  durationMinutes: number;
  days?: number;
  now?: Date;
}) => {
  const config = getCallConfig();
  const now = opts.now ?? new Date();
  const durationMinutes = opts.durationMinutes;

  if (!isAllowedDuration(durationMinutes)) {
    return {
      config,
      days: [] as AvailabilityDay[],
    };
  }

  const days = Math.min(
    clampInt(String(opts.days ?? config.autoDays), config.autoDays, {
      min: 1,
      max: config.autoDays,
    }),
    config.autoDays,
  );

  const overnight = config.windowEndHour <= config.windowStartHour;
  const baseDay = startOfLocalDay(now);
  if (overnight && now.getHours() < config.windowEndHour) {
    baseDay.setDate(baseDay.getDate() - 1);
  }

  const rangeStart = getNightWindowForStartDate(
    baseDay,
    config.windowStartHour,
    config.windowEndHour,
  ).windowStart;
  const lastDay = new Date(baseDay);
  lastDay.setDate(lastDay.getDate() + days - 1);
  const rangeEnd = getNightWindowForStartDate(
    lastDay,
    config.windowStartHour,
    config.windowEndHour,
  ).windowEnd;

  const locks = await CallSlotLock.find({
    blockStartAt: { $gte: rangeStart, $lt: rangeEnd },
    $or: [
      { kind: "booking" },
      { kind: "hold", expiresAt: { $gt: now } },
    ],
  }).select("blockStartAt");

  const locked = new Set<number>();
  for (const l of locks) {
    locked.add(new Date(l.blockStartAt).getTime());
  }

  const minStart = ceilToStepLocal(
    addMinutes(now, config.bufferMinutes),
    config.stepMinutes,
  );

  const result: AvailabilityDay[] = [];

  for (let i = 0; i < days; i += 1) {
    const dayStart = new Date(baseDay);
    dayStart.setDate(dayStart.getDate() + i);

    const { windowStart, windowEnd } = getNightWindowForStartDate(
      dayStart,
      config.windowStartHour,
      config.windowEndHour,
    );

    const effectiveStart = windowStart.getTime() < minStart.getTime()
      ? minStart
      : windowStart;

    const slots: string[] = [];
    for (
      let t = new Date(effectiveStart);
      addMinutes(t, durationMinutes).getTime() <= windowEnd.getTime();
      t = addMinutes(t, config.stepMinutes)
    ) {
      const blocks = requiredLockBlockStarts(t, durationMinutes, config.stepMinutes);
      if (blocks.length === 0) continue;
      const ok = blocks.every((b) => !locked.has(b.getTime()));
      if (!ok) continue;
      slots.push(t.toISOString());
    }

    result.push({
      date: formatLocalDateYMD(windowStart),
      windowStartAt: windowStart.toISOString(),
      windowEndAt: windowEnd.toISOString(),
      slots,
    });
  }

  return { config, days: result };
};
