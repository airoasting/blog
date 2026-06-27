---
name: create-post
description: 소스 URL(아티클/유튜브/arXiv/X/GitHub)을 받아 블로그 포스트 초고를 자동 생성합니다
---

# 블로그 포스트 자동 생성

`$ARGUMENTS`에서 소스 URL을 받습니다. 카테고리 인자가 있으면 사용, 없으면 소스 내용 기반으로 결정.

예: `/create-post https://hbr.org/xxx` / `/create-post https://arxiv.org/abs/xxx research` / `/create-post https://youtu.be/xxx tech`

> CLAUDE.md의 핵심 규칙(종결어미·3원칙·금지 표현·카테고리 컬러)은 전 단계에 기본 적용합니다. 중복 나열하지 않습니다.

## Step 1: 소스 읽기

URL 도메인으로 분기:

| 패턴 | 추출 방법 |
|---|---|
| youtube.com, youtu.be | `yt-dlp --write-auto-sub` → 트랜스크립트 |
| arxiv.org | ar5iv HTML → WebFetch. 실패 시 Read(PDF, pages: "1-20") |
| *.pdf | Read tool (pages: "1-20") |
| x.com, twitter.com | WebFetch → 스레드 전문 |
| github.com | WebFetch → README + 핵심 섹션 |
| 그 외 | WebFetch → 제목/저자/본문 |

상세 규칙은 `guides/editorial-rules.md` Section 1-1. 실패 대응은 `.claude/skills/_shared/troubleshooting/source-failures.md`를 실패 시에만 참조.

### WebFetch 도메인 자동 등록

WebFetch로 소스를 성공적으로 가져온 직후 `.claude/settings.local.json`에 도메인을 추가합니다. 사용자 승인 불필요, 다음 실행부터 동일 도메인 프롬프트가 제거됩니다.

1. URL에서 호스트만 추출. 예: `https://hbr.org/x` → `hbr.org`, `https://www.anthropic.com/y` → `www.anthropic.com`. 서브도메인은 그대로 유지 (`www.` 포함).
2. `.claude/settings.local.json`을 Read → `permissions.allow` 배열에 `WebFetch(domain:<호스트>)` 항목이 이미 있으면 스킵, 없으면 한 줄 추가 → Edit 또는 Write로 저장.
3. WebFetch 실패는 추가하지 않음. yt-dlp(Bash) 호출은 대상 외 (도메인 등록 불필요).
4. 파일 누락/JSON 파싱 실패는 조용히 스킵하고 본 작업 계속. 사용자에게 보고하지 않음.

## Step 2: 메타데이터

- **제목**: 한국어, 40자 이내 목표. **제목이 서술성 종결로 끝날 때 "~이다"(계사) 종결 금지, "~입니다"로 쓴다.** 예: "신뢰가 전략이다" → "신뢰가 전략입니다", "두 가지뿐이다" → "두 가지뿐입니다". (동사 과거형 ~았다/었다, 명사형 종결은 기존 스타일 유지)
- **카테고리**: 5개 중 선택
- **날짜**: **소스 원문 발행일** 사용 (오늘 날짜 아님). 확인 불가 시에만 오늘
- **Slug**: 영문 kebab-case
- **태그**: 3~6개 한국어
- **출처**: `매체 (저자)`
- **요약**: 1~2문장
- **Roasting Quote**: 도발적 1~2문장, **반드시 높임말(~입니다/~합니다/~습니까?)**

## Step 3: 콘텐츠 작성

CLAUDE.md의 3원칙·금지 표현을 0건 기준으로 준수합니다. 추가 필수 사항:

- **`<h3>` 금지**: `<p><strong>첫째, ...</strong>` 패턴 사용
- **1문단 3~5문장**, 초과 시 분리
- **"왜 지금 중요한가" 5문장 이하**
- **기술 용어 Lv.2**: 본문은 괄호 설명 없이, 하단 "용어 설명" 섹션에서 풀이. `<div class="methodology-box">` 클래스만 (인라인 스타일 금지)
- **비즈니스 비용**: 수치 없으면 섹션 생략
- **참고자료 APA**: `저자. (2026, June). <em>제목</em> [Article]. 플랫폼. (원문 보기 ↗)`. 날짜는 영어 월명, 노출 URL/도메인 금지, 링크는 인용문 끝 `(<a ...>원문 보기 ↗</a>)`로. 참고자료 아래 별도 `원문 보기 →` CTA 버튼 금지(링크는 참고자료로 일원화)
- **Roasting quote 4곳 동기화**: blockquote, data-roasting-quote, JS `ROASTING_QUOTE`, posts-index.json
- **액션 스텝**: `<span class="action-num">` + `<div class="action-body">` 구조
- **"다음 단계" CTA 섹션 금지** (section-cta 생성 안 함)
- **"스스로"는 오타 아님**, 교정 금지

### 소스 표/차트

소스에 핵심 테이블(성능 비교, 정량 결과, 시사점 데이터)이 있으면 **반드시** 포함. 템플릿: `.claude/skills/_shared/templates/post-table.html`. 가공 원칙·카테고리 컬러는 템플릿 주석 참조.

### 핵심 수치 카드

소스에 3개 이하 핵심 숫자(%, 건수, 배율) → stat-card. 템플릿: `.claude/skills/_shared/templates/stat-card.html`. 4개 이상이면 post-table로 대체.

### 소스 이미지/인포그래픽

논문 Figure·데이터 시각화·설명 스크린샷은 **반드시** 포함 (장식/프로필/UI 제외). 원본 URL 그대로 사용. 템플릿: `.claude/skills/_shared/templates/post-figure.html`. 복수 시 2~3개 선별.

## Step 4: HTML 파일 생성

`{category}/` 최신 파일 1개를 참조하여 구조 복제.

- 경로: `{category}/{YYYY-MM-DD-slug}.html`
- 메타 태그·OG·JSON-LD·헤더·네비게이션·진행률 바·TOC 포함
- `../assets/css/style.css` 링크
- 스크립트: `posts-data.js`, `post-features.js`, `search.js`, `ai-view.js`

> **썸네일 자동 생성 금지.** `thumbnail.png`를 만들지 않습니다(헤드리스 Chrome 스크린샷 등 일절 금지). 히어로의 `<img>`는 `onerror`로 파일이 없으면 숨겨지고 제목 오버레이만 표시됩니다. 썸네일은 사용자가 **명시적으로 요청할 때만** 생성합니다.

파일이 이미 있으면 사용자에게 확인 요청 후 진행. 자동 덮어쓰기 금지.

## Step 5: Navy 평가 루프

HTML 생성 직후, 사용자 승인 없이 자동 실행.

**Navy**: 20년차 전략 컨설팅 출신. "이 글이 실제로 의사결정을 바꾸는가?"가 핵심 기준. 독자는 35세 비개발자 팀장.

**자기 채점 편향 방지:**
1. 만점은 구체 근거 1개 이상 필요
2. **1라운드 총점 상한 9.3**
3. 핵심 개선 요청 최소 2건 (미만 시 재점검)

**루브릭 (10점):** 전략적 관련성 2.5 / 논리 구조 2.0 / 인사이트 깊이 2.0 / 실행 가능성 2.0 / 문체·가독성 1.5

**루프:**
1. 파일을 읽고 영역별 점수 + 핵심 개선 요청 2건 이상 출력
2. **총점 < 9.0**: 해당 섹션 수정 후 재평가
3. **총점 ≥ 9.0**: `✦ 승인 (X.X/10.0)` 후 다음 단계
4. 최대 3라운드. 미달 시 최고점 버전으로 진행하며 사용자에게 알림

## Step 6: 자동 파이프라인

Navy 승인 후 사용자 승인 없이: `/publish-post {path}` (→ update-insights → persona-comment 포함).

edit-post는 파이프라인 제외. 전체 완료 후에만 최종 보고.
