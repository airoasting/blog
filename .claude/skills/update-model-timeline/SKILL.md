---
name: update-model-timeline
description: 주요 AI 모델 업데이트 타임라인을 리서치하고, 팩트 검증 후, 인터랙티브 가로 타임라인 페이지를 생성합니다
---

# AI 모델 타임라인 업데이트

주요 AI 모델의 업데이트 이력을 리서치하고, 팩트 검증 후, 인터랙티브 가로 스크롤 타임라인 HTML 페이지를 생성(또는 갱신)합니다.

## 입력

`$ARGUMENTS`는 선택적입니다.

- `/update-model-timeline` — 전체 모델 타임라인을 처음부터 생성하거나 전체 갱신
- `/update-model-timeline 2026` — 특정 연도만 추가/갱신
- `/update-model-timeline Claude` — 특정 모델만 추가/갱신

## 출력 파일

```
timeline/model-updates.html          ← 인터랙티브 타임라인 페이지
timeline/data/model-timeline.md      ← 타임라인 데이터 (단일 소스)
timeline/research/                   ← 리서치/검증/인수인계 md 아카이브
```

> **model-timeline.md가 단일 소스**입니다. HTML은 이 Markdown 파일의 첫 `json` 코드블록을 읽어 렌더링합니다.
>
> 단, 에이전트 간 소통과 중간 산출물은 모두 `timeline/research/` 아래의 `md` 파일로 남깁니다. 각 단계는 직전 단계가 남긴 `md`를 읽고 이어서 작업합니다.

### 리서치 아카이브 규칙

모든 단계는 아래 규칙을 따릅니다.

1. 중간 판단, 조사 범위, 발견 사항, 보완 요청은 모두 `md` 파일로 남깁니다
2. 다음 페르소나는 콘솔 출력이 아니라 직전 `md` 파일을 읽고 작업합니다
3. 리서처 산출물은 실행마다 새 파일로 누적 저장합니다
4. 첫 리서치와 후속 증분 리서치는 파일을 분리합니다
5. 각 리서치 `md` 상단에는 반드시 리서치 기준일을 적습니다
6. 예외 없이 아래 폴더 구조와 파일명 규칙을 사용합니다
7. 파일이 없으면 먼저 폴더를 만들고, 그 다음 파일을 생성합니다

### 고정 폴더 구조

이 스킬은 예외 없이 아래 구조를 사용합니다.

```
timeline/
  data/
    model-timeline.md
  research/
    0001_baseline_research.md
    0002_incremental_research.md
    0003_strategy_review.md
    0004_design_brief.md
    0005_qa_report.md
  model-updates.html
```

폴더 생성 규칙:

1. `timeline/`이 없으면 생성합니다
2. `timeline/data/`가 없으면 생성합니다
3. `timeline/research/`가 없으면 생성합니다
4. 그 외 추가 폴더를 임의로 만들지 않습니다

### 고정 파일명 규칙

파일명은 예외 없이 `4자리 번호 + 언더스코어 + 단계명 + .md` 형식을 사용합니다.

- 리서치 본문: `NNNN_baseline_research.md`
- 증분 리서치: `NNNN_incremental_research.md`
- 검증 메모: `NNNN_strategy_review.md`
- 디자인 인수 문서: `NNNN_design_brief.md`
- QA 리포트: `NNNN_qa_report.md`

번호 규칙:

- `timeline/research/`의 기존 파일을 보고 가장 큰 4자리 번호 다음 번호를 사용합니다
- 리서치, 검증, 디자인, QA를 같은 번호대에서 순차 누적합니다
- 기존 파일을 덮어쓰지 않습니다
- 번호를 건너뛰지 않습니다
- 같은 실행 안에서는 새 파일을 만들 때마다 직전 번호에 1을 더합니다

파일명 생성 금지 사항:

1. 날짜를 파일명에 넣지 않습니다
2. 모델명이나 연도를 파일명에 넣지 않습니다
3. `final`, `draft`, `v2` 같은 접미어를 붙이지 않습니다
4. 기존 파일을 수정본 이름으로 복제하지 않습니다

리서치 `md` 상단 필수 형식:

```
# AI Model Timeline Research

- Research date: YYYY-MM-DD
- Coverage start: YYYY-MM-DD
- Coverage end: YYYY-MM-DD
- Run type: baseline | incremental
- Sources checked: 공식 블로그 N건, 논문 N건, 뉴스 N건
```

증분 리서치 시작점 규칙:

1. 스킬 시작 시 `timeline/research/*_research.md` 파일을 찾습니다
2. 가장 최근 리서치 파일의 `Research date`를 읽습니다
3. 그 날짜부터 오늘까지의 신규 자료만 추가 조사합니다
4. 그 결과를 새 번호의 `incremental_research.md`로 저장합니다
5. 리서치 파일이 없으면 전체 기간을 조사하고 `baseline_research.md`를 만듭니다

### 최신 입력 파일 선택 규칙

각 페르소나는 입력 파일을 감으로 고르지 않습니다. 아래 규칙을 예외 없이 따릅니다.

1. 파일 선택 기준은 수정 시각이 아니라 파일명 앞의 4자리 번호입니다
2. 같은 유형의 파일이 여러 개면 가장 큰 번호를 최신본으로 간주합니다
3. 리서처는 가장 큰 번호의 `*_research.md`를 기준 입력으로 사용합니다
4. 전략 컨설턴트는 가장 큰 번호의 `*_research.md`를 읽습니다
5. 디자이너는 가장 큰 번호의 `*_strategy_review.md`를 읽습니다
6. QA는 가장 큰 번호의 `*_design_brief.md`를 읽습니다
7. 특정 단계 입력 파일이 없으면 그 이전 단계를 먼저 수행하고 파일을 생성합니다
8. 파일 수정 시각과 번호가 충돌하면 번호를 우선합니다

### 단계 종료 전 필수 검증

각 단계는 종료 전에 아래 체크를 통과해야 합니다. 하나라도 실패하면 다음 단계로 넘기지 않습니다.

공통 체크:

1. 출력 파일이 실제로 생성되었는지 확인합니다
2. 파일명이 고정 규칙을 따르는지 확인합니다
3. 번호가 직전 파일보다 정확히 1 큰지 확인합니다
4. 문서 상단 메타 필드가 모두 채워졌는지 확인합니다
5. 빈 섹션 제목만 있고 내용이 없는지 확인합니다

리서치 단계 체크:

1. `Research date`, `Coverage start`, `Coverage end`, `Run type`가 모두 있는지 확인합니다
2. `New or Updated Events`에 최소 1건 이상 또는 `이번 실행 신규 항목 없음`이 명시됐는지 확인합니다
3. `JSON Candidate`가 유효한 JSON 배열 형태인지 확인합니다
4. 모든 major 이벤트가 최소 2개 출처를 가졌는지 확인합니다

전략 검증 단계 체크:

1. `Input research file`이 실제 파일을 가리키는지 확인합니다
2. `Verdict`가 `PASS`, `CONDITIONAL`, `FAIL` 중 하나인지 확인합니다
3. `Scorecard` 10개 항목이 모두 채워졌는지 확인합니다
4. `CONDITIONAL` 또는 `FAIL`이면 `Findings`가 비어 있지 않은지 확인합니다

디자인 단계 체크:

1. `Input review file`이 최신 `strategy_review.md`인지 확인합니다
2. `timeline/data/model-timeline.md`가 생성 또는 갱신됐는지 확인합니다
3. `timeline/model-updates.html`이 생성 또는 갱신됐는지 확인합니다
4. `design_brief.md`에 데이터셋 요약과 UX 결정이 모두 적혔는지 확인합니다
5. 분기 라벨과 분기 점프 UI가 실제로 반영됐는지 확인합니다

QA 단계 체크:

1. `Input design brief`가 실제 파일을 가리키는지 확인합니다
2. `Verdict`가 `PASS`, `CONDITIONAL`, `FAIL` 중 하나인지 확인합니다
3. `Scorecard` 10개 항목이 모두 채워졌는지 확인합니다
4. `CONDITIONAL` 또는 `FAIL`이면 수정 요청이 구체적으로 적혔는지 확인합니다

### Markdown 반영 규칙

`model-timeline.md`는 최종 산출물이지만, 근거 없는 직접 수정은 금지합니다.

1. 디자이너 단계 전에는 `md` 단일 소스를 최종본으로 확정하지 않습니다
2. `md` 반영 기준은 가장 최근 `PASS` 또는 수정 완료 후 승인된 `strategy_review.md`입니다
3. `strategy_review.md`의 `Approved JSON Candidate`만 `model-timeline.md`의 첫 `json` 코드블록에 반영합니다
4. `CONDITIONAL` 또는 `FAIL` 상태의 후보 데이터는 직접 반영하지 않습니다
5. 기존 `md` 데이터와 신규 후보가 충돌하면 더 최신 번호의 승인 문서를 우선합니다
6. 같은 이벤트가 중복되면 `date + provider + model + event_type` 조합으로 하나만 유지합니다

---

## 실행 단계

이 스킬은 4개의 독립된 페르소나가 순차적으로 작업합니다. 각 단계는 이전 단계의 출력을 입력으로 받습니다.

---

### Phase 1: 리서치 (Research Analyst)

**페르소나**: AI 산업 전문 리서치 애널리스트. 사실 기반 데이터 수집만 수행합니다.

#### 1-1. 대상 모델 목록

아래 모델 패밀리를 **필수** 포함합니다. 이 외에도 산업적으로 중요한 모델이 있으면 추가합니다.

| 제공사 | 모델 패밀리 | 비고 |
|--------|-------------|------|
| Google | Transformer (원조), BERT, PaLM, Gemini | 2017 Transformer 논문부터 |
| OpenAI | GPT-1/2/3/4, ChatGPT, o1/o3, GPT-4o, Codex, DALL-E, Sora | |
| Anthropic | Claude 1/2/3/3.5/4 | |
| Meta | LLaMA 1/2/3, Code Llama | |
| xAI | Grok 1/2/3 | |
| DeepSeek | DeepSeek-V1/V2/V3, DeepSeek-R1 | |
| ByteDance | Seed, Doubao, SeedDance | |
| Alibaba | Qwen 1/1.5/2/2.5/3, Qwen-VL | |
| Mistral | Mistral, Mixtral, Mistral Large/Medium | |
| Cohere | Command R/R+ | |
| Stability AI | Stable Diffusion 1/2/XL/3 | 이미지 생성 모델 |
| Midjourney | v1~v6 | 이미지 생성 모델 |
| Google DeepMind | AlphaFold, AlphaGo, Gemma | 과학/게임 특화 |

#### 1-2. 수집 기준

각 모델 업데이트마다 아래 필드를 수집합니다:

```json
{
  "date": "YYYY-MM-DD",
  "provider": "OpenAI",
  "model": "GPT-4",
  "event_type": "release | update | api_launch | paper | discontinue",
  "summary_ko": "40자 이내 한글 요약",
  "summary_en": "60자 이내 영문 요약",
  "source_url": "공식 블로그/논문/뉴스 URL",
  "source_type": "official_blog | paper | news | press_release",
  "significance": "major | minor",
  "category": "llm | image | video | code | science | multimodal"
}
```

#### 1-3. 리서치 방법

1. **WebSearch**를 사용하여 각 모델의 공식 릴리즈 이력을 검색합니다
2. **WebFetch**로 공식 블로그, arXiv, 뉴스 기사에서 날짜와 내용을 확인합니다
3. 날짜가 불확실한 경우 `"date_confidence": "estimated"`를 추가합니다
4. 최소 2개 이상의 독립 소스로 교차 검증합니다

#### 1-4. 리서치 출력

리서처는 조사 결과를 곧바로 단일 소스 `md`에 쓰지 않습니다. 먼저 아래 순서로 `md` 아카이브를 남깁니다.

1. 기존 `timeline/research/*_research.md`를 확인합니다
2. 가장 최근 리서치 파일의 `Research date`를 읽습니다
3. 첫 실행이면 전체 기간을 조사하고 `baseline`으로 기록합니다
4. 후속 실행이면 `Research date`부터 오늘까지 증분 조사합니다
5. 결과를 새 번호의 리서치 `md` 파일로 저장합니다

예시:

```
timeline/research/0001_baseline_research.md
timeline/research/0006_incremental_research.md
```

리서치 `md`에는 아래 내용을 반드시 포함합니다:

```
# AI Model Timeline Research

- Research date: YYYY-MM-DD
- Coverage start: YYYY-MM-DD
- Coverage end: YYYY-MM-DD
- Run type: baseline | incremental

## Scope
- 이번 실행에서 조사한 제공사/모델

## New or Updated Events
| Date | Provider | Model | Event Type | Significance | Source 1 | Source 2 |

## Notes
- 날짜가 불확실한 항목
- 추가 검증이 필요한 항목

## JSON Candidate
<json>
[
  {
    "date": "YYYY-MM-DD",
    "provider": "OpenAI",
    "model": "GPT-4",
    "event_type": "release",
    "summary_ko": "40자 이내 한글 요약",
    "summary_en": "60자 이내 영문 요약",
    "source_url": "https://...",
    "source_type": "official_blog",
    "significance": "major",
    "category": "llm"
  }
]
</json>
```

---

### Phase 2: 전략 컨설턴트 검증 (Strategy Consultant)

**페르소나**: 맥킨지 20년차 시니어 파트너. 데이터의 정확성과 완결성을 깐깐하게 검증합니다.

#### 2-1. 검증 항목 (10점 만점, 항목별)

| # | 검증 항목 | 기준 | 감점 기준 |
|---|-----------|------|-----------|
| 1 | **날짜 정확성** | 모든 이벤트의 날짜가 공식 소스와 일치 | 오류 1건당 -1점 |
| 2 | **소스 신뢰성** | official_blog/paper 비율 70% 이상 | 60% 미만 시 -2점, 70% 미만 시 -1점 |
| 3 | **완결성(모델)** | 필수 모델 패밀리 전체 포함 | 누락 1개당 -1점 |
| 4 | **완결성(시기)** | 2017~현재 연도별 공백 없음 | 공백 연도 1개당 -1점 |
| 5 | **완결성(major)** | 산업적으로 중요한 major 이벤트 누락 없음 | 누락 1건당 -2점 |
| 6 | **요약 품질** | summary_ko 40자 이내, 핵심 정보 포함 | 초과/부정확 1건당 -0.5점 |
| 7 | **중복 검출** | 동일 이벤트 중복 없음 | 중복 1건당 -0.5점 |
| 8 | **이벤트 분류** | event_type, significance, category 정확 | 오분류 1건당 -0.5점 |
| 9 | **교차 검증** | major 이벤트는 2개 이상 소스 확인 | 미검증 1건당 -1점 |
| 10 | **일관성** | JSON 필드 형식, 날짜 포맷 통일 | 불일치 1건당 -0.5점 |

#### 2-2. 검증 프로세스

1. 가장 최근 리서치 `md`를 읽습니다
2. **WebSearch/WebFetch로 무작위 샘플 20%를 재검증**합니다 (최소 10건)
3. 각 항목별 점수를 산출합니다
4. 총점 = 10개 항목 평균
5. 검증 결과를 새 번호의 `strategy_review.md`로 저장합니다

#### 2-3. 판정 기준

- **9.5점 이상**: PASS → Phase 3으로 진행
- **9.0~9.4점**: CONDITIONAL → 지적 사항을 Phase 1에 반환, 수정 후 재검증 (최대 2회 반복)
- **9.0점 미만**: FAIL → 지적 사항 전체 목록과 함께 Phase 1 재실행

#### 2-4. 검증 출력

전략 컨설턴트는 콘솔 출력만 하지 않습니다. 아래 형식의 `md` 파일을 남깁니다.

```md
# Strategy Review

- Review date: YYYY-MM-DD
- Input research file: timeline/research/0006_incremental_research.md
- Sample size: N
- Verdict: PASS | CONDITIONAL | FAIL

## Scorecard
- 날짜 정확성: X.X / 10
- 소스 신뢰성: X.X / 10
- 완결성(모델): X.X / 10
- 완결성(시기): X.X / 10
- 완결성(major): X.X / 10
- 요약 품질: X.X / 10
- 중복 검출: X.X / 10
- 이벤트 분류: X.X / 10
- 교차 검증: X.X / 10
- 일관성: X.X / 10

## Findings
- 수정 필요 사항

## Approved JSON Candidate
- 채택 가능 항목 목록 또는 수정 후 승인 목록
```

---

### Phase 3: 인터랙티브 디자인 (Interactive Designer)

**페르소나**: 파슨스 시각디자인학과 졸업, 20년차 인터랙티브 디자인 베테랑.

#### 3-1. 디자인 원칙

1. **가로 스크롤 타임라인**을 기본 레이아웃으로 사용합니다
   - 시간은 왼쪽→오른쪽으로 흐릅니다
   - 기본 구획 단위는 **분기**입니다
   - 모든 연도는 `Q1`, `Q2`, `Q3`, `Q4` 4개 분기로 나눕니다
   - 이벤트 배치, 점프, 통계 요약도 분기 단위를 우선 사용합니다
   - 마우스 휠로 가로 스크롤이 가능합니다 (세로 휠 → 가로 전환)
2. 기존 블로그 디자인 시스템(`assets/css/style.css`)을 따릅니다
   - 다크 모드 지원 (`[data-theme="dark"]`)
   - 커스텀 커서 (insights.html과 동일)
   - 폰트: `var(--font-body)`, `var(--font-heading)` 사용
3. 모바일 대응: 768px 이하에서는 세로 타임라인으로 전환

#### 3-2. UI 구성 요소

**히어로 영역** (insights.html 스타일 계승):
- 다크 풀블리드 배경 + 그리드 패턴 + 글로우 효과
- 제목: "AI Model Timeline"
- 통계: 총 모델 수, 총 이벤트 수, 기간
- 보조 통계: 최근 분기, 가장 이벤트가 많았던 분기

**필터 바** (히어로 하단, sticky):
- 제공사별 필터 토글 (칩 형태, 각 제공사 브랜드 컬러)
- 카테고리별 필터 (LLM, Image, Video, Code, Science, Multimodal)
- 검색 입력: 모델명/키워드 검색
- significance 필터: Major만 / 전체

**타임라인 영역**:
- 가로 스크롤 컨테이너
- 상단에 연도와 분기 눈금자 (고정)
- 각 연도 아래에 `Q1`, `Q2`, `Q3`, `Q4` 구획을 명확히 표시합니다
- 각 이벤트는 카드로 표현:
  - 제공사 로고/아이콘 (SVG 또는 이니셜 원형 배지)
  - 모델명 (볼드)
  - 날짜
  - 소속 분기 라벨
  - 한글 요약
  - major 이벤트는 카드 크기 1.5배 + 강조 테두리
- 동일 분기 안의 근접 날짜 이벤트는 세로로 스택
- 호버 시 상세 팝오버 (영문 요약, 소스 링크, 이벤트 유형)

**분기 점프**:
- 우측 하단 미니맵 또는 연도/분기 버튼으로 특정 분기로 즉시 이동
- 예: `2024 Q1`, `2024 Q2`

#### 3-3. 인터랙션

- 마우스 휠 → 가로 스크롤 (smooth)
- 드래그 앤 스크롤 지원
- 필터 변경 시 애니메이션으로 분기 슬롯 안에서 카드 재배치 (FLIP 기법)
- 카드 클릭 → 상세 팝오버
- 키보드: ← → 로 이벤트 간 이동, ESC로 팝오버 닫기

#### 3-4. 기술 구현

- **순수 HTML + CSS + Vanilla JS** (외부 라이브러리 없음)
- `timeline/data/model-timeline.md`의 첫 `json` 코드블록을 fetch 후 파싱해 로드
- CSS: 인라인 `<style>` (insights.html과 동일 패턴)
- JS: 인라인 `<script>` (페이지 하단)
- 다크/라이트 테마: `localStorage` + `data-theme` 속성
- 스크롤 성능: `will-change: transform`, `transform: translateX()` 사용

#### 3-5. 디자인 출력

디자이너는 가장 최근 `strategy_review.md`와 승인된 리서치 `md`를 읽고 작업합니다.

디자인 시작 전 아래 인수 문서를 남깁니다.

```md
# Design Brief

- Brief date: YYYY-MM-DD
- Input research file: ...
- Input review file: ...

## Dataset Summary
- 총 이벤트 수
- 적용 연도 수
- 적용 분기 수
- 최근 분기

## UX Decisions
- 분기 단위 가로 스크롤 구조
- 분기 점프 방식
- 모바일 세로 전환 방식

## Build Notes
- 구현 시 주의점
```

그 다음 `timeline/data/model-timeline.md`를 생성하거나 갱신하고, `timeline/model-updates.html` 파일을 생성합니다.

---

### Phase 4: QA (Quality Assurance)

**페르소나**: International Design Award 3회 수상 UX 전문가. 디자인 품질을 깐깐하게 평가합니다.

#### 4-1. 평가 항목 (10점 만점, 항목별)

| # | 평가 항목 | 기준 | 감점 기준 |
|---|-----------|------|-----------|
| 1 | **시각적 위계** | 정보의 중요도가 시각적 크기/색상으로 명확히 구분됨 | 위계 불명확 1건당 -1점 |
| 2 | **가독성** | 텍스트 크기, 대비, 줄간격이 WCAG AA 기준 충족 | 미충족 1건당 -1점 |
| 3 | **인터랙션 일관성** | 호버, 클릭, 스크롤 반응이 일관적이고 예측 가능 | 불일치 1건당 -1점 |
| 4 | **가로 스크롤 UX** | 휠 매핑, 드래그, 관성이 자연스러움 | 부자연스러움 -2점 |
| 5 | **필터 작동** | 제공사/카테고리/검색 필터가 정확하게 동작 | 오작동 1건당 -1.5점 |
| 6 | **반응형** | 768px 이하에서 세로 전환, 요소 겹침 없음 | 깨짐 1건당 -1.5점 |
| 7 | **다크/라이트 모드** | 양쪽 테마에서 모든 요소 가시성 확보 | 미대응 요소 1건당 -1점 |
| 8 | **성능** | 초기 로드 시 버벅임 없음, 스크롤 60fps 유지 | 성능 문제 1건당 -1점 |
| 9 | **접근성** | 키보드 네비게이션, aria 라벨, focus 스타일 | 미흡 1건당 -0.5점 |
| 10 | **디자인 통일성** | 기존 블로그(insights.html)와 시각 언어 통일 | 불일치 1건당 -1점 |

#### 4-2. QA 프로세스

1. 가장 최근 `design_brief.md`를 읽고 의도를 확인합니다
2. `timeline/model-updates.html`을 읽습니다
2. **preview_start**로 로컬 서버를 실행합니다
3. **preview_screenshot**으로 전체 페이지를 확인합니다
4. **preview_console_logs**로 JS 에러를 확인합니다
5. **preview_click**, **preview_fill**로 인터랙션을 테스트합니다
6. **preview_resize**로 반응형을 확인합니다 (1440px, 768px, 375px)
7. 각 항목별 점수를 산출합니다

#### 4-3. 판정 기준

- **9.5점 이상**: PASS → 완료
- **9.0~9.4점**: CONDITIONAL → 지적 사항을 Phase 3에 반환, 수정 후 재평가 (최대 2회 반복)
- **9.0점 미만**: FAIL → 지적 사항 전체 목록과 함께 Phase 3 재실행

#### 4-4. QA 출력

QA는 아래 형식의 `md` 파일을 남깁니다.

```md
# QA Report

- QA date: YYYY-MM-DD
- Input design brief: ...
- Input page: timeline/model-updates.html
- Verdict: PASS | CONDITIONAL | FAIL

## Scorecard
- 시각적 위계: X.X / 10
- 가독성: X.X / 10
- 인터랙션 일관성: X.X / 10
- 가로 스크롤 UX: X.X / 10
- 필터 작동: X.X / 10
- 반응형: X.X / 10
- 다크/라이트 모드: X.X / 10
- 성능: X.X / 10
- 접근성: X.X / 10
- 디자인 통일성: X.X / 10

## Findings
- 수정 필요 사항

## Fixed Items
- 재평가 때 반영된 수정 사항
```

---

## 재시도 로직

```
Phase 1 ←──── Phase 2 FAIL/CONDITIONAL (수정 지시 포함)
   │
   ↓
Phase 2 ────→ PASS
   │
   ↓
Phase 3 ←──── Phase 4 FAIL/CONDITIONAL (수정 지시 포함)
   │
   ↓
Phase 4 ────→ PASS
   │
   ↓
   완료
```

- Phase 2 재검증은 최대 **2회** 반복합니다. 각 회차는 새 `md` 파일을 남깁니다. 3회 실패 시 사용자에게 보고하고 중단합니다.
- Phase 4 재평가는 최대 **2회** 반복합니다. 각 회차는 새 `md` 파일을 남깁니다. 3회 실패 시 사용자에게 보고하고 중단합니다.

---

## 에이전트 간 소통 규칙

이 스킬에서는 에이전트끼리 직접 요약을 전달하지 않습니다. 항상 파일을 기준으로 소통합니다.

1. 각 페르소나는 시작 전에 가장 최근 관련 `md` 파일을 읽습니다
2. 각 페르소나는 종료 전에 자신의 판단과 결과를 새 `md` 파일로 남깁니다
3. 다음 페르소나는 직전 `md`를 근거 문서로 사용합니다
4. 최종 단일 소스 `md`와 `html`도 반드시 최신 `md` 아카이브와 일치해야 합니다
5. 중간 판단이 바뀌면 기존 파일을 수정하기보다 새 번호 파일로 누적합니다

---

## 최종 출력

모든 Phase를 통과하면 아래를 출력합니다:

```
[AI 모델 타임라인 생성 완료]

데이터: timeline/data/model-timeline.md
페이지: timeline/model-updates.html

총 모델 패밀리: N개
총 이벤트: N건
기간: 2017-06 ~ 현재

전략 컨설턴트 검증: X.X / 10 (PASS)
QA 평가: X.X / 10 (PASS)
```

최종 보고에는 아래 경로도 함께 포함합니다:

```
리서치 아카이브: timeline/research/
최신 리서치: timeline/research/NNNN_incremental_research.md
최신 검증: timeline/research/NNNN_strategy_review.md
최신 디자인 브리프: timeline/research/NNNN_design_brief.md
최신 QA: timeline/research/NNNN_qa_report.md
```
