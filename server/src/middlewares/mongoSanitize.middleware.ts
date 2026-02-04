import type { NextFunction, Request, Response } from "express";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const isUnsafeKey = (key: string) => key.startsWith("$") || key.includes(".");

const sanitizeObjectInPlace = (obj: Record<string, any>) => {
  for (const key of Object.keys(obj)) {
    if (isUnsafeKey(key)) {
      delete obj[key];
      continue;
    }

    const value = obj[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isPlainObject(item)) sanitizeObjectInPlace(item);
      }
      continue;
    }

    if (isPlainObject(value)) {
      sanitizeObjectInPlace(value);
    }
  }
};

// Express 5's `req.query` is a getter-only property, so we must avoid re-assigning it.
export const mongoSanitizeCompat = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (isPlainObject(req.body)) sanitizeObjectInPlace(req.body);
  if (isPlainObject(req.params)) sanitizeObjectInPlace(req.params);

  const q = req.query as unknown;
  if (isPlainObject(q)) sanitizeObjectInPlace(q);

  next();
};

