// 한국 시간대로 변환하는 유틸리티 함수들

/**
 * UTC 시간을 한국 시간(KST)으로 변환
 * @param {string|Date} utcDate - UTC 시간 문자열 또는 Date 객체
 * @returns {Date} 한국 시간 Date 객체
 */
export const convertToKST = (utcDate) => {
  if (!utcDate) return null;

  const date = new Date(utcDate);
  // UTC + 9 (한국 시간)
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(date.getTime() + kstOffset);
};

/**
 * 한국 시간을 포맷팅된 문자열로 변환
 * @param {string|Date} date - 날짜
 * @param {string} format - 포맷 ('date', 'datetime', 'time')
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatKST = (date, format = "datetime") => {
  if (!date) return "";

  const kstDate = convertToKST(date);
  if (!kstDate) return "";

  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getDate()).padStart(2, "0");
  const hours = String(kstDate.getHours()).padStart(2, "0");
  const minutes = String(kstDate.getMinutes()).padStart(2, "0");
  const seconds = String(kstDate.getSeconds()).padStart(2, "0");

  switch (format) {
    case "date":
      return `${year}-${month}-${day}`;
    case "time":
      return `${hours}:${minutes}:${seconds}`;
    case "datetime":
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

/**
 * 현재 한국 시간을 가져오기
 * @returns {Date} 현재 한국 시간
 */
export const getCurrentKST = () => {
  const now = new Date();
  return convertToKST(now);
};

/**
 * 날짜가 오늘인지 확인
 * @param {string|Date} date - 확인할 날짜
 * @returns {boolean} 오늘인지 여부
 */
export const isToday = (date) => {
  if (!date) return false;

  const kstDate = convertToKST(date);
  const today = getCurrentKST();

  return (
    kstDate.getFullYear() === today.getFullYear() &&
    kstDate.getMonth() === today.getMonth() &&
    kstDate.getDate() === today.getDate()
  );
};

/**
 * 날짜가 이번 주인지 확인
 * @param {string|Date} date - 확인할 날짜
 * @returns {boolean} 이번 주인지 여부
 */
export const isThisWeek = (date) => {
  if (!date) return false;

  const kstDate = convertToKST(date);
  const today = getCurrentKST();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return kstDate >= startOfWeek && kstDate <= endOfWeek;
};

/**
 * 날짜가 이번 달인지 확인
 * @param {string|Date} date - 확인할 날짜
 * @returns {boolean} 이번 달인지 여부
 */
export const isThisMonth = (date) => {
  if (!date) return false;

  const kstDate = convertToKST(date);
  const today = getCurrentKST();

  return (
    kstDate.getFullYear() === today.getFullYear() &&
    kstDate.getMonth() === today.getMonth()
  );
};
