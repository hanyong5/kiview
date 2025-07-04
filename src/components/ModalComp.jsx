import React, { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  cartTotalQtySelector,
  cartTotalPriceSelector,
  cartState,
} from "../recoil/cartState";
import supabase from "../utils/supabase";

function ModalComp({ show, onClose, onPayment }) {
  const totalQty = useRecoilValue(cartTotalQtySelector);
  const totalPrice = useRecoilValue(cartTotalPriceSelector);
  const cart = useRecoilValue(cartState);
  const setCart = useSetRecoilState(cartState);

  const [paymentType, setPaymentType] = useState(null); // 'guest' | 'member'
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  if (!show) return null;

  // 비회원 결제 처리
  const handleGuestPayment = async () => {
    setIsLoading(true);
    try {
      // 비회원용 사용자 ID (핸드폰 1004)
      const { data: guestUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("phone", "1004")
        .single();

      if (userError) throw userError;

      // 주문 생성
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: guestUser.id,
            total_price: totalPrice,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 주문 아이템 생성
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert("비회원 결제가 완료되었습니다!");
      setCart([]);
      onClose();
      setPaymentType(null);
    } catch (error) {
      console.error("비회원 결제 오류:", error);
      alert("결제 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원 전화번호 확인
  const checkMemberPhone = async () => {
    if (!phoneNumber.trim()) {
      alert("전화번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 사용자 조회
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name")
        .eq("phone", phoneNumber)
        .single();

      if (userError) {
        alert("등록되지 않은 전화번호입니다.");
        setIsLoading(false);
        return;
      }

      // 잔고 조회
      const { data: balance, error: balanceError } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      let currentBalance = 0;

      if (balanceError && balanceError.code === "PGRST116") {
        // 잔고가 없는 경우
        const addBalance = window.confirm(
          `${
            user.name
          }님의 적립금이 없습니다. ${totalPrice.toLocaleString()}원을 적립하시겠습니까?`
        );

        if (addBalance) {
          const { error: insertError } = await supabase
            .from("balances")
            .insert([
              {
                user_id: user.id,
                balance: totalPrice,
              },
            ]);

          if (insertError) throw insertError;
          currentBalance = totalPrice;
        } else {
          setIsLoading(false);
          return;
        }
      } else if (balanceError) {
        throw balanceError;
      } else {
        currentBalance = balance.balance;
      }

      // 잔고 정보 설정 및 화면 전환
      setUserBalance(currentBalance);
      setShowPhoneInput(true);
    } catch (error) {
      console.error("회원 확인 오류:", error);
      alert("회원 확인 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 잔고 새로 고침
  const refreshBalance = async () => {
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    try {
      // 사용자 조회
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name")
        .eq("phone", phoneNumber)
        .single();

      if (userError) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
      }

      // 잔고 조회
      const { data: balance, error: balanceError } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      let currentBalance = 0;

      if (balanceError && balanceError.code === "PGRST116") {
        currentBalance = 0;
      } else if (balanceError) {
        throw balanceError;
      } else {
        currentBalance = balance.balance;
      }

      setUserBalance(currentBalance);
      alert(
        `잔고가 업데이트되었습니다. 현재 잔고: ${currentBalance.toLocaleString()}원`
      );
    } catch (error) {
      console.error("잔고 새로 고침 오류:", error);
      alert("잔고 조회 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원 결제 처리
  const processMemberPayment = async () => {
    if (!userBalance || userBalance < totalPrice) {
      alert(
        `잔고가 부족합니다. 현재 잔고: ${userBalance?.toLocaleString() || 0}원`
      );
      return;
    }

    setIsLoading(true);
    try {
      // 사용자 ID 조회
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phoneNumber)
        .single();

      if (userError) throw userError;

      // 주문 생성
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            total_price: totalPrice,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // 주문 아이템 생성
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 적립금 차감
      const { error: balanceError } = await supabase
        .from("balances")
        .update({ balance: userBalance - totalPrice })
        .eq("user_id", user.id);

      if (balanceError) throw balanceError;

      alert("회원 결제가 완료되었습니다!");
      setCart([]);
      onClose();
      setPaymentType(null);
      setPhoneNumber("");
      setUserBalance(null);
      setShowPhoneInput(false);
    } catch (error) {
      console.error("회원 결제 오류:", error);
      alert("결제 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setPaymentType(null);
    setPhoneNumber("");
    setUserBalance(null);
    setShowPhoneInput(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[320px] max-w-[90vw]">
        {!paymentType ? (
          // 결제 방식 선택
          <>
            <h2 className="text-xl font-bold mb-4">결제 방식 선택</h2>
            <div className="mb-4">
              <div>
                총 주문수량: <b>{totalQty}</b>개
              </div>
              <div>
                합계금액:{" "}
                <b className="text-2xl">{totalPrice.toLocaleString()}원</b>
              </div>
            </div>
            <div className="space-y-3">
              <button
                className="w-full px-6 py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold"
                onClick={() => setPaymentType("guest")}
              >
                비회원 결제
              </button>
              <button
                className="w-full px-6 py-3 rounded bg-green-500 hover:bg-green-600 text-white font-bold"
                onClick={() => setPaymentType("member")}
              >
                회원 결제 (적립금 사용)
              </button>
            </div>
            <button
              className="w-full px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 mt-4"
              onClick={onClose}
            >
              취소
            </button>
          </>
        ) : paymentType === "guest" ? (
          // 비회원 결제 확인
          <>
            <h2 className="text-xl font-bold mb-4">비회원 결제</h2>
            <div className="mb-4">
              <div>
                총 주문수량: <b>{totalQty}</b>개
              </div>
              <div>
                합계금액:{" "}
                <b className="text-2xl">{totalPrice.toLocaleString()}원</b>
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={handleBack}
              >
                뒤로가기
              </button>
              <button
                className="px-6 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-bold"
                onClick={handleGuestPayment}
                disabled={isLoading}
              >
                {isLoading ? "처리 중..." : "결제하기"}
              </button>
            </div>
          </>
        ) : (
          // 회원 결제
          <>
            <h2 className="text-xl font-bold mb-4">회원 결제</h2>
            <div className="mb-4">
              <div>
                총 주문수량: <b>{totalQty}</b>개
              </div>
              <div>
                합계금액:{" "}
                <b className="text-2xl">{totalPrice.toLocaleString()}원</b>
              </div>
            </div>

            {!showPhoneInput ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="전화번호를 입력하세요"
                  className="input w-full"
                />
                <div className="flex gap-4 justify-end">
                  <button
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    onClick={handleBack}
                  >
                    뒤로가기
                  </button>
                  <button
                    className="px-6 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold"
                    onClick={checkMemberPhone}
                    disabled={isLoading}
                  >
                    {isLoading ? "확인 중..." : "확인"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">잔고 정보</span>
                    <button
                      onClick={refreshBalance}
                      disabled={isLoading}
                      className="btn btn-xs btn-outline"
                      title="잔고 새로 고침"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      ) : (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div>
                    현재 잔고:{" "}
                    <b className="text-blue-600">
                      {userBalance?.toLocaleString()}원
                    </b>
                  </div>
                  <div>
                    결제 후 잔고:{" "}
                    <b className="text-green-600">
                      {(userBalance - totalPrice).toLocaleString()}원
                    </b>
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    onClick={handleBack}
                  >
                    뒤로가기
                  </button>
                  <button
                    className="px-6 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-bold"
                    onClick={processMemberPayment}
                    disabled={isLoading}
                  >
                    {isLoading ? "결제 중..." : "결제하기"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ModalComp;
