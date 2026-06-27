const TAG_WEIGHT = 3;
const HEADING_WEIGHT = 2;
const BODY_WEIGHT = 1;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractFromBoldAndHeadings(content) {
  const terms = [];
  const insightMatch = content.match(/##\s*핵심 인사이트[\s\S]*?(?=\n##|$)/);
  const insightSection = insightMatch ? insightMatch[0] : '';
  const boldMatches = insightSection.matchAll(/\*\*([^*\n]{2,30})\*\*/g);
  for (const m of boldMatches) terms.push(m[1].trim());
  const headingMatches = content.matchAll(/^###?\s+(.{2,40})$/gm);
  for (const m of headingMatches) terms.push(m[1].trim());
  return terms;
}

function extractDomainKeywords(content, keywords) {
  const found = [];
  const isAscii = s => /^[\x00-\x7F]+$/.test(s);
  for (const kw of keywords) {
    const lookahead = isAscii(kw) ? '(?![A-Za-z0-9])' : '(?![가-힣])';
    const lookbehind = isAscii(kw) ? '(?<![A-Za-z0-9])' : '(?<![가-힣])';
    const re = new RegExp(`${lookbehind}${escapeRegex(kw)}${lookahead}`, 'g');
    if (re.test(content)) found.push(kw);
  }
  return found;
}

function extractCapitalizedAcronyms(content) {
  const matches = content.match(/\b[A-Z]{2,}(?:[A-Z][a-z]+)*\b/g) || [];
  return [...new Set(matches)].filter(t => t.length >= 2 && t.length <= 12);
}

function addTerm(map, name, weight) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return;
  const cur = map.get(trimmed) || { name: trimmed, weight: 0 };
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
