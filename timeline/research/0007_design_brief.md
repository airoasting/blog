# Design Brief

- Brief date: 2026-07-26
- Input research file: timeline/research/0005_incremental_research.md
- Input review file: timeline/research/0006_strategy_review.md

## Dataset Summary
- 총 이벤트 수: 194건 (기존 193건 + Opus 5 1건)
- 적용 연도 수: 2017~2026 (10개년)
- 적용 분기: 2026 Q3까지
- 최근 분기: 2026 Q3
- 제공사: 12곳

## UX Decisions
- 페이지 구조·CSS·인터랙션 변경 없음. 데이터 추가만 반영.
- 신규 항목은 기존 2026 Q3 컬럼의 Anthropic 행에 major 카드로 자동 배치.
- 분기 컬럼 신설 불필요(2026 Q3 이미 존재).

## Build Notes
- `.md`(단일 소스)·`.js`·`.json` 세 파일을 동일 내용으로 갱신.
- `last_updated` 2026-07-26, `period_end` 2026-07-24로 상향.
