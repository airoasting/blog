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
      if (src.date) {
        if (!cur.firstSeen || src.date < cur.firstSeen) cur.firstSeen = src.date;
        if (!cur.lastSeen || src.date > cur.lastSeen) cur.lastSeen = src.date;
      }
      map.set(c.name, cur);
    }
  }
  const out = [];
  for (const c of map.values()) {
    const freq = c.posts.length + c.newsletters.length;
    if (freq < minFrequency) continue;
    c.frequency = freq;
    c.category = pickCategory(c.categoryCounts);
    out.push(c);
  }
  return out.sort((a, b) => b.frequency - a.frequency);
}

function pickCategory(counts) {
  const entries = Object.entries(counts);
  if (entries.length === 0) return 'research';
  const max = Math.max(...entries.map(([, v]) => v));
  const winners = entries.filter(([, v]) => v === max).map(([k]) => k);
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

module.exports = { buildConceptIndex, calculateRelationships, pickCategory };
