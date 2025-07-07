import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../utils/supabase";
import { formatKST } from "../../utils/dateUtils";

function UserList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      // balances와 users를 조인하여 적립내역 조회
      const { data, error } = await supabase
        .from("balances")
        .select("balance, updated_at, users: user_id (name, phone)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setList(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <h3>적립내역</h3>
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
        {loading ? (
          <div className="text-center text-lg">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-500">오류: {error}</div>
        ) : list.length === 0 ? (
          <div className="text-center text-gray-500">적립내역이 없습니다.</div>
        ) : (
          <table className="w-full border text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2">이름</th>
                <th className="py-2 px-2">전화번호</th>
                <th className="py-2 px-2">적립금</th>
                <th className="py-2 px-2">최근적립일</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2 px-2">{row.users?.name || "-"}</td>
                  <td className="py-2 px-2">{row.users?.phone || "-"}</td>
                  <td className="py-2 px-2 font-bold text-blue-600">
                    {row.balance.toLocaleString()}원
                  </td>
                  <td className="py-2 px-2 text-gray-500">
                    {formatKST(row.updated_at, "datetime")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default UserList;
