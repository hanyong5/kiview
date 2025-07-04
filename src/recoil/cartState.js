import { atom, selector } from "recoil";

// localStorage에서 장바구니 데이터 불러오기
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("장바구니 로드 오류:", error);
    return [];
  }
};

// 장바구니 상태 atom
export const cartState = atom({
  key: "cartState",
  default: loadCartFromStorage(),
  effects: [
    ({ onSet }) => {
      onSet((newCart) => {
        // 장바구니 상태가 변경될 때마다 localStorage에 저장
        try {
          localStorage.setItem("cart", JSON.stringify(newCart));
        } catch (error) {
          console.error("장바구니 저장 오류:", error);
        }
      });
    },
  ],
});

// 장바구니 선택자 (총 수량 계산)
export const cartTotalQtySelector = selector({
  key: "cartTotalQtySelector",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((sum, item) => sum + item.qty, 0);
  },
});

// 장바구니 선택자 (총 금액 계산)
export const cartTotalPriceSelector = selector({
  key: "cartTotalPriceSelector",
  get: ({ get }) => {
    const cart = get(cartState);
    return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  },
});
