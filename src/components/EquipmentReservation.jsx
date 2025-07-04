import React, { useState, useEffect } from "react";
import { getEquipmentReservations } from "../services/equipmentService";

const EquipmentReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 한국 요일
  const koreanDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 시간대 (8시부터 19시까지)
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8);

  // 날짜 포맷팅 함수
  const formatDateForDisplay = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 주간 데이터 생성
  const generateWeekDays = (date) => {
    const weekDays = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);

      const dateKey = formatDateForDisplay(day);
      const isToday =
        formatDateForDisplay(day) === formatDateForDisplay(new Date());

      weekDays.push({
        date: day,
        dateKey,
        isToday,
        dayOfWeek: day.getDay(),
      });
    }

    return weekDays;
  };

  // 이전 주
  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  // 다음 주
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 예약 데이터 가져오기
  const fetchReservations = async () => {
    try {
      setLoading(true);

      // 실제 API 호출 시도
      try {
        const response = await getEquipmentReservations();

        if (response.resultCode === "00") {
          setReservations(response.items || []);
          setError(null);
          return;
        } else {
          setError(response.resultMsg || "데이터를 불러오는데 실패했습니다.");
        }
      } catch (apiError) {
        console.log("API 서버 연결 실패, 샘플 데이터 사용:", apiError.message);
      }

      // API 호출 실패 시 샘플 데이터 사용 (개발용)
      const sampleData = {
        items: [
          {
            equipName: "레이저커팅기: 알디웍스(Rdworks)(콘텐츠공작소)",
            team: "남현경",
            stat: "REG",
            hopeDate: "2025-07-01",
            hopeHours: ["13", "14", "15"],
          },
          {
            equipName: "레이저커팅기: 알디웍스(Rdworks)(콘텐츠공작소)",
            team: "남현경",
            stat: "REG",
            hopeDate: "2025-07-02",
            hopeHours: ["13", "14", "15"],
          },
          {
            equipName: "3D프린터: 크리에이터프로(콘텐츠공작소)",
            team: "김철수",
            stat: "REG",
            hopeDate: "2025-07-03",
            hopeHours: ["9", "10", "11"],
          },
          {
            equipName: "CNC밀링: 하스코(콘텐츠공작소)",
            team: "이영희",
            stat: "REG",
            hopeDate: "2025-07-04",
            hopeHours: ["14", "15", "16"],
          },
        ],
      };

      setReservations(sampleData.items);
      setError(null);
    } catch (err) {
      setError("예약 데이터를 불러오는데 실패했습니다.");
      console.error("예약 데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // 특정 날짜와 시간의 예약 찾기
  const getReservationForTimeSlot = (dateKey, time) => {
    return reservations.filter(
      (reservation) =>
        reservation.hopeDate === dateKey &&
        reservation.hopeHours.includes(time.toString())
    );
  };

  // 시간대별 셀 렌더링
  const renderTimeSlot = (time, day) => {
    const dateKey = day.dateKey;
    const dayReservations = getReservationForTimeSlot(dateKey, time);

    return (
      <div
        key={`${dateKey}-${time}`}
        className={` p-2 border border-gray-200 ${
          day.isToday ? "bg-blue-50" : ""
        }`}
      >
        {/* <div className="text-xs text-gray-500 mb-1 font-medium">{time}:00</div> */}
        <div className="space-y-1 max-h-[50px] overflow-y-auto">
          {dayReservations.map((reservation, index) => (
            <div
              key={`${reservation.hopeDate}-${time}-${index}`}
              className="text-xs  p-1 rounded shadow-sm"
              title={`${reservation.equipName} - ${reservation.team}팀`}
            >
              {/* <div className="font-medium truncate">
                {reservation.equipName.split(":")[0]}
              </div> */}
              <div className="text-xs ">
                {time} / {reservation.team}
              </div>
            </div>
          ))}
          {/* {dayReservations.length === 0 && (
            <div className="text-xs text-gray-400 italic">예약 없음</div>
          )} */}
        </div>
      </div>
    );
  };

  const weekDays = generateWeekDays(currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">예약 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchReservations}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                오늘
              </button>
            </div>
          </div>

          {/* 주 네비게이션 */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-semibold text-gray-800">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              {Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7)}
              주차
            </h2>

            <button
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 주간 예약 테이블 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-8 bg-gray-100">
            <div className="p-4 text-center font-semibold text-gray-700">
              시간
            </div>
            {weekDays.map((day, index) => (
              <div
                key={day.dateKey}
                className={`p-4 text-center font-semibold ${
                  day.isToday ? "bg-blue-100" : ""
                } ${
                  index === 0
                    ? "text-red-500"
                    : index === 6
                    ? "text-blue-500"
                    : "text-gray-700"
                }`}
              >
                <div className="text-sm">{koreanDays[day.dayOfWeek]}</div>
                <div
                  className={`text-lg font-bold ${
                    day.isToday ? "text-blue-600" : ""
                  }`}
                >
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* 시간대별 그리드 */}
          <div className="grid grid-cols-8">
            {timeSlots.map((time) => (
              <React.Fragment key={time}>
                {/* 시간 헤더 */}
                <div className="p-2 border border-gray-200 bg-gray-50 text-center font-medium">
                  {time}:00
                </div>
                {/* 각 요일별 시간대 */}
                {weekDays.map((day) => renderTimeSlot(time, day))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentReservation;
