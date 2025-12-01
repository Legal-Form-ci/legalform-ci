import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { registerServiceWorker } from "./utils/serviceWorkerRegistration";
import { initGA } from "./utils/analytics";

// Initialize Google Analytics
initGA();

// Register Service Worker for offline support
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
