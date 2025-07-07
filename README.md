# 카페 키오스크 PWA

카페 키오스크를 위한 Progressive Web App (PWA)입니다.

## PWA 기능

- **오프라인 지원**: 서비스 워커를 통한 오프라인 캐싱
- **앱 설치**: 홈 화면에 앱으로 설치 가능
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- **푸시 알림**: 향후 푸시 알림 기능 추가 예정

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## PWA 테스트

1. 개발 서버를 실행합니다: `npm run dev`
2. 브라우저에서 `http://localhost:5173` 접속
3. 개발자 도구 > Application 탭에서 PWA 상태 확인
4. 모바일에서 테스트하려면 HTTPS 환경에서 접속

## 주요 파일

- `public/manifest.json`: PWA 매니페스트 설정
- `public/sw.js`: 서비스 워커
- `src/utils/pwa.js`: PWA 유틸리티 함수
- `src/components/InstallPWA.jsx`: 설치 버튼 컴포넌트
- `src/components/OfflineIndicator.jsx`: 오프라인 상태 표시

## 빌드 및 배포

PWA로 빌드하려면:

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성되며, HTTPS 환경에서 서비스하면 PWA 기능이 활성화됩니다.

## 브라우저 지원

- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+
