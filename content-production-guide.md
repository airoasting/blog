# 콘텐츠 제작 가이드 (Deprecated)

> **이 파일은 더 이상 사용되지 않습니다.** 아래 파일들로 분리되었습니다.
>
> | 목적 | 파일 |
> |------|------|
> | 프로젝트 허브 | `CLAUDE.md` |
> | 글쓰기 규칙 | `guides/editorial-rules.md` |
> | HTML 구현 | `guides/html-spec.md` |
> | SNS·이미지 | `guides/distribution.md` |
> | 검수·발행 | `guides/qa-checklist.md` |
>
> 스킬에서 이 파일을 참조하지 마세요. `guides/` 디렉토리의 해당 가이드를 사용하세요.

---

*아래는 레거시 내용입니다. 위 파일들이 정본입니다.*

> **"AI 에이전트를 고용하라" 콘텐츠 운영 매뉴얼**

---

## 1. 소스 소화

### 1-1. 분해 (Deconstruct)

원문에서 아래 5가지를 추출합니다.

- **핵심 팩트**: 수치, 날짜, 고유명사 (출처 기록)
- **원문의 주장**: 핵심 메시지 1~3개
- **숨은 전제**: 저자가 깔고 가는 가정
- **수강생 접점**: 경영 리더에게 의미 있는 부분
- **기술 정확성**: AI 기술·도구·수치 사실 여부

**소스 유형별 주의점**:

| 소스 유형 | 주의점 |
|-----------|--------|
| 뉴스 아티클 | 헤드라인 과장 여부 확인, 원출처 역추적 |
| 리서치/PDF | 핵심 도표·수치만 추출, 방법론 한계 확인 |
| 전문가 칼럼 | 의견과 사실 분리, 이해관계 파악 |
| 공식 보도자료 | PR 프레이밍 걷어내기, 실제 기능 vs 마케팅 구분 |
| 복수 소스 | 상충 데이터 교차 검증, 최신 소스 우선 |

### 1-2. 재구성 (Reconstruct)

**관점 프레임**: "이 정보가 AI를 활용해 사업을 성장시키려는 경영 리더에게 어떤 의미인가?"

세 가지 질문에 답합니다:

1. **So What?** : 왜 지금 중요한가?
2. **Now What?** : 내일 당장 할 수 있는 행동은?
3. **What If Not?** : 무시하면 어떤 리스크가 있는가?

### 1-3. 관점 입히기 (Perspective Layer)

| 베인 스타일 요소 | 적용 방법 |
|------------------|-----------|
| 구조화된 사고 | MECE 프레임으로 정리 |
| 데이터 기반 논증 | 수치·사례·출처 동반 |
| 80/20 원칙 | 핵심 20% 먼저, 나머지는 보충 |
| 실행 가능성 중심 | "하면 바뀌는 것" 위주 |
| AI 강사 시각 | 기술 트렌드를 비즈니스 임팩트로 번역 |

---

## 2. 문체 규칙

### 최우선 3원칙

**1. 자연스러운 한국어로 쓴다.**
- 번역체를 철저히 배제합니다. "~라고 할 수 있겠습니다", "~라는 점에서 주목할 만합니다" 같은 표현은 금지합니다.
- 소리 내어 읽었을 때 어색하면 고칩니다.
- 조사를 정확히 씁니다. "~에 대해"를 남용하지 않습니다.
  - 나쁜 예: "AI 도입에 대해 고민하고 있는 기업들에 대해서는"
  - 좋은 예: "AI 도입을 고민하는 기업은"

**2. 주어와 술어를 가깝게 놓는다.**
- 주술 사이에 수식어가 3개 이상 끼면 문장을 나눕니다.
  - 나쁜 예: "AI 에이전트는 반복 업무를 자동화하고 내부 문서를 검색하며 고객 응대까지 처리하는 기능을 통해 기업의 운영 효율성을 높이는 역할을 합니다."
  - 좋은 예: "AI 에이전트는 기업의 운영 효율을 높입니다. 반복 업무 자동화, 내부 문서 검색, 고객 응대를 하나의 시스템에서 처리합니다."

**3. 이해하기 쉽게 쓴다.**
- 한 문장에 하나의 정보만 담습니다.
- 앞 문장을 다시 읽지 않아도 뒷 문장을 이해할 수 있어야 합니다.
- 추상적 표현은 구체적 수치로 바꿉니다. "생산성이 향상됩니다" → "보고서 작성 시간이 절반으로 줄어듭니다."

### 기본 원칙

- **종결어미**: `~입니다`, `~합니다` 통일 (3줄 요약 포함, 모든 섹션 동일)
- **문장 길이**: 40자 이내 목표, 60자 초과 금지 (띄어쓰기·문장부호 포함)
- **능동태** 사용, 이중 부정 금지
- **자연스러운 연결**: 접속 부사(그래서, 따라서, 한편, 다만 등)를 적절히 활용하되 남발하지 않습니다.
- **Topic Sentence**: 문단 첫 문장 = 해당 문단의 핵심
- **1문단 1아이디어**, 3~5문장 구성
- **줄바꿈**: 단어 중간에서 줄바꿈하지 않습니다. CSS에서 `word-break: keep-all`을 적용합니다.

### 톤 매트릭스

| 콘텐츠 유형 | 톤 | 예시 |
|-------------|-----|------|
| 트렌드 분석 | 전략가의 냉정한 분석 | "이 변화는 3가지 구조적 원인에서 비롯됩니다. 첫째, 기업용 AI 에이전트의 가격이 12개월 만에 60% 하락했습니다." |
| 활용 가이드 | 옆자리 선배의 실전 조언 | "저도 처음엔 막혔습니다. 핵심은 이겁니다. 한 번에 완벽한 프롬프트를 쓰려고 하지 마세요." |
| 사례 소개 | 컨설턴트의 케이스 브리핑 | "A사는 이 전략으로 운영 비용을 40% 절감했습니다. 핵심은 '오류 비용'을 기준으로 자동화 대상을 고른 것입니다." |
| 뉴스 해설 | 강사의 맥락 해설 | "헤드라인만 보면 놓칩니다. 이번 발표의 핵심은 기술이 아니라 가격 정책입니다." |
| 시리즈 연재 | 강의식 내레이션 | "지난 편에서 AI 에이전트의 구조를 살펴봤습니다. 오늘은 그 위에 실전 활용법을 쌓아 올립니다." |
| 인터뷰 기반 | 큐레이터의 맥락 전달 | "이 대화에서 주목할 지점은 3가지입니다. 특히 두 번째 답변은 기존 업계 통념과 정반대입니다." |

### 금지 표현 & 대체 표현

| 금지 | 대체 | 이유 |
|---------|---------|------|
| 혁명적인 / 획기적인 | 구조적 변화 / 유의미한 전환 | 과장 |
| ~할 수밖에 없습니다 | ~하는 것이 합리적입니다 | 강요 |
| 모든 기업이~ | 대다수의 기업이~ / 조사에 따르면~ | 일반화 |
| 놀라운 / 충격적인 | 주목할 만한 / 의미 있는 | 감정 과잉 |
| 패러다임 시프트 / 게임 체인저 | 시장 구조의 변화 / 차별화 지점 | 클리셰 |
| 폭발적 성장 | (수치)% 성장 | 과장, 수치로 대체 |
| 누구나 쉽게 | 기본 설정만으로 / 별도 코딩 없이 | 과장 |
| em dash (—) | 쉼표, 마침표, 괄호로 대체 | 가독성 저해 |

**금지 표현 검출 패턴** (자가 검수용):

```
혁명적|획기적|할 수밖에|모든 기업이|놀라운|충격적인|패러다임 시프트|게임 체인저|폭발적 성장|누구나 쉽게|—
```

### 흔한 실수

| 실수 | 교정 |
|------|------|
| em dash 습관 | 쉼표, 마침표, 괄호로 대체 |
| 3줄 요약 이다 체 | 반드시 "~입니다", "~되었습니다"로 수정 |
| 접속 부사 남발 | 연속 2문장 이상 접속 부사로 시작 금지 |
| 과장 형용사 ("매우", "정말") | 수치로 대체하거나 삭제 |
| 번역체 | "~라고 할 수 있겠습니다" → 직접적 표현으로 교체 |
| 모호한 실행 지침 | "AI를 활용해 보세요" → 도구명 + 프롬프트 예시 + 소요 시간 |
| 구조 스킵 | 11개 섹션 체크리스트로 확인. 생략 시 "[해당 없음]" 명시 |
| 출처 누락 | 모든 수치에 (출처: 기관명, 연도) 형식 필수 |
| 히어로 이미지 lazy | 히어로는 LCP이므로 lazy loading 제외 |

---

## 3. 아티클 구조

아티클은 아래 섹션으로 구성됩니다. [A], [B], [C], [D]는 부속, [1]~[6]은 본문입니다.

```
[A] 3줄 요약 (부속, 본문 상단 고정)
[B] Roasting (부속, 도발적 코멘트)
[1] 이 글, 왜 읽어야 하나 (본문 시작, 훅)
[2] 왜 지금 중요한가 (컨텍스트)
[3] 핵심 인사이트 (So What)
[3.5] 비즈니스 비용 (정량적 영향, 조건부)
[4] 내일 당장 할 수 있는 것 (Now What)
[5] 리스크 & 주의점 (What If Not)
[6] 한 줄 정리 (마무리)
[C] 리더의 결정 포인트 (부속, 역할별 행동 지침)
[D] 참고자료 (부속, 인용 목록)
```

### 섹션별 핵심 규칙

**3줄 요약**: 글 전체를 3문장으로 압축합니다. **반드시 입니다/합니다 체로 작성합니다.** 각 문장에 `data-summary` 속성을 부여합니다.

**Roasting**: 독자의 관성을 깨는 도발적 코멘트입니다. `<blockquote>` 태그를 사용합니다. 1~2문장, 반말이나 직설적 톤도 허용됩니다.

- **톤 유형**: 위트(유머로 포장한 관찰) / 냉소(업계 허세를 짚는 건조한 톤) / 도발(독자의 안일함을 겨냥) / 자조(업계 전체를 대상으로 한 자기 성찰)
- **금지선**: 특정 기업·인물 비하 금지, 독자 비하 금지("이것도 모르면서"), 혐오·차별 표현 절대 금지, 비관론 금지("다 끝났다")

**이 글, 왜 읽어야 하나 (훅)**: 출처 없는 수치 사용 금지. 5가지 유형: 반직관 팩트, 현실 질문, 시간 압박, 비유 전환, 손실 프레이밍.

**왜 지금 중요한가 (컨텍스트)**: 5문장 초과 금지. "시장 → 산업 → 독자 현실" 순서로 좁혀 들어갑니다.

**핵심 인사이트**: 다른 매체에서도 쓸 수 있는 문장이면 삭제합니다. 수치·사례 없는 주장은 포함하지 않습니다. 각 포인트는 `<strong>` 볼드 첫 문장 + 후속 설명 구조입니다.

**비즈니스 비용**: 인사이트를 무시했을 때의 구체적 비용을 수치로 제시합니다. 소스에 비용 수치가 전혀 없고 합리적 추정도 불가능하면 "[비즈니스 비용: 해당 없음]"으로 표기합니다.

**내일 당장 할 수 있는 것**: "AI를 활용하세요"는 실전이 아닙니다. 도구명, 프롬프트 예시, 소요 시간, 기대 결과를 명시합니다. HTML에서 `<div class="action-steps">` > `<div class="action-step">` 구조를 사용합니다.

**리스크 & 주의점**: 장점만 나열하면 광고입니다. 기술 한계와 현실 제약을 솔직하게 씁니다.

**한 줄 정리**: 새로운 정보 추가 금지. 핵심 메시지를 1~2문장으로 압축합니다.

**리더의 결정 포인트**: 창업자·팀장·임원 등 역할별로 행동 지침 1문장을 제시합니다. HTML에서 `<div class="decision-points">` > `<div class="decision-point">` 구조를 사용합니다.

**참고자료**: APA 스타일, `<ul class="references-list">` 목록. 소스가 여러 개이면 각각 `<li>`로 개별 항목으로 표기합니다.

---

## 4. 출처 규칙

### 출처 등급

| 등급 | 소스 유형 | 사용 가이드 |
|------|-----------|-------------|
| **A** | 원본 연구 보고서, 공식 발표, 1차 데이터 | 핵심 논거로 사용 |
| **B** | 로이터, 블룸버그, 주요 기술 매체 | 트렌드·사례 근거 |
| **C** | 업계 블로그, 전문가 의견 | "~에 따르면"으로 인용, 단독 근거 불가 |
| **D** | SNS, 커뮤니티, 미확인 출처 | 원칙적 사용 금지 |

> **D등급 예외**: CEO·공식 계정이 SNS에 직접 게시한 1차 발표는 **A등급으로 승격**합니다. "Sam Altman이 X에서 직접 발표한 바에 따르면"처럼 출처 경로를 명시합니다.

### 기술 용어 난이도

| 등급 | 처리 방법 | 예시 |
|------|-----------|------|
| **Lv.1** | 별도 설명 불필요 | AI, 챗봇, 자동화 |
| **Lv.2** | 첫 등장 시 괄호 설명 | "RAG(회사 내부 문서를 AI에 연결하는 방식)" |
| **Lv.3** | 사용 지양, 사용 시 설명 박스 | 파인튜닝, 벡터 DB, 토큰 윈도우 |

### 팩트체크 항목

1. 수치의 원출처 확인
2. 수치 측정 시점 1년 이내 여부
3. 기업명·인명·직함 정확성
4. AI 도구 버전·기능이 현재 기준인지 확인
5. 번역 과정 의미 왜곡 여부

---

## 5. 카테고리 & 파일 구조

### 카테고리 정의

| 카테고리 | 담는 콘텐츠 | 컬러 | URL |
|----------|-------------|------|-----|
| **리서치** | HBR · BCG · EY · 논문 | `#1A1A1A` | `research/` |
| **리더** | 빅테크 CEO · 석학 대담 | `#C43500` | `leader/` |
| **기업** | 조직 · 경영 · AX 트렌드 | `#1A4A7A` | `company/` |
| **기술** | 에이전트 · 자동화 · 한계 돌파 | `#145C35` | `tech/` |
| **생존** | 구조조정 · 세대 · 직업 변화 | `#7A1F1F` | `survival/` |

### 콘텐츠 파일 저장 규칙

```
{category}/YYYY-MM-DD-slug.html
```

- 날짜: `YYYY-MM-DD` (하이픈 구분)
- 제목: 영문 소문자 + 하이픈(kebab-case), 한글 불가
- 확장자: `.html`

### 이미지 어셋 저장 규칙

```
{category}/images/{YYYY_MM_DD_slug}/
```

> 이미지 폴더명은 파일명과 달리 언더스코어를 사용합니다.

| 이미지 유형 | 파일명 | 사이즈 |
|-------------|--------|--------|
| 블로그 썸네일 | `thumbnail.png` | 1200x630 |
| OG 소셜 카드 | `og.png` | 1200x630 |
| 인포그래픽 | `infographic.png` | 가변 |
| 프로세스 다이어그램 | `diagram.png` | 가변 |
| 비교 차트 | `chart.png` | 가변 |
| 인용 카드 | `quote.png` | 1080x1080 |
| 카드뉴스 슬라이드 | `card_01.png` ~ `card_07.png` | 1080x1080 |

---

## 6. HTML 템플릿 구조

모든 아티클은 아래 HTML 템플릿을 따릅니다. `research/2026-03-05-brain-fry.html`을 기준 참조 파일로 사용합니다.

**템플릿 변수 매핑**: 아래 코드 블록의 `{변수}`는 새 아티클 작성 시 실제 값으로 치환합니다.

| 변수 | 설명 | 예시 |
|------|------|------|
| `{제목}` | 아티클 한글 제목 | AI 도구 3개 넘으면 생산성이 떨어진다 |
| `{category}` | 영문 카테고리 코드 | research |
| `{카테고리 한글명}` | 카테고리 표시명 | 리서치 |
| `{YYYY-MM-DD}` | 발행일 | 2026-03-05 |
| `{YYYY_MM_DD_slug}` | 이미지 폴더명 (언더스코어) | 2026_03_05_brain-fry |
| `{파일명}` | HTML 파일명 | 2026-03-05-brain-fry.html |
| `{메타 디스크립션}` | SEO 요약 (160자 이내) | BCG 조사: AI 도구 3개 초과 시... |
| `{OG 요약}` | 소셜 미리보기 요약 | 메타 디스크립션과 동일 또는 축약 |
| `{출처 매체명}` | 원문 매체 | HBR |
| `{저자명}` | 원문 저자 | Julie Bedard 외 3인 |
| `{원문 URL}` | 원문 링크 | https://hbr.org/... |
| `{태그}` | 포스트 태그 (3~4개) | HBR, 인지부하, 생산성 |
| `{로스팅 코멘트}` | Roasting 텍스트 | AI 도구를 많이 쓸수록... |
| `{다음글 slug}` | 다음 글 파일명 (확장자 포함) | 2026-03-09-ai-last-mile.html |

### 6-1. `<head>` 구성

```html
<!-- 기본 메타 -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{제목} - AI ROASTING</title>
<meta name="description" content="{메타 디스크립션}">

<!-- Open Graph -->
<meta property="og:title" content="{제목}">
<meta property="og:description" content="{OG 요약}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://airoasting.github.io/blog/{category}/{파일명}">
<meta property="og:locale" content="ko_KR">
<meta property="article:published_time" content="{YYYY-MM-DD}">
<meta property="article:section" content="{카테고리 한글명}">
<meta property="article:tag" content="{태그1}">
<meta property="article:tag" content="{태그2}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{제목}">
<meta name="twitter:description" content="{OG 요약}">

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;800&family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<!-- Stylesheet -->
<link rel="stylesheet" href="../assets/css/style.css">

<!-- JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{제목}",
  "datePublished": "{YYYY-MM-DD}",
  "author": { "@type": "Person", "name": "AI ROASTING" },
  "publisher": { "@type": "Organization", "name": "AI ROASTING", "url": "https://airoasting.github.io/blog/" },
  "description": "{메타 디스크립션}",
  "mainEntityOfPage": "https://airoasting.github.io/blog/{category}/{파일명}",
  "articleSection": "{카테고리 한글명}"
}
</script>
```

### 6-2. `<header>` 구성

- **Row 1**: 로고(`AI ROASTING`) + 유틸리티(About 링크, 검색 버튼, Human/AI 뷰 토글, 햄버거 메뉴)
- **Row 2**: 카테고리 내비게이션 (리서치/리더/기업/기술/생존), 현재 카테고리에 `class="active"` 부여
- **모바일 내비**: 검색 입력 + 카테고리 링크

### 6-3. 읽기 진행률 바

```html
<div class="reading-progress-bar" id="readingProgress">
  <div class="reading-progress-fill"></div>
</div>
```

```css
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 9999;
}
.reading-progress-fill {
  height: 100%;
  background: var(--category-color, #2D7FF9);
  width: 0%;
  transition: width 0.1s ease-out;
}
```

```javascript
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  document.querySelector('.reading-progress-fill').style.width = progress + '%';
});
```

### 6-4. 목차 (Table of Contents)

데스크톱에서는 사이드 TOC, 모바일에서는 플로팅 버튼으로 섹션 간 이동을 지원합니다.

```html
<!-- 데스크톱 사이드 TOC -->
<nav class="toc-sidebar" id="tocSidebar">
  <ul class="toc-list">
    <li><a href="#section-summary" class="toc-link">3줄 요약</a></li>
    <li><a href="#section-roasting" class="toc-link">Roasting</a></li>
    <li><a href="#section-hook" class="toc-link">왜 읽어야 하나</a></li>
    <li><a href="#section-context" class="toc-link">왜 지금 중요한가</a></li>
    <li><a href="#section-insight" class="toc-link">핵심 인사이트</a></li>
    <li><a href="#section-action" class="toc-link">내일 당장</a></li>
    <li><a href="#section-risk" class="toc-link">리스크</a></li>
    <li><a href="#section-closing" class="toc-link">한 줄 정리</a></li>
  </ul>
</nav>

<!-- 모바일 플로팅 TOC 버튼 -->
<button class="toc-fab" id="tocFab" aria-label="목차 열기">목차</button>
```

### 6-5. 썸네일 히어로

```html
<div class="post-thumbnail-hero" data-category="{category}">
  <div class="post-color-bar"></div>
  <img src="./images/{YYYY_MM_DD_slug}/thumbnail.png"
       alt="{제목} - 썸네일">
  <div class="post-hero-meta">
    <span class="post-category" data-category="{category}">{카테고리 한글명}</span>
    <span class="post-date">{YYYY-MM-DD}</span>
  </div>
  <div class="post-thumbnail-overlay">
    <h1 class="post-title" id="postTitle">{제목}</h1>
  </div>
  <div class="post-hero-bottom">
    <div class="post-hero-source">
      <span>{출처 매체명}</span>
      <span>{저자명}</span>
      <span><a href="{원문 URL}" target="_blank" rel="noopener">{원문 제목} ↗</a></span>
    </div>
    <div class="post-hero-tags">
      <a href="../index.html?tag={태그}" class="post-tag">#{태그}</a>
      <!-- 태그 3~4개만 사용 -->
    </div>
  </div>
</div>
```

> **이미지 lazy loading**: 히어로 이미지는 LCP이므로 lazy loading을 적용하지 않습니다. 나머지 모든 `<img>` 태그에 `loading="lazy"` 속성을 추가합니다.

### 6-6. AI 뷰용 데이터

```html
<div id="postData" hidden
  data-title="{제목}"
  data-date="{YYYY-MM-DD}"
  data-category="{category}"
  data-source="{출처 매체명}"
  data-tags="{태그1}, {태그2}, {태그3}"
  data-original-url="{원문 URL}"
  data-roasting-quote="{로스팅 코멘트}"
  data-next-post="{다음글 slug}"></div>
```

### 6-7. 본문 섹션 패턴

```html
<section class="post-section" id="section-{섹션키}">
  <div class="post-section-label">{섹션 레이블}</div>
  <!-- 본문 내용 -->
</section>
```

### 6-8. 프롬프트/코드 복사 버튼

```html
<div class="prompt-block">
  <pre class="prompt-text">{프롬프트 내용}</pre>
  <button class="copy-prompt-btn" onclick="copyPrompt(this)" aria-label="프롬프트 복사">복사</button>
</div>
```

```javascript
function copyPrompt(btn) {
  const text = btn.previousElementSibling.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '복사됨';
    setTimeout(() => { btn.textContent = '복사'; }, 2000);
  });
}
```

### 6-9. 하단 요소

```html
<!-- 원문 보기 링크 -->
<a href="{원문 URL}" target="_blank" rel="noopener" class="hero-cta">원문 보기 →</a>

<!-- 소셜 공유 (데스크톱) -->
<div class="share-bar desktop-only">
  <button class="share-btn" onclick="shareLinkedIn()">LinkedIn 공유</button>
  <button class="share-btn" onclick="shareThreads()">Threads 공유</button>
  <button class="share-btn" id="copyBtn" onclick="copyLink()">링크 복사</button>
</div>

<!-- 다음 글 추천 -->
<div class="next-post">
  <div class="next-post-label">AI ROASTING이 추천하는 다음 글</div>
  <a href="./{다음글 파일명}">
    <div class="next-post-title">{다음 글 제목} →</div>
  </a>
</div>

<!-- 모바일 공유 바 (article 바깥, main 바깥) -->
<div class="mobile-share-bar">...</div>

<!-- AI 마크다운 오버레이 -->
<div class="ai-md-overlay" id="aiMdOverlay">...</div>
```

> **모바일 공유 바**: `position: fixed; bottom: 0`이므로 `padding-bottom: calc(60px + env(safe-area-inset-bottom))` 적용.

### 6-10. CSS 기본 규칙

```css
body {
  word-break: keep-all;
  overflow-wrap: break-word;
}

:root {
  --rhythm: 8px;
}
p {
  font-size: 16px;
  line-height: 1.75;
  margin-bottom: 16px;
}
h2 {
  margin-top: 48px;
  margin-bottom: 16px;
}
h3 {
  margin-top: 32px;
  margin-bottom: 8px;
}
```

### 6-11. 스크립트

```html
<script>
  const PAGE_URL = 'https://airoasting.github.io/blog/{category}/{파일명}';
  const ROASTING_QUOTE = '{로스팅 코멘트}';
</script>
<script src="../assets/js/ai-view.js"></script>
```

### 6-12. `_posts/` 마크다운 파일

각 HTML 아티클에 대응하는 마크다운 파일을 `_posts/` 폴더에 저장합니다. AI 뷰에서 표시됩니다.

```
_posts/{YYYY-MM-DD-slug}.md
```

---

## 7. SNS 배포

### 채널별 변환 규칙

| 채널 | 길이 | 톤 | 구조 | 주의 |
|------|------|-----|------|------|
| **LinkedIn** | 1,300자 이내 | 전문가, 입니다체 유지 | 훅 1문장 + 핵심 인사이트 2~3개 + 블로그 링크 | 해시태그 3~4개 |
| **Threads** | 500자 이내 | 캐주얼, 반말 허용 | 훅 1문장 + 핵심 1개 + 링크 | 해시태그 3~4개 |
| **카카오 채널** | 제목 + 요약 3줄 | 친근, 입니다체 | 3줄 요약 그대로 활용 + 썸네일 | 링크 클릭 유도 |
| **카드뉴스** | 슬라이드 5~7장 | 시각 중심, 짧은 문장 | 1슬라이드 1메시지 | 텍스트 최소화 |

### LinkedIn 변환 템플릿

```
{훅 1문장 - 블로그 [1] 섹션에서 발췌 또는 변형}

{핵심 인사이트 2~3개 - 블로그 [3] 섹션에서 압축}

{실전 팁 1개 - 블로그 [4] 섹션에서 가장 임팩트 있는 1단계}

{블로그 링크}

#AI에이전트 #경영전략 #{카테고리키워드}
```

### 시리즈 연재

시리즈는 3~5편 구성을 기본으로 합니다.

```
1편: 문제 정의 (왜 이 주제가 중요한가)
2편: 구조 분석 (어떤 요소로 이루어져 있는가)
3편: 실전 적용 (내일 당장 어떻게 쓰는가)
4편: 심화/사례 [선택]
5편: 전망/정리 [선택]
```

- 각 편의 첫 문장에서 이전 편을 1문장으로 요약합니다.
- 각 편의 마지막에 다음 편 예고를 1문장으로 넣습니다.

```html
<div class="series-nav">
  <div class="series-title">{시리즈명} ({현재편}/{전체편})</div>
  <a href="./{이전편}" class="series-prev">← 이전 편</a>
  <a href="./{다음편}" class="series-next">다음 편 →</a>
</div>
```

---

## 8. 이미지 생성

콘텐츠 초고 완성 시 아래 이미지를 자동 생성합니다.

| 콘텐츠 유형 | 자동 생성 이미지 |
|-------------|-----------------|
| 트렌드 분석 | thumbnail + og + infographic |
| 활용 가이드 | thumbnail + og + diagram |
| 사례 소개 | thumbnail + og + chart |
| 뉴스 해설 | thumbnail + og + quote |
| 시리즈 | thumbnail(회차 표시) + og |
| SNS 배포 시 | 위 항목 + card_01~07 추가 |

### 디자인 기본값

| 항목 | 기본값 |
|------|--------|
| 프라이머리 컬러 | Deep Navy `#1B2A4A` |
| 세컨더리 컬러 | Electric Blue `#2D7FF9` |
| 액센트 컬러 | Warm Gold `#F5A623` |
| 배경 | Soft Gray `#F4F5F7` 또는 Deep Navy 그래디언트 |
| 카테고리 컬러 | 리서치 `#1A1A1A` · 리더 `#C43500` · 기업 `#1A4A7A` · 기술 `#145C35` · 생존 `#7A1F1F` |
| 한글 폰트 | Pretendard |
| 수치/코드 폰트 | JetBrains Mono |
| 아이콘 | Lucide 스타일, 선형 2px |

### 이미지 생성 프롬프트

```
아래 콘텐츠 정보를 바탕으로 이미지 어셋을 생성해 주세요.

## 콘텐츠 정보
- 제목: {title}
- 카테고리: {category} (research / leader / company / tech / survival)
- 핵심 키워드: {keyword_1}, {keyword_2}, {keyword_3}
- 핵심 수치: {stat_1}, {stat_2}
- 프로세스 단계: {step_1} → {step_2} → {step_3}

## 디자인 규칙
- 브랜드 컬러: Deep Navy (#1B2A4A), Electric Blue (#2D7FF9), Warm Gold (#F5A623)
- 카테고리 배지: 해당 카테고리 컬러 적용
- 폰트: Pretendard (한글), JetBrains Mono (코드/수치)
- 아이콘: Lucide 스타일, 선형 2px
- 저장: {category}/images/{YYYY_MM_DD_slug}/
```

---

## 9. 검수 체크리스트

초고 완성 후 아래 5관점으로 자가 검수합니다. 모든 항목을 통과해야 발행합니다. 미통과 시 해당 항목을 수정하고 재검수합니다. **최대 2회 재검수 후에도 미통과 시 문제 항목을 명시하고 사람의 판단을 요청합니다.**

### 전략 (블랙 관점)

- [ ] 이 글이 왜 지금 필요한지 명확한가?
- [ ] "AI 에이전트를 실무에 적용하는 실전 교육" 포지셔닝과 맞는가?
- [ ] 경쟁 콘텐츠 대비 우리만의 관점이 있는가?
- [ ] AI/클로드 관련 기술 설명이 정확한가?

### 논리·팩트 (레드 관점)

- [ ] 논리적 비약 없이 주장이 전개되는가?
- [ ] 모든 주장에 수치·출처·사례가 동반되는가?
- [ ] 금지 표현 패턴 검출 결과: 0건인가?
- [ ] 수치·기업명·도구명이 정확한가?
- [ ] A/B 등급 소스를 핵심 논거로 사용했는가?

### 실용성 (골드 관점: 35~45세 경영 리더, 비개발자)

- [ ] "내 사업에 어떻게 쓰라는 건데?"에 답하는가?
- [ ] 기술 용어가 설명 없이 사용되지 않았는가?
- [ ] 비개발자가 따라 할 수 있는가?
- [ ] 읽는 시간 대비 충분히 유용한가?

### 스토리·문체 (퍼플 관점)

- [ ] 첫 3문장이 독자를 붙잡는가?
- [ ] 각 문단의 첫 문장이 핵심을 대표하는가? (Topic Sentence)
- [ ] 60자 초과 문장이 없는가?
- [ ] 3줄 요약이 입니다/합니다 체인가?
- [ ] em dash(—) 사용이 없는가?
- [ ] 끝까지 읽히는 구조인가?

### UI·성능 (화이트 관점)

- [ ] 시맨틱 태그, id/class 네이밍, 섹션 구조가 올바른가?
- [ ] 모바일(375px)~데스크톱(1440px)에서 깨지는 요소가 없는가?
- [ ] alt 텍스트, aria-label이 적용되었는가?
- [ ] lazy loading 적용 (히어로 제외)
- [ ] word-break: keep-all 적용

### 의견 충돌 시 우선순위

**팩트 > 논리 > 실용성 > 전략 > 표현**

---

## 10. 콘텐츠 생성 프롬프트

소스를 투입하면 초고를 바로 생산하는 프롬프트입니다. 문체 규칙(섹션 2), 아티클 구조(섹션 3), 출처 규칙(섹션 4)을 준수합니다.

```
당신은 베인 컨설팅 출신 전략가이자 AI 전문 강사입니다.
아래 소스를 읽고, 콘텐츠 초고를 작성해 주세요.

## 소스
{소스 전문 또는 요약을 여기에 붙여넣기}

## 작성 규칙

### 관점
- 독자: 35~45세 경영 리더 (AI에 관심 있으나 비개발자, 클로드를 배우려 함)
- 관점 프레임: "이 정보가 AI로 사업을 성장시키려는 경영 리더에게 어떤 의미인가?"
- 베인 스타일: MECE 구조, 데이터 기반 논증, 80/20 원칙, 실행 가능성 중심

### 아티클 구조
[A] 3줄 요약: 3문장, 입니다/합니다 체
[B] Roasting: 도발적 한 줄 (위트/냉소/도발/자조 중 택1, 인물·기업 비하 금지)
[1] 이 글, 왜 읽어야 하나 (훅): 1~2문장, 출처 없는 수치 금지
[2] 왜 지금 중요한가: 3~5문장, "시장→산업→독자 현실" 순서
[3] 핵심 인사이트: MECE 2~4개 포인트
[3.5] 비즈니스 비용: 정량적 수치 필수 (불가 시 "[해당 없음]" 표기)
[4] 내일 당장 할 수 있는 것: 5단계 이내, 도구명·프롬프트·소요 시간·기대 결과
[5] 리스크 & 주의점: 1~3개, 기술 한계와 현실 제약
[6] 한 줄 정리
[C] 리더의 결정 포인트: 창업자/팀장/임원 역할별 1문장씩
[D] 참고자료: APA 스타일 인용 목록

### 문체
> 이 프롬프트를 단독 사용할 경우, 아래 규칙을 적용합니다. 가이드 전체를 컨텍스트에 로드한 상태라면 섹션 2를 따릅니다.

- **최우선 3원칙**:
  - 자연스러운 한국어: 번역체 금지, 소리 내어 읽었을 때 어색하면 고침, "~에 대해" 남용 금지
  - 주술 근접: 주술 사이 수식어 3개 이상이면 문장 분리
  - 이해하기 쉽게: 한 문장에 하나의 정보, 추상적 표현은 구체적 수치로 교체
- 종결어미: ~입니다/~합니다
- 문장 길이: 40자 이내 목표, 60자 초과 금지
- 능동태 사용, 이중 부정 금지
- Topic Sentence: 문단 첫 문장 = 핵심
- em dash(—) 사용 금지, 쉼표·마침표·괄호로 대체
- 금지 표현: 혁명적인, 획기적인, 모든 기업이~, 놀라운, 충격적인, 패러다임 시프트, 게임 체인저, 폭발적 성장, 누구나 쉽게
- 기술 용어 Lv.2 이상은 괄호 설명

### 자가 검수
초고 완성 후, 아래 항목을 확인하고 위반 시 수정한 뒤 최종본을 출력합니다.

1. 소리 내어 읽었을 때 어색한 문장이 없는가?
2. 번역체 표현이 없는가?
3. 주어와 술어가 가까운가?
4. 한 문장에 하나의 정보만 담고 있는가?
5. 금지 표현 패턴 검출: 0건인가?
6. 3줄 요약이 입니다/합니다 체인가?
7. 60자 초과 문장이 없는가?
8. 출처 없는 수치가 없는가?
9. 문장 간 연결이 자연스러운가?

### 출력 형식
각 섹션을 **[3줄 요약]**, **[Roasting]**, **[이 글, 왜 읽어야 하나]**, **[왜 지금 중요한가]**, **[핵심 인사이트]**, **[비즈니스 비용]**, **[내일 당장 할 수 있는 것]**, **[리스크 & 주의점]**, **[한 줄 정리]**, **[리더의 결정 포인트]**, **[참고자료]** 헤딩으로 구분합니다.
카테고리(research/leader/company/tech/survival)와 파일명을 제안합니다.
형식: {category}/YYYY-MM-DD-{slug}.html
```

---

## 11. 발행 체크리스트

```
[작성 전]
□ 카테고리는? (리서치 / 리더 / 기업 / 기술 / 생존)
□ 핵심 메시지 1문장은?
□ 독자가 읽고 나서 할 행동은?

[퇴고]
□ 최우선 3원칙 통과 (자연스러운 한국어, 주술 근접, 이해하기 쉽게)
□ 금지 표현 패턴 검출 0건
□ 3줄 요약 입니다/합니다 체
□ 60자 초과 문장 없음
□ 출처 없는 수치 없음
□ em dash 없음

[발행 직전]
□ 5관점 검수 완료 (섹션 9 체크리스트)
□ 오탈자·맞춤법·링크 확인
□ 모바일 미리보기 (단어 중간 줄바꿈 없는지)
□ HTML 파일 저장 ({category}/YYYY-MM-DD-slug.html)
□ 이미지 어셋 저장 완료
□ lazy loading 적용 (히어로 제외)
□ 읽기 진행률 바·TOC·프롬프트 복사 동작 확인
□ 모바일 공유 바 본문 가림 없음
□ _posts/ 마크다운 파일 저장
□ 메타 디스크립션 + OG 태그 + JSON-LD 작성
□ word-break: keep-all 적용

[JS 데이터 업데이트]
□ posts-index.json에 새 포스트 추가 (배열 최상단, 최신순)
□ 이전 최신 글의 next_post 필드 업데이트
□ assets/js/posts-data.js 동기화 (node sync-posts.js 또는 직접 수정)
□ 동기화 검증: posts-index.json과 posts-data.js의 포스트 수 일치 확인
□ 홈 페이지에서 새 글 목록 표시 확인

⚠️ posts-index.json이 단일 소스입니다. posts-data.js를 직접 수정한 경우,
반드시 posts-index.json에도 동일 내용을 반영하세요. 불일치 시 검색·필터가 깨집니다.
```

---

*최종 업데이트: 2026년 3월*
