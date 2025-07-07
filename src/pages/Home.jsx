import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Link } from "react-router-dom";
import supabase from "../utils/supabase";
import CartComp from "../components/CartComp";
import ModalComp from "../components/ModalComp";
import { cartState } from "../recoil/cartState";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useRecoilState(cartState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  // 카트에 상품 추가
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  };

  // 결제 모달 열기/닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // 관리자용 홈 페이지
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              KIOSK 관리자 대시보드
            </h1>
            <p className="text-lg text-gray-600">
              주문 관리, 포인트 관리, 판매 내역을 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 주문 큐 카드 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  주문 큐
                </h3>
                <p className="text-gray-600 mb-4">
                  실시간 주문 상태를 확인하고 관리하세요
                </p>
                <Link
                  to="/queue"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  주문 큐 보기
                </Link>
              </div>
            </div>

            {/* 판매 내역 카드 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  판매 내역
                </h3>
                <p className="text-gray-600 mb-4">
                  주문 내역과 매출 통계를 확인하세요
                </p>
                <Link
                  to="/orders"
                  className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  판매 내역 보기
                </Link>
              </div>
            </div>

            {/* 포인트 관리 카드 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  포인트 관리
                </h3>
                <p className="text-gray-600 mb-4">
                  회원 포인트 적립 및 사용 내역을 관리하세요
                </p>
                <Link
                  to="/point/list"
                  className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  포인트 관리
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 일반 사용자용 홈 페이지 (기존 코드)
  return (
    <div className=" bg-gray-50 flex pb-20 relative h-screen">
      {/* 상품 리스트 */}
      <div className="flex-1 p-4 flex  gap-3 items-start">
        {loading ? (
          <div className="col-span-full text-center text-lg">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 ">
            등록된 상품이 없습니다.
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
            >
              <img
                src={
                  product.image_url ||
                  "https://via.placeholder.com/200x200?text=No+Image"
                }
                alt={product.name}
                className="w-32 h-32 object-contain mb-2"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/200x200?text=No+Image";
                }}
              />
              <div className="font-semibold text-base mt-2 mb-1">
                {product.name}
              </div>
              <div className="text-gray-700 mb-2">
                {product.price.toLocaleString()}원
              </div>
              <button
                className="w-full bg-red-400 hover:bg-red-500 text-white py-2 rounded transition-colors"
                onClick={() => addToCart(product)}
              >
                주문하기
              </button>
            </div>
          ))
        )}
      </div>

      {/* 카트 영역 - CartComp로 분리 */}
      <CartComp openModal={openModal} />

      {/* 결제 모달 - ModalComp로 분리 */}
      <ModalComp show={showModal} onClose={closeModal} />
    </div>
  );
}

export default Home;
