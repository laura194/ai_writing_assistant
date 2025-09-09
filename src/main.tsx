/* ENTRY POINT FOR THE APPLICATION
 *
 * This file is the main entry point for the React application.
 * It initializes the application, sets up the Clerk provider for authentication,
 * and renders the App component within a BrowserRouter.
 *
 * It also includes the global CSS styles of the index.css file.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import logger from "loglevel";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ThemeProvider } from "./providers/ThemeProvider.tsx";

logger.info("[main.tsx] Application started 🥳");

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  logger.error("[main.tsx] Missing Clerk Publishable Key");
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      {/* URL AFTER SIGN OUT */}
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </ThemeProvider>
  </StrictMode>,
);
