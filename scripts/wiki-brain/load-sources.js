const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const cheerio = require('cheerio');

const CATEGORIES = ['research', 'leader', 'company', 'tech', 'survival'];

function safeParseFrontmatter(raw) {
  try {
    return matter(raw);
  } catch (e) {
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) return { data: {}, content: raw };
    const fm = m[1];
    const content = m[2];
    const data = {};
    const tagMatch = fm.match(/^tags:\s*\[(.*)\]/m);
    if (tagMatch) data.tags = tagMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    const catMatch = fm.match(/^category:\s*(.+)$/m);
    if (catMatch) data.category = catMatch[1].trim();
    const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) data.title = titleMatch[1].trim();
    const dateMatch = fm.match(/^date:\s*(\S+)/m);
    if (dateMatch) data.date = dateMatch[1].trim();
    const fileMatch = fm.match(/^file:\s*(.+)$/m);
    if (fileMatch) data.file = fileMatch[1].trim();
    const quoteMatch = fm.match(/^roasting_quote:\s*["']?(.+?)["']?\s*$/m);
    if (quoteMatch) data.roasting_quote = quoteMatch[1].trim();
    return { data, content };
  }
}

function loadPostsFromMd(root) {
  const postsDir = path.join(root, '_posts');
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(postsDir, f), 'utf8');
      const { data, content } = safeParseFrontmatter(raw);
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
      const { data, content } = safeParseFrontmatter(raw);
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
