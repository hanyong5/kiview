import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  cartState,
  cartTotalQtySelector,
  cartTotalPriceSelector,
} from "../recoil/cartState";

function CartComp({ openModal }) {
  const [cart, setCart] = useRecoilState(cartState);
  const totalQty = useRecoilValue(cartTotalQtySelector);
  const totalPrice = useRecoilValue(cartTotalPriceSelector);

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

  return (
    <div className="bg-white border-t p-4 flex flex-col md:flex-row items-center gap-4 fixed w-full left-0 bottom-0 z-10">
      {cart.length === 0 ? (
        <div className="text-gray-400 flex-1">카트에 담긴 상품이 없습니다.</div>
      ) : (
        <>
          <div className="flex-1 flex items-center gap-4 overflow-x-auto">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 border rounded px-2 py-1 bg-gray-50"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-10 h-10 object-contain"
                />
                <div className="text-sm font-medium">{item.name}</div>
                <button onClick={() => changeQty(item.id, -1)} className="px-2">
                  -
                </button>
                <span className="font-bold text-lg">{item.qty}잔</span>
                <button onClick={() => changeQty(item.id, 1)} className="px-2">
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end gap-1 min-w-[180px]">
            <div>
              총 <b>{totalQty}</b>개 &nbsp; 합계금액{" "}
              <b className="text-2xl">{totalPrice.toLocaleString()}원</b>
            </div>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded text-lg mt-1"
              onClick={openModal}
            >
              제품주문
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartComp;
