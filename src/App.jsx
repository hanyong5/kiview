import React from "react";
import { RouterProvider } from "react-router-dom";
import root from "./routers/router";

function App() {
  return (
    <>
      <RouterProvider router={root} />
    </>
  );
}

export default App;
