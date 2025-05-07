import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import logger from "loglevel";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";

logger.info("[main.tsx] Application started 🥳");

// Import Clerk Publishable Key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if the Clerk Publishable Key is defined
if (!CLERK_PUBLISHABLE_KEY) {
  logger.error("[App.tsx] Missing Clerk Publishable Key");
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />
          <Route path="/*" element={<App />} />
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
