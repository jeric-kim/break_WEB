# Core Breaker Text

텍스트 입력으로 진행되는 모바일 UI 게임 버전의 Core Breaker입니다. Phaser/Canvas 없이 DOM/CSS만으로 동작합니다.

## 실행 방법

```bash
npm install
npm run dev
```

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
