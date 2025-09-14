/* CENTRAL COMPONENT FOR ROUTING AND LAYOUT
 *
 * In this file, we define the App component that serves as the central point for routing and layout.
 *
 * It imports the AppRoutes component, which contains all the routes of the application.
 * Also sets up the main structure of the application.
 * Here you define the main layout, which can include headers, footers, or other common elements.
 */

import AppRoutes from "./AppRoutes";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import AOS from "aos";
console.log("Console Log Test");

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
      delay: 1200,
    });
  }, []);

  return (
    <>
      <main>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1333",
              color: "#fff",
              fontSize: "16px",
              padding: "14px 20px",
              borderRadius: "12px",
            },
          }}
        />
      </main>
    </>
  );
};

export default App;
