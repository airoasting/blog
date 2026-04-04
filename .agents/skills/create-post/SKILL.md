---
name: create-post
description: 소스 URL(아티클/유튜브)을 받아 블로그 포스트 초고를 자동 생성합니다 (콘텐츠 + 썸네일)
---

# 블로그 포스트 자동 생성

사용자가 제공한 소스 URL을 기반으로 AI ROASTING 블로그 포스트를 자동 생성합니다.

## 입력

`$ARGUMENTS`에서 소스 URL을 받습니다. 카테고리가 함께 제공되면 사용하고, 없으면 소스 내용을 분석하여 적절한 카테고리를 결정합니다.

예시:
- `/create-post https://hbr.org/some-article`
- `/create-post https://arxiv.org/paper research`
- `/create-post https://youtube.com/watch?v=xxxxx`
- `/create-post https://youtu.be/xxxxx tech`

## 실행 단계

### Step 1: 소스 읽기

입력 URL을 판별하여 분기합니다:

**아티클 (기본):**
- WebFetch로 소스 URL의 콘텐츠를 가져옵니다
- 제목, 저자, 핵심 내용, 데이터/수치를 추출합니다

**유튜브 (youtube.com / youtu.be):**
- 트랜스크립트를 추출합니다 (`yt-dlp --write-auto-sub` 또는 YouTube Transcript API)
- 타임스탬프를 제거하고 반복/필러를 정리합니다
- 출처 메타데이터: 매체명 "YouTube", 저자명은 채널명, 원문 URL은 영상 링크

### Step 2: 메타데이터 결정

- **제목**: 한국어, AI ROASTING 스타일 (40자 이내 목표)
- **카테고리**: 소스 내용 기반으로 5개 중 선택 (research/leader/company/tech/survival)
- **날짜**: 오늘 날짜 (YYYY-MM-DD)
- **Slug**: 영문 kebab-case (예: `ai-agent-security`)
- **태그**: 3~6개 (한국어)
- **출처**: "출판사/매체 (저자명)" 형식
- **요약**: 1~2문장
- **Roasting Quote**: 도발적 코멘트 1~2문장. **반드시 높임말(~입니다/~합니다/~습니까?)로 작성**

### Step 3: 콘텐츠 작성

`guides/editorial-rules.md`를 읽고 해당 가이드를 **반드시** 따릅니다.

#### ⚠️ 최우선 3원칙 (모든 문장에 적용, 위반 시 즉시 재작성)

**원칙 1. 자연스러운 한국어로 쓴다.**
- 번역체 철저 배제. 소리 내어 읽었을 때 어색하면 고친다.
- 금지: "~라고 할 수 있겠습니다", "~라는 점에서 주목할 만합니다", "~에 대해" 남용
- 나쁜 예: "AI 도입에 대해 고민하고 있는 기업들에 대해서는"
- 좋은 예: "AI 도입을 고민하는 기업은"

**원칙 2. 주어와 술어를 가깝게 놓는다.**
- 주술 사이에 수식어가 3개 이상 끼면 문장을 나눈다.
- 나쁜 예: "AI 에이전트는 반복 업무를 자동화하고 내부 문서를 검색하며 고객 응대까지 처리하는 기능을 통해 기업의 운영 효율성을 높이는 역할을 합니다."
- 좋은 예: "AI 에이전트는 기업의 운영 효율을 높입니다. 반복 업무 자동화, 내부 문서 검색, 고객 응대를 하나의 시스템에서 처리합니다."

**원칙 3. 이해하기 쉽게 쓴다.**
- 한 문장에 하나의 정보만 담는다.
- 앞 문장을 다시 읽지 않아도 뒷 문장을 이해할 수 있어야 한다.
- 추상적 표현은 구체적 수치로 바꾼다. "생산성이 향상됩니다" → "보고서 작성 시간이 절반으로 줄어듭니다."

> **작성 후 자가 검증**: 모든 문장을 3원칙 기준으로 재점검합니다. 위반 문장이 1건이라도 있으면 수정 후 다음 단계로 넘어갑니다.

#### 세부 가이드

1. **소스 소화**: 분해 → 재구성 → 관점 입히기 (가이드 섹션 1)
2. **문체 규칙**: 기본 원칙 + 톤 매트릭스 (가이드 섹션 2)
3. **아티클 구조**: 11개 섹션 (가이드 섹션 3)
4. **출처 규칙**: 등급 판단 + 기술 용어 난이도 + 팩트체크 (가이드 섹션 4)
5. **금지 표현 체크**: 작성 완료 후 금지 표현 패턴 검출, 0건 확인

**필수 준수 사항:**
- **`<h3>` 금지**: 핵심 인사이트 등 항목 구분에 `<h3>` 사용 금지. `<p><strong>첫째, ...</strong>` 패턴 사용
- **1문단 3~5문장**: 초과 시 반드시 문단 분리
- **컨텍스트 5문장 이하**: "왜 지금 중요한가" 섹션 엄수
- **기술 용어 Lv.2**: 첫 등장 시 괄호 설명 필수 (예: "오케스트레이션(여러 에이전트의 작업 배분과 조율)")
- **비즈니스 비용**: 소스에 정량 수치가 없으면 섹션 자체 생략 (빈 섹션 금지)
- **참고자료 APA**: `저자. (연도, 월). *제목* [Video/Article]. 플랫폼. URL 전문` 형식. 링크 텍스트 축약 금지
- **Roasting quote 4곳 동기화**: blockquote, data-roasting-quote, JS ROASTING_QUOTE, posts-index.json
- **Roasting quote 높임말**: 종결어미가 ~입니다/~합니다/~습니까? 형태인지 확인 후 아니면 변환
- **액션 스텝 마크업**: `<span class="action-num">` + `<div class="action-body">` 구조 사용

### Step 4: HTML 파일 생성

`guides/html-spec.md`를 읽고 HTML 구조를 따릅니다:

- 기존 포스트 파일의 HTML 구조를 참조합니다
- 파일 경로: `{category}/{YYYY-MM-DD-slug}.html`
- 모든 메타 태그, OG 태그, JSON-LD, 헤더, 네비게이션, 진행률 바, TOC 포함
- `../assets/css/style.css` 링크
- 하단 스크립트: `posts-data.js`, `post-features.js`, `search.js`, `ai-view.js`

### Step 5: 썸네일 생성

`/generate-thumbnail` 스킬을 실행합니다:

1. 이미지 디렉토리 생성: `mkdir -p {category}/images/{YYYY_MM_DD_slug}/`
2. 로컬 스크립트로 썸네일 생성: `python3 tools/generate-thumbnail.py --category {category} --output {category}/images/{YYYY_MM_DD_slug}/thumbnail.png --seed {slug}`

### Step 6: 자동 파이프라인 진행

초고 생성 완료 후, **사용자 승인 없이 자동으로** 다음 단계를 순차 실행합니다:

1. `/edit-post {category}/{YYYY-MM-DD-slug}.html` → 퇴고 & 자동 수정
2. `/publish-post {category}/{YYYY-MM-DD-slug}.html` → 5관점 검수 + 인덱스 등록 + 발행

> **참고**: 전체 파이프라인이 끝날 때까지 사용자에게 중간 확인을 묻지 않습니다. 최종 완료 보고만 합니다.
