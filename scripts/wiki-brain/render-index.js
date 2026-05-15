const fs = require('fs');

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function sumContent(concepts) {
  const all = new Set();
  for (const c of concepts) {
    for (const p of c.posts || []) all.add(p);
    for (const n of c.newsletters || []) all.add(n);
  }
  return all.size;
}

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
  <p class="wiki-index-intro">${concepts.length}개 개념이 ${sumContent(concepts)}개 콘텐츠에서 연결됩니다. <a href="graph.html">개념 그래프 보기 →</a></p>
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
    if (!input || !grid) return;
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

module.exports = { renderIndex };
