import React, { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { formatKST } from "../../utils/dateUtils";
import "./OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("week"); // 'week' or 'month'
  const [expandedOrder, setExpandedOrder] = useState(null);

  // 주간/월간 필터링을 위한 날짜 계산 (한국 시간 기준)
  const getDateRange = (type) => {
    const now = new Date();
    // 한국 시간으로 변환 (UTC + 9)
    const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const startOfWeek = new Date(kstNow);
    const startOfMonth = new Date(kstNow.getFullYear(), kstNow.getMonth(), 1);

    if (type === "week") {
      startOfWeek.setDate(kstNow.getDate() - kstNow.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return {
        start: startOfWeek.toISOString(),
        end: kstNow.toISOString(),
      };
    } else {
      return {
        start: startOfMonth.toISOString(),
        end: kstNow.toISOString(),
      };
    }
  };

  // 주문 데이터 가져오기
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(filterType);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          users (
            name,
            phone
          ),
          order_items (
            *,
            products (
              name,
              price
            )
          )
        `
        )
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("주문 데이터 가져오기 오류:", error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("주문 데이터 가져오기 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterType]);

  // 주문 총액 계산
  const calculateTotal = (orderItems) => {
    return orderItems.reduce((total, item) => {
      return total + (item.products?.price || 0) * item.quantity;
    }, 0);
  };

  // 요약 음료명 생성
  const getSummaryDrinks = (orderItems) => {
    const drinkMap = {};

    orderItems.forEach((item) => {
      const productName = item.products?.name || "";
      const quantity = item.quantity || 0;

      // 음료명을 간단한 형태로 변환
      let shortName = "";
      if (productName.includes("아메리카노")) {
        if (productName.includes("아이스")) {
          shortName = "아아";
        } else {
          shortName = "아";
        }
      } else if (productName.includes("라떼")) {
        if (productName.includes("아이스")) {
          shortName = "아라";
        } else {
          shortName = "라";
        }
      } else if (productName.includes("카푸치노")) {
        shortName = "카";
      } else if (productName.includes("모카")) {
        shortName = "모";
      } else if (productName.includes("에스프레소")) {
        shortName = "에";
      } else {
        // 기타 음료는 첫 글자만 사용
        shortName = productName.charAt(0);
      }

      if (shortName) {
        drinkMap[shortName] = (drinkMap[shortName] || 0) + quantity;
      }
    });

    // 요약 문자열 생성
    const summary = Object.entries(drinkMap)
      .map(([name, quantity]) => `${name}${quantity}`)
      .join(", ");

    return summary || "상품 없음";
  };

  // 날짜 포맷팅 (한국 시간)
  const formatDate = (dateString) => {
    return formatKST(dateString, "datetime");
  };

  // 상태 텍스트 변환 함수
  const getStatusText = (status) => {
    const statusMap = {
      pending: "주문접수",
      processing: "처리중",
      completed: "완료",
      cancelled: "취소",
      shipped: "배송중",
      delivered: "배송완료",
    };
    return statusMap[status] || status;
  };

  // 상태별 CSS 클래스 반환 함수
  const getStatusClass = (status) => {
    const classMap = {
      pending: "status-pending",
      processing: "status-processing",
      completed: "status-completed",
      cancelled: "status-cancelled",
      shipped: "status-shipped",
      delivered: "status-delivered",
    };
    return classMap[status] || "status-default";
  };

  // 상태 변경 핸들러
  const handleStatusChange = async (orderId, newStatus, orderData) => {
    try {
      // 취소 상태로 변경하는 경우 적립금 환불 처리 (회원만)
      if (newStatus === "cancelled" && orderData.status !== "cancelled") {
        // 비회원 여부 확인 (전화번호가 1004인 경우)
        const isGuest = orderData.users?.phone === "1004";

        if (isGuest) {
          // 비회원 취소 시 환불 없음
          const shouldCancel = window.confirm(
            `비회원 주문을 취소하시겠습니까?\n비회원 주문은 환불되지 않습니다.`
          );

          if (!shouldCancel) {
            return;
          }
        } else {
          // 회원 취소 시 환불 처리
          const shouldRefund = window.confirm(
            `주문을 취소하시겠습니까?\n주문 금액 ${orderData.total_price.toLocaleString()}원이 적립금으로 환불됩니다.`
          );

          if (!shouldRefund) {
            return;
          }

          // 적립금 환불 처리
          const { data: balance, error: balanceError } = await supabase
            .from("balances")
            .select("balance")
            .eq("user_id", orderData.user_id)
            .single();

          if (balanceError && balanceError.code === "PGRST116") {
            // 잔고가 없는 경우 새로 생성
            const { error: insertError } = await supabase
              .from("balances")
              .insert([
                {
                  user_id: orderData.user_id,
                  balance: orderData.total_price,
                },
              ]);

            if (insertError) {
              console.error("적립금 생성 오류:", insertError);
              alert("적립금 환불 중 오류가 발생했습니다.");
              return;
            }
          } else if (balanceError) {
            console.error("적립금 조회 오류:", balanceError);
            alert("적립금 조회 중 오류가 발생했습니다.");
            return;
          } else {
            // 기존 잔고에 환불 금액 추가
            const { error: updateError } = await supabase
              .from("balances")
              .update({ balance: balance.balance + orderData.total_price })
              .eq("user_id", orderData.user_id);

            if (updateError) {
              console.error("적립금 업데이트 오류:", updateError);
              alert("적립금 환불 중 오류가 발생했습니다.");
              return;
            }
          }
        }
      }

      // 주문 상태 업데이트
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("상태 변경 오류:", error);
        alert("상태 변경에 실패했습니다.");
        return;
      }

      // 성공 시 주문 목록 새로고침
      fetchOrders();

      if (newStatus === "cancelled") {
        const isGuest = orderData.users?.phone === "1004";
        if (isGuest) {
          alert("비회원 주문이 취소되었습니다.");
        } else {
          alert(
            `주문이 취소되었습니다.\n${orderData.total_price.toLocaleString()}원이 적립금으로 환불되었습니다.`
          );
        }
      } else {
        alert("상태가 변경되었습니다.");
      }
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  // 행 클릭 핸들러
  const handleRowClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="order-list-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>판매내역</h2>
        <div>
          오늘 주문 수량: {orders.length}개 / 총 판매액:{" "}
          {orders
            .reduce((total, order) => {
              return total + calculateTotal(order.order_items);
            }, 0)
            .toLocaleString()}
          원
        </div>
        <div className="filter-buttons">
          <button
            className={filterType === "week" ? "active" : ""}
            onClick={() => setFilterType("week")}
          >
            주간
          </button>
          <button
            className={filterType === "month" ? "active" : ""}
            onClick={() => setFilterType("month")}
          >
            월간
          </button>
        </div>
      </div>

      <div className="order-list">
        {orders.length === 0 ? (
          <div className="no-orders">주문 내역이 없습니다.</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-item">
              <div
                className="order-header"
                onClick={() => handleRowClick(order.id)}
              >
                <div className="order-info">
                  <div
                    className={`order-status-display ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </div>
                  <div className="order-customer">
                    주문자: {order.users?.name || "알 수 없음"}
                  </div>
                  <div className="order-drinks">
                    {getSummaryDrinks(order.order_items)}
                  </div>
                  <div className="order-date">
                    {formatDate(order.created_at)}
                  </div>
                  <div className="order-total">
                    총액: {calculateTotal(order.order_items).toLocaleString()}원
                  </div>
                </div>
                <div className="expand-icon">
                  {expandedOrder === order.id ? "▼" : "▶"}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="order-details">
                  <div className="order-items">
                    <h4>주문 상품</h4>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="order-item-detail">
                        <div className="item-name">{item.products?.name}</div>
                        <div className="item-quantity">
                          수량: {item.quantity}
                        </div>
                        <div className="item-price">
                          가격: {(item.products?.price || 0).toLocaleString()}원
                        </div>
                        <div className="item-total">
                          소계:{" "}
                          {(
                            (item.products?.price || 0) * item.quantity
                          ).toLocaleString()}
                          원
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-summary">
                    <div className="total-amount">
                      총 주문액:{" "}
                      {calculateTotal(order.order_items).toLocaleString()}원
                    </div>
                    <div className="order-status-section">
                      <div className="order-status">
                        상태: {getStatusText(order.status)}
                      </div>
                      <div className="status-buttons">
                        <button
                          className={`status-btn ${
                            order.status === "pending" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(order.id, "pending", order)
                          }
                        >
                          주문접수
                        </button>
                        <button
                          className={`status-btn ${
                            order.status === "processing" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(order.id, "processing", order)
                          }
                        >
                          처리중
                        </button>
                        <button
                          className={`status-btn ${
                            order.status === "shipped" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(order.id, "shipped", order)
                          }
                        >
                          배송중
                        </button>
                        <button
                          className={`status-btn ${
                            order.status === "delivered" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(order.id, "delivered", order)
                          }
                        >
                          배송완료
                        </button>
                        <button
                          className={`status-btn ${
                            order.status === "completed" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(order.id, "completed", order)
                          }
                        >
                          완료
                        </button>
                        <button
                          className={`status-btn ${
                            order.status === "cancelled" ? "active" : ""
                          }`}
                          onClick={() =>
                            handleStatusChange(order.id, "cancelled", order)
                          }
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;
