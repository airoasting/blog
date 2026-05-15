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

module.exports = { normalize, buildAliasIndex };
