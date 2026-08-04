---
name: update-insights
description: 발행된 포스트를 insights/insights.html의 해당 분기 PHASES 배열에 인사이트 카드로 추가합니다
---

# insights.html 업데이트

발행이 완료된 포스트를 `insights/insights.html`의 분기별 인사이트 타임라인에 추가합니다.

## 입력

`$ARGUMENTS`에서 포스트 파일 경로를 받습니다.

예시:
- `/update-insights tech/2026-03-10-openclaw-rl.html`
- `/update-insights research/2026-03-05-brain-fry.html`

## 실행 단계

### Step 1: 포스트 메타데이터 추출

지정된 HTML 파일을 읽어 다음 정보를 추출합니다:

- **title**: `<h1>` 태그 텍스트 (없으면 `<title>` 태그에서 " | AI ROASTING" 제거)
- **category**: 파일 경로의 첫 번째 세그먼트 (research/leader/company/tech/survival)
- **date**: 파일명의 날짜 부분 (YYYY-MM-DD)
- **slug**: 파일명 전체 (확장자 포함. 예: `2026-03-10-openclaw-rl.html`)
- **roasting_quote**: `<blockquote id="roastingQuote">` 태그 내용 그대로 (`<br>` 태그 포함 유지)
- **3줄 요약**: `<p data-summary>` 태그 3개의 텍스트 내용 (HTML 태그 제거한 순수 텍스트)
- **핵심 인사이트 body**: 아래 우선순위로 추출합니다:
  1. `section-insight` 내 첫 번째 `<p><strong>...</strong>` 태그의 strong 텍스트에서 핵심 수치/결론 포함 문장
  2. 1이 40자 초과 시, 3줄 요약(`<p data-summary>`)에서 가장 구체적 수치가 있는 1문장 선택
  3. 선택된 문장을 40자 이내로 압축하고, 핵심 수치 또는 결론 1곳에 `<strong>` 태그 적용
  4. 종결어미 ~입니다/~합니다 확인

### Step 2: 분기 결정

포스트 날짜(YYYY-MM-DD)에서 연도(Y)와 월(M)을 추출하여 분기를 계산합니다:

**분기 계산 공식:**
- quarter 라벨: `{YY} Q{ceil(M/3)}` (예: 2026-04 → "26 Q2")
- PHASES id: `(Y - 2025) * 4 + ceil(M/3) - 1` (기준점: 2025 Q2 = id 0)

**검증 예시:**

| 날짜 | 계산 | id | quarter |
|------|------|-----|---------|
| 2025-04 | (0)*4 + 2 - 1 | 0 | 25 Q2 |
| 2025-10 | (0)*4 + 4 - 1 | 2 | 25 Q4 |
| 2026-01 | (1)*4 + 1 - 1 | 3 | 26 Q1 |
| 2026-04 | (1)*4 + 2 - 1 | 4 | 26 Q2 |
| 2026-07 | (1)*4 + 3 - 1 | 5 | 26 Q3 |

해당 id가 PHASES 배열에 없으면 새 분기를 추가합니다 (Step 4 "새 분기가 필요한 경우" 참조).

### Step 3: 인사이트 카드 객체 생성

아래 형식으로 카드 객체를 작성합니다:

```js
{ theme: "{category}", tag: "{tag_label}", body: "{핵심 인사이트 1~2문장. <strong>핵심 수치나 결론</strong> 강조}", source: "{포스트 제목}", url: "../{category}/{slug}", roasting: "{roasting_quote}", summaries: ["{요약1}", "{요약2}", "{요약3}"] }
```

**각 필드 규칙:**

- `theme`: 카테고리 영문 소문자 (research/leader/company/tech/survival)
- `tag`: 카테고리 한국어 (리서치/리더/기업/기술/생존)
- `body`: 40자 이내 문장 1~2개. `<strong>` 태그로 핵심 수치 또는 결론 1곳만 강조. 종결어미 ~입니다/~합니다
- `source`: 포스트 제목 (Step 1에서 추출한 `title`)
- `url`: 상대 경로 `../category/slug` (예: `../tech/2026-03-10-openclaw-rl.html`)
- `roasting`: Step 1에서 추출한 blockquote 내용 그대로. `<br>` 유지, 따옴표는 `\"`로 이스케이프
- `summaries`: Step 1에서 추출한 `<p data-summary>` 3개 텍스트. 각 항목 1문장

### Step 3.5: 중복 검출

insights.html을 읽은 후, 해당 분기의 `insights` 배열에서 동일한 `url` 값을 가진 카드가 이미 존재하는지 확인합니다.

- **동일 URL 발견**: 카드 추가를 건너뛰고, 기존 카드의 내용을 최신 메타데이터로 업데이트합니다 (body, roasting, summaries 갱신).
- **미발견**: Step 4로 진행하여 새 카드를 추가합니다.

> 이 단계를 통해 `/update-insights`를 여러 번 실행해도 중복 카드가 생기지 않습니다 (멱등성 보장).

### Step 4: insights.html 수정

`insights/insights.html`을 읽고 6곳을 수정합니다.

---

**[수정 1] 해당 분기 insights 배열 끝에 카드 추가**

해당 분기(`id`가 일치하는 PHASES 항목)의 `insights: [` 배열 마지막 항목 뒤에 쉼표를 추가하고 새 카드 객체를 삽입합니다.

```js
// 수정 전
      insights: [
        { theme: "...", ... },
        { theme: "...", ... }   ← 마지막 항목
      ]

// 수정 후
      insights: [
        { theme: "...", ... },
        { theme: "...", ... },
        { theme: "tech", tag: "기술", body: "...", source: "...", url: "...", roasting: "...", summaries: [...] }
      ]
```

---

**[수정 2] 해당 분기 epRange 포스트 카운트 업데이트**

- `epRange` 값에 `포스트 N개` 패턴이 있으면 N을 1 증가
  - 예: `"뉴스레터 #29~41 · 포스트 34개"` → `"뉴스레터 #29~41 · 포스트 35개"`
- `포스트 N개` 패턴이 없으면 ` · 포스트 1개`를 뒤에 추가
  - 예: `"뉴스레터 #1~2"` → `"뉴스레터 #1~2 · 포스트 1개"`

---

**[수정 3] 탭 버튼 q-tab-count 업데이트**

해당 분기의 탭 버튼(`data-phase="{id}"`)에서 `q-tab-count` 숫자를 1 증가시킵니다:

```html
<!-- 수정 전 -->
<button class="q-tab" data-phase="4" role="tab">
  <span class="q-tab-quarter">26 Q2</span>
  <span class="q-tab-title">토큰 경제의 시대<span class="q-tab-count">4</span></span>
</button>

<!-- 수정 후 -->
<button class="q-tab" data-phase="4" role="tab">
  <span class="q-tab-quarter">26 Q2</span>
  <span class="q-tab-title">토큰 경제의 시대<span class="q-tab-count">5</span></span>
</button>
```

---

**[수정 4] 히어로 블로그 포스트 수 통계 업데이트**

`posts-index.json`을 읽어 `posts` 배열의 총 개수를 확인합니다. 히어로 섹션에서 "블로그 포스트" 레이블 바로 위의 `ins-stat-num` 값을 해당 숫자로 업데이트합니다:

```html
<!-- 수정 전 -->
<div class="ins-stat-num">41</div>
<div class="ins-stat-label">블로그 포스트</div>

<!-- 수정 후 (posts-index.json 총 포스트 수로) -->
<div class="ins-stat-num">42</div>
<div class="ins-stat-label">블로그 포스트</div>
```

---

**[수정 5] `<meta name="description">` 포스트 수 업데이트**

`<meta name="description" content="...">` 태그에 "포스트 N개" 또는 "블로그 포스트 N개" 패턴이 있으면 N을 posts-index.json 총 포스트 수로 업데이트합니다.

---

**[수정 6] 히어로 `ins-hero-desc` 포스트 수 업데이트**

`<p class="ins-hero-desc">` 태그에 "포스트 N개" 패턴이 있으면 N을 posts-index.json 총 포스트 수로 업데이트합니다.

---

**새 분기가 필요한 경우 (Step 2에서 해당 id 없음):**

기존 PHASES 배열 마지막 항목 뒤에 새 분기 블록을 추가합니다:

```js
    {
      id: {N}, quarter: "{YY QN}",
      period: "{YYYY.M~M월}",
      epRange: "포스트 1개",
      headline: "{포스트 내용 기반 분기 핵심 흐름 한 문장. ~됩니다 종결}",
      summary: "{분기 배경 2~3문장. ~입니다/~합니다 종결}",
      insights: [
        { theme: "...", tag: "...", body: "...", source: "...", url: "...", roasting: "...", summaries: [...] }
      ]
    },
```

탭 버튼도 `quarter-selector` 섹션에 추가합니다:

```html
<button class="q-tab" data-phase="{N}" role="tab">
  <span class="q-tab-quarter">{YY QN}</span>
  <span class="q-tab-title">{분기 부제}<span class="q-tab-count">1</span></span>
</button>
```

### Step 5: 완료 보고

```
## insights.html 업데이트 완료

- 추가된 카드: {포스트 제목}
- 분기: {quarter} (id: {N})
- q-tab-count: {N} → {N+1}
- 블로그 포스트 통계: {N} → {N+1}
- meta description: 포스트 수 업데이트
- hero 텍스트: 포스트 수 업데이트
```
