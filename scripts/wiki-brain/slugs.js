function kebab(s) {
  return String(s || '').toLowerCase()
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
    const base = translated ? kebab(translated) : (kebab(c.name) || 'concept');
    c.slug = ensureUnique(base || 'concept', used);
    if (translated) {
      if (!aliases.slugMap) aliases.slugMap = {};
      aliases.slugMap[c.name] = c.slug;
    }
  }
  return concepts;
}

module.exports = { assignSlugs, applyTranslatedSlugs, kebab };
