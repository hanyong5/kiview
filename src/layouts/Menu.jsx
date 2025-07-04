import React from "react";
import { Link } from "react-router-dom";

function Menu() {
  return (
    <>
      <div className="flex justify-between items-center p-4 bg-gray-200">
        <h1>
          <Link to="/">LOGO</Link>
        </h1>
        <ul className="flex gap-4">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/product/list">products</Link>
          </li>
          <li>
            <Link to="/login">login</Link>
          </li>
          <li>
            <Link to="/regist">regist</Link>
          </li>
          <li>
            <Link to="/phone">phone</Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Menu;
