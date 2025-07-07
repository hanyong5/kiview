import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Menu() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-gray-200">
        <h1>
          <Link to="/">KIOSK 관리자</Link>
        </h1>
        <ul className="flex gap-4">
          <li>
            <Link to="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <Link to="/product/list" className="hover:text-blue-600">
                  상품관리
                </Link>
              </li>
              <li>
                <Link to="/queue" className="hover:text-blue-600">
                  주문큐
                </Link>
              </li>
              <li>
                <Link to="/point/list" className="hover:text-blue-600">
                  포인트 관리
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-blue-600">
                  판매내역
                </Link>
              </li>
              <li>
                <Link to="/queue" className="hover:text-blue-600">
                  주문큐
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  로그아웃
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-blue-600">
                  로그인
                </Link>
              </li>
              <li>
                <Link to="/regist" className="hover:text-blue-600">
                  회원가입
                </Link>
              </li>
              <li>
                <Link to="/phone" className="hover:text-blue-600">
                  전화번호
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </>
  );
}

export default Menu;
