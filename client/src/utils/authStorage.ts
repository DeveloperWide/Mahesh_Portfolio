export type StoredAuthUser = {
  id: string;
  name: string;
  email: string;
};

export type StoredAuthState = {
  user: StoredAuthUser | null;
  token: string | null;
  isAdmin: boolean;
};

const STORAGE_KEY = "mr_portfolio_auth";

export const readAuth = (): StoredAuthState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null, isAdmin: false };
    const parsed = JSON.parse(raw) as StoredAuthState;
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
      isAdmin: Boolean(parsed.isAdmin),
    };
  } catch {
    return { user: null, token: null, isAdmin: false };
  }
};

export const writeAuth = (state: StoredAuthState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getToken = () => readAuth().token;

