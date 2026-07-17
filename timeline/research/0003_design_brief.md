# Design Brief

- Brief date: 2026-07-17
- Input research file: timeline/research/0001_incremental_research.md
- Input review file: timeline/research/0002_strategy_review.md

## Dataset Summary
- 기존 이벤트: 187건 → 신규 6건 추가 → 총 193건
- 적용 연도: 2017~2026 (변동 없음)
- 신규 커버 분기: 2026 Q3 (07-01~07-16)
- 최근 분기: 2026 Q3
- 신규 provider 행: Moonshot AI (중국, lead=Kimi) → provider 11개 → 12개

## UX Decisions
- 페이지 디자인·CSS·인터랙션은 **변경 없음**. 데이터와 provider 행 목록만 갱신.
- 분기 단위 가로 스크롤·분기 점프 구조는 기존 그대로 2026 Q3까지 자동 확장.
- Moonshot AI 행은 ByteDance 다음(중국 그룹 끝)에 배치.

## Build Notes
- 3개 데이터 파일(md/js/json)을 동일 내용으로 유지 (CLAUDE.md 규칙).
  - md: 첫 json 코드블록, last_updated=2026-07-17, period_end=2026-07-16
  - js: window.MODEL_TIMELINE_DATA
  - json: 동일 객체
- HTML의 providerOrder/providerLeadModel/providerCountry에 "Moonshot AI" 추가.
- 페이지 로직·스타일 그 외 손대지 않음.
