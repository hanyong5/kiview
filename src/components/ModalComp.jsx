import React from "react";

function ModalComp({ show, totalQty, totalPrice, onClose, onPayment }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[320px] max-w-[90vw]">
        <h2 className="text-xl font-bold mb-4">결제하기</h2>
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
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-6 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-bold"
            onClick={onPayment}
          >
            결제완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalComp;
