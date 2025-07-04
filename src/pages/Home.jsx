import React, { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import CartComp from "../components/CartComp";
import ModalComp from "../components/ModalComp";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  // 카트 수량 조절
  const changeQty = (id, diff) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + diff) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // 카트에서 상품 삭제
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // 카트 합계
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  // 결제 모달 열기/닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // 결제 완료 처리(예시)
  const handlePayment = () => {
    alert("결제가 완료되었습니다!");
    setCart([]);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상품 리스트 */}
      <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-lg">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
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
      <CartComp
        cart={cart}
        changeQty={changeQty}
        removeFromCart={removeFromCart}
        totalQty={totalQty}
        totalPrice={totalPrice}
        openModal={openModal}
      />

      {/* 결제 모달 - ModalComp로 분리 */}
      <ModalComp
        show={showModal}
        totalQty={totalQty}
        totalPrice={totalPrice}
        onClose={closeModal}
        onPayment={handlePayment}
      />
    </div>
  );
}

export default Home;
