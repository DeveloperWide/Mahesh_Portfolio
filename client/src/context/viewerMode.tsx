import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ViewerMode = "student" | "hr";

type ViewerModeContextValue = {
  mode: ViewerMode;
  setMode: (mode: ViewerMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = "mr_viewer_mode";

const ViewerModeContext = createContext<ViewerModeContextValue | null>(null);

const readStoredMode = (): ViewerMode => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "student" || raw === "hr") return raw;
  return "hr";
};

export const ViewerModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<ViewerMode>(() => readStoredMode());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<ViewerModeContextValue>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === "hr" ? "student" : "hr")),
    }),
    [mode],
  );

  return (
    <ViewerModeContext.Provider value={value}>
      {children}
    </ViewerModeContext.Provider>
  );
};

export const useViewerMode = () => {
  const ctx = useContext(ViewerModeContext);
  if (!ctx) throw new Error("useViewerMode must be used within ViewerModeProvider");
  return ctx;
};

