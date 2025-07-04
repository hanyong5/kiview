import React, { useState, useEffect } from "react";
import {
  formatDate,
  formatDateShort,
  getDayInfo,
  getSpecialDayInfo,
  getLunarDate,
  getWeekOfMonth,
  getWeekOfYear,
  holidays,
  solarTerms,
  memorialDays,
} from "../utils/koreanCalendar";

const CalendarComp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // month, week
  const [schedules, setSchedules] = useState({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // 로컬 스토리지에서 일정 불러오기
  useEffect(() => {
    const savedSchedules = localStorage.getItem("weeklySchedules");
    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (error) {
        console.error("일정 데이터 로드 실패:", error);
      }
    }
  }, []);

  // 일정 변경시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem("weeklySchedules", JSON.stringify(schedules));
  }, [schedules]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && selectedTimeSlot) {
        setSelectedTimeSlot(null);
      }
      if (e.key === "ArrowLeft" && e.ctrlKey) {
        e.preventDefault();
        prevWeek();
      }
      if (e.key === "ArrowRight" && e.ctrlKey) {
        e.preventDefault();
        nextWeek();
      }
      if (e.key === "Home" && e.ctrlKey) {
        e.preventDefault();
        goToToday();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [selectedTimeSlot]);

  // 한국 요일
  const koreanDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 한국 월 이름
  const koreanMonths = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

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

      // 특별한 날 정보 가져오기
      const specialDayInfo = getSpecialDayInfo(day);
      const dayInfo = getDayInfo(day);
      const lunarDate = getLunarDate(day);

      weekDays.push({
        date: day,
        dateKey,
        isToday,
        dayOfWeek: day.getDay(),
        dayInfo,
        lunarDate,
        ...specialDayInfo,
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
    setSelectedDate(null);
  };

  // 일정 추가
  const addSchedule = (
    dateKey,
    time,
    title,
    description = "",
    color = "blue"
  ) => {
    const newSchedules = { ...schedules };
    if (!newSchedules[dateKey]) {
      newSchedules[dateKey] = {};
    }
    if (!newSchedules[dateKey][time]) {
      newSchedules[dateKey][time] = [];
    }

    newSchedules[dateKey][time].push({
      id: Date.now(),
      title,
      description,
      time,
      color,
    });

    setSchedules(newSchedules);
  };

  // 일정 삭제
  const deleteSchedule = (dateKey, time, scheduleId) => {
    const newSchedules = { ...schedules };
    if (newSchedules[dateKey] && newSchedules[dateKey][time]) {
      newSchedules[dateKey][time] = newSchedules[dateKey][time].filter(
        (schedule) => schedule.id !== scheduleId
      );
      setSchedules(newSchedules);
    }
  };

  const weekDays = generateWeekDays(currentDate);

  // 시간대별 셀 렌더링
  const renderTimeSlot = (time, day) => {
    const dateKey = day.dateKey;
    const daySchedules = schedules[dateKey]?.[time] || [];
    const isSelected =
      selectedTimeSlot &&
      selectedTimeSlot.dateKey === dateKey &&
      selectedTimeSlot.time === time;

    return (
      <div
        key={`${dateKey}-${time}`}
        className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
          isSelected ? "bg-blue-100 border-blue-400" : ""
        } ${day.isToday ? "bg-blue-50" : ""}`}
        onClick={() => setSelectedTimeSlot({ dateKey, time })}
      >
        <div className="text-xs text-gray-500 mb-1 font-medium">{time}:00</div>
        <div className="space-y-1 max-h-[50px] overflow-y-auto">
          {daySchedules.map((schedule) => {
            const colorClasses = {
              blue: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300",
              green:
                "bg-gradient-to-r from-green-100 to-green-200 text-green-800 hover:from-green-200 hover:to-green-300",
              purple:
                "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300",
              orange:
                "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 hover:from-orange-200 hover:to-orange-300",
              red: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300",
            };

            return (
              <div
                key={schedule.id}
                className={`text-xs ${
                  colorClasses[schedule.color] || colorClasses.blue
                } p-1 rounded cursor-pointer transition-all duration-200 shadow-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSchedule(dateKey, time, schedule.id);
                }}
                title={`${schedule.title} - ${schedule.description}`}
              >
                <div className="font-medium truncate">{schedule.title}</div>
                {schedule.description && (
                  <div className="text-xs truncate opacity-80">
                    {schedule.description}
                  </div>
                )}
              </div>
            );
          })}
          {daySchedules.length === 0 && (
            <div className="text-xs text-gray-400 italic">
              클릭하여 일정 추가
            </div>
          )}
        </div>
      </div>
    );
  };

  // 일정 추가 모달
  const ScheduleModal = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("blue");

    if (!selectedTimeSlot) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (title.trim()) {
        addSchedule(
          selectedTimeSlot.dateKey,
          selectedTimeSlot.time,
          title,
          description,
          color
        );
        setTitle("");
        setDescription("");
        setColor("blue");
        setSelectedTimeSlot(null);
      }
    };

    const selectedDay = weekDays.find(
      (day) => day.dateKey === selectedTimeSlot.dateKey
    );
    const dayInfo = selectedDay ? getDayInfo(selectedDay.date) : null;
    const specialInfo = selectedDay
      ? getSpecialDayInfo(selectedDay.date)
      : null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📅 일정 추가</h3>
            <button
              onClick={() => setSelectedTimeSlot(null)}
              className="text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 날짜 정보 */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="text-sm text-blue-800">
              <span className="font-semibold">
                {selectedDay?.date.getMonth() + 1}월{" "}
                {selectedDay?.date.getDate()}일 ({dayInfo?.korean}요일){" "}
                {selectedTimeSlot.time}:00
              </span>
            </div>
            {specialInfo?.holiday && (
              <div className="text-xs text-red-600 mt-1">
                🎉 {specialInfo.holiday.name}
              </div>
            )}
            {specialInfo?.solarTerm && (
              <div className="text-xs text-green-600 mt-1">
                🌱 {specialInfo.solarTerm}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">📝 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="일정 제목을 입력하세요"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">📄 설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="일정 설명을 입력하세요 (선택사항)"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">🎨 색상</label>
              <div className="flex gap-2">
                {["blue", "green", "purple", "orange", "red"].map(
                  (colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      onClick={() => setColor(colorOption)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        color === colorOption
                          ? "border-gray-800"
                          : "border-gray-300"
                      } ${
                        colorOption === "blue"
                          ? "bg-blue-500"
                          : colorOption === "green"
                          ? "bg-green-500"
                          : colorOption === "purple"
                          ? "bg-purple-500"
                          : colorOption === "orange"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                    />
                  )
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                ✅ 일정 추가
              </button>
              <button
                type="button"
                onClick={() => setSelectedTimeSlot(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                ❌ 취소
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              📅 주간 스케줄러
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === "week"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                주간
              </button>
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
              {currentDate.getFullYear()}년{" "}
              {koreanMonths[currentDate.getMonth()]}
              {getWeekOfMonth(currentDate)}주차
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

        {/* 주간 스케줄 테이블 */}
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
                {day.holiday && (
                  <div className="text-xs text-red-600 font-semibold">
                    {day.holiday.name}
                  </div>
                )}
                {day.solarTerm && (
                  <div className="text-xs text-green-600">{day.solarTerm}</div>
                )}
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

        {/* 일정 추가 모달 */}
        <ScheduleModal />
      </div>
    </div>
  );
};

export default CalendarComp;
