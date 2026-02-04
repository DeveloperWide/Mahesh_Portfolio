import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/auth.tsx";
import { ViewerModeProvider } from "./context/viewerMode.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ViewerModeProvider>
        <App />
      </ViewerModeProvider>
    </AuthProvider>
  </BrowserRouter>,
);
