import React from "react";
import { RouterProvider } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "./contexts/AuthContext";
import root from "./routers/router";
import InstallPWA from "./components/InstallPWA";
import OfflineIndicator from "./components/OfflineIndicator";

function App() {
  return (
    <RecoilRoot>
      <AuthProvider>
        <RouterProvider router={root} />
        <InstallPWA />
        <OfflineIndicator />
      </AuthProvider>
    </RecoilRoot>
  );
}

export default App;
