# HTML & 파일 구조 스펙

> 카테고리 정의, 파일/이미지 저장 규칙, HTML 템플릿 구조를 다룹니다.

---

## 1. 카테고리 정의

| 카테고리 | 담는 콘텐츠 | 컬러 | URL |
|----------|-------------|------|-----|
| **리서치** | HBR · BCG · EY · 논문 | `#1A1A1A` | `research/` |
| **리더** | 빅테크 CEO · 석학 대담 | `#C43500` | `leader/` |
| **기업** | 조직 · 경영 · AX 트렌드 | `#1A4A7A` | `company/` |
| **기술** | 에이전트 · 자동화 · 한계 돌파 | `#145C35` | `tech/` |
| **생존** | 구조조정 · 세대 · 직업 변화 | `#7A1F1F` | `survival/` |

## 2. 콘텐츠 파일 저장 규칙

```
{category}/YYYY-MM-DD-slug.html
```

- 날짜: `YYYY-MM-DD` (하이픈 구분)
- 제목: 영문 소문자 + 하이픈(kebab-case), 한글 불가
- 확장자: `.html`

## 3. 이미지 어셋 저장 규칙

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

## 4. HTML 템플릿 구조

모든 아티클은 아래 HTML 템플릿을 따릅니다. 기존 포스트 파일을 기준 참조로 사용합니다.

### 템플릿 변수 매핑

아래 `{변수}`는 새 아티클 작성 시 실제 값으로 치환합니다.

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

### 4-1. `<head>` 구성

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

### 4-2. `<header>` 구성

- **Row 1**: 로고(`AI ROASTING`) + 유틸리티(About 링크, 검색 버튼, Human/AI 뷰 토글, 햄버거 메뉴)
- **Row 2**: 카테고리 내비게이션 (리서치/리더/기업/기술/생존), 현재 카테고리에 `class="active"` 부여
- **모바일 내비**: 검색 입력 + 카테고리 링크

### 4-3. 읽기 진행률 바

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

### 4-4. 목차 (Table of Contents)

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

### 4-5. 썸네일 히어로

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

### 4-6. AI 뷰용 데이터

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

### 4-7. 본문 섹션 패턴

```html
<section class="post-section" id="section-{섹션키}">
  <div class="post-section-label">{섹션 레이블}</div>
  <!-- 본문 내용 -->
</section>
```

> **`<h3>` 사용 금지**: 본문 내부에서 `<h3>` 태그를 사용하지 않습니다. CSS에 `.post-section h3` 스타일이 없어 브라우저 기본값(큰 폰트)이 적용됩니다. 인사이트 등 항목 구분은 `<p><strong>첫째, ...</strong>` 패턴을 사용합니다.

**핵심 인사이트 섹션 패턴:**
```html
<p><strong>첫째, 주제문입니다.</strong> 후속 설명 1. 후속 설명 2.</p>
<p><strong>둘째, 주제문입니다.</strong> 후속 설명 1. 후속 설명 2.</p>
```

**액션 스텝 섹션 패턴:**
```html
<div class="action-steps">
  <div class="action-step">
    <span class="action-num">1</span>
    <div class="action-body"><strong>행동 제목.</strong><br>구체적 설명. (소요 시간)</div>
  </div>
</div>
```

**참고자료 APA 패턴:**
```html
<ul class="references-list">
  <li>저자/매체. (연도, 월). <em>제목</em> [Video]. 플랫폼.
    <a href="{URL}" target="_blank" rel="noopener">{URL 전문}</a></li>
</ul>
```

> 링크 텍스트를 "영상 보기 ↗" 같이 축약하지 않습니다. URL 전문을 그대로 표시합니다.

**리더의 결정 포인트 섹션 패턴:**
```html
<div class="decision-points">
  <div class="decision-point">
    <span class="decision-role">창업자/CEO</span>
    <span>설명 텍스트.</span>
  </div>
  <div class="decision-point">
    <span class="decision-role">팀장</span>
    <span>설명 텍스트.</span>
  </div>
  <div class="decision-point">
    <span class="decision-role">임원</span>
    <span>설명 텍스트.</span>
  </div>
</div>
```

> **가로 배치**: `decision-point`는 `flex-direction: row; align-items: baseline` 레이아웃입니다. 왼쪽에 role 레이블, 오른쪽에 설명 텍스트가 배치됩니다. `<strong>` 대신 반드시 `<span class="decision-role">`을 사용합니다.

**비즈니스 비용 섹션:** 소스에 정량적 비용 수치가 없으면 섹션 자체를 생략합니다. 빈 섹션("[해당 없음]")을 만들지 않습니다.

**Roasting quote 동기화:** Roasting 문구는 4곳에 동일하게 반영해야 합니다: `<blockquote>`, `data-roasting-quote` 속성, `ROASTING_QUOTE` JS 상수, `posts-index.json`.

### 4-8. 프롬프트/코드 복사 버튼

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

### 4-9. 하단 요소

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

### 4-10. 인라인 차트 다크모드 CSS 규칙

포스트 내 `<style>` 블록에서 차트·도표 컴포넌트의 다크/라이트 모드를 처리할 때는 **`@media (prefers-color-scheme: dark)` 금지**. 사이트 테마 토글과 충돌하여 라이트모드 페이지에 다크 배경이 강제 적용됩니다.

```css
/* ✅ 올바른 방법 — data-theme 셀렉터 단독 사용 */
[data-theme="light"] .chart-figure { background: #f4f4f4; border-color: #e0e0e0; }
[data-theme="dark"]  .chart-figure { background: #3a3a3a; border-color: #555; }

/* ❌ 금지 */
@media (prefers-color-scheme: dark) {
  .chart-figure { background: #1e1e1e; }
}
```

다크모드 SVG 텍스트 가시성 기본값:

```css
[data-theme="dark"] .chart-figure svg text              { fill: #ddd; }
[data-theme="dark"] .chart-figure svg text[fill="#555"] { fill: #e0e0e0 !important; }
[data-theme="dark"] .chart-figure svg text[fill="#aaa"] { fill: #bbb   !important; }  /* #888로 내리지 않음 */
[data-theme="dark"] .chart-figure svg line[stroke="#eee"]  { stroke: #5a5a5a !important; }
[data-theme="dark"] .chart-figure svg line[stroke="#f0f0f0"]{ stroke: #555   !important; }
```

### 4-11. 포스트 내 테이블 마크업

포스트 본문에 테이블이 필요한 경우 **반드시 `.post-table` 클래스**를 사용합니다. inline style로 색상을 하드코딩하면 다크 모드에서 테이블이 보이지 않습니다.

```html
<!-- ✅ 올바른 방법 -->
<div class="post-table-wrap">
  <table class="post-table">
    <thead>
      <tr>
        <th>컬럼명</th>
        <th>컬럼명</th>
        <th>컬럼명</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>일반 셀</td>
        <td>일반 셀</td>
        <td class="cell-hl">강조 셀 (굵게 + 카테고리 색상)</td>
      </tr>
    </tbody>
  </table>
  <p class="post-table-source">출처: 저자 (연도), Table N.</p>
</div>

<!-- ❌ 금지 — 다크 모드 깨짐 -->
<div style="overflow-x: auto; margin: 24px 0;">
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <thead>
      <tr style="background: var(--bg-secondary, #f5f5f5);">
        <th style="padding: 12px; border-bottom: 2px solid #145C35;">...</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">...</td>
      </tr>
    </tbody>
  </table>
  <p style="font-size: 13px; color: #666; margin-top: 8px;">출처: ...</p>
</div>
```

- `.post-table-wrap`: overflow-x 스크롤 래퍼
- `.post-table`: 기본 테이블 (border, padding, color 모두 CSS 변수)
- `.cell-hl`: 굵게 + 해당 카테고리 색상 강조
- `.post-table-source`: 출처 표기 (소형, muted) — `.post-section p`보다 specificity가 낮으므로 반드시 `<p class="post-table-source">` 형태로 사용. 인라인 스타일 금지
- th 하단 보더는 포스트의 `data-category` 값에 따라 자동으로 카테고리 색상 적용됨

### 4-12. CSS 기본 규칙

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

/* 제목 호버 효과 — 카테고리 색으로 전환 */
.post-thumbnail-overlay .post-title {
  transition: color 0.25s ease;
  cursor: default;
}
.post[data-category="research"] .post-thumbnail-overlay .post-title:hover { color: var(--cat-research) !important; }
.post[data-category="leader"]   .post-thumbnail-overlay .post-title:hover { color: var(--cat-leader)   !important; }
.post[data-category="company"]  .post-thumbnail-overlay .post-title:hover { color: var(--cat-company)  !important; }
.post[data-category="tech"]     .post-thumbnail-overlay .post-title:hover { color: var(--cat-tech)     !important; }
.post[data-category="survival"] .post-thumbnail-overlay .post-title:hover { color: var(--cat-survival) !important; }
```

### 4-12. 스크립트

```html
<script>
  const PAGE_URL = 'https://airoasting.github.io/blog/{category}/{파일명}';
  const ROASTING_QUOTE = '{로스팅 코멘트}';
</script>
<script src="../assets/js/ai-view.js"></script>
```

### 4-13. `_posts/` 마크다운 파일

각 HTML 아티클에 대응하는 마크다운 파일을 `_posts/` 폴더에 저장합니다. AI 뷰에서 표시됩니다.

```
_posts/{YYYY-MM-DD-slug}.md
```
