import React, { useState, useEffect } from "react";
import { installPWA, isPWAInstallable, isPWAInstalled } from "../utils/pwa";

const InstallPWA = () => {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA 설치 상태 확인
    setIsInstalled(isPWAInstalled());

    // 설치 가능 여부 확인
    const checkInstallable = () => {
      const installable = isPWAInstallable();
      setShowInstallButton(installable && !isInstalled);
    };

    // 초기 확인
    checkInstallable();

    // 주기적으로 확인 (설치 프롬프트가 나중에 나타날 수 있음)
    const interval = setInterval(checkInstallable, 1000);

    return () => clearInterval(interval);
  }, [isInstalled]);

  const handleInstall = async () => {
    try {
      const installed = await installPWA();
      if (installed) {
        setShowInstallButton(false);
        setIsInstalled(true);
        console.log("PWA가 성공적으로 설치되었습니다!");
      }
    } catch (error) {
      console.error("PWA 설치 중 오류 발생:", error);
    }
  };

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstall}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        앱 설치
      </button>
    </div>
  );
};

export default InstallPWA;
