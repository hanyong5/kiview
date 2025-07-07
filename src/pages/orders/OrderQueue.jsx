import React, { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { formatKST } from "../../utils/dateUtils";
import "./OrderQueue.css";

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedOrders, setCompletedOrders] = useState([]);

  // 주문 데이터 가져오기 (실시간)
  const fetchOrders = async () => {
    try {
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
        .in("status", ["pending", "processing"])
        .order("created_at", { ascending: true });

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

  // 완료된 주문 가져오기
  const fetchCompletedOrders = async () => {
    try {
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
        .in("status", ["completed", "delivered"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("완료된 주문 데이터 가져오기 오류:", error);
        return;
      }

      setCompletedOrders(data || []);
    } catch (error) {
      console.error("완료된 주문 데이터 가져오기 오류:", error);
    }
  };

  // Postgres CDC + WebSocket 기반 실시간 구독 설정
  useEffect(() => {
    console.log("실시간 구독 설정 시작");
    fetchOrders();
    fetchCompletedOrders();

    // Postgres CDC + WebSocket 기반 실시간 구독
    const ordersSubscription = supabase
      .channel("orders_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          console.log("새 주문 감지:", payload);
          console.log("새 주문 상태:", payload.new.status);

          // pending, processing 상태의 주문만 추가
          if (["pending", "processing"].includes(payload.new.status)) {
            // 새 주문 데이터 가져오기
            const { data: newOrder, error } = await supabase
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
              .eq("id", payload.new.id)
              .single();

            if (!error && newOrder) {
              console.log("새 주문을 목록에 추가:", newOrder.id);
              setOrders((prev) => [...prev, newOrder]);
            } else {
              console.error("새 주문 데이터 가져오기 오류:", error);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          console.log("주문 상태 변경 감지:", payload);
          console.log(
            "이전 상태:",
            payload.old.status,
            "새 상태:",
            payload.new.status
          );

          // 주문 상태에 따라 적절한 목록 업데이트
          if (["pending", "processing"].includes(payload.new.status)) {
            // 활성 주문 목록에서 업데이트
            setOrders((prev) => {
              const updated = prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              );
              console.log("활성 주문 목록 업데이트:", updated.length);
              return updated;
            });
          } else {
            // 완료된 주문으로 이동
            setOrders((prev) => {
              const filtered = prev.filter(
                (order) => order.id !== payload.new.id
              );
              console.log("완료된 주문을 활성 목록에서 제거:", filtered.length);
              return filtered;
            });

            // 완료된 주문 데이터 가져오기
            const { data: completedOrder, error } = await supabase
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
              .eq("id", payload.new.id)
              .single();

            if (!error && completedOrder) {
              console.log("완료된 주문을 완료 목록에 추가:", completedOrder.id);
              setCompletedOrders((prev) => [
                completedOrder,
                ...prev.slice(0, 9),
              ]);
            } else {
              console.error("완료된 주문 데이터 가져오기 오류:", error);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("주문 삭제 감지:", payload);
          // 삭제된 주문을 목록에서 제거
          setOrders((prev) =>
            prev.filter((order) => order.id !== payload.old.id)
          );
          setCompletedOrders((prev) =>
            prev.filter((order) => order.id !== payload.old.id)
          );
        }
      )
      .subscribe((status) => {
        console.log("실시간 구독 상태:", status);
        if (status === "SUBSCRIBED") {
          console.log("실시간 구독이 성공적으로 연결되었습니다.");
        } else if (status === "CHANNEL_ERROR") {
          console.error("실시간 구독 연결 오류");
        } else if (status === "TIMED_OUT") {
          console.error("실시간 구독 연결 시간 초과");
        }
      });

    // 폴링 백업 (실시간 구독이 작동하지 않을 경우를 대비)
    const pollingInterval = setInterval(() => {
      console.log("폴링으로 데이터 새로고침");
      fetchOrders();
      fetchCompletedOrders();
    }, 10000); // 10초마다 폴링

    return () => {
      console.log("실시간 구독 해제");
      ordersSubscription.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, []);

  // 주문 상태 변경
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`주문 ${orderId} 상태를 ${newStatus}로 변경 중...`);

      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("상태 변경 오류:", error);
        return;
      }

      console.log("상태 변경 성공, 실시간 업데이트 대기 중...");

      // 실시간 구독이 작동하지 않을 경우를 대비해 수동으로 상태 업데이트
      setTimeout(() => {
        console.log("수동으로 목록 새로고침");
        fetchOrders();
        fetchCompletedOrders();
      }, 1000);
    } catch (error) {
      console.error("상태 변경 오류:", error);
    }
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
    return formatKST(dateString, "time");
  };

  // 주문 총액 계산
  const calculateTotal = (orderItems) => {
    return orderItems.reduce((total, item) => {
      return total + (item.products?.price || 0) * item.quantity;
    }, 0);
  };

  // 대기 중인 주문 수
  const pendingCount = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const processingCount = orders.filter(
    (order) => order.status === "processing"
  ).length;

  if (loading) {
    return (
      <div className="order-queue-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="order-queue-container">
      <div className="order-queue-header">
        <h2>주문 큐</h2>
        <div className="order-stats">
          <div className="stat-item">
            <span className="stat-label">대기:</span>
            <span className="stat-value pending">{pendingCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">제작중:</span>
            <span className="stat-value processing">{processingCount}</span>
          </div>
        </div>
      </div>

      {/* 대기 중인 주문 */}
      <div className="orders-section">
        <h3>대기 중인 주문 ({pendingCount})</h3>
        <div className="orders-grid">
          {orders
            .filter((order) => order.status === "pending")
            .map((order) => (
              <div key={order.id} className="order-card pending">
                <div className="order-header">
                  <div className="order-number">#{order.id.slice(0, 8)}</div>
                  <div className="order-time">
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div className="order-customer">
                  {order.users?.name || "비회원"} (
                  {order.users?.phone || "1004"})
                </div>
                <div className="order-drinks">
                  {getSummaryDrinks(order.order_items)}
                </div>
                <div className="order-details">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span className="item-name">{item.products?.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="order-actions">
                  <button
                    className="btn-start"
                    onClick={() => updateOrderStatus(order.id, "processing")}
                  >
                    제작 시작
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 제작 중인 주문 */}
      <div className="orders-section">
        <h3>제작 중인 주문 ({processingCount})</h3>
        <div className="orders-grid">
          {orders
            .filter((order) => order.status === "processing")
            .map((order) => (
              <div key={order.id} className="order-card processing">
                <div className="order-header">
                  <div className="order-number">#{order.id.slice(0, 8)}</div>
                  <div className="order-time">
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div className="order-customer">
                  {order.users?.name || "비회원"} (
                  {order.users?.phone || "1004"})
                </div>
                <div className="order-drinks">
                  {getSummaryDrinks(order.order_items)}
                </div>
                <div className="order-details">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span className="item-name">{item.products?.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="order-actions">
                  <button
                    className="btn-complete"
                    onClick={() => updateOrderStatus(order.id, "completed")}
                  >
                    완료
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 최근 완료된 주문 */}
      <div className="orders-section" style={{ display: "none" }}>
        <h3>최근 완료된 주문</h3>
        <div className="completed-orders">
          {completedOrders.map((order) => (
            <div key={order.id} className="completed-order">
              <div className="completed-order-info">
                <span className="order-number">#{order.id.slice(0, 8)}</span>
                <span className="order-customer">
                  {order.users?.name || "비회원"}
                </span>
                <span className="order-drinks">
                  {getSummaryDrinks(order.order_items)}
                </span>
                <span className="order-time">
                  {formatDate(order.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderQueue;
