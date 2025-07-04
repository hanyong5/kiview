// 한국 달력 유틸리티 함수들

// 음력 변환을 위한 간단한 알고리즘 (실제로는 더 복잡한 계산이 필요)
export const getLunarDate = (solarDate) => {
  // 실제 음력 변환은 매우 복잡하므로 간단한 예시로 대체
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();

  // 간단한 음력 날짜 계산 (실제와는 다름)
  const lunarDay = Math.floor((day + 15) % 30) + 1;
  const lunarMonth = month;

  return {
    year,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth: false,
  };
};

// 24절기 데이터 (2024-2025년)
export const solarTerms = {
  2024: {
    "01-06": "소한",
    "01-20": "대한",
    "02-04": "입춘",
    "02-19": "우수",
    "03-05": "경칩",
    "03-20": "춘분",
    "04-04": "청명",
    "04-20": "곡우",
    "05-05": "입하",
    "05-21": "소만",
    "06-05": "망종",
    "06-21": "하지",
    "07-06": "소서",
    "07-22": "대서",
    "08-07": "입추",
    "08-23": "처서",
    "09-07": "백로",
    "09-23": "추분",
    "10-08": "한로",
    "10-23": "상강",
    "11-07": "입동",
    "11-22": "소설",
    "12-07": "대설",
    "12-21": "동지",
  },
  2025: {
    "01-06": "소한",
    "01-20": "대한",
    "02-03": "입춘",
    "02-18": "우수",
    "03-05": "경칩",
    "03-20": "춘분",
    "04-04": "청명",
    "04-20": "곡우",
    "05-05": "입하",
    "05-21": "소만",
    "06-05": "망종",
    "06-21": "하지",
    "07-07": "소서",
    "07-22": "대서",
    "08-07": "입추",
    "08-23": "처서",
    "09-07": "백로",
    "09-23": "추분",
    "10-08": "한로",
    "10-23": "상강",
    "11-07": "입동",
    "11-22": "소설",
    "12-07": "대설",
    "12-21": "동지",
  },
};

// 공휴일 데이터 (2024-2025년)
export const holidays = {
  2024: {
    "01-01": { name: "신정", type: "holiday", description: "새해 첫날" },
    "02-09": { name: "설날", type: "holiday", description: "음력 1월 1일" },
    "02-10": { name: "설날", type: "holiday", description: "음력 1월 2일" },
    "02-11": { name: "설날", type: "holiday", description: "음력 1월 3일" },
    "03-01": {
      name: "삼일절",
      type: "holiday",
      description: "독립운동 기념일",
    },
    "04-10": {
      name: "국회의원선거",
      type: "holiday",
      description: "제22대 국회의원선거",
    },
    "05-05": {
      name: "어린이날",
      type: "holiday",
      description: "어린이를 위한 날",
    },
    "05-15": {
      name: "부처님오신날",
      type: "holiday",
      description: "석가탄신일",
    },
    "06-06": {
      name: "현충일",
      type: "holiday",
      description: "호국영령 추모일",
    },
    "08-15": {
      name: "광복절",
      type: "holiday",
      description: "일제로부터 해방된 날",
    },
    "09-16": { name: "추석", type: "holiday", description: "음력 8월 15일" },
    "09-17": { name: "추석", type: "holiday", description: "음력 8월 16일" },
    "09-18": { name: "추석", type: "holiday", description: "음력 8월 17일" },
    "10-03": {
      name: "개천절",
      type: "holiday",
      description: "단군왕검 즉위일",
    },
    "10-09": {
      name: "한글날",
      type: "holiday",
      description: "한글 창제 기념일",
    },
    "12-25": {
      name: "크리스마스",
      type: "holiday",
      description: "예수 그리스도 탄생일",
    },
  },
  2025: {
    "01-01": { name: "신정", type: "holiday", description: "새해 첫날" },
    "01-28": { name: "설날", type: "holiday", description: "음력 1월 1일" },
    "01-29": { name: "설날", type: "holiday", description: "음력 1월 2일" },
    "01-30": { name: "설날", type: "holiday", description: "음력 1월 3일" },
    "03-01": {
      name: "삼일절",
      type: "holiday",
      description: "독립운동 기념일",
    },
    "05-05": {
      name: "어린이날",
      type: "holiday",
      description: "어린이를 위한 날",
    },
    "05-03": {
      name: "부처님오신날",
      type: "holiday",
      description: "석가탄신일",
    },
    "06-06": {
      name: "현충일",
      type: "holiday",
      description: "호국영령 추모일",
    },
    "08-15": {
      name: "광복절",
      type: "holiday",
      description: "일제로부터 해방된 날",
    },
    "10-05": { name: "추석", type: "holiday", description: "음력 8월 15일" },
    "10-06": { name: "추석", type: "holiday", description: "음력 8월 16일" },
    "10-07": { name: "추석", type: "holiday", description: "음력 8월 17일" },
    "10-03": {
      name: "개천절",
      type: "holiday",
      description: "단군왕검 즉위일",
    },
    "10-09": {
      name: "한글날",
      type: "holiday",
      description: "한글 창제 기념일",
    },
    "12-25": {
      name: "크리스마스",
      type: "holiday",
      description: "예수 그리스도 탄생일",
    },
  },
};

// 기념일 데이터
export const memorialDays = {
  //   "02-14": {
  //     name: "발렌타인데이",
  //     type: "memorial",
  //     description: "연인을 위한 날",
  //   },
  //   "03-14": {
  //     name: "화이트데이",
  //     type: "memorial",
  //     description: "남성이 여성에게 답례하는 날",
  //   },
  //   "04-14": {
  //     name: "블랙데이",
  //     type: "memorial",
  //     description: "솔로들을 위한 날",
  //   },
  //   "05-08": {
  //     name: "어버이날",
  //     type: "memorial",
  //     description: "부모님을 위한 날",
  //   },
  //   "05-15": {
  //     name: "스승의날",
  //     type: "memorial",
  //     description: "스승을 위한 날",
  //   },
  //   "06-14": {
  //     name: "키스데이",
  //     type: "memorial",
  //     description: "연인을 위한 날",
  //   },
  //   "07-14": {
  //     name: "실버데이",
  //     type: "memorial",
  //     description: "노인을 위한 날",
  //   },
  //   "08-14": {
  //     name: "그린데이",
  //     type: "memorial",
  //     description: "자연을 위한 날",
  //   },
  //   "09-14": {
  //     name: "포토데이",
  //     type: "memorial",
  //     description: "사진을 찍는 날",
  //   },
  //   "10-14": {
  //     name: "와인데이",
  //     type: "memorial",
  //     description: "와인을 마시는 날",
  //   },
  //   "11-11": {
  //     name: "빼빼로데이",
  //     type: "memorial",
  //     description: "빼빼로를 주고받는 날",
  //   },
  //   "11-14": {
  //     name: "무비데이",
  //     type: "memorial",
  //     description: "영화를 보는 날",
  //   },
  //   "12-14": {
  //     name: "머니데이",
  //     type: "memorial",
  //     description: "돈을 주고받는 날",
  //   },
};

// 날짜 포맷팅 함수
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateShort = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
};

// 요일 정보 가져오기
export const getDayInfo = (date) => {
  const dayOfWeek = date.getDay();
  const koreanDays = ["일", "월", "화", "수", "목", "금", "토"];
  const englishDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return {
    korean: koreanDays[dayOfWeek],
    english: englishDays[dayOfWeek],
    number: dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
  };
};

// 특별한 날 정보 가져오기
export const getSpecialDayInfo = (date) => {
  const year = date.getFullYear().toString();
  const dateShort = formatDateShort(date);

  const holiday = holidays[year]?.[dateShort];
  const solarTerm = solarTerms[year]?.[dateShort];
  const memorialDay = memorialDays[dateShort];

  return {
    holiday,
    solarTerm,
    memorialDay,
    hasSpecialDay: !!(holiday || solarTerm || memorialDay),
  };
};

// 주차 계산
export const getWeekOfYear = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

// 월의 주차 계산
export const getWeekOfMonth = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const days = date.getDate() - 1;
  return Math.ceil((days + firstDayOfMonth.getDay() + 1) / 7);
};
