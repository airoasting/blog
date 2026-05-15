const fs = require('fs');
const path = require('path');

const CAT_LABEL = { research: '리서치', leader: '리더', company: '기업', tech: '기술', survival: '생존', newsletter: '뉴스레터' };

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
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
  const conceptByName = new Map(allConcepts.map(c => [c.name, c]));
  const related = relationships
    .filter(e => e.source === concept.name || e.target === concept.name)
    .map(e => {
      const otherName = e.source === concept.name ? e.target : e.source;
      const other = conceptByName.get(otherName);
      return other ? { name: otherName, slug: other.slug, strength: e.strength } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 12);

  const reviewBadge = concept.needs_manual_review ? '<span class="badge review">검수 필요</span>' : '';
  const aliasesHtml = (concept.aliases || []).length
    ? `<div class="wiki-aliases">${concept.aliases.map(a => `<span class="alias">${esc(a)}</span>`).join('')}</div>` : '';

  return `<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(concept.name)} · AI ROASTING · Blog</title>
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
    <a href="../graph.html">개념 그래프 보기 →</a>
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
