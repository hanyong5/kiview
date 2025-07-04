import ProductList from "../pages/product/ProductList";
import ProductWrite from "../pages/product/ProductWrite";
import ProductModi from "../pages/product/ProductModi";

const productRouters = [
  {
    path: "list",
    element: <ProductList />,
  },
  {
    path: "write",
    element: <ProductWrite />,
  },
  {
    path: "modify/:id",
    element: <ProductModi />,
  },
];

export default productRouters;
