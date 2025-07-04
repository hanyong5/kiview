import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../utils/supabase";

function SellPoint() {
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'guest', 'member'

  useEffect(() => {
    fetchSalesList();
  }, []);

  const fetchSalesList = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // orders 테이블을 기준으로 조인하여 판매 내역 조회
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          total_price,
          created_at,
          users!inner (
            name,
            phone
          ),
          order_items (
            id,
            quantity,
            price,
            products!inner (
              name
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // order_items를 평면화하여 리스트 생성
      const flattenedData = [];
      data?.forEach((order) => {
        order.order_items?.forEach((item) => {
          flattenedData.push({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            orders: {
              id: order.id,
              total_price: order.total_price,
              created_at: order.created_at,
              users: order.users,
            },
            products: item.products,
          });
        });
      });

      setSalesList(flattenedData);
      setError(null);
    } catch (err) {
      console.error("판매 내역 조회 오류:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로 고침 함수
  const handleRefresh = () => {
    fetchSalesList(true);
  };

  // 비회원/회원 구분
  const guestSales = salesList.filter(
    (item) => item.orders.users.phone === "1004"
  );
  const memberSales = salesList.filter(
    (item) => item.orders.users.phone !== "1004"
  );

  // 현재 탭에 따른 데이터 필터링
  const getCurrentData = () => {
    switch (activeTab) {
      case "guest":
        return guestSales;
      case "member":
        return memberSales;
      default:
        return salesList;
    }
  };

  // 통계 계산
  const calculateStats = (data) => {
    const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = data.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const uniqueOrders = [...new Set(data.map((item) => item.orders.id))]
      .length;

    return { totalQuantity, totalAmount, uniqueOrders };
  };

  const currentData = getCurrentData();
  const allStats = calculateStats(salesList);
  const guestStats = calculateStats(guestSales);
  const memberStats = calculateStats(memberSales);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ko-KR");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-between items-center py-4">
          <h3>판매내역</h3>
          <div className="flex gap-2">
            <Link to="/point/income" className="btn btn-sm">
              적립하기
            </Link>
            <Link to="/point/list" className="btn btn-sm">
              적립내역
            </Link>
            <Link to="/point/sell" className="btn btn-sm btn-accent">
              판매리스트
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">로딩 중...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex justify-between items-center py-4">
          <h3>판매내역</h3>
          <div className="flex gap-2">
            <Link to="/point/income" className="btn btn-sm">
              적립하기
            </Link>
            <Link to="/point/list" className="btn btn-sm">
              적립내역
            </Link>
            <Link to="/point/sell" className="btn btn-sm btn-accent">
              판매리스트
            </Link>
          </div>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500">오류: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <h3>판매내역</h3>
        <div className="flex gap-2">
          <Link to="/point/income" className="btn btn-sm">
            적립하기
          </Link>
          <Link to="/point/list" className="btn btn-sm">
            적립내역
          </Link>
          <Link to="/point/sell" className="btn btn-sm btn-accent">
            판매리스트
          </Link>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-sm btn-outline"
            title="새로 고침"
          >
            {refreshing ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                새로고침
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
                새로고침
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold text-blue-800 mb-2">전체 통계</h4>
            <div className="text-sm">
              <div>주문 수: {allStats.uniqueOrders}건</div>
              <div>총 수량: {allStats.totalQuantity}개</div>
              <div>총 매출: {formatPrice(allStats.totalAmount)}원</div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">비회원 통계</h4>
            <div className="text-sm">
              <div>주문 수: {guestStats.uniqueOrders}건</div>
              <div>총 수량: {guestStats.totalQuantity}개</div>
              <div>총 매출: {formatPrice(guestStats.totalAmount)}원</div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">회원 통계</h4>
            <div className="text-sm">
              <div>주문 수: {memberStats.uniqueOrders}건</div>
              <div>총 수량: {memberStats.totalQuantity}개</div>
              <div>총 매출: {formatPrice(memberStats.totalAmount)}원</div>
            </div>
          </div>
        </div>

        {/* 탭 버튼 */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("all")}
          >
            전체 ({salesList.length})
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "guest" ? "bg-gray-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("guest")}
          >
            비회원 ({guestSales.length})
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "member" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("member")}
          >
            회원 ({memberSales.length})
          </button>
        </div>

        {/* 판매 내역 테이블 */}
        {currentData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {activeTab === "all" && "판매 내역이 없습니다."}
            {activeTab === "guest" && "비회원 판매 내역이 없습니다."}
            {activeTab === "member" && "회원 판매 내역이 없습니다."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-2">주문일시</th>
                  <th className="py-2 px-2">고객구분</th>
                  <th className="py-2 px-2">고객명</th>
                  <th className="py-2 px-2">전화번호</th>
                  <th className="py-2 px-2">상품명</th>
                  <th className="py-2 px-2">수량</th>
                  <th className="py-2 px-2">단가</th>
                  <th className="py-2 px-2">소계</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, idx) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 text-sm">
                      {formatDate(item.orders.created_at)}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.orders.users.phone === "1004"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-green-200 text-green-700"
                        }`}
                      >
                        {item.orders.users.phone === "1004" ? "비회원" : "회원"}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-medium">
                      {item.orders.users.name}
                    </td>
                    <td className="py-2 px-2 text-sm text-gray-600">
                      {item.orders.users.phone}
                    </td>
                    <td className="py-2 px-2">{item.products.name}</td>
                    <td className="py-2 px-2 font-bold">{item.quantity}개</td>
                    <td className="py-2 px-2">{formatPrice(item.price)}원</td>
                    <td className="py-2 px-2 font-bold text-blue-600">
                      {formatPrice(item.quantity * item.price)}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default SellPoint;
