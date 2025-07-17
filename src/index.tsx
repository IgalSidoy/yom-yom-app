import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 [index.tsx] Starting app initialization...");

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ Service Worker registered successfully:", registration);
      })
      .catch((error) => {
        console.log("❌ Service Worker registration failed:", error);
      });
  });
}

const container = document.getElementById("root");
console.log("🔍 [index.tsx] Root container found:", !!container);

if (container) {
  const root = createRoot(container);
  console.log("🔧 [index.tsx] React root created, rendering App...");
  root.render(<App />);
  console.log("✅ [index.tsx] App rendered successfully");
} else {
  console.error("❌ [index.tsx] Root container not found!");
}
