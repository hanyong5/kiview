import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";

function PointIncome() {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 사용자 검색
  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`phone.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(10);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("사용자 검색 오류:", error);
      alert("사용자 검색 중 오류가 발생했습니다.");
    } finally {
      setSearchLoading(false);
    }
  };

  // 사용자 선택
  const selectUser = (user) => {
    setSelectedUser(user);
  };

  // 빠른 금액 버튼
  const addAmount = (value) => {
    const currentAmount = parseInt(amount) || 0;
    setAmount((currentAmount + value).toString());
  };

  // 금액 초기화
  const resetAmount = () => {
    setAmount("0");
  };

  // 적립금 입력
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert("사용자를 선택해주세요.");
      return;
    }
    if (!amount || parseInt(amount) <= 0) {
      alert("적립금액을 입력해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      // 기존 잔액 조회
      const { data: existingBalance, error: balanceError } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", selectedUser.id)
        .single();
      let newBalance;
      if (balanceError && balanceError.code === "PGRST116") {
        // 잔액이 없는 경우 새로 생성
        newBalance = parseInt(amount);
        const { error: insertError } = await supabase.from("balances").insert([
          {
            user_id: selectedUser.id,
            balance: newBalance,
          },
        ]);
        if (insertError) throw insertError;
      } else if (balanceError) {
        throw balanceError;
      } else {
        // 기존 잔액에 추가
        newBalance = existingBalance.balance + parseInt(amount);
        const { error: updateError } = await supabase
          .from("balances")
          .update({ balance: newBalance })
          .eq("user_id", selectedUser.id);
        if (updateError) throw updateError;
      }
      alert(
        `${selectedUser.name}님에게 ${parseInt(
          amount
        ).toLocaleString()}원이 적립되었습니다.`
      );
      navigate("/point/list");
    } catch (error) {
      console.error("적립금 입력 오류:", error);
      alert("적립금 입력 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <h3>적립하기</h3>
        <div className="flex gap-2">
          <Link to="/point/income" className="btn btn-sm">
            적립하기
          </Link>
          <Link to="/point/list" className="btn btn-sm">
            적립내역
          </Link>
          <Link to="/point/sell" className="btn btn-sm">
            판매리스트
          </Link>
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 사용자 검색 및 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              사용자 검색
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름 또는 전화번호로 검색"
                className="input flex-1"
                onKeyPress={(e) => e.key === "Enter" && searchUsers()}
              />
              <button
                type="button"
                onClick={searchUsers}
                disabled={searchLoading}
                className="btn btn-primary"
              >
                {searchLoading ? "검색 중..." : "검색"}
              </button>
            </div>
            {/* 검색 결과 리스트 */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto mb-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                      selectedUser?.id === user.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div>
                      <span className="font-medium">{user.name}</span>
                      <span className="ml-2 text-gray-500 text-sm">
                        {user.phone}
                      </span>
                    </div>
                    {selectedUser?.id === user.id && (
                      <span className="text-blue-600 font-bold">선택됨</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* 선택된 사용자 정보 */}
            {selectedUser && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-2">
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedUser.phone}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  선택취소
                </button>
              </div>
            )}
          </div>

          {/* 적립금액 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">적립금액</label>
            <div className="space-y-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="적립금액을 입력하세요"
                className="input w-full"
                min="1"
                required
              />
              {/* 빠른 금액 버튼 */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addAmount(1000)}
                  className="btn btn-sm btn-outline flex-1"
                >
                  1000+
                </button>
                <button
                  type="button"
                  onClick={() => addAmount(10000)}
                  className="btn btn-sm btn-outline flex-1"
                >
                  10000+
                </button>
                <button
                  type="button"
                  onClick={() => addAmount(-1000)}
                  className="btn btn-sm btn-outline flex-1"
                >
                  1000-
                </button>
                <button
                  type="button"
                  onClick={() => addAmount(-10000)}
                  className="btn btn-sm btn-outline flex-1"
                >
                  10000-
                </button>
                <button
                  type="button"
                  onClick={resetAmount}
                  className="btn btn-sm btn-outline flex-1"
                >
                  0
                </button>
              </div>
            </div>
          </div>

          {/* 적립 버튼 */}
          <button
            type="submit"
            disabled={!selectedUser || !amount || isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? "적립 중..." : "적립하기"}
          </button>
        </form>
      </div>
    </>
  );
}

export default PointIncome;
