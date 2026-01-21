import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";
import App from "./App";
import "./index.css";

const cdpConfig: Config = {
  projectId: import.meta.env.VITE_CDP_PROJECT_ID,
  appName: "DJZS",
  ethereum: { createOnLogin: "smart" },
  authMethods: ["email", "oauth:google", "oauth:apple"],
};

// Dark theme matching the landing page aesthetic
const darkTheme = {
  "colors-bg-default": "#0a0a0a",
  "colors-bg-primary": "#9333ea",
  "colors-bg-secondary": "#1a1a1a",
  "colors-bg-overlay": "rgba(0, 0, 0, 0.85)",
  "colors-fg-default": "#ffffff",
  "colors-fg-secondary": "#a1a1aa",
  "colors-fg-primary": "#ffffff",
  "colors-border-default": "rgba(255, 255, 255, 0.1)",
  "colors-border-focus": "#9333ea",
} as Partial<Theme>;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CDPReactProvider config={cdpConfig} theme={darkTheme}>
      <App />
    </CDPReactProvider>
  </StrictMode>
);
