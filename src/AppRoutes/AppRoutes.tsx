/* DEFINE ROUTES AND REDIRECTS
 *
 * In this file, we define the routes of the application and handle redirects based on the user's authentication status.
 * Here is defined which routes are public and which are protected,
 * and how the application should behave when a user is authenticated or not and want to access certain routes:
 *
 * 1) Public and protected paths are defined in camelCase.
 * 2) Define if a path is public or protected using `startsWith` for better matching.
 * 3) NOT AUTHENTICATED USER: If the user tries to access a protected route, redirect to "/signIn".
 * 4) NOT AUTHENTICATED USER: If the user tries to access an unknown path, redirect to the landing page "/".
 * 5) AUTHENTICATED USER: If the user tries to access the landing page or signIn/signUp pages, redirect to "/home".
 * 6) AUTHENTICATED USER: If the user tries to access an unknown path, redirect to "/home".
 * 7) Render all routes with Loaduing Spinner if Clerk is still loading user data.
 */

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Spinner from "../components/Spinner/Spinner";

import LandingPage from "../pages/LandingPage/LandingPage";
import HomePage from "../pages/HomePage/HomePage";
import StructureSelectionPage from "../pages/StructureSelectionPage/StructureSelectionPage";
import EditPage from "../pages/EditPage/EditPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import ProjectOverview from "../pages/ProjectOverview/ProjectOverview";
import CommunityPage from "../pages/CommunityPage/CommunityPage.tsx";

/*
 * AllRoutes Component
 * This component defines all the routes of the application.
 * It is used to render the routes based on the user's authentication status.
 */
function AllRoutes(isSignedIn: boolean) {
  return (
    <>
      {/* Public Paths */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signIn/*" element={<SignInPage />} />
      <Route path="/signUp/*" element={<SignUpPage />} />

      {/* Protected Paths */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/edit" element={<EditPage />} />
      <Route path="/edit/:projectId" element={<EditPage />} />
      <Route path="/structureSelection" element={<StructureSelectionPage />} />
      <Route path="/myProjects" element={<ProjectOverview />} />
        <Route path="/communityPage" element={<CommunityPage />} />


        {/* Catch-All (je nachdem ob der User signedIn ist oder nicht) */}
      <Route
        path="*"
        element={
          isSignedIn ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </>
  );
}

export default function AppRoutes() {
  const { isSignedIn, isLoaded } = useAuth();
  const { pathname } = useLocation();

  // 1)
  const publicPaths = ["/", "/signIn", "/signUp"];
  const protectedPaths = [
    "/home",
    "/edit",
    "/structureSelection",
    "/myProjects",
      "/communityPage",
  ];

  // 2)
  const isPublicPath = publicPaths.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p),
  );

  const isProtectedPath = protectedPaths.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p),
  );

  // Wait for Clerk to load before rendering routes
  // This prevents rendering issues when Clerk is still loading user data
  if (!isLoaded) {
    return (
      <>
        <Routes>{AllRoutes(false)}</Routes>
        <Spinner />
      </>
    );
  }

  // 3)
  if (!isSignedIn && isProtectedPath) {
    return <Navigate to="/signIn" replace />;
  }

  // 4)
  if (!isSignedIn && !isPublicPath && !isProtectedPath) {
    return <Navigate to="/" replace />;
  }

  // 5)
  if (isSignedIn && pathname === "/") {
    return <Navigate to="/home" replace />;
  }
  if (
    isSignedIn &&
    (pathname.startsWith("/signIn") || pathname.startsWith("/signUp"))
  ) {
    return <Navigate to="/home" replace />;
  }

  // 6)
  if (isSignedIn && !isPublicPath && !isProtectedPath) {
    return <Navigate to="/home" replace />;
  }

  // 7)
  return <Routes>{AllRoutes(isSignedIn)}</Routes>;
}
