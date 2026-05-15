# Wiki Brain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI ROASTING 블로그 186개 포스트 + 47개 뉴스레터에서 개념을 자동 추출해 위키 페이지와 개념 네트워크 그래프(`wiki/graph.html`)를 생성하는 시스템 구축.

**Architecture:** Node.js 빌드 스크립트가 `_posts/*.md` + HTML fallback에서 개념을 추출, 정규화, 관계 계산 후 Claude API로 정의 생성. 출력은 단일 `wiki/concepts-data.json` + 정적 HTML들. 기존 `insights/graph.html`의 D3.js 디자인을 그대로 차용.

**Tech Stack:** Node.js (no framework), gray-matter (frontmatter), cheerio (HTML 파싱·삽입), @anthropic-ai/sdk, D3.js v7 (graph). 빌드된 결과물은 정적 HTML이라 클라이언트 의존성 없음.

---

## File Map

**Create:**
- `package.json` (의존성)
- `config/concept-aliases.json` (정규화 사전, 수동 편집)
- `scripts/wiki-brain/index.js` (메인 엔트리)
- `scripts/wiki-brain/load-sources.js` (MD/HTML 파싱)
- `scripts/wiki-brain/extract.js` (개념 추출)
- `scripts/wiki-brain/normalize.js` (정규화)
- `scripts/wiki-brain/relationships.js` (co-occurrence)
- `scripts/wiki-brain/slugs.js` (slug 결정 + 캐시)
- `scripts/wiki-brain/definitions.js` (Claude API + 검증)
- `scripts/wiki-brain/render-concept.js` (개념 페이지)
- `scripts/wiki-brain/render-index.js` (wiki/index.html)
- `scripts/wiki-brain/render-graph.js` (wiki/graph.html)
- `scripts/wiki-brain/inject-links.js` (포스트 HTML 갱신)
- `scripts/wiki-brain/__tests__/*.test.js` (Node 빌트인 test)
- `assets/css/wiki.css`
- `.claude/commands/update-wiki.md` (스킬)

**Modify:**
- `assets/js/header.js` (Wiki 메뉴)
- `CLAUDE.md` (워크플로우)
- 186개 포스트 HTML (cheerio로 자동 갱신)

**Generated (런타임 산출물, 커밋함):**
- `wiki/index.html`, `wiki/graph.html`
- `wiki/concepts-data.json`, `wiki/build-report.json`
- `wiki/concepts/*.html` (약 40-60개)

---

## Phase 1: Setup

### Task 1: 프로젝트 의존성과 디렉토리 골격

**Files:**
- Create: `package.json`
- Create: `config/concept-aliases.json`
- Create: `scripts/wiki-brain/.gitkeep`

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "ai-roasting-blog",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "wiki": "node scripts/wiki-brain/index.js",
    "wiki:enrich": "node scripts/wiki-brain/index.js --enrich",
    "wiki:dry": "node scripts/wiki-brain/index.js --dry-run",
    "wiki:test": "node --test scripts/wiki-brain/__tests__"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "cheerio": "^1.0.0",
    "gray-matter": "^4.0.3"
  }
}
```

- [ ] **Step 2: 의존성 설치**

Run: `npm install`
Expected: `node_modules/` 생성, 에러 없음

- [ ] **Step 3: concept-aliases.json 시드 작성**

Create `config/concept-aliases.json`:

```json
{
  "_comment": "수동 편집 가능. canonical: 표준명 → alias 배열. slugMap: 한국어 → 영문 slug (결정론적 캐시). blacklist: 개념 제외. domainKeywords: 우선 매칭.",
  "version": 1,
  "canonical": {
    "AI 에이전트": ["AI에이전트", "AI agent", "에이전트", "agent"],
    "조직설계": ["조직 설계", "org design", "organization design"],
    "프롬프팅": ["프롬프트", "prompting", "prompt engineering"],
    "AI 안전": ["AI안전", "AI safety"],
    "AI 정렬": ["AI alignment", "정렬"]
  },
  "slugMap": {
    "AI 에이전트": "ai-agent",
    "조직설계": "organizational-design",
    "프롬프팅": "prompting",
    "AI 안전": "ai-safety",
    "AI 정렬": "ai-alignment"
  },
  "blacklist": ["AI", "데이터", "사용자", "회사", "사람", "분석", "방법", "내용", "결과"],
  "domainKeywords": [
    "AI에이전트", "AI전략", "AI안전", "AI정렬", "AGI", "ASI", "MCP", "LLM", "RAG",
    "ClaudeCode", "Claude", "ChatGPT", "Anthropic", "OpenAI", "Google", "Meta",
    "조직설계", "프롬프팅", "메타프롬프팅", "코딩에이전트", "개인AI", "지식관리"
  ]
}
```

- [ ] **Step 4: scripts 디렉토리 골격**

```bash
mkdir -p scripts/wiki-brain/__tests__
mkdir -p wiki/concepts wiki/assets/css
touch scripts/wiki-brain/.gitkeep
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json config/concept-aliases.json scripts/wiki-brain/.gitkeep
git commit -m "feat: wiki-brain 의존성 및 정규화 사전 시드"
```

---

## Phase 2: Source Loading

### Task 2: 포스트·뉴스레터 로더

**Files:**
- Create: `scripts/wiki-brain/load-sources.js`
- Create: `scripts/wiki-brain/__tests__/load-sources.test.js`

- [ ] **Step 1: 테스트 작성**

Create `scripts/wiki-brain/__tests__/load-sources.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const { loadAllSources } = require('../load-sources');

test('loadAllSources returns posts and newsletters', async () => {
  const { posts, newsletters } = await loadAllSources(process.cwd() + '/../..');
  assert.ok(posts.length >= 180, `expected 180+ posts, got ${posts.length}`);
  assert.ok(newsletters.length >= 40, `expected 40+ newsletters, got ${newsletters.length}`);

  const sample = posts[0];
  assert.ok(sample.slug, 'post must have slug');
  assert.ok(sample.title, 'post must have title');
  assert.ok(Array.isArray(sample.tags), 'tags must be array');
  assert.ok(typeof sample.content === 'string', 'content must be string');
  assert.ok(['md', 'html'].includes(sample.source), 'source must be md or html');
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `node --test scripts/wiki-brain/__tests__/load-sources.test.js`
Expected: FAIL with "Cannot find module '../load-sources'"

- [ ] **Step 3: load-sources.js 구현**

Create `scripts/wiki-brain/load-sources.js`:

```javascript
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const cheerio = require('cheerio');

const CATEGORIES = ['research', 'leader', 'company', 'tech', 'survival'];

function loadPostsFromMd(root) {
  const postsDir = path.join(root, '_posts');
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(postsDir, f), 'utf8');
      const { data, content } = matter(raw);
      const slug = f.replace(/\.md$/, '');
      return {
        slug,
        title: data.title || '',
        date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : (data.date || ''),
        category: data.category || 'research',
        tags: Array.isArray(data.tags) ? data.tags : [],
        source: 'md',
        content,
        file: data.file || '',
        summary: data.roasting_quote || ''
      };
    });
}

function loadPostsFromHtml(root, existingSlugs) {
  const posts = [];
  for (const cat of CATEGORIES) {
    const dir = path.join(root, cat);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.html') || f === 'index.html') continue;
      const slug = f.replace(/\.html$/, '');
      if (existingSlugs.has(slug)) continue;
      const html = fs.readFileSync(path.join(dir, f), 'utf8');
      const $ = cheerio.load(html);
      const title = $('h1').first().text().trim() || $('title').text().trim();
      const article = $('article').text().replace(/\s+/g, ' ').trim();
      posts.push({
        slug,
        title,
        date: slug.slice(0, 10),
        category: cat,
        tags: [],
        source: 'html',
        content: article,
        file: `${cat}/${f}`,
        summary: ''
      });
    }
  }
  return posts;
}

function mergeWithIndex(root, posts) {
  const idxPath = path.join(root, 'posts-index.json');
  if (!fs.existsSync(idxPath)) return posts;
  const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8')).posts || [];
  const bySlug = new Map(idx.map(p => [p.slug, p]));
  return posts.map(p => {
    const meta = bySlug.get(p.slug);
    if (!meta) return p;
    return {
      ...p,
      title: p.title || meta.title,
      tags: p.tags.length ? p.tags : (meta.tags || []),
      file: p.file || meta.file,
      summary: p.summary || meta.summary || meta.roasting_quote || '',
      category: meta.category || p.category
    };
  });
}

function loadNewsletters(root) {
  const dir = path.join(root, 'newsletter', 'content');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /^nl-\d+\.md$/.test(f))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data, content } = matter(raw);
      const ep = parseInt(f.match(/(\d+)/)[1], 10);
      return {
        id: 'nl-' + ep,
        ep,
        title: data.title || '',
        date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : (data.date || ''),
        tags: Array.isArray(data.tags) ? data.tags : [],
        source: 'md',
        content,
        url: `newsletter/index.html#nl-${ep}`
      };
    });
}

async function loadAllSources(root) {
  const mdPosts = loadPostsFromMd(root);
  const mdSlugs = new Set(mdPosts.map(p => p.slug));
  const htmlPosts = loadPostsFromHtml(root, mdSlugs);
  const all = mergeWithIndex(root, [...mdPosts, ...htmlPosts]);
  const newsletters = loadNewsletters(root);
  return { posts: all, newsletters };
}

module.exports = { loadAllSources };
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npm run wiki:test`
Expected: PASS, "posts:186+, newsletters:47+"

- [ ] **Step 5: Commit**

```bash
git add scripts/wiki-brain/load-sources.js scripts/wiki-brain/__tests__/load-sources.test.js
git commit -m "feat: wiki-brain 소스 로더 (MD + HTML fallback)"
```

---

## Phase 3: Concept Extraction & Normalization

### Task 3: 개념 추출기

**Files:**
- Create: `scripts/wiki-brain/extract.js`
- Create: `scripts/wiki-brain/__tests__/extract.test.js`

- [ ] **Step 1: 테스트 작성**

Create `scripts/wiki-brain/__tests__/extract.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const { extractRawTerms } = require('../extract');

const aliases = {
  domainKeywords: ['AI에이전트', 'Claude', 'MCP'],
  blacklist: ['AI']
};

test('extractRawTerms picks up tags, headings, domain keywords', () => {
  const source = {
    title: 'AI 에이전트와 Claude로 자동화하기',
    tags: ['AI에이전트', '자동화'],
    content: `## 핵심 인사이트
- **MCP**가 핵심입니다.
- Claude는 강력합니다.
- 일반 AI는 제외됩니다.`
  };
  const terms = extractRawTerms(source, aliases);
  const names = terms.map(t => t.name);
  assert.ok(names.includes('AI에이전트'), 'tag should be extracted');
  assert.ok(names.includes('Claude'), 'domain keyword should be extracted');
  assert.ok(names.includes('MCP'), 'bold text should be extracted');
  assert.ok(!names.includes('AI'), 'blacklist should be filtered');
});

test('extractRawTerms assigns weights', () => {
  const source = {
    title: 'test',
    tags: ['Claude'],
    content: '## 핵심 인사이트\n- **Claude**'
  };
  const terms = extractRawTerms(source, aliases);
  const claude = terms.find(t => t.name === 'Claude');
  assert.ok(claude.weight >= 3, 'tag+heading should have weight >= 3');
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `node --test scripts/wiki-brain/__tests__/extract.test.js`
Expected: FAIL with module not found

- [ ] **Step 3: extract.js 구현**

Create `scripts/wiki-brain/extract.js`:

```javascript
const TAG_WEIGHT = 3;
const HEADING_WEIGHT = 2;
const BODY_WEIGHT = 1;

function extractFromBoldAndHeadings(content) {
  const terms = [];
  const insightSection = (content.match(/##\s*핵심 인사이트[\s\S]*?(?=##|$)/) || [''])[0];
  const boldMatches = insightSection.matchAll(/\*\*([^*\n]{2,30})\*\*/g);
  for (const m of boldMatches) terms.push(m[1].trim());
  const headingMatches = content.matchAll(/^###?\s+(.{2,40})$/gm);
  for (const m of headingMatches) terms.push(m[1].trim());
  return terms;
}

function extractDomainKeywords(content, keywords) {
  const found = [];
  for (const kw of keywords) {
    const re = new RegExp(`(?<![A-Za-z가-힣])${escapeRegex(kw)}(?![A-Za-z가-힣])`, 'g');
    if (re.test(content)) found.push(kw);
  }
  return found;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractCapitalizedAcronyms(content) {
  const matches = content.match(/\b[A-Z]{2,}(?:[A-Z][a-z]+)*\b/g) || [];
  return [...new Set(matches)].filter(t => t.length >= 2 && t.length <= 12);
}

function addTerm(map, name, weight) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const cur = map.get(trimmed) || { name: trimmed, weight: 0, sources: new Set() };
  cur.weight += weight;
  map.set(trimmed, cur);
}

function extractRawTerms(source, aliases) {
  const blacklist = new Set(aliases.blacklist || []);
  const domainKw = aliases.domainKeywords || [];
  const map = new Map();

  for (const tag of source.tags || []) addTerm(map, tag, TAG_WEIGHT);
  for (const t of extractFromBoldAndHeadings(source.content || '')) addTerm(map, t, HEADING_WEIGHT);
  for (const t of extractDomainKeywords(source.content || '', domainKw)) addTerm(map, t, BODY_WEIGHT);
  for (const t of extractCapitalizedAcronyms(source.content || '')) addTerm(map, t, BODY_WEIGHT);

  return [...map.values()].filter(t => !blacklist.has(t.name));
}

module.exports = { extractRawTerms };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run wiki:test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/wiki-brain/extract.js scripts/wiki-brain/__tests__/extract.test.js
git commit -m "feat: wiki-brain 개념 추출기 (도메인 키워드 + 헤딩 + 굵은 글)"
```

### Task 4: 정규화기

**Files:**
- Create: `scripts/wiki-brain/normalize.js`
- Create: `scripts/wiki-brain/__tests__/normalize.test.js`

- [ ] **Step 1: 테스트 작성**

Create `scripts/wiki-brain/__tests__/normalize.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const { normalize } = require('../normalize');

const aliases = {
  canonical: {
    'AI 에이전트': ['AI에이전트', 'AI agent', '에이전트'],
    'Claude': ['claude', 'Claude AI']
  }
};

test('normalize collapses aliases to canonical form', () => {
  const inputs = [
    { name: 'AI에이전트', weight: 3 },
    { name: '에이전트', weight: 1 },
    { name: 'AI agent', weight: 2 },
    { name: 'Claude', weight: 5 },
    { name: 'claude', weight: 1 }
  ];
  const out = normalize(inputs, aliases);
  const map = new Map(out.map(t => [t.name, t]));
  assert.strictEqual(map.get('AI 에이전트').weight, 6, 'three aliases merged');
  assert.strictEqual(map.get('Claude').weight, 6, 'two aliases merged');
});

test('normalize keeps unknown terms', () => {
  const out = normalize([{ name: '신기술', weight: 2 }], aliases);
  assert.strictEqual(out[0].name, '신기술');
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test scripts/wiki-brain/__tests__/normalize.test.js`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `scripts/wiki-brain/normalize.js`:

```javascript
function buildAliasIndex(canonical) {
  const idx = new Map();
  for (const [canon, aliases] of Object.entries(canonical || {})) {
    idx.set(canon.toLowerCase(), canon);
    for (const a of aliases) idx.set(a.toLowerCase(), canon);
  }
  return idx;
}

function normalize(terms, aliases) {
  const idx = buildAliasIndex(aliases.canonical);
  const merged = new Map();
  for (const t of terms) {
    const key = idx.get(t.name.toLowerCase()) || t.name;
    const cur = merged.get(key) || { name: key, weight: 0 };
    cur.weight += t.weight;
    merged.set(key, cur);
  }
  return [...merged.values()];
}

module.exports = { normalize };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run wiki:test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/wiki-brain/normalize.js scripts/wiki-brain/__tests__/normalize.test.js
git commit -m "feat: wiki-brain 정규화기 (alias 사전 기반 통합)"
```

---

## Phase 4: Relationships & Filtering

### Task 5: 관계 계산기

**Files:**
- Create: `scripts/wiki-brain/relationships.js`
- Create: `scripts/wiki-brain/__tests__/relationships.test.js`

- [ ] **Step 1: 테스트 작성**

Create `scripts/wiki-brain/__tests__/relationships.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const { buildConceptIndex, calculateRelationships } = require('../relationships');

test('buildConceptIndex groups posts per concept and filters by frequency', () => {
  const sources = [
    { slug: 'p1', concepts: [{ name: 'A', weight: 3 }, { name: 'B', weight: 2 }] },
    { slug: 'p2', concepts: [{ name: 'A', weight: 1 }, { name: 'C', weight: 1 }] },
    { slug: 'p3', concepts: [{ name: 'A', weight: 2 }] },
    { slug: 'p4', concepts: [{ name: 'B', weight: 1 }] }
  ];
  const concepts = buildConceptIndex(sources, { minFrequency: 3 });
  const names = concepts.map(c => c.name);
  assert.ok(names.includes('A'), 'A appears 3 times');
  assert.ok(!names.includes('B'), 'B only twice');
  assert.ok(!names.includes('C'), 'C only once');
});

test('calculateRelationships produces strength >= 2 edges', () => {
  const sources = [
    { slug: 'p1', concepts: [{ name: 'A' }, { name: 'B' }] },
    { slug: 'p2', concepts: [{ name: 'A' }, { name: 'B' }] },
    { slug: 'p3', concepts: [{ name: 'A' }, { name: 'C' }] }
  ];
  const concepts = [
    { name: 'A', posts: ['p1', 'p2', 'p3'] },
    { name: 'B', posts: ['p1', 'p2'] },
    { name: 'C', posts: ['p3'] }
  ];
  const edges = calculateRelationships(concepts, { minStrength: 2 });
  assert.strictEqual(edges.length, 1, 'only A-B has strength 2');
  assert.strictEqual(edges[0].strength, 2);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test scripts/wiki-brain/__tests__/relationships.test.js`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `scripts/wiki-brain/relationships.js`:

```javascript
const CATEGORY_PRIORITY = ['tech', 'research', 'company', 'leader', 'survival', 'newsletter'];

function buildConceptIndex(sources, { minFrequency = 3 } = {}) {
  const map = new Map();
  for (const src of sources) {
    for (const c of src.concepts || []) {
      const cur = map.get(c.name) || {
        name: c.name,
        posts: [],
        newsletters: [],
        weight: 0,
        categoryCounts: {},
        firstSeen: null,
        lastSeen: null
      };
      if (src.type === 'newsletter') {
        cur.newsletters.push(src.slug);
      } else {
        cur.posts.push(src.slug);
      }
      cur.weight += c.weight || 1;
      const cat = src.category || 'newsletter';
      cur.categoryCounts[cat] = (cur.categoryCounts[cat] || 0) + 1;
      if (!cur.firstSeen || src.date < cur.firstSeen) cur.firstSeen = src.date;
      if (!cur.lastSeen || src.date > cur.lastSeen) cur.lastSeen = src.date;
      map.set(c.name, cur);
    }
  }
  const out = [];
  for (const c of map.values()) {
    const freq = c.posts.length + c.newsletters.length;
    if (freq < minFrequency) continue;
    c.frequency = freq;
    c.category = pickCategory(c.categoryCounts, c.lastSeenCategory);
    out.push(c);
  }
  return out.sort((a, b) => b.frequency - a.frequency);
}

function pickCategory(counts, fallback) {
  const max = Math.max(...Object.values(counts));
  const winners = Object.keys(counts).filter(k => counts[k] === max);
  if (winners.length === 1) return winners[0];
  for (const cat of CATEGORY_PRIORITY) if (winners.includes(cat)) return cat;
  return winners[0];
}

function calculateRelationships(concepts, { minStrength = 2 } = {}) {
  const edges = [];
  for (let i = 0; i < concepts.length; i++) {
    const a = concepts[i];
    const aIds = new Set([...(a.posts || []), ...(a.newsletters || [])]);
    for (let j = i + 1; j < concepts.length; j++) {
      const b = concepts[j];
      let strength = 0;
      const bIds = [...(b.posts || []), ...(b.newsletters || [])];
      for (const id of bIds) if (aIds.has(id)) strength++;
      if (strength >= minStrength) {
        edges.push({ source: a.name, target: b.name, strength });
      }
    }
  }
  return edges;
}

module.exports = { buildConceptIndex, calculateRelationships };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run wiki:test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/wiki-brain/relationships.js scripts/wiki-brain/__tests__/relationships.test.js
git commit -m "feat: wiki-brain 빈도 필터 + co-occurrence 관계 계산"
```

---

## Phase 5: Slugs & Definitions

### Task 6: Slug 결정론적 생성기

**Files:**
- Create: `scripts/wiki-brain/slugs.js`
- Create: `scripts/wiki-brain/__tests__/slugs.test.js`

- [ ] **Step 1: 테스트 작성**

Create `scripts/wiki-brain/__tests__/slugs.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const { assignSlugs } = require('../slugs');

test('assignSlugs uses cached slug from slugMap', () => {
  const aliases = { slugMap: { 'AI 에이전트': 'ai-agent' } };
  const result = assignSlugs([{ name: 'AI 에이전트' }], aliases, { existing: {} });
  assert.strictEqual(result.concepts[0].slug, 'ai-agent');
});

test('assignSlugs preserves slug from previous build', () => {
  const aliases = { slugMap: {} };
  const existing = { 'NewConcept': 'new-concept-x' };
  const r = assignSlugs([{ name: 'NewConcept' }], aliases, { existing });
  assert.strictEqual(r.concepts[0].slug, 'new-concept-x');
});

test('assignSlugs kebab-cases ASCII names', () => {
  const r = assignSlugs(
    [{ name: 'Claude Code' }, { name: 'AI Safety' }],
    { slugMap: {} },
    { existing: {} }
  );
  assert.strictEqual(r.concepts[0].slug, 'claude-code');
  assert.strictEqual(r.concepts[1].slug, 'ai-safety');
});

test('assignSlugs handles slug collision with suffix', () => {
  const r = assignSlugs(
    [{ name: 'Foo Bar' }, { name: 'foo-bar' }],
    { slugMap: {} },
    { existing: {} }
  );
  assert.notStrictEqual(r.concepts[0].slug, r.concepts[1].slug);
});

test('assignSlugs collects pending Korean concepts for API translation', () => {
  const r = assignSlugs(
    [{ name: '메타인지' }],
    { slugMap: {} },
    { existing: {} }
  );
  assert.ok(r.pending.includes('메타인지'), 'Korean concept needs translation');
});
```

- [ ] **Step 2: 실패 확인**

Run: `node --test scripts/wiki-brain/__tests__/slugs.test.js`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `scripts/wiki-brain/slugs.js`:

```javascript
function kebab(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isAscii(s) { return /^[\x00-\x7F\s]+$/.test(s); }

function ensureUnique(slug, used) {
  if (!used.has(slug)) { used.add(slug); return slug; }
  let i = 2;
  while (used.has(`${slug}-${i}`)) i++;
  const out = `${slug}-${i}`;
  used.add(out);
  return out;
}

function assignSlugs(concepts, aliases, { existing = {} } = {}) {
  const used = new Set();
  const pending = [];
  const result = [];
  for (const c of concepts) {
    let slug = existing[c.name] || aliases.slugMap?.[c.name];
    if (!slug && isAscii(c.name)) slug = kebab(c.name);
    if (!slug) {
      pending.push(c.name);
      slug = `_pending_${pending.length}`;
    }
    slug = ensureUnique(slug, used);
    result.push({ ...c, slug });
  }
  return { concepts: result, pending };
}

function applyTranslatedSlugs(concepts, translations, aliases) {
  const used = new Set(concepts.filter(c => !c.slug.startsWith('_pending_')).map(c => c.slug));
  for (const c of concepts) {
    if (!c.slug.startsWith('_pending_')) continue;
    const translated = translations[c.name];
    if (!translated) { c.slug = ensureUnique(kebab(c.name) || 'concept', used); continue; }
    c.slug = ensureUnique(kebab(translated), used);
    aliases.slugMap[c.name] = c.slug;
  }
  return concepts;
}

module.exports = { assignSlugs, applyTranslatedSlugs, kebab };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run wiki:test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/wiki-brain/slugs.js scripts/wiki-brain/__tests__/slugs.test.js
git commit -m "feat: wiki-brain 결정론적 slug 생성기 + 충돌 방지"
```

### Task 7: 정의 생성 + 품질 검증

**Files:**
- Create: `scripts/wiki-brain/definitions.js`
- Create: `scripts/wiki-brain/__tests__/definitions.test.js`

- [ ] **Step 1: 테스트 작성** (Claude API mock)

Create `scripts/wiki-brain/__tests__/definitions.test.js`:

```javascript
const test = require('node:test');
const assert = require('node:assert');
const { validateDefinition, buildPrompt, fallbackDefinition } = require('../definitions');

test('validateDefinition accepts valid Korean definition', () => {
  const r = validateDefinition('AI를 자동화 도구로 활용하는 시스템입니다.');
  assert.strictEqual(r.valid, true);
});

test('validateDefinition rejects em dash', () => {
  const r = validateDefinition('AI는 — 매우 강력합니다.');
  assert.strictEqual(r.valid, false);
  assert.ok(r.failed.includes('noEmDash'));
});

test('validateDefinition rejects banned words', () => {
  const r = validateDefinition('혁명적인 AI 기술입니다.');
  assert.strictEqual(r.valid, false);
  assert.ok(r.failed.includes('noBannedWords'));
});

test('validateDefinition rejects long sentences', () => {
  const longSentence = '이것은 매우매우매우매우매우매우매우매우매우매우매우매우매우 긴 문장으로서 60자를 훨씬 초과하는 정의입니다.';
  const r = validateDefinition(longSentence);
  assert.strictEqual(r.valid, false);
});

test('validateDefinition rejects wrong ending', () => {
  const r = validateDefinition('AI 도구다.');
  assert.strictEqual(r.valid, false);
  assert.ok(r.failed.includes('endingForm'));
});

test('buildPrompt includes concept name and post info', () => {
  const p = buildPrompt({ name: 'AI 에이전트' }, [
    { title: 'T1', summary: 'S1' },
    { title: 'T2', summary: 'S2' }
  ], ['자동화']);
  assert.ok(p.includes('AI 에이전트'));
  assert.ok(p.includes('T1'));
  assert.ok(p.includes('자동화'));
});

test('fallbackDefinition uses concept name', () => {
  const d = fallbackDefinition({ name: 'AI 에이전트' });
  assert.ok(d.includes('AI 에이전트'));
  assert.ok(/입니다\.?\s*$/.test(d.trim()));
});
```

- [ ] **Step 2: 실패 확인**

Run: `node --test scripts/wiki-brain/__tests__/definitions.test.js`
Expected: FAIL

- [ ] **Step 3: 구현**

Create `scripts/wiki-brain/definitions.js`:

```javascript
const BANNED = /(혁명적|획기적|폭발적|패러다임 시프트|게임 체인저|누구나 쉽게)/;
const TRANSLATIONESE = /(~?라고 할 수 있겠습니다|것으로 보입니다만)/;

function validateDefinition(text) {
  const failed = [];
  const trimmed = (text || '').trim();
  if (trimmed.length === 0 || trimmed.length > 220) failed.push('length');
  const sentences = trimmed.split(/(?<=[.。!?])\s+/).filter(Boolean);
  if (sentences.some(s => s.length > 70)) failed.push('sentenceLength');
  if (!/(입니다|합니다)[.。!?]?\s*$/.test(trimmed)) failed.push('endingForm');
  if (trimmed.includes('—')) failed.push('noEmDash');
  if (BANNED.test(trimmed)) failed.push('noBannedWords');
  if (TRANSLATIONESE.test(trimmed)) failed.push('noTranslationese');
  return { valid: failed.length === 0, failed };
}

function buildPrompt(concept, topPosts, relatedNames) {
  const postLines = topPosts.slice(0, 3)
    .map(p => `- ${p.title}: ${p.summary || ''}`).join('\n');
  const rel = (relatedNames || []).slice(0, 3).join(', ') || '없음';
  return [
    `다음 개념의 정의를 한국어 1-2문장으로 작성하세요.`,
    `규칙: 종결어미는 ~입니다/~합니다. em dash(—) 금지. 각 문장 60자 이내.`,
    `금지: 혁명적, 획기적, 폭발적, 패러다임 시프트, 게임 체인저, "~라고 할 수 있겠습니다".`,
    ``,
    `개념명: ${concept.name}`,
    `자주 등장한 포스트:`,
    postLines || '- (요약 없음)',
    `관련 개념: ${rel}`,
    ``,
    `JSON으로만 답하세요: {"definition": "..."}`
  ].join('\n');
}

function fallbackDefinition(concept) {
  return `${concept.name}는 AI ROASTING 블로그에서 자주 다루는 핵심 개념입니다.`;
}

async function generateOne(client, concept, topPosts, relatedNames, { model, maxRetries = 3 }) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const prompt = attempt === 1
      ? buildPrompt(concept, topPosts, relatedNames)
      : buildPrompt(concept, topPosts, relatedNames) + `\n\n이전 시도가 규칙을 위반했습니다. 규칙을 엄격히 지키세요.`;
    try {
      const resp = await client.messages.create({
        model,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      });
      const text = resp.content[0].text;
      const m = text.match(/\{[\s\S]*?"definition"\s*:\s*"([^"]+)"[\s\S]*?\}/);
      const def = m ? m[1].trim() : text.trim();
      const v = validateDefinition(def);
      if (v.valid) return { definition: def, attempts: attempt };
    } catch (e) {
      if (attempt === maxRetries) return { definition: fallbackDefinition(concept), attempts: attempt, error: e.message, needsReview: true };
    }
  }
  return { definition: fallbackDefinition(concept), attempts: maxRetries, needsReview: true };
}

async function generateAll(concepts, postsBySlug, relationships, client, { model = 'claude-haiku-4-5-20251001', concurrency = 10, skip = new Set() } = {}) {
  const relMap = new Map();
  for (const e of relationships) {
    if (!relMap.has(e.source)) relMap.set(e.source, []);
    if (!relMap.has(e.target)) relMap.set(e.target, []);
    relMap.get(e.source).push({ name: e.target, strength: e.strength });
    relMap.get(e.target).push({ name: e.source, strength: e.strength });
  }

  const out = new Map();
  let idx = 0;
  async function worker() {
    while (idx < concepts.length) {
      const i = idx++;
      const c = concepts[i];
      if (skip.has(c.name)) { out.set(c.name, { definition: c.definition || fallbackDefinition(c) }); continue; }
      const topPosts = (c.posts || []).slice(0, 3).map(slug => postsBySlug.get(slug)).filter(Boolean);
      const related = (relMap.get(c.name) || []).sort((a, b) => b.strength - a.strength).map(r => r.name);
      const r = await generateOne(client, c, topPosts, related, { model });
      out.set(c.name, r);
    }
  }
  await Promise.all(Array(Math.min(concurrency, concepts.length)).fill(0).map(worker));
  return out;
}

module.exports = { validateDefinition, buildPrompt, fallbackDefinition, generateOne, generateAll };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run wiki:test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/wiki-brain/definitions.js scripts/wiki-brain/__tests__/definitions.test.js
git commit -m "feat: wiki-brain 정의 생성 + 6규칙 자동 검증 + 재시도"
```

---

## Phase 6: Output Generation

### Task 8: 개념 페이지 + 인덱스 렌더러

**Files:**
- Create: `scripts/wiki-brain/render-concept.js`
- Create: `scripts/wiki-brain/render-index.js`
- Create: `assets/css/wiki.css`

- [ ] **Step 1: wiki.css 작성**

Create `assets/css/wiki.css`:

```css
.wiki-page { max-width: 880px; margin: 40px auto; padding: 0 24px; font-family: 'Pretendard', sans-serif; }
.wiki-breadcrumb { font-size: 13px; color: #888; margin-bottom: 24px; }
.wiki-breadcrumb a { color: #444; text-decoration: none; }
.wiki-hero { padding: 32px 28px; border-radius: 16px; background: #fafaf7; border: 1px solid #e8e6e0; margin-bottom: 36px; }
.wiki-hero h1 { font-size: 32px; margin: 0 0 16px; font-weight: 800; }
.wiki-hero .badges { display: flex; gap: 8px; margin-bottom: 16px; }
.wiki-hero .badge { font-size: 11px; padding: 3px 10px; border-radius: 100px; background: #fff; border: 1px solid #ddd; color: #555; }
.wiki-hero .badge.review { background: #FFF3CD; border-color: #FFC107; color: #856404; }
.wiki-hero .definition { font-size: 17px; line-height: 1.7; color: #222; }
.wiki-aliases { margin-top: 16px; display: flex; gap: 6px; flex-wrap: wrap; }
.wiki-aliases .alias { font-size: 12px; padding: 2px 8px; background: #f2f0eb; border-radius: 6px; color: #666; }
.wiki-section { margin-bottom: 40px; }
.wiki-section h2 { font-size: 20px; margin-bottom: 16px; color: #1a1a1a; }
.wiki-posts { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.wiki-post-card { padding: 14px 16px; border-radius: 10px; background: #fff; border: 1px solid #ececec; text-decoration: none; color: inherit; transition: border-color 0.15s; }
.wiki-post-card:hover { border-color: #999; }
.wiki-post-card .meta { font-size: 11px; color: #888; margin-bottom: 6px; }
.wiki-post-card .title { font-size: 14px; line-height: 1.45; font-weight: 600; color: #222; }
.wiki-related { display: flex; flex-wrap: wrap; gap: 10px; }
.wiki-related .item { padding: 10px 14px; border-radius: 10px; background: #fff; border: 1px solid #ececec; text-decoration: none; color: inherit; display: flex; align-items: center; gap: 8px; }
.wiki-related .strength { font-size: 10px; padding: 2px 6px; background: #1a1a1a; color: #fff; border-radius: 4px; }
.wiki-footer-nav { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e8e6e0; display: flex; justify-content: space-between; font-size: 13px; }
.wiki-footer-nav a { color: #1a1a1a; text-decoration: none; font-weight: 600; }

.wiki-index { max-width: 1100px; margin: 40px auto; padding: 0 24px; }
.wiki-index h1 { font-size: 32px; margin-bottom: 24px; }
.wiki-index-search { width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; margin-bottom: 24px; }
.wiki-concept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.wiki-concept-tile { padding: 14px 16px; border-radius: 10px; background: #fff; border: 1px solid #ececec; text-decoration: none; color: inherit; }
.wiki-concept-tile .name { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
.wiki-concept-tile .freq { font-size: 11px; color: #888; }

.related-concepts { margin: 40px 0; padding: 24px; border-top: 1px solid #e8e6e0; }
.related-concepts h3 { font-size: 14px; color: #666; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.related-concepts .concept-links { display: flex; flex-wrap: wrap; gap: 8px; }
.related-concepts .concept-chip { font-size: 13px; padding: 6px 12px; border-radius: 100px; background: #f2f0eb; color: #444; text-decoration: none; transition: background 0.15s; }
.related-concepts .concept-chip:hover { background: #e8e6e0; }
```

- [ ] **Step 2: render-concept.js 구현**

Create `scripts/wiki-brain/render-concept.js`:

```javascript
const fs = require('fs');
const path = require('path');

const CAT_LABEL = { research: '리서치', leader: '리더', company: '기업', tech: '기술', survival: '생존', newsletter: '뉴스레터' };

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderPosts(postsMeta) {
  if (!postsMeta.length) return '<p style="color:#888;">관련 포스트 없음</p>';
  return `<div class="wiki-posts">${postsMeta.map(p => `
    <a class="wiki-post-card" href="../../${esc(p.file)}">
      <div class="meta">${esc(p.date)} · ${esc(CAT_LABEL[p.category] || p.category)}</div>
      <div class="title">${esc(p.title)}</div>
    </a>`).join('')}</div>`;
}

function renderRelated(related) {
  if (!related.length) return '<p style="color:#888;">관련 개념 없음</p>';
  return `<div class="wiki-related">${related.map(r => `
    <a class="item" href="${esc(r.slug)}.html">
      <span>${esc(r.name)}</span>
      <span class="strength">강도 ${esc(r.strength)}</span>
    </a>`).join('')}</div>`;
}

function renderConcept(concept, ctx) {
  const { postsBySlug, relationships, allConcepts } = ctx;
  const postsMeta = (concept.posts || []).map(s => postsBySlug.get(s)).filter(Boolean);
  const conceptBySlug = new Map(allConcepts.map(c => [c.name, c]));
  const related = relationships
    .filter(e => e.source === concept.name || e.target === concept.name)
    .map(e => {
      const otherName = e.source === concept.name ? e.target : e.source;
      const other = conceptBySlug.get(otherName);
      return other ? { name: otherName, slug: other.slug, strength: e.strength } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 12);

  const reviewBadge = concept.needsReview ? '<span class="badge review">검수 필요</span>' : '';
  const aliasesHtml = (concept.aliases || []).length
    ? `<div class="wiki-aliases">${concept.aliases.map(a => `<span class="alias">${esc(a)}</span>`).join('')}</div>` : '';

  return `<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(concept.name)} · AI ROASTING · Wiki</title>
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="../../assets/css/wiki.css">
</head>
<body>
<header id="site-header"></header>
<main class="wiki-page">
  <nav class="wiki-breadcrumb"><a href="../index.html">Wiki</a> · ${esc(concept.name)}</nav>
  <section class="wiki-hero">
    <div class="badges">
      <span class="badge">${esc(CAT_LABEL[concept.category] || concept.category)}</span>
      <span class="badge">${esc(concept.frequency)}개 콘텐츠</span>
      ${reviewBadge}
    </div>
    <h1>${esc(concept.name)}</h1>
    <p class="definition">${esc(concept.definition)}</p>
    ${aliasesHtml}
  </section>
  <section class="wiki-section">
    <h2>이 개념이 나타나는 포스트 (${postsMeta.length})</h2>
    ${renderPosts(postsMeta)}
  </section>
  <section class="wiki-section">
    <h2>관련 개념 (${related.length})</h2>
    ${renderRelated(related)}
  </section>
  <div class="wiki-footer-nav">
    <a href="../index.html">← Wiki 메인</a>
    <a href="../graph.html">🌐 개념 그래프 보기</a>
  </div>
</main>
<footer id="site-footer"></footer>
<script src="../../assets/js/header.js"></script>
<script src="../../assets/js/footer.js"></script>
</body>
</html>`;
}

function writeConceptPages(concepts, ctx, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const c of concepts) {
    const html = renderConcept(c, { ...ctx, allConcepts: concepts });
    fs.writeFileSync(path.join(outDir, `${c.slug}.html`), html);
  }
}

module.exports = { renderConcept, writeConceptPages };
```

- [ ] **Step 3: render-index.js 구현**

Create `scripts/wiki-brain/render-index.js`:

```javascript
const fs = require('fs');

function esc(s) { return String(s || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

function renderIndex(concepts, outPath) {
  const sorted = [...concepts].sort((a, b) => b.frequency - a.frequency);
  const top10 = sorted.slice(0, 10);
  const byName = [...concepts].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const tile = c => `<a class="wiki-concept-tile" href="concepts/${esc(c.slug)}.html"><div class="name">${esc(c.name)}</div><div class="freq">${esc(c.frequency)}개 콘텐츠 · ${esc(c.category)}</div></a>`;

  const html = `<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wiki · AI ROASTING · Blog</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="../assets/css/wiki.css">
</head>
<body>
<header id="site-header"></header>
<main class="wiki-index">
  <h1>Wiki Brain</h1>
  <p style="color:#666;margin-bottom:24px;">${concepts.length}개 개념이 ${sumContent(concepts)}개 콘텐츠에서 연결됩니다. <a href="graph.html" style="color:#1a1a1a;font-weight:700;">🌐 그래프 보기 →</a></p>
  <input class="wiki-index-search" id="wikiSearch" type="text" placeholder="개념 검색 (예: AI 에이전트, 조직설계)">

  <section class="wiki-section">
    <h2>가장 자주 등장한 개념 Top 10</h2>
    <div class="wiki-concept-grid">${top10.map(tile).join('')}</div>
  </section>

  <section class="wiki-section">
    <h2>전체 개념 (가나다순)</h2>
    <div class="wiki-concept-grid" id="conceptGrid">${byName.map(tile).join('')}</div>
  </section>
</main>
<footer id="site-footer"></footer>
<script src="../assets/js/header.js"></script>
<script src="../assets/js/footer.js"></script>
<script>
  (function(){
    const input = document.getElementById('wikiSearch');
    const grid = document.getElementById('conceptGrid');
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      [...grid.children].forEach(el => {
        const name = el.querySelector('.name').textContent.toLowerCase();
        el.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
    });
  })();
</script>
</body>
</html>`;
  fs.writeFileSync(outPath, html);
}

function sumContent(concepts) {
  const all = new Set();
  for (const c of concepts) {
    for (const p of c.posts || []) all.add(p);
    for (const n of c.newsletters || []) all.add(n);
  }
  return all.size;
}

module.exports = { renderIndex };
```

- [ ] **Step 4: Commit**

```bash
git add scripts/wiki-brain/render-concept.js scripts/wiki-brain/render-index.js assets/css/wiki.css
git commit -m "feat: wiki-brain 개념 페이지 + 인덱스 렌더러"
```

### Task 9: 그래프 렌더러 (insights/graph.html 기반)

**Files:**
- Create: `scripts/wiki-brain/render-graph.js`

- [ ] **Step 1: render-graph.js 구현 — insights/graph.html을 베이스로 데이터 소스만 교체**

Create `scripts/wiki-brain/render-graph.js`:

```javascript
const fs = require('fs');
const path = require('path');

function renderGraph(rootDir, outPath) {
  const baseHtml = fs.readFileSync(path.join(rootDir, 'insights/graph.html'), 'utf8');

  let html = baseHtml;

  html = html.replace(
    "<link rel=\"stylesheet\" href=\"../assets/css/style.css\">",
    "<link rel=\"stylesheet\" href=\"../assets/css/style.css\">\n  <link rel=\"stylesheet\" href=\"../assets/css/wiki.css\">"
  );

  html = html.replace(/<title>[^<]*<\/title>/, '<title>Concept Graph · AI ROASTING · Wiki</title>');

  const dataPatch = `
  /* WIKI BRAIN OVERRIDE */
  fetch('concepts-data.json')
    .then(r => r.json())
    .then(data => buildWikiGraph(data))
    .catch(err => {
      const el = document.getElementById('graphLoading');
      if (el) el.innerHTML = '<div style="color:#F87171;font-size:14px;">데이터 로드 실패: ' + err.message + '</div>';
    });

  function buildWikiGraph(data) {
    const CAT = {
      research:   { stroke: '#60A5FA', fill: 'rgba(96,165,250,0.18)',   text: '#93C5FD', badge: '#2563EB' },
      leader:     { stroke: '#FB923C', fill: 'rgba(251,146,60,0.18)',   text: '#FCA86A', badge: '#EA580C' },
      company:    { stroke: '#38BDF8', fill: 'rgba(56,189,248,0.18)',   text: '#67D4FC', badge: '#0284C7' },
      tech:       { stroke: '#4ADE80', fill: 'rgba(74,222,128,0.18)',   text: '#86EFAC', badge: '#16A34A' },
      survival:   { stroke: '#F87171', fill: 'rgba(248,113,113,0.18)', text: '#FCA5A5', badge: '#DC2626' },
      newsletter: { stroke: '#C084FC', fill: 'rgba(192,132,252,0.18)', text: '#D8B4FE', badge: '#9333EA' }
    };
    const CAT_LABEL = { research: '리서치', leader: '리더', company: '기업', tech: '기술', survival: '생존', newsletter: '뉴스레터' };
    const isMobile = ('ontouchstart' in window) || (window.innerWidth <= 768);

    const nodes = data.concepts.map(c => ({
      id: c.slug,
      name: c.name,
      category: c.category || 'research',
      frequency: c.frequency,
      definition: c.definition,
      url: 'concepts/' + c.slug + '.html'
    }));
    const links = data.relationships.map(r => ({
      source: data.concepts.find(c => c.name === r.source).slug,
      target: data.concepts.find(c => c.name === r.target).slug,
      weight: r.strength
    }));

    const wrap = document.querySelector('.graph-canvas-wrap');
    wrap.innerHTML = '<svg id="graphSvg"></svg>';
    const svg = d3.select('#graphSvg');
    const W = wrap.clientWidth, H = wrap.clientHeight;

    const rMin = isMobile ? 9 : 7;
    const rMax = isMobile ? 24 : 20;
    const maxFreq = d3.max(nodes, n => n.frequency) || 1;
    const rScale = d3.scaleSqrt().domain([0, maxFreq]).range([rMin, rMax]);
    nodes.forEach(n => { n.r = rScale(n.frequency); });

    const degreeMap = {};
    links.forEach(l => { degreeMap[l.source] = (degreeMap[l.source] || 0) + 1; degreeMap[l.target] = (degreeMap[l.target] || 0) + 1; });
    nodes.forEach(n => { n.degree = degreeMap[n.id] || 0; });
    const hubThreshold = d3.quantile(nodes.map(n => n.degree).sort(d3.ascending), 0.9) || 0;

    const stats = document.getElementById('graphStats');
    if (stats) stats.innerHTML = '<strong>' + nodes.length + '</strong>개 개념 · <strong>' + links.length + '</strong>개 관계';

    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.2, 4]).on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);

    const link = g.append('g').selectAll('line').data(links).enter().append('line')
      .attr('class', 'g-link')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', d => Math.max(0.5, Math.min(3, d.weight * 0.5)));

    const node = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .attr('class', d => 'g-node' + (d.degree >= hubThreshold && hubThreshold > 0 ? ' hub' : '') + (d.degree <= 1 ? ' isolated' : ''))
      .style('cursor', 'pointer')
      .on('click', (e, d) => { window.location.href = d.url; })
      .on('mouseover', (e, d) => highlight(d))
      .on('mouseout', () => unhighlight());

    node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => CAT[d.category].fill)
      .attr('stroke', d => CAT[d.category].stroke)
      .attr('stroke-width', 1.5);

    node.append('text')
      .attr('class', 'node-label')
      .attr('y', d => d.r + 14)
      .attr('font-size', d => Math.max(10, Math.min(14, d.r * 0.7)))
      .attr('fill', d => CAT[d.category].text)
      .text(d => d.name);

    function highlight(d) {
      const linked = new Set([d.id]);
      const myEdges = links
        .filter(l => l.source.id === d.id || l.target.id === d.id)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 6);
      myEdges.forEach(l => { linked.add(typeof l.source === 'object' ? l.source.id : l.source); linked.add(typeof l.target === 'object' ? l.target.id : l.target); });
      node.classed('faded', n => !linked.has(n.id)).classed('highlighted', n => n.id === d.id);
      link.classed('faded', l => !myEdges.includes(l)).classed('highlighted', l => myEdges.includes(l));
    }
    function unhighlight() {
      node.classed('faded', false).classed('highlighted', false);
      link.classed('faded', false).classed('highlighted', false);
    }

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80).strength(d => Math.min(0.6, d.weight * 0.1)))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide(d => d.r + 6))
      .on('tick', () => {
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');
      });
  }
  /* WIKI BRAIN OVERRIDE END */
`;

  html = html.replace(/fetch\('\.\.\/posts-index\.json'\)[\s\S]*?function buildGraph\(posts\) \{/, dataPatch + '\n\n  function buildGraph(posts) {\n    return; // disabled\n');

  fs.writeFileSync(outPath, html);
}

module.exports = { renderGraph };
```

- [ ] **Step 2: Commit**

```bash
git add scripts/wiki-brain/render-graph.js
git commit -m "feat: wiki-brain 그래프 렌더러 (insights/graph.html 기반)"
```

---

## Phase 7: Post HTML Link Injection

### Task 10: 포스트 HTML 자동 갱신

**Files:**
- Create: `scripts/wiki-brain/inject-links.js`

- [ ] **Step 1: 구현**

Create `scripts/wiki-brain/inject-links.js`:

```javascript
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const MAX_LINKS = 7;
const START = '<!-- WIKI_CONCEPTS_START -->';
const END = '<!-- WIKI_CONCEPTS_END -->';

function buildSection(concepts, postFile) {
  const depth = (postFile.match(/\//g) || []).length;
  const prefix = '../'.repeat(depth);
  const links = concepts
    .slice(0, MAX_LINKS)
    .map(c => `      <a href="${prefix}wiki/concepts/${c.slug}.html" class="concept-chip">${c.name}</a>`)
    .join('\n');
  return `${START}
    <section class="related-concepts">
      <h3>이 글의 핵심 개념</h3>
      <div class="concept-links">
${links}
      </div>
    </section>
    ${END}`;
}

function injectIntoPost(filePath, postFile, concepts) {
  if (!concepts.length) return { skipped: true };
  const html = fs.readFileSync(filePath, 'utf8');
  const section = buildSection(concepts, postFile);

  if (html.includes(START)) {
    const updated = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), section);
    if (updated === html) return { unchanged: true };
    fs.writeFileSync(filePath, updated);
    return { updated: true };
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  const article = $('article').first();
  if (article.length === 0) return { skipped: true, reason: 'no <article>' };
  article.append(`\n    ${section}\n  `);
  fs.writeFileSync(filePath, $.html());
  return { inserted: true };
}

function injectAll(rootDir, conceptsBySlug, posts) {
  const stats = { updated: 0, inserted: 0, unchanged: 0, skipped: 0 };
  for (const post of posts) {
    if (!post.file) continue;
    const filePath = path.join(rootDir, post.file);
    if (!fs.existsSync(filePath)) continue;
    const conceptsForPost = [];
    for (const c of conceptsBySlug.values()) {
      if ((c.posts || []).includes(post.slug)) conceptsForPost.push({ name: c.name, slug: c.slug, frequency: c.frequency });
    }
    conceptsForPost.sort((a, b) => b.frequency - a.frequency);
    const r = injectIntoPost(filePath, post.file, conceptsForPost);
    if (r.updated) stats.updated++;
    else if (r.inserted) stats.inserted++;
    else if (r.unchanged) stats.unchanged++;
    else stats.skipped++;
  }
  return stats;
}

module.exports = { injectAll, buildSection };
```

- [ ] **Step 2: Commit**

```bash
git add scripts/wiki-brain/inject-links.js
git commit -m "feat: wiki-brain 포스트 HTML wiki 링크 자동 삽입 (cheerio)"
```

---

## Phase 8: Main Entry & Wiring

### Task 11: 메인 빌드 스크립트

**Files:**
- Create: `scripts/wiki-brain/index.js`

- [ ] **Step 1: index.js 구현**

Create `scripts/wiki-brain/index.js`:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { loadAllSources } = require('./load-sources');
const { extractRawTerms } = require('./extract');
const { normalize } = require('./normalize');
const { buildConceptIndex, calculateRelationships } = require('./relationships');
const { assignSlugs, applyTranslatedSlugs, kebab } = require('./slugs');
const { generateAll, fallbackDefinition } = require('./definitions');
const { writeConceptPages } = require('./render-concept');
const { renderIndex } = require('./render-index');
const { renderGraph } = require('./render-graph');
const { injectAll } = require('./inject-links');

const ROOT = path.resolve(__dirname, '../..');
const ALIASES_PATH = path.join(ROOT, 'config/concept-aliases.json');
const DATA_PATH = path.join(ROOT, 'wiki/concepts-data.json');
const REPORT_PATH = path.join(ROOT, 'wiki/build-report.json');

function flags() {
  const a = process.argv.slice(2);
  return {
    enrich: a.includes('--enrich'),
    dryRun: a.includes('--dry-run'),
    skipDefinitions: a.includes('--skip-definitions'),
    forceRegenerate: a.includes('--force-regenerate'),
    prune: a.includes('--prune')
  };
}

function loadJSON(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

async function translateKoreanToSlug(client, names) {
  if (!names.length) return {};
  const prompt = `다음 한국어 개념을 영문 kebab-case slug로 변환하세요.
의미가 통하는 영문 표기를 사용하세요. 결과는 JSON 객체로만:
{"한국어1": "english-slug1", ...}

개념 목록:
${names.map(n => '- ' + n).join('\n')}`;
  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });
    const m = resp.content[0].text.match(/\{[\s\S]+\}/);
    return m ? JSON.parse(m[0]) : {};
  } catch (e) {
    console.warn('slug translation failed:', e.message);
    return {};
  }
}

async function main() {
  const f = flags();
  console.log('▶ wiki-brain build starting...', f);
  const t0 = Date.now();

  const aliases = loadJSON(ALIASES_PATH, { canonical: {}, slugMap: {}, blacklist: [], domainKeywords: [] });
  const existing = loadJSON(DATA_PATH, { concepts: [], relationships: [] });
  const existingSlugByName = Object.fromEntries(existing.concepts.map(c => [c.name, c.slug]));
  const existingDefinitions = Object.fromEntries(existing.concepts.map(c => [c.name, { definition: c.definition, needsReview: c.needs_manual_review }]));

  const { posts, newsletters } = await loadAllSources(ROOT);
  console.log(`✓ loaded ${posts.length} posts, ${newsletters.length} newsletters`);

  const allSources = [
    ...posts.map(p => ({ ...p, type: 'post' })),
    ...newsletters.map(n => ({ ...n, type: 'newsletter', slug: n.id, category: 'newsletter' }))
  ];

  for (const s of allSources) {
    s.concepts = normalize(extractRawTerms(s, aliases), aliases);
  }

  let concepts = buildConceptIndex(allSources, { minFrequency: 3 });
  console.log(`✓ filtered to ${concepts.length} concepts (min 3 occurrences)`);

  if (concepts.length < 30) {
    console.error('❌ FAIL: <30 concepts. Aliases or extraction may be misconfigured.');
    process.exitCode = 1;
  }

  const relationships = calculateRelationships(concepts, { minStrength: 2 });
  console.log(`✓ ${relationships.length} relationships (strength >= 2)`);

  const slugResult = assignSlugs(concepts, aliases, { existing: existingSlugByName });
  concepts = slugResult.concepts;

  if (slugResult.pending.length) {
    console.log(`▶ translating ${slugResult.pending.length} Korean concepts to slugs...`);
    const client = new Anthropic();
    const translations = await translateKoreanToSlug(client, slugResult.pending);
    concepts = applyTranslatedSlugs(concepts, translations, aliases);
    saveJSON(ALIASES_PATH, aliases);
  }

  const postsBySlug = new Map(posts.map(p => [p.slug, p]));
  const skip = new Set();
  if (!f.forceRegenerate && !f.skipDefinitions) {
    for (const c of concepts) {
      const ex = existingDefinitions[c.name];
      if (ex && ex.definition && !ex.needsReview) {
        c.definition = ex.definition;
        skip.add(c.name);
      }
    }
  } else if (f.skipDefinitions) {
    for (const c of concepts) {
      const ex = existingDefinitions[c.name];
      if (ex && ex.definition) { c.definition = ex.definition; skip.add(c.name); }
    }
  }

  if (!f.skipDefinitions && skip.size < concepts.length) {
    console.log(`▶ generating definitions for ${concepts.length - skip.size} concepts...`);
    const client = new Anthropic();
    const defs = await generateAll(concepts, postsBySlug, relationships, client, { skip });
    for (const c of concepts) {
      if (skip.has(c.name)) continue;
      const r = defs.get(c.name);
      c.definition = r.definition;
      if (r.needsReview) c.needs_manual_review = true;
    }
  }

  for (const c of concepts) {
    if (!c.definition) c.definition = fallbackDefinition(c);
  }

  const data = {
    generatedAt: new Date().toISOString(),
    version: 1,
    stats: {
      totalConcepts: concepts.length,
      totalRelationships: relationships.length,
      totalPosts: posts.length,
      totalNewsletters: newsletters.length
    },
    concepts: concepts.map(c => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      aliases: aliases.canonical?.[c.name] || [],
      definition: c.definition,
      frequency: c.frequency,
      category: c.category,
      posts: c.posts,
      newsletters: c.newsletters,
      firstSeen: c.firstSeen,
      lastSeen: c.lastSeen,
      needs_manual_review: !!c.needs_manual_review
    })),
    relationships
  };

  if (f.dryRun) {
    console.log('(dry-run) would write', concepts.length, 'concepts');
    return;
  }

  saveJSON(DATA_PATH, data);
  console.log(`✓ wrote ${DATA_PATH}`);

  writeConceptPages(concepts, { postsBySlug, relationships }, path.join(ROOT, 'wiki/concepts'));
  console.log(`✓ rendered ${concepts.length} concept pages`);

  renderIndex(concepts, path.join(ROOT, 'wiki/index.html'));
  renderGraph(ROOT, path.join(ROOT, 'wiki/graph.html'));
  console.log('✓ rendered wiki/index.html and wiki/graph.html');

  const conceptsBySlug = new Map(concepts.map(c => [c.slug, c]));
  const injectStats = injectAll(ROOT, conceptsBySlug, posts);
  console.log(`✓ post links: ${JSON.stringify(injectStats)}`);

  const report = {
    buildAt: data.generatedAt,
    duration: (Date.now() - t0) / 1000,
    concepts: {
      total: concepts.length,
      validDefinitions: concepts.filter(c => !c.needs_manual_review).length,
      needsReview: concepts.filter(c => c.needs_manual_review).length
    },
    relationships: { total: relationships.length },
    coverage: {
      postsWithConcepts: posts.filter(p => [...conceptsBySlug.values()].some(c => (c.posts || []).includes(p.slug))).length,
      totalPosts: posts.length
    },
    inject: injectStats,
    needsManualReview: concepts.filter(c => c.needs_manual_review).map(c => ({ name: c.name, slug: c.slug }))
  };
  saveJSON(REPORT_PATH, report);
  console.log('\n=== Build Report ===');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error(e); process.exitCode = 1; });
```

- [ ] **Step 2: 헤더 메뉴 Wiki 추가**

Modify `assets/js/header.js` — '지식 그래프' 링크 뒤에 추가:

```javascript
'<a href="' + prefix + 'insights/graph.html" class="nav-graph' + (activeCat === 'graph' ? ' active' : '') + '">지식 그래프</a>' +
'<a href="' + prefix + 'wiki/index.html" class="nav-wiki' + (activeCat === 'wiki' ? ' active' : '') + '">Wiki</a>' +
```

모바일 메뉴(`mobile-nav`)에도 동일하게 추가.

- [ ] **Step 3: dry-run으로 첫 빌드 검증**

Run: `ANTHROPIC_API_KEY=... npm run wiki:dry`
Expected: 콘솔에 "filtered to N concepts" 출력, 에러 없음. 파일 변경 없음.

- [ ] **Step 4: 실제 빌드**

Run: `ANTHROPIC_API_KEY=... npm run wiki`
Expected: `wiki/concepts-data.json`, `wiki/concepts/*.html`, `wiki/index.html`, `wiki/graph.html`, `wiki/build-report.json` 생성. 포스트 HTML에 wiki 링크 삽입.

- [ ] **Step 5: 빌드 결과 검증**

```bash
node -e "const r = require('./wiki/build-report.json'); console.log('concepts:', r.concepts.total, 'review needed:', r.concepts.needsReview, 'coverage:', r.coverage.postsWithConcepts + '/' + r.coverage.totalPosts);"
```

Expected: concepts 30+, needsReview <5%, coverage 90%+

- [ ] **Step 6: Commit**

```bash
git add scripts/wiki-brain/index.js assets/js/header.js wiki/ config/concept-aliases.json
git commit -m "feat: wiki-brain 메인 빌드 스크립트 + 헤더 메뉴 통합 + 첫 빌드 산출물"
```

---

## Phase 9: Site Integration Commit

### Task 12: 갱신된 포스트 HTML 커밋

**Files:**
- Modify: 186개 포스트 HTML (Task 11에서 이미 자동 갱신됨)

- [ ] **Step 1: 변경된 파일 검증**

Run: `git status --short | grep -E "research|leader|company|tech|survival" | wc -l`
Expected: 100+ 파일 변경됨

- [ ] **Step 2: 샘플 검증**

Run: `grep -A 10 "WIKI_CONCEPTS_START" research/2026-04-09-google-cloud-ai-agent-trends.html | head -15`
Expected: `<section class="related-concepts">` 블록이 정상적으로 삽입됨

- [ ] **Step 3: 한 포스트 직접 브라우저로 확인 (선택, 로컬 서버 가동 시)**

Run: `node server.js &` 그리고 브라우저에서 `localhost:포트/research/2026-04-09-google-cloud-ai-agent-trends.html` 접속. 푸터 위 "이 글의 핵심 개념" 섹션 확인.

- [ ] **Step 4: Commit**

```bash
git add research/ leader/ company/ tech/ survival/
git commit -m "feat: 모든 포스트 HTML 하단에 wiki 개념 링크 자동 삽입"
```

---

## Phase 10: Workflow Integration

### Task 13: /update-wiki 스킬 추가

**Files:**
- Create: `.claude/commands/update-wiki.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: 스킬 파일 작성**

Check if `.claude/commands/` exists; if not, find correct skill location:

Run: `ls -la /Users/jaydenkang/Desktop/New\ Projects/20260316_블로그/.claude 2>/dev/null || echo "NO_CLAUDE_DIR"`

If no `.claude/commands/`, use `.claude/skills/update-wiki.md` or follow existing skill convention.

Create skill file (예: `.claude/commands/update-wiki.md`):

```markdown
---
name: update-wiki
description: wiki-brain 시스템을 재생성합니다. 새 포스트 발행 후 자동 실행됩니다.
---

# /update-wiki

새 포스트가 추가된 후 위키 브레인을 갱신합니다.

## 실행

1. `npm run wiki` 실행
2. 빌드 리포트(`wiki/build-report.json`) 확인
3. 신규 개념이 있으면 사용자에게 보고: 개수, 이름 목록
4. `needs_manual_review`가 있으면 해당 개념 정의 검수 권고
5. 변경된 파일 커밋: `wiki/`, 갱신된 포스트 HTML

## 옵션

- `--skip-definitions`: 정의 재생성 건너뜀 (수동 편집 보존)
- `--force-regenerate`: 모든 정의를 다시 생성 (수동 편집 무시)
- `--dry-run`: 변경 없이 결과만 표시
```

- [ ] **Step 2: CLAUDE.md 워크플로우 업데이트**

Modify `CLAUDE.md` 워크플로우 섹션:

Before:
```
소스 URL → /create-post → (자동) /publish-post → /update-insights → /persona-comment
```

After:
```
소스 URL → /create-post → (자동) /publish-post → /update-insights → /persona-comment → /update-wiki
```

스킬 표에도 한 줄 추가:
```
| `/update-wiki` | wiki-brain 재빌드 (개념 추출 + 위키 + 그래프) |
```

- [ ] **Step 3: Commit**

```bash
git add .claude/ CLAUDE.md
git commit -m "feat: /update-wiki 스킬 추가 및 워크플로우 통합"
```

---

## Phase 11: Final Validation

### Task 14: 최종 동작 검증

- [ ] **Step 1: graph.html 브라우저 검증**

Run: `node server.js &` 후 브라우저에서 `/wiki/graph.html`. 다음 확인:
- 노드들이 카테고리 색상으로 표시되는지
- 호버 시 상위 6개 강조되는지
- 클릭 시 `wiki/concepts/[slug].html`로 이동하는지
- 모바일 화면(320px) 응답하는지

- [ ] **Step 2: 개념 페이지 검증**

`wiki/concepts/ai-agent.html` 또는 다른 페이지 열기. 다음 확인:
- 정의가 자연스럽게 표시되는지 (CLAUDE.md 문체 규칙)
- 관련 포스트 카드들이 클릭 가능한지
- 관련 개념 링크가 작동하는지
- "← Wiki 메인" / "🌐 그래프" 푸터 작동하는지

- [ ] **Step 3: 포스트 → wiki 통합 검증**

포스트 페이지(예: `/research/2026-04-09-google-cloud-ai-agent-trends.html`) 열어서:
- 본문 끝, footer 위에 "이 글의 핵심 개념" 섹션이 보이는지
- 칩 클릭 시 해당 wiki concept 페이지로 이동하는지

- [ ] **Step 4: 헤더 메뉴 검증**

모든 페이지에서 헤더의 "Wiki" 메뉴 클릭 → `wiki/index.html`로 이동. 현재 페이지가 wiki일 때 active 클래스 적용되는지.

- [ ] **Step 5: 재빌드 안정성 검증**

Run: `npm run wiki` 한 번 더 실행. Expected:
- 정의 변경 없음 (slug + definition 캐시 동작)
- API 호출 거의 0회 (slug map 채워진 후)
- build-report.json만 갱신

- [ ] **Step 6: 최종 Commit**

```bash
git add -A
git commit -m "feat: wiki-brain 시스템 1차 완성 (최종 검증)"
```

---

## Acceptance Checklist

빌드 완료 시 다음이 모두 ✓이어야 합니다:

- [ ] `wiki/concepts-data.json` 존재, 30개 이상 concepts
- [ ] `wiki/concepts/*.html` 30개 이상 존재
- [ ] `wiki/index.html` 검색 가능
- [ ] `wiki/graph.html` 노드 + 엣지 렌더링됨
- [ ] 모든 포스트 HTML에 `<!-- WIKI_CONCEPTS_START -->` 마커 포함
- [ ] `assets/js/header.js`에 Wiki 메뉴 추가됨
- [ ] `.claude/`에 `/update-wiki` 스킬 등록됨
- [ ] `CLAUDE.md` 워크플로우 업데이트됨
- [ ] `wiki/build-report.json` 생성됨, validDefinitions >= 90%
- [ ] `npm run wiki:test` 모든 테스트 통과
- [ ] 재빌드 시 API 호출 거의 0회 (캐시 동작)

---

## Self-Review (작성 후)

**Spec coverage check (spec → plan task 매핑)**:

| Spec section | Implemented in |
|---|---|
| File structure | Task 1 |
| concept-aliases.json | Task 1, Task 6 |
| Source loading (MD + HTML) | Task 2 |
| Concept extraction | Task 3 |
| Normalization | Task 4 |
| Filtering 3+ | Task 5 |
| Relationships (strength) | Task 5 |
| Definition generation + 검증 | Task 7 |
| Slug 결정론적 | Task 6 |
| Wiki concept pages | Task 8 |
| Wiki index | Task 8 |
| Wiki graph (insights 기반) | Task 9 |
| Post HTML injection | Task 10 |
| Header menu | Task 11 |
| /update-wiki 스킬 | Task 13 |
| build-report.json + KPI | Task 11 |
| Mobile simplified mode | Task 9 (rScale 분기 포함) |
| 수동 편집 보존 | Task 11 (skip 로직) |

모든 spec 요구사항이 task에 매핑됨.
