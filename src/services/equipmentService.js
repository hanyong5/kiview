import axios from "axios";

// API 기본 설정
const API_BASE_URL = "http://localhost:8080";

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error);

    // 401 에러 시 토큰 제거
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }

    return Promise.reject(error);
  }
);

// 장비 예약 목록 조회
export const getEquipmentReservations = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/equipment-reservations", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("장비 예약 목록 조회 실패:", error);
    throw error;
  }
};

// 특정 날짜 범위의 장비 예약 조회
export const getEquipmentReservationsByDateRange = async (
  startDate,
  endDate
) => {
  try {
    const response = await apiClient.get("/api/equipment-reservations", {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error("날짜별 장비 예약 조회 실패:", error);
    throw error;
  }
};

// 특정 장비의 예약 조회
export const getEquipmentReservationsByEquipment = async (equipmentName) => {
  try {
    const response = await apiClient.get("/api/equipment-reservations", {
      params: {
        equipmentName,
      },
    });
    return response.data;
  } catch (error) {
    console.error("장비별 예약 조회 실패:", error);
    throw error;
  }
};

// 특정 팀의 예약 조회
export const getEquipmentReservationsByTeam = async (teamName) => {
  try {
    const response = await apiClient.get("/api/equipment-reservations", {
      params: {
        team: teamName,
      },
    });
    return response.data;
  } catch (error) {
    console.error("팀별 예약 조회 실패:", error);
    throw error;
  }
};

// 장비 목록 조회
export const getEquipmentList = async () => {
  try {
    const response = await apiClient.get("/api/equipment-list");
    return response.data;
  } catch (error) {
    console.error("장비 목록 조회 실패:", error);
    throw error;
  }
};

// 팀 목록 조회
export const getTeamList = async () => {
  try {
    const response = await apiClient.get("/api/team-list");
    return response.data;
  } catch (error) {
    console.error("팀 목록 조회 실패:", error);
    throw error;
  }
};

export default {
  getEquipmentReservations,
  getEquipmentReservationsByDateRange,
  getEquipmentReservationsByEquipment,
  getEquipmentReservationsByTeam,
  getEquipmentList,
  getTeamList,
};
