import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import supabase from "../utils/supabase";
import CartComp from "../components/CartComp";
import ModalComp from "../components/ModalComp";
import { cartState } from "../recoil/cartState";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useRecoilState(cartState);

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
