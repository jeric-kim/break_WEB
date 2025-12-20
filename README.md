# Core Breaker

Phaser 3 + TypeScript + Vite로 만드는 브라우저 미니게임입니다. 도트 스타일의 무료 에셋(SVG/UI)과 Web Audio 기반의 간단한 톤 효과음으로 구성되어 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 조작

- **Tap(클릭/탭)**: 기본 타격
- **Hold ≥ 0.35s 후 Release**: 차지 강타

## 에셋 구성

- `public/assets/ui`: 버튼/패널 UI 에셋
- `public/assets/game`: 배경/세이프/마커 등 도트 스타일 스프라이트
- `src/systems/AudioSystem.ts`: Web Audio 톤 기반 효과음 (바이너리 파일 없이 동작)

## 게임 흐름

- Boot → Title → Garage → Run → Result
- 40초 런 동안 Shield → WeakPoint → Core 순으로 파괴
- 판정(Perfect/Great/Good/Miss)에 따라 데미지/콤보/카운터게이지가 변합니다.

## 저장 데이터

- localStorage 키: `core_breaker_save_v1`
- Garage에서 장비 업그레이드, 리셋을 지원합니다.
