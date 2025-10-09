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

import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Spinner from "../components/Spinner/Spinner";
import { useSettings } from "../providers/SettingsProvider";
import { useEffect, useRef } from "react";
import { ProjectService } from "../utils/ProjectService.ts";

import LandingPage from "../pages/LandingPage/LandingPage";
import HomePage from "../pages/HomePage/HomePage";
import StructureSelectionPage from "../pages/StructureSelectionPage/StructureSelectionPage";
import EditPage from "../pages/EditPage/EditPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import ProjectOverview from "../pages/ProjectOverview/ProjectOverview";
import ReadingPage from "../pages/ReadingPage/ReadingPage";
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
      <Route path="/read/:projectId" element={<ReadingPage />} />
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
  const navigate = useNavigate();
  const { settings } = useSettings();

  const prevSignedInRef = useRef<boolean>(isSignedIn);

  // Redirect the user to the last opened project
  useEffect(() => {
    if (!isLoaded) {
      prevSignedInRef.current = isSignedIn;
      return;
    }

    const wasSignedIn = prevSignedInRef.current;
    if (!wasSignedIn && isSignedIn) {
      // User hat sich soeben angemeldet
      console.log("[auth-redirect] detected sign-in transition");

      // SignUp should always go to /home
      if (pathname.startsWith("/signUp")) {
        console.log("[auth-redirect] on signUp -> navigate /home");
        navigate("/home", { replace: true });
        prevSignedInRef.current = isSignedIn;
        return;
      }

      // Only proceed when the user enabled lastOpenedProject in settings
      if (!settings?.lastOpenedProject) {
        console.log(
          "[auth-redirect] setting lastOpenedProject disabled -> no redirect"
        );
        prevSignedInRef.current = isSignedIn;
        return;
      }

      const last = localStorage.getItem("lastOpenedProjectId");
      if (!last) {
        console.log(
          "[auth-redirect] no lastOpenedProjectId set -> no redirect"
        );
        prevSignedInRef.current = isSignedIn;
        return;
      }

      // if already on that edit page, don't navigate
      if (pathname === `/edit/${last}`) {
        console.log(
          "[auth-redirect] already on the last project page -> no redirect"
        );
        prevSignedInRef.current = isSignedIn;
        return;
      }

      // Navigate to last project
      (async () => {
        try {
          const project = await ProjectService.getProjectById(last);
          if (project) {
            console.log("[auth-redirect] sign-in redirect -> edit page", last);
            navigate(`/edit/${last}`, { replace: true });
            // set per-project session flag so general /home redirects won't run again to same project
            sessionStorage.setItem("didRedirectToLastProject", last);
          } else {
            console.log(
              "[auth-redirect] last project not found -> removing key"
            );
            localStorage.removeItem("lastOpenedProjectId");
          }
        } catch (err) {
          console.warn(
            "[auth-redirect] error while checking last project:",
            err
          );
        }
      })();
    }

    // update ref
    prevSignedInRef.current = isSignedIn;
  }, [isLoaded, isSignedIn, pathname, navigate, settings?.lastOpenedProject]);

  useEffect(() => {
    // only run when fully loaded and signed in
    if (!isLoaded || !isSignedIn) return;
    if (!settings?.lastOpenedProject) return;

    // we consider /home as entry path for new-tab landing
    const entryPaths = ["/home"];
    const isEntry = entryPaths.some((p) => pathname.startsWith(p));
    if (!isEntry) return;

    const prevRedirectedProject = sessionStorage.getItem(
      "didRedirectToLastProject"
    );
    const last = localStorage.getItem("lastOpenedProjectId");
    if (!last) return;

    // if we've already redirected to this very project this session, skip
    if (prevRedirectedProject === last) {
      console.log(
        "[home-redirect] already redirected to this project this session -> skip"
      );
      return;
    }

    // if already on that project page, mark it and skip
    if (pathname === `/edit/${last}`) {
      sessionStorage.setItem("didRedirectToLastProject", last);
      return;
    }

    (async () => {
      try {
        const project = await ProjectService.getProjectById(last);
        if (project) {
          console.log(
            "[home-redirect] entry on /home -> redirect to last project",
            last
          );
          navigate(`/edit/${last}`, { replace: true });
          sessionStorage.setItem("didRedirectToLastProject", last);
        } else {
          console.log(
            "[home-redirect] project not found -> clearing stored id"
          );
          localStorage.removeItem("lastOpenedProjectId");
        }
      } catch (err) {
        console.warn("[home-redirect] error checking project:", err);
      }
    })();
  }, [isLoaded, isSignedIn, settings?.lastOpenedProject, pathname, navigate]);

  // 1)
  const publicPaths = ["/", "/signIn", "/signUp"];
  const protectedPaths = [
    "/home",
    "/edit",
    "/structureSelection",
    "/myProjects",
    "/read",
    "/communityPage",
  ];

  // 2)
  const isPublicPath = publicPaths.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );

  const isProtectedPath = protectedPaths.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
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
