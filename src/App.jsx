import React from "react";
import { RouterProvider } from "react-router-dom";
import { RecoilRoot } from "recoil";
import root from "./routers/router";

function App() {
  return (
    <RecoilRoot>
      <RouterProvider router={root} />
    </RecoilRoot>
  );
}

export default App;
