import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Prevent ethereum property redefinition errors from browser extensions
if (typeof window !== "undefined") {
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function (obj: any, prop: string, descriptor: PropertyDescriptor) {
    if (obj === window && prop === "ethereum") {
      if (window.ethereum) {
        return obj;
      }
    }
    return originalDefineProperty.call(Object, obj, prop, descriptor);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
