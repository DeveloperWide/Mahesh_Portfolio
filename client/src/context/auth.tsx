import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { instance } from "../utils/axiosInstance";
import { readAuth, type StoredAuthState, writeAuth } from "../utils/authStorage";

type AuthState = StoredAuthState;

type LoginPayload = { email: string; password: string };

type AuthContextValue = AuthState & {
  login: (
    payload: LoginPayload,
  ) => Promise<
    { ok: true; isAdmin: boolean } | { ok: false; message: string }
  >;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => readAuth());

  useEffect(() => {
    writeAuth(state);
  }, [state]);

  const login = async (payload: LoginPayload) => {
    try {
      const res = await instance.post("/auth/login", payload);
      const next: AuthState = {
        user: res.data.user ?? null,
        token: res.data.token ?? null,
        isAdmin: Boolean(res.data.isAdmin),
      };
      setState(next);
      return { ok: true, isAdmin: next.isAdmin } as const;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed";
      return { ok: false, message } as const;
    }
  };

  const logout = async () => {
    try {
      await instance.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setState({ user: null, token: null, isAdmin: false });
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
