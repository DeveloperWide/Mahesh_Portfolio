const withoutTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getPublicSiteUrl = () => {
  const explicit = (process.env.PUBLIC_SITE_URL || "").trim();
  if (explicit) return withoutTrailingSlash(explicit);

  const cors = (process.env.CORS_ORIGINS || "").split(",")[0]?.trim();
  if (cors) return withoutTrailingSlash(cors);

  return "http://localhost:5173";
};

export const publicLink = (path: string) => {
  const base = getPublicSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

