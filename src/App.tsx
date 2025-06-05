/* CENTRAL COMPONENT FOR ROUTING AND LAYOUT
 *
 * In this file, we define the App component that serves as the central point for routing and layout.
 *
 * It imports the AppRoutes component, which contains all the routes of the application.
 * Also sets up the main structure of the application.
 * Here you define the main layout, which can include headers, footers, or other common elements.
 */

import AppRoutes from "./AppRoutes";

const App = () => {
  return (
    <>
      <main>
        <AppRoutes />
      </main>
    </>
  );
};

export default App;
