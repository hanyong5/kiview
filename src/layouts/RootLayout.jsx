import React from "react";
import { Outlet } from "react-router-dom";
import Menu from "./Menu";

function RootLayout() {
  return (
    <>
      <Menu />
      <div className=" mx-auto">
        <Outlet />
      </div>
    </>
  );
}

export default RootLayout;
