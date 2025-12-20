# Core Breaker

Phaser 3 + TypeScript + Vite로 만드는 브라우저 미니게임입니다. 외부 이미지/사운드 없이도 플레이 가능한 placeholder 그래픽으로 구현되어 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 조작

- **Tap(클릭/탭)**: 기본 타격
- **Hold ≥ 0.35s 후 Release**: 차지 강타

## 게임 흐름

- Boot → Title → Garage → Run → Result
- 40초 런 동안 Shield → WeakPoint → Core 순으로 파괴
- 판정(Perfect/Great/Good/Miss)에 따라 데미지/콤보/카운터게이지가 변합니다.

## 저장 데이터

- localStorage 키: `core_breaker_save_v1`
- Garage에서 장비 업그레이드, 리셋을 지원합니다.
