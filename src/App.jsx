import React from "react";
import { RouterProvider } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { AuthProvider } from "./contexts/AuthContext";
import root from "./routers/router";

function App() {
  return (
    <RecoilRoot>
      <AuthProvider>
        <RouterProvider router={root} />
      </AuthProvider>
    </RecoilRoot>
  );
}

export default App;
