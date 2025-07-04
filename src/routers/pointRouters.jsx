import PointIncome from "../pages/point/PointIncome";
import SellPoint from "../pages/point/SellPoint";
import UserList from "../pages/point/UserList";

const pointRouters = [
  {
    path: "list",
    element: <UserList />,
  },
  {
    path: "income",
    element: <PointIncome />,
  },
  {
    path: "sell",
    element: <SellPoint />,
  },
];

export default pointRouters;
