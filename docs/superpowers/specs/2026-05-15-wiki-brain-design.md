# Wiki Brain System Design

**Date**: 2026-05-15
**Status**: Design Approved
**Scope**: Concept extraction, wiki page generation, concept graph visualization

---

## Overview

AI ROASTING 블로그의 186개 포스트(`research/`, `leader/`, `company/`, `tech/`, `survival/`)와 47개 뉴스레터를 **개념(concept) 네트워크**로 재구성합니다. 각 개념은 자체 위키 페이지를 갖고, `wiki/graph.html`이 개념 간 관계를 시각화합니다.

**핵심 원칙**:
1. **자동화 우선**: 사용자는 `node scripts/generate-wiki-brain.js` 한 번만 실행
2. **단일 진실 소스**: `wiki/concepts-data.json`만 보면 전체 상태 파악 가능
3. **기존 자산 재사용**: `insights/graph.html`의 D3.js + 다크 테마 + 카테고리 색상 + 호버 인터랙션을 그대로 차용
4. **블로그와 통합**: 사이트 헤더에 "Wiki" 메뉴, 각 포스트 하단에 "관련 개념" 링크

---

## Architecture

### File Structure

```
wiki/
  ├── index.html                    # Wiki 메인 (전체 개념 카탈로그 + 검색)
  ├── graph.html                    # 개념 네트워크 시각화
  ├── concepts-data.json            # 개념 + 관계 데이터 (단일 진실 소스)
  ├── concepts/
  │   ├── ai-agent.html             # 개념별 위키 페이지
  │   ├── organizational-design.html
  │   └── ...                       # 약 40-60개
  └── assets/
      └── css/wiki.css              # 위키 전용 스타일

scripts/
  └── generate-wiki-brain.js        # 메인 빌드 스크립트

config/
  └── concept-aliases.json          # 개념 정규화 매핑 (수동 편집 가능)
```

### concept-aliases.json (정규화 매핑)

수동으로 편집 가능한 alias 사전. 자동 추출 후 사용자가 점진적으로 정제.

```json
{
  "canonical": {
    "AI 에이전트": ["AI에이전트", "AI agent", "에이전트", "agent", "Agent"],
    "조직설계": ["조직 설계", "organization design", "org design"],
    "Claude": ["claude", "Anthropic Claude", "Claude AI"],
    "프롬프팅": ["프롬프트", "프롬프트 엔지니어링", "prompting", "prompt engineering"]
  },
  "blacklist": ["AI", "데이터", "사용자", "회사", "사람", "분석", "방법"],
  "domainKeywords": ["AI전략", "AI안전", "AGI", "ASI", "MCP", "LLM", "ClaudeCode", "AI에이전트"]
}
```

- `canonical`: 동의어 사전. 키가 canonical name, 값은 alias 배열
- `blacklist`: 너무 일반적이라 개념으로 부적절한 단어 (수동 필터)
- `domainKeywords`: 추출 우선순위 (먼저 매칭 시도)

---

## Data Schema: concepts-data.json

```json
{
  "generatedAt": "2026-05-15T10:30:00Z",
  "version": 1,
  "stats": {
    "totalConcepts": 47,
    "totalRelationships": 312,
    "totalPosts": 186,
    "totalNewsletters": 47
  },
  "concepts": [
    {
      "id": "ai-agent",
      "slug": "ai-agent",
      "name": "AI 에이전트",
      "aliases": ["AI에이전트", "AI agent", "에이전트"],
      "definition": "사용자의 의도를 이해하고 자동으로 작업을 수행하는 AI 시스템입니다. 채팅창에서 묻고 답하는 도구가 아닌, 운영체제처럼 지속적으로 일을 처리합니다.",
      "frequency": 23,
      "category": "tech",
      "extractedFrom": ["tags", "content", "headings"],
      "relatedPosts": [
        {
          "slug": "2026-05-10-garry-tan-meta-meta-prompting-personal-ai",
          "title": "개리 탄: AI를 채팅창 대신 운영체제로 만드는 법",
          "date": "2026-05-10",
          "category": "leader",
          "file": "leader/2026-05-10-garry-tan-meta-meta-prompting-personal-ai.html",
          "relevance": 9
        }
      ],
      "relatedNewsletters": [{"ep": 31, "title": "...", "url": "..."}],
      "relatedConcepts": [
        {"id": "automation", "name": "자동화", "strength": 8},
        {"id": "productivity", "name": "생산성", "strength": 6}
      ],
      "firstSeen": "2025-04-15",
      "lastSeen": "2026-05-10"
    }
  ],
  "relationships": [
    {
      "source": "ai-agent",
      "target": "automation",
      "strength": 8,
      "commonPostCount": 8,
      "commonNewsletterCount": 5
    }
  ]
}
```

**필드 설명**:
- `slug`: URL 안전 영문 식별자 (해시테이블 키)
- `frequency`: 등장 포스트 + 뉴스레터 수 합계
- `category`: 가장 빈번하게 등장한 카테고리 (graph 노드 색상용)
  - **Tie-breaking 규칙** (동률 시 적용 순서):
    1. 카테고리 우선순위 (tech > research > company > leader > survival > newsletter — 도메인 중요도 기준)
    2. 그래도 동률이면 가장 최근 포스트의 카테고리 (`lastSeen` 기준)
- `relevance` (relatedPosts 내): 1-10 점수. 제목·헤딩 매칭 → 9, 본문 매칭 → 5, 태그만 → 3
- `firstSeen` / `lastSeen`: 개념의 시간적 분포 (향후 timeline view용)
- `needs_manual_review`: boolean. 자동 정의 생성 실패 시 true. wiki 페이지에 배지로 표시

---

## Concept Extraction Pipeline

### Step 1: Collection

각 포스트(`_posts/*.md`)에서 다음을 추출:

1. **Front matter `tags`** (가중치 ×3): 가장 신뢰도 높음
2. **`## 핵심 인사이트` 섹션의 헤딩 및 굵은 텍스트** (가중치 ×2): 명시적 주제어
3. **본문 명사구** (가중치 ×1): n-gram (2-4 어절) 추출 후 빈도순

**한국어 처리 방식**:
- **MeCab/Kkma 같은 형태소 분석기를 쓰지 않음**. 외부 의존성 최소화.
- 대신 **사전 기반(domainKeywords) + n-gram + 화이트리스트** 방식 사용:
  - `config/concept-aliases.json`의 `canonical` 키를 우선 매칭
  - 영문 약어 (AGI, MCP, LLM, RAG, YC, AI 등 + 대문자 시작 고유명사)는 정규식으로 추출
  - 2-4 어절 한글 명사구는 단순 공백 분리 후 빈도 카운트
- **품질이 부족하면** Claude API로 보강: 각 포스트마다 "이 글의 핵심 개념 5개를 JSON으로 답하라" 호출 (옵션, `--enrich` 플래그)

### Step 2: Normalization

1. `config/concept-aliases.json`의 `canonical` 매핑 적용
2. 대소문자 통일 (영문 고유명사는 보존)
3. 공백 제거 변형 통합 ("AI 에이전트" == "AI에이전트")
4. `blacklist`에 있는 단어 제거

### Step 3: Filtering

- **최소 3개 포스트 또는 뉴스레터에서 등장**한 개념만 유지
- 예상 결과: 40-60개 개념 (186 + 47 = 233개 콘텐츠 기준)

### Step 4: Relationship Calculation

```
for each concept A:
  for each concept B (A != B):
    common_posts = posts_containing(A) ∩ posts_containing(B)
    strength = common_posts.length  // 1-10 정규화

if strength >= 2:
  create relationship(A, B, strength)
```

- `strength` 1이면 노이즈로 간주, 엣지 생성 안 함
- 최종 엣지 수 예상: 200-400개

### Step 5: Definition Generation (Claude API)

각 개념마다 Claude API 호출:

**Prompt 템플릿**:
```
다음 개념의 정의를 한국어 1-2 문장으로 작성하시오.
종결어미는 ~입니다/~합니다로 통일. em dash(—) 금지. 각 문장 60자 이내.
번역체("~라고 할 수 있겠습니다") 금지. 금지 표현: 혁명적, 획기적, 폭발적, 패러다임.

개념명: {concept.name}
가장 자주 등장한 포스트 3개:
- {post1.title}: {post1.summary}
- {post2.title}: {post2.summary}
- {post3.title}: {post3.summary}

관련 개념: {top3 related concepts names}

JSON으로 답하세요: {"definition": "..."}
```

**처리**:
- 병렬 호출 (Promise.all로 10개씩 배치)
- 비용 예상: 50개 × 1회 = 50 API calls per refresh

**자동 품질 검증 + 재시도 (최대 3회)**:
```javascript
function validateDefinition(text) {
  const checks = {
    length: text.length <= 200,                    // 총 길이
    sentenceLength: !text.split(/[.。]/).some(s => s.length > 60),  // 문장당 60자
    endingForm: /(입니다|합니다)[.。]?\s*$/.test(text.trim()),       // 종결어미
    noEmDash: !text.includes('—'),                                // em dash
    noBannedWords: !/(혁명적|획기적|폭발적|패러다임|게임 체인저)/.test(text),
    noTranslationese: !/(~라고 할 수 있|것으로 보입니다만)/.test(text)
  };
  return Object.values(checks).every(v => v);
}
```

- 검증 실패 시 같은 프롬프트로 재시도, 실패한 규칙을 추가 강조
- 3회 실패 시 fallback 정의 사용 + 콘솔에 경고 (`needs_manual_review: true` 플래그 저장)
- 빌드 종료 후 `needs_manual_review` 목록 출력

### Step 6: Slug 생성 (한국어 → URL) — 결정론적 + 안정성 보장

```
"AI 에이전트" → "ai-agent"
"조직설계" → "organizational-design"
"잭도시" → "jack-dorsey"
"메타인지" → "meta-cognition"
```

**우선순위 (결정론적 순서)**:
1. **기존 `concepts-data.json`에 이미 있던 slug**: 무조건 보존 (영구 안정)
2. **`config/concept-aliases.json`의 `slug` 명시 필드**: 사용
3. **영문 alias 존재 시**: 그것을 kebab-case로 변환 (예: "AI agent" → "ai-agent")
4. **한국어만 있는 경우**: Claude API로 변환 후 **즉시 `concept-aliases.json`에 캐시 저장** (다음 빌드부터는 결정론적)
5. **충돌 시**: `-2`, `-3` 접미사 자동 부여 (이것도 캐시됨)

**Slug 안정성 보장 메커니즘**:
- 모든 slug 결정은 `config/concept-aliases.json`의 `slugMap` 섹션에 영구 저장
  ```json
  {
    "slugMap": {
      "AI 에이전트": "ai-agent",
      "메타인지": "meta-cognition"
    }
  }
  ```
- 빌드 시작 시 이 맵을 먼저 로드. 매칭되는 개념은 API 호출 없이 즉시 slug 결정
- 캐시 히트 100% 보장: 두 번째 빌드부터는 Claude API 호출 0회
- 만약 `slugMap`에서 개념이 제거되면(개념이 사라진 경우), 해당 wiki HTML 파일도 함께 삭제. 단, **삭제 전 사용자 확인 프롬프트** 또는 `--prune` 플래그 명시 필요

### Step 7: HTML Generation

#### 7-1. 개념 페이지 (`wiki/concepts/[slug].html`)

템플릿 구조:
```
[Site Header (공유)]
[Breadcrumb: Wiki > AI 에이전트]
[Hero Card]
  - 개념명 + frequency 배지 + 카테고리 배지
  - 정의 (1-2 문장)
  - aliases 칩
[Section: 이 개념이 나타나는 포스트 (23개)]
  - 카테고리별 그룹화
  - 카드: 제목, 날짜, 카테고리 배지, 관련도 점수
[Section: 관련 개념 (8개)]
  - 강도 순 정렬
  - 카드: 개념명, 정의 일부, 강도 게이지
[Footer: ← Wiki 메인 | 🌐 Graph 보기]
```

#### 7-2. Wiki Index (`wiki/index.html`)

- 알파벳/가나다순 전체 개념 목록 (A-Z, ㄱ-ㅎ 점프 링크)
- 검색 입력 (클라이언트 사이드 fuzzy match)
- "가장 자주 등장" Top 10
- "최근 새로 추가된 개념" Top 5 (`firstSeen` 기준)
- 카테고리 필터

#### 7-3. Graph (`wiki/graph.html`)

**`insights/graph.html`을 베이스로 다음만 변경**:

| 항목 | insights/graph.html | wiki/graph.html |
|------|---------------------|-----------------|
| 노드 | 포스트 + 뉴스레터 (233개) | 개념 (40-60개) |
| 노드 색상 | 카테고리별 (research, leader, company, tech, survival, newsletter) | 동일한 6색 시스템 사용. 각 개념의 `category` 필드 기반 |
| 노드 크기 | 연결도 sqrt scale | `frequency` sqrt scale (rMin=8, rMax=24 — 더 크게) |
| 엣지 | 공유 태그 (weight≥1) | 개념 co-occurrence (strength≥2) |
| 엣지 두께 | weight 기반 | strength 기반 (1-10 → 0.5-3px) |
| 노드 라벨 | 포스트 제목 (8자 잘림) | 개념명 (full, 일관성 위해) |
| Tooltip | 포스트 제목 + 카테고리 + 태그 + "아티클 열기" | 개념명 + 정의 + 등장 포스트 수 + "Wiki 페이지 열기" |
| 클릭 | 포스트 HTML로 이동 | `wiki/concepts/[slug].html`로 이동 |
| 호버 강조 | 상위 6개 강한 연결 | 동일 (상위 6개 강한 연결) |
| 허브 임계값 | 상위 10% degree | 동일 |
| 컨트롤 바 | 카테고리 필터 | 카테고리 필터 + strength threshold slider (min 2-5) |
| 데이터 소스 | `posts-index.json` | `concepts-data.json` |
| 헤더 | 기존 사이트 헤더 | 동일한 사이트 헤더 (Wiki 활성화) |

**CSS는 insights/graph.html의 인라인 스타일을 그대로 복제**합니다 (controls, tooltip, legend, zoom-reset, isolated/hub 클래스 등 전부).

---

## Site Integration

### 사이트 헤더 메뉴 추가 (검증된 구조)

**수정 파일**: `assets/js/header.js`

기존 메뉴 구조 (header.js의 navLink 패턴):
```js
'<nav class="main-nav">' +
  navLink('research', '리서치') +
  navLink('leader', '리더') +
  navLink('company', '기업') +
  navLink('tech', '기술') +
  navLink('survival', '생존') +
  '<a href="' + prefix + 'newsletter/index.html" class="nav-newsletter...">뉴스레터</a>' +
  '<a href="' + prefix + 'insights/graph.html" class="nav-graph...">지식 그래프</a>' +
'</nav>'
```

**추가할 위치**: '지식 그래프' 링크 바로 뒤
```js
'<a href="' + prefix + 'wiki/index.html" class="nav-wiki' + (activeCat === 'wiki' ? ' active' : '') + '">Wiki</a>'
```

모바일 메뉴(`mobile-nav`)에도 동일하게 추가. activeCat 'wiki' 지원.

### 포스트 페이지 → Wiki 링크 (검증된 구조)

**확인된 사실**: 186개 포스트 전체가 `</article>` 태그로 본문을 닫고, 그 직전에 `<div class="next-post">` 블록을 포함하며, `<footer id="site-footer"></footer>`로 끝나는 일관된 구조.

**삽입 위치**: `</article>` 직전, `.next-post` 블록 다음

```html
<!-- WIKI_CONCEPTS_START -->
<section class="related-concepts">
  <h3>이 글의 핵심 개념</h3>
  <div class="concept-links">
    <a href="../wiki/concepts/ai-agent.html" class="concept-chip">AI 에이전트</a>
    <a href="../wiki/concepts/automation.html" class="concept-chip">자동화</a>
  </div>
</section>
<!-- WIKI_CONCEPTS_END -->
```

**삽입 알고리즘** (cheerio 사용):
1. HTML 파싱
2. `<!-- WIKI_CONCEPTS_START -->...<!-- WIKI_CONCEPTS_END -->` 마커가 있으면 그 사이를 교체
3. 마커가 없으면 `.next-post`의 부모 컨테이너 직후 또는 `</article>` 직전에 삽입
4. **`.next-post`가 없는 예외 케이스 처리**: 그래도 `</article>` 직전에 fallback 삽입
5. 변경사항이 있을 때만 파일 write (mtime 보존)

**스타일**: `assets/css/style.css`에 `.related-concepts`, `.concept-chip` 클래스 추가.

**개수 상한**: 포스트당 최대 7개 (frequency 순). 그 이상은 noise.

---

## Implementation Script: scripts/generate-wiki-brain.js

### CLI Options

```bash
node scripts/generate-wiki-brain.js              # 전체 빌드
node scripts/generate-wiki-brain.js --enrich     # Claude API로 개념 보강 (느림, 정확도↑)
node scripts/generate-wiki-brain.js --skip-definitions  # 정의 재생성 건너뜀 (수동 편집 보존)
node scripts/generate-wiki-brain.js --post <slug> # 특정 포스트만 wiki concept 링크 갱신
node scripts/generate-wiki-brain.js --dry-run    # 변경 없이 결과만 표시
```

### Pseudo-code

```javascript
async function main() {
  const aliases = loadAliases('config/concept-aliases.json');
  const posts = loadPosts('_posts/*.md');
  const postsIndex = loadJSON('posts-index.json');
  const newsletters = loadNewsletters('newsletter/content/*.md');

  // Step 1-3: Extract & Normalize & Filter
  const rawConcepts = extractConcepts(posts, newsletters, aliases);
  const filtered = filterByFrequency(rawConcepts, minCount=3);

  // Step 4: Relationships
  const relationships = calculateCooccurrence(filtered, posts, newsletters);

  // Step 5: Definitions
  const definitions = await generateDefinitionsBatch(filtered, claudeAPI);

  // Step 6: Slugs
  const withSlugs = assignSlugs(filtered, existingData?.concepts);

  // Step 7: HTML Generation
  renderConceptPages(withSlugs, 'wiki/concepts/*.html');
  renderWikiIndex(withSlugs, 'wiki/index.html');
  renderConceptGraph(withSlugs, relationships, 'wiki/graph.html');

  // Step 8: Inject concept links into post HTML
  injectConceptLinks(posts, withSlugs);

  // Step 9: Site integration
  updateSiteHeader('Wiki menu');

  writeJSON('wiki/concepts-data.json', { concepts: withSlugs, relationships });

  console.log(`✓ ${withSlugs.length} concepts, ${relationships.length} relationships`);
}
```

### Error Handling

| 상황 | 처리 |
|------|------|
| MD 파일 파싱 실패 | 해당 포스트 skip, 콘솔에 경고. 빌드는 계속 |
| Claude API 호출 실패 | 정의를 fallback 텍스트로 대체. 재실행 시 자동 재시도 |
| concept-aliases.json 누락 | 빈 객체로 초기화. 모든 토큰을 raw 사용 |
| 동일 slug 충돌 | `-2`, `-3` 접미사 자동 부여 |
| 기존 `concepts-data.json` 있음 | 정의·slug는 보존 (수동 편집 가능). 관계·frequency만 재계산 |
| 포스트 HTML에 마커 없음 | `</article>` 직전에 자동 삽입 |
| 빈 결과 (0 concepts) | 에러 종료. 사용자에게 aliases 점검 안내 |
| 정의 검증 3회 실패 | fallback 정의 + `needs_manual_review: true` 플래그 |
| 개념 삭제(소스에서 사라짐) | 기본은 skip + 경고. `--prune` 플래그 시 wiki HTML 삭제 |
| 모바일에서 graph 60fps 미달 | Strength threshold를 자동으로 3+로 상향(simplified mode), 또는 노드/엣지 fade-in 단계화 |

### 수동 편집 보존 메커니즘

사용자가 wiki/concepts/[slug].html을 직접 편집한 경우 보호 방법:

1. **자동 마커 기반**: 각 자동 생성 섹션을 `<!-- AUTO_START -->...<!-- AUTO_END -->`로 감쌈
2. **자동 영역**: 정의, 관련 포스트 목록, 관련 개념 목록 (재생성 대상)
3. **사용자 영역**: `<!-- USER_CONTENT_START -->...<!-- USER_CONTENT_END -->` 사이는 절대 덮어쓰지 않음
4. **`concepts-data.json`의 `manualEdits` 필드**: 사용자가 수정한 정의는 이 필드에 저장. 재빌드 시 자동 정의가 아닌 이것을 사용
5. **`--force-regenerate` 플래그**: 의도적 전체 재생성 (사용자 편집 무시) — 명시적으로 요청 시에만

---

## CLAUDE.md 워크플로우 통합

기존:
```
소스 URL → /create-post → /publish-post → /update-insights → /persona-comment
```

수정 후:
```
소스 URL → /create-post → /publish-post → /update-insights → /persona-comment → /update-wiki
```

**`/update-wiki`** 신규 스킬:
- 내부적으로 `node scripts/generate-wiki-brain.js` 실행
- 새로운 개념이 발견되면 사용자에게 알림 (예: "신규 개념 3개 추가됨: 메타 프롬프팅, 코딩 에이전트, 개인 AI")
- 기존 wiki와 새 포스트의 연결 요약 출력

`/publish-post` 완료 후 자동 실행되도록 체인에 추가.

---

## Graph Visualization 상세 명세

### 색상 시스템 (insights/graph.html과 동일)

```js
const CAT = {
  research:   { stroke: '#60A5FA', fill: 'rgba(96,165,250,0.18)',   text: '#93C5FD', badge: '#2563EB' },
  leader:     { stroke: '#FB923C', fill: 'rgba(251,146,60,0.18)',   text: '#FCA86A', badge: '#EA580C' },
  company:    { stroke: '#38BDF8', fill: 'rgba(56,189,248,0.18)',   text: '#67D4FC', badge: '#0284C7' },
  tech:       { stroke: '#4ADE80', fill: 'rgba(74,222,128,0.18)',   text: '#86EFAC', badge: '#16A34A' },
  survival:   { stroke: '#F87171', fill: 'rgba(248,113,113,0.18)', text: '#FCA5A5', badge: '#DC2626' },
  newsletter: { stroke: '#C084FC', fill: 'rgba(192,132,252,0.18)', text: '#D8B4FE', badge: '#9333EA' },
};
```

개념의 `category`는 해당 개념이 가장 자주 등장한 포스트의 카테고리.

### 인터랙션 (insights/graph.html과 동일)

- **호버**: 노드 + 상위 6개 강한 연결을 강조, 나머지 fade. Tooltip 표시.
- **클릭** (데스크톱): 새 탭에서 `wiki/concepts/[slug].html` 열림.
- **탭** (모바일): Tooltip이 하단 시트로 표시, "Wiki 페이지 열기" 버튼 노출.
- **드래그**: 캔버스 pan, 노드 위치 fix 가능.
- **휠/핀치**: zoom in/out.
- **Zoom reset 버튼**: 우측 상단.

### 컨트롤 바

- 카테고리 필터 pill (research / leader / company / tech / survival / newsletter)
- **신규**: Strength threshold slider (2 ~ 5, default 2). 약한 연결을 숨겨서 핵심 구조 강조.
- 전체 통계: 개념 N개 · 관계 N개

### Legend

좌하단 또는 우하단 (insights/graph.html 위치 그대로):
- 카테고리별 점
- "연결 적음 ●" / "연결 많음 (허브) ⬤" 설명

---

## Performance

- **빌드 시간**: ~30초 (정의 생성 제외) / ~2분 (정의 생성 포함, 50 API calls)
- **Graph 렌더링**: 40-60 nodes, 200-400 edges. D3 force simulation 1-2초 내 안정화.
- **Wiki 페이지 로드**: 정적 HTML이므로 즉시. concepts-data.json은 lazy fetch.

### 모바일 성능 검증 및 대응

**예상 위험**: 저사양 안드로이드(2020년 이전)에서 force simulation 시 30fps 미달 가능성.

**대응 전략 (성능 저하 감지 자동 적용)**:
1. **초기 진단**: 첫 frame 후 `performance.now()` 측정. 300ms 이상이면 simplified mode 활성화
2. **Simplified mode 자동 활성화 조건**: 모바일 + `window.innerWidth < 768`
   - Strength threshold default 2 → 3 상향 (엣지 약 40% 감소)
   - 노드 라벨 폰트 크기 축소
   - Glow 효과(`filter: drop-shadow`) 비활성화
   - Force simulation iteration 300 → 150회
3. **수동 토글**: 컨트롤 바에 "단순 모드" 토글 버튼 (insights/graph.html 패턴과 동일)
4. **Fallback**: 그래도 미달이면 정적 SVG 렌더링 (force 없이 pre-computed 좌표)

### 빌드 결과 KPI (성공 판정 기준)

빌드 종료 시 콘솔에 자동 출력 및 `wiki/build-report.json` 생성:

```json
{
  "buildAt": "2026-05-15T10:30:00Z",
  "duration": 87.3,
  "concepts": {
    "total": 47,
    "validDefinitions": 45,
    "needsReview": 2,
    "averageRelatedPosts": 5.2
  },
  "relationships": {
    "total": 312,
    "strengthDistribution": {"2": 180, "3-5": 100, "6+": 32}
  },
  "coverage": {
    "postsWithConcepts": 184,
    "postsWithoutConcepts": 2,
    "averageConceptsPerPost": 4.8
  },
  "warnings": ["..."],
  "needsManualReview": [{"id": "x", "reason": "..."}]
}
```

**성공 판정 기준**:
- ✅ 빌드 성공: 30개 이상 concepts 추출, 90% 이상 정의 검증 통과
- ⚠️ 경고: 정의 검증 실패 5% 이상, 또는 포스트의 5% 이상이 0 concepts
- ❌ 실패: 30개 미만 concepts, 또는 50% 이상 정의 검증 실패

---

## Success Criteria

✅ 40-60개 개념이 자동 추출되고 wiki 페이지 생성됨  
✅ 각 개념마다 한국어 정의 1-2문장이 자동 생성됨 (CLAUDE.md 문체 규칙 준수)  
✅ `wiki/graph.html`이 `insights/graph.html`과 시각적·인터랙션 일관성 100% 유지  
✅ 모든 포스트 하단에 "이 글의 핵심 개념" 섹션이 자동 삽입됨  
✅ 사이트 헤더에 Wiki 메뉴 추가됨  
✅ 새 포스트 발행 후 `/update-wiki` 한 번에 전체 wiki 자동 갱신  
✅ `concepts-data.json` 단일 파일로 전체 시스템 상태 파악 가능  
✅ 모바일에서도 graph 인터랙션 정상 동작  

---

## Future Extensions (이번 스코프 아님)

- 개념 timeline view (시간순 진화)
- 개념 trending (최근 6개월 frequency 변화)
- 개념별 페르소나 코멘트 (이 개념을 누가 어떻게 보는가)
- 영문 wiki 자동 생성 (글로벌 확장)
- 개념 클러스터링 (semantic similarity 기반 그룹화)

---

## Open Decisions (구현 시 결정)

이 결정들은 implementation plan 단계에서 확정합니다:

1. **`concept-aliases.json` 초기 시드**: 빈 파일로 시작 vs 50개 도메인 키워드 사전 입력
2. **정의 생성 모델**: Claude Haiku 4.5 (빠름·저렴) vs Sonnet 4.6 (품질↑)
3. **Wiki Index 정렬**: 가나다·알파벳 vs frequency 내림차순 (또는 둘 다 토글)
4. **소스 파일 우선순위**: 현재 `_posts/*.md`는 93개, 발행된 HTML은 186개. MD 없는 포스트는 HTML에서 직접 본문 추출 (cheerio). MD 우선, 없으면 HTML fallback.
5. **MD 파싱 라이브러리**: gray-matter (front matter) + 표준 fs/string 처리 권장.
6. **빌드 결과 검증 자동화**: build-report.json만 출력 vs 검증 미달 시 exit code 1로 종료 (CI 게이트 가능)

---

## Notes

- **CLAUDE.md 문체 규칙 준수**: 정의 생성 프롬프트에 ~입니다/~합니다, em dash 금지, 60자 제한 등 명시
- **카테고리는 정보 손실 없음**: 같은 개념이 여러 카테고리에 걸쳐 있어도 `relatedPosts`에 모두 보존되며, 노드 색상만 최빈 카테고리로 표시
- **버전 관리**: `concepts-data.json`의 `version` 필드로 스키마 변경 추적
- **수동 편집 권장 지점**: `config/concept-aliases.json` (alias·blacklist), `concepts-data.json`의 정의 필드 (수동 다듬기 후 `--skip-definitions`로 보존)
