// PWA 설치 프롬프트 관리
let deferredPrompt;

// 설치 가능한 이벤트 리스너
window.addEventListener("beforeinstallprompt", (e) => {
  // 기본 설치 프롬프트 방지
  e.preventDefault();
  // 나중에 사용하기 위해 이벤트 저장
  deferredPrompt = e;
  console.log("PWA 설치 가능");
});

// 앱 설치 함수
export const installPWA = async () => {
  if (deferredPrompt) {
    // 설치 프롬프트 표시
    deferredPrompt.prompt();
    // 사용자 응답 대기
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`사용자 선택: ${outcome}`);
    // 프롬프트 초기화
    deferredPrompt = null;
    return outcome === "accepted";
  }
  return false;
};

// PWA 설치 가능 여부 확인
export const isPWAInstallable = () => {
  return deferredPrompt !== null;
};

// 서비스 워커 등록
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("서비스 워커 등록 성공:", registration);
      return registration;
    } catch (error) {
      console.error("서비스 워커 등록 실패:", error);
      return null;
    }
  }
  return null;
};

// PWA 설치 상태 확인
export const isPWAInstalled = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

// 오프라인 상태 확인
export const isOffline = () => {
  return !navigator.onLine;
};

// 온라인/오프라인 상태 변경 리스너
export const addOnlineStatusListener = (callback) => {
  window.addEventListener("online", () => callback(true));
  window.addEventListener("offline", () => callback(false));
};
