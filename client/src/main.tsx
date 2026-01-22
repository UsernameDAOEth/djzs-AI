import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";
import App from "./App";
import "./index.css";

const cdpConfig: Config = {
  projectId: import.meta.env.VITE_CDP_PROJECT_ID,
  appName: "DJZS",
  ethereum: { createOnLogin: "smart" },
  authMethods: ["email"],
};

const darkTheme: Partial<Theme> = {
  "colors-bg-default": "#0a0a0a",
  "colors-bg-alternate": "#171717",
  "colors-bg-overlay": "rgba(0, 0, 0, 0.95)",
  "colors-bg-primary": "#9333ea",
  "colors-bg-secondary": "#1f1f1f",
  "colors-fg-default": "#ffffff",
  "colors-fg-muted": "#a1a1aa",
  "colors-fg-primary": "#a855f7",
  "colors-fg-onPrimary": "#ffffff",
  "colors-line-default": "#27272a",
  "colors-line-heavy": "#3f3f46",
  "colors-line-primary": "#9333ea",
  "font-family-sans": "Inter, system-ui, sans-serif",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CDPReactProvider config={cdpConfig} theme={darkTheme}>
      <App />
    </CDPReactProvider>
  </StrictMode>
);
