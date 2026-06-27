const fs = require('fs');
const path = require('path');

const MAX_LINKS = 7;   // 최대 칩 수
const MIN_LINKS = 3;   // 최소 칩 수 (모든 아티클 보장)
const START = '<!-- WIKI_CONCEPTS_START -->';
const END = '<!-- WIKI_CONCEPTS_END -->';

function buildSection(concepts, postFile) {
  const depth = (postFile.match(/\//g) || []).length;
  const prefix = '../'.repeat(depth);
  const links = concepts
    .slice(0, MAX_LINKS)
    .map(c => `      <a href="${prefix}insights/wiki/concepts/${c.slug}.html" class="concept-chip">${c.name}</a>`)
    .join('\n');
  return `${START}
    <section class="related-concepts">
      <div class="concept-links">
${links}
      </div>
    </section>
    ${END}`;
}

// 인접 리스트 (개념명 → [{name, strength}]) — 무방향
function buildAdjacency(relationships) {
  const adj = new Map();
  const push = (a, b, s) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push({ name: b, strength: s });
  };
  for (const r of (relationships || [])) {
    push(r.source, r.target, r.strength || 1);
    push(r.target, r.source, r.strength || 1);
  }
  for (const list of adj.values()) list.sort((a, b) => b.strength - a.strength);
  return adj;
}

// 매칭된 개념이 MIN_LINKS 미만이면 관계 그래프 → 동일 카테고리 → 전역 빈도순으로 보강.
// 보강 후보는 모두 실제 concept 객체이므로 위키 페이지가 존재한다.
function padConcepts(matched, post, ctx) {
  const chosen = matched.slice(0, MAX_LINKS);
  const have = new Set(chosen.map(c => c.slug));
  const add = (c) => {
    if (c && !have.has(c.slug)) {
      chosen.push({ name: c.name, slug: c.slug, frequency: c.frequency });
      have.add(c.slug);
    }
  };

  // 1) 관계 그래프: 매칭 개념의 이웃을 강도순으로
  if (chosen.length < MIN_LINKS) {
    const neighbors = [];
    for (const m of matched) {
      for (const nb of (ctx.adjacency.get(m.name) || [])) neighbors.push(nb);
    }
    neighbors.sort((a, b) => b.strength - a.strength);
    for (const nb of neighbors) {
      if (chosen.length >= MIN_LINKS) break;
      add(ctx.byName.get(nb.name));
    }
  }

  // 2) 동일 카테고리 빈도순
  if (chosen.length < MIN_LINKS) {
    for (const c of ctx.byCategory.get(post.category) || []) {
      if (chosen.length >= MIN_LINKS) break;
      add(c);
    }
  }

  // 3) 전역 빈도순 (최후 보강)
  if (chosen.length < MIN_LINKS) {
    for (const c of ctx.byFrequency) {
      if (chosen.length >= MIN_LINKS) break;
      add(c);
    }
  }

  return chosen;
}

function injectIntoPost(filePath, postFile, concepts) {
  if (!concepts.length) return { skipped: true, reason: 'no concepts' };
  const html = fs.readFileSync(filePath, 'utf8');
  const section = buildSection(concepts, postFile);

  if (html.includes(START)) {
    const updated = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), section);
    if (updated === html) return { unchanged: true };
    fs.writeFileSync(filePath, updated);
    return { updated: true };
  }

  if (!html.includes('<wiki-css-link>')) {
    if (html.includes('assets/css/style.css') && !html.includes('assets/css/wiki.css')) {
      const depth = (postFile.match(/\//g) || []).length;
      const prefix = '../'.repeat(depth);
      const inject = `<link rel="stylesheet" href="${prefix}assets/css/wiki.css">`;
      const newHtml = html.replace(
        /(<link rel="stylesheet" href="[^"]*assets\/css\/style\.css">)/,
        `$1\n  ${inject}`
      );
      fs.writeFileSync(filePath, newHtml);
    }
  }

  // 문자열 삽입(마지막 </article> 직전). cheerio가 일부 구버전 포스트의
  // 마크업을 파싱하지 못하는 문제를 피하기 위해 정규식/cheerio 대신 사용한다.
  const reloaded = fs.readFileSync(filePath, 'utf8');
  const idx = reloaded.lastIndexOf('</article>');
  if (idx === -1) return { skipped: true, reason: 'no </article>' };
  const updated = reloaded.slice(0, idx) + `\n    ${section}\n  ` + reloaded.slice(idx);
  fs.writeFileSync(filePath, updated);
  return { inserted: true };
}

function injectAll(rootDir, conceptsBySlug, posts, relationships) {
  const stats = { updated: 0, inserted: 0, unchanged: 0, skipped: 0 };
  const allConcepts = [...conceptsBySlug.values()];
  const ctx = {
    byName: new Map(allConcepts.map(c => [c.name, c])),
    byFrequency: allConcepts.slice().sort((a, b) => b.frequency - a.frequency),
    byCategory: new Map(),
    adjacency: buildAdjacency(relationships)
  };
  for (const c of ctx.byFrequency) {
    if (!ctx.byCategory.has(c.category)) ctx.byCategory.set(c.category, []);
    ctx.byCategory.get(c.category).push(c);
  }

  for (const post of posts) {
    if (!post.file) continue;
    const filePath = path.join(rootDir, post.file);
    if (!fs.existsSync(filePath)) continue;
    const conceptsForPost = [];
    for (const c of conceptsBySlug.values()) {
      if ((c.posts || []).includes(post.slug)) {
        conceptsForPost.push({ name: c.name, slug: c.slug, frequency: c.frequency });
      }
    }
    conceptsForPost.sort((a, b) => b.frequency - a.frequency);
    const finalConcepts = padConcepts(conceptsForPost, post, ctx);
    const r = injectIntoPost(filePath, post.file, finalConcepts);
    if (r.updated) stats.updated++;
    else if (r.inserted) stats.inserted++;
    else if (r.unchanged) stats.unchanged++;
    else stats.skipped++;
  }
  return stats;
}

module.exports = { injectAll, buildSection, padConcepts, MIN_LINKS, MAX_LINKS };
