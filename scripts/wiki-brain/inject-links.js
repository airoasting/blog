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

  const reloaded = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(reloaded, { decodeEntities: false });
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
      if ((c.posts || []).includes(post.slug)) {
        conceptsForPost.push({ name: c.name, slug: c.slug, frequency: c.frequency });
      }
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
