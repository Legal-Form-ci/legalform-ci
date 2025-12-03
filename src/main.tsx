import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Import i18n config before App to ensure translations are loaded
import "./i18n/config";

import App from "./App";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";
import { initGA } from "./utils/analytics";

// Initialize Google Analytics
initGA();

// Register Service Worker for offline support
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
