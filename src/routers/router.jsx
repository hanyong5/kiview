import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import RootLayout from "../layouts/RootLayout";
import Login from "../pages/member/Login";
import Regist from "../pages/member/Regist";
import Phone from "../pages/member/Phone";
import ProductLayout from "../layouts/ProductLayout";
import productRouters from "./productRouters";
import pointRouters from "./pointRouters";
import PointLayout from "../layouts/PointLayout";
const root = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },

  {
    path: "/product",
    element: <ProductLayout />,
    children: productRouters,
  },
  {
    path: "/point",
    element: <PointLayout />,
    children: pointRouters,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/regist",
    element: <Regist />,
  },
  {
    path: "/phone",
    element: <Phone />,
  },
]);

export default root;
