const fs = require('fs');

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// 카테고리 메타: 한글 라벨 + 디자인 토큰 매핑 (라이트/다크 공용)
const CAT_META = {
  research:   { label: '리서치',   color: 'var(--cat-research)', surf: 'var(--cat-research-surface)' },
  leader:     { label: '리더',     color: 'var(--cat-leader)',   surf: 'var(--cat-leader-surface)' },
  company:    { label: '기업',     color: 'var(--cat-company)',  surf: 'var(--cat-company-surface)' },
  tech:       { label: '기술',     color: 'var(--cat-tech)',     surf: 'var(--cat-tech-surface)' },
  survival:   { label: '생존',     color: 'var(--cat-survival)', surf: 'var(--cat-survival-surface)' },
  column:     { label: '칼럼',     color: 'var(--cat-column)',   surf: 'var(--cat-column-surface)' },
  newsletter: { label: '뉴스레터', color: 'var(--cat-newsletter)', surf: 'var(--surface-container-high)' },
};
const catMeta = cat => CAT_META[cat] || { label: cat, color: 'var(--text-secondary)', surf: 'var(--surface-container-high)' };

function sumContent(concepts) {
  const all = new Set();
  for (const c of concepts) {
    for (const p of c.posts || []) all.add(p);
    for (const n of c.newsletters || []) all.add(n);
  }
  return all.size;
}

function renderIndex(concepts, outPath, stats = {}) {
  const sorted = [...concepts].sort((a, b) => b.frequency - a.frequency);
  const top10 = sorted.slice(0, 10);
  const byName = [...concepts].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const maxFreq = top10.length ? top10[0].frequency : 1;
  // 코퍼스 전체 규모(빌드 stats 우선, 없으면 연결된 콘텐츠 수로 폴백)
  const totalPosts = stats.totalPosts != null
    ? stats.totalPosts
    : new Set(concepts.flatMap(c => c.posts || [])).size;
  const totalNewsletters = stats.totalNewsletters != null
    ? stats.totalNewsletters
    : new Set(concepts.flatMap(c => c.newsletters || [])).size;

  // 데이터에 실제로 존재하는 카테고리만, 정의된 순서대로 필터칩 생성
  const order = ['research', 'leader', 'company', 'tech', 'survival', 'newsletter'];
  const present = order.filter(cat => concepts.some(c => c.category === cat));

  const styleVars = m => `--cat:${m.color};--cat-surf:${m.surf}`;

  const filterBtns = [
    `<button class="wiki-filter active" data-cat="all">전체</button>`,
    ...present.map(cat => {
      const m = catMeta(cat);
      return `<button class="wiki-filter" data-cat="${cat}" style="${styleVars(m)}"><span class="dot"></span>${esc(m.label)}</button>`;
    }),
  ].join('');

  const featuredTile = (c, i) => {
    const m = catMeta(c.category);
    const pct = Math.max(8, Math.round((c.frequency / maxFreq) * 100));
    const rank = String(i + 1).padStart(2, '0');
    return `<a class="wiki-featured-tile" href="concepts/${esc(c.slug)}.html" style="${styleVars(m)}" data-cat="${esc(c.category)}" data-name="${esc(c.name.toLowerCase())}">`
      + `<div class="wiki-featured-head"><span class="wiki-featured-rank">${rank}</span><span class="wiki-featured-name">${esc(c.name)}</span><span class="wiki-featured-cat">${esc(m.label)}</span></div>`
      + `<div class="wiki-featured-bar"><i style="width:${pct}%"></i></div>`
      + `<div class="wiki-featured-meta">${esc(c.frequency)}개 콘텐츠에서 언급</div>`
      + `</a>`;
  };

  const tile = c => {
    const m = catMeta(c.category);
    return `<a class="wiki-concept-tile" href="concepts/${esc(c.slug)}.html" style="${styleVars(m)}" data-cat="${esc(c.category)}" data-name="${esc(c.name.toLowerCase())}">`
      + `<div class="name">${esc(c.name)}</div>`
      + `<div class="freq"><span class="n">${esc(c.frequency)}</span>개 콘텐츠<span class="cat-tag">${esc(m.label)}</span></div>`
      + `</a>`;
  };

  const html = `<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wiki · AI ROASTING · Blog</title>
  <meta property="og:image" content="https://airoasting.github.io/blog/assets/images/og-cover.png">
  <meta name="twitter:image" content="https://airoasting.github.io/blog/assets/images/og-cover.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="../../assets/css/style.css">
  <link rel="stylesheet" href="../../assets/css/wiki.css">
  <script>(function(){var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})()</script>
</head>
<body>
<header id="site-header"></header>
<main class="wiki-index">
  <div class="wiki-hero-index">
    <h1>Wiki Brain</h1>
    <p class="wiki-index-intro">${totalPosts}개 포스트와 ${totalNewsletters}개 뉴스레터에서 ${concepts.length}개 개념을 뽑아 서로 연결했습니다. 개념 하나를 따라가면 관련 글과 다른 개념으로 이어집니다.</p>
    <div class="wiki-hero-row">
      <div class="wiki-stats">
        <div class="wiki-stat"><span class="num">${concepts.length}</span><span class="label">개념</span></div>
        <div class="wiki-stat"><span class="num">${totalPosts}</span><span class="label">포스트</span></div>
        <div class="wiki-stat"><span class="num">${totalNewsletters}</span><span class="label">뉴스레터</span></div>
      </div>
      <a class="wiki-graph-link" href="graph.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><line x1="6.8" y1="7.4" x2="10.4" y2="16.2"/><line x1="17.2" y1="7.4" x2="13.6" y2="16.2"/><line x1="7" y1="6" x2="16.6" y2="6"/></svg>
        지식 그래프 보기
      </a>
    </div>
  </div>

  <div class="wiki-toolbar">
    <div class="wiki-search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input class="wiki-index-search" id="wikiSearch" type="text" placeholder="개념 검색 (예: AI 에이전트, 조직설계)" autocomplete="off">
    </div>
    <div class="wiki-filters" id="wikiFilters">${filterBtns}</div>
  </div>

  <section class="wiki-section" id="featuredSection">
    <div class="wiki-section-head"><h2>가장 자주 등장한 개념</h2><span class="wiki-section-count">Top 10</span></div>
    <div class="wiki-featured-grid">${top10.map(featuredTile).join('')}</div>
  </section>

  <section class="wiki-section" id="allSection">
    <div class="wiki-section-head"><h2>전체 개념</h2><span class="wiki-section-count">가나다순 · <span id="conceptCount">${byName.length}</span>개</span></div>
    <div class="wiki-concept-grid" id="conceptGrid">${byName.map(tile).join('')}</div>
    <p class="wiki-empty" id="wikiEmpty">조건에 맞는 개념이 없습니다.</p>
  </section>
</main>
<footer id="site-footer"></footer>
<script>window.HEADER_CONFIG = { activeCat: 'wiki' };</script>
<script src="../../assets/js/header.js"></script>
<script src="../../assets/js/theme.js"></script>
<script src="../../assets/js/footer.js"></script>
<script>
  (function(){
    const input = document.getElementById('wikiSearch');
    const grid = document.getElementById('conceptGrid');
    const filters = document.getElementById('wikiFilters');
    const featured = document.getElementById('featuredSection');
    const empty = document.getElementById('wikiEmpty');
    const countEl = document.getElementById('conceptCount');
    if (!input || !grid) return;
    const tiles = [...grid.children];
    let activeCat = 'all';

    function apply(){
      const q = input.value.toLowerCase().trim();
      let shown = 0;
      tiles.forEach(el => {
        const name = el.getAttribute('data-name') || '';
        const cat = el.getAttribute('data-cat') || '';
        const ok = (!q || name.includes(q)) && (activeCat === 'all' || cat === activeCat);
        el.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (empty) empty.classList.toggle('show', shown === 0);
      // 검색·필터가 활성화되면 Top 10은 숨겨 집중 모드로 전환
      if (featured) featured.hidden = !!q || activeCat !== 'all';
    }

    input.addEventListener('input', apply);
    if (filters) {
      filters.addEventListener('click', e => {
        const btn = e.target.closest('.wiki-filter');
        if (!btn) return;
        activeCat = btn.getAttribute('data-cat');
        [...filters.children].forEach(b => b.classList.toggle('active', b === btn));
        apply();
      });
    }
  })();
</script>
</body>
</html>`;
  fs.writeFileSync(outPath, html);
}

module.exports = { renderIndex };
