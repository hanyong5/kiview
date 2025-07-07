import React, { useState, useEffect } from "react";
import { isOffline, addOnlineStatusListener } from "../utils/pwa";

const OfflineIndicator = () => {
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => {
    const handleOnlineStatusChange = (isOnline) => {
      setOffline(!isOnline);
    };

    // 초기 상태 설정
    setOffline(isOffline());

    // 온라인/오프라인 상태 변경 리스너 추가
    addOnlineStatusListener(handleOnlineStatusChange);
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center z-50">
      <div className="flex items-center justify-center gap-2">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span>오프라인 모드 - 인터넷 연결을 확인해주세요</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
