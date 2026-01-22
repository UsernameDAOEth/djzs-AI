import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CDPReactProvider, type Config } from "@coinbase/cdp-react";
import App from "./App";
import "./index.css";

const cdpConfig: Config = {
  projectId: import.meta.env.VITE_CDP_PROJECT_ID,
  appName: "DJZS",
  ethereum: { createOnLogin: "smart" },
  authMethods: ["email"],
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CDPReactProvider config={cdpConfig}>
      <App />
    </CDPReactProvider>
  </StrictMode>
);
