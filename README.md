# Core Breaker Text

텍스트 입력으로 진행되는 모바일 UI 게임 버전의 Core Breaker입니다. Phaser/Canvas 없이 DOM/CSS만으로 동작합니다.

## 실행 방법

```bash
npm install
npm run dev
```

## GitHub Pages 배포 (Jekyll + Vite)

1. `npm run build`로 Vite 빌드하면 `docs/`에 산출물이 생성됩니다.
2. GitHub Pages는 Jekyll로 `docs/`를 빌드하도록 구성되어 있습니다.
3. `.github/workflows/pages.yml` 워크플로가 Node + Ruby(Jekyll) 의존성을 설치한 뒤 배포합니다.

> Pages 소스는 Actions를 사용합니다. `Gemfile`과 `_config.yml`은 Jekyll 의존성을 사전 설치하는 용도입니다.

## 조작 방식

- 상단 Help 버튼: 게임 설명/명령어/판정/저장 안내
- 하단 입력창에 명령 입력 후 전송 (Enter 가능)
- 입력 예시: `1`, `hit`, `charge`, `focus`, `upgrade glove`

## 게임 흐름

- MAIN → GARAGE → RUN → RESULT
- 40초 런을 턴 기반 텍스트로 진행
- localStorage 키: `core_breaker_text_save_v1`

## 구조

- `src/main.ts`: 앱 부트스트랩
- `src/styles.css`: 모바일 UI 스타일
- `src/ui/AppShell.ts`: 상단 바/로그/입력 UI
- `src/ui/HelpModal.ts`: 도움말 모달
- `src/game/GameEngine.ts`: 상태 머신 및 입력 처리
- `src/game/Combat.ts`: 전투/판정/스테이지 로직
- `src/storage/SaveSystem.ts`: 저장/로드/리셋
