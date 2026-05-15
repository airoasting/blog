const BANNED = /(혁명적|획기적|폭발적|패러다임 시프트|게임 체인저|누구나 쉽게)/;
const TRANSLATIONESE = /(라고 할 수 있겠습니다|것으로 보입니다만)/;

function validateDefinition(text) {
  const failed = [];
  const trimmed = (text || '').trim();
  if (trimmed.length === 0 || trimmed.length > 220) failed.push('length');
  const sentences = trimmed.split(/(?<=[.。!?])\s+/).filter(Boolean);
  if (sentences.some(s => s.length > 70)) failed.push('sentenceLength');
  if (!/(입니다|합니다)[.。!?]?\s*$/.test(trimmed)) failed.push('endingForm');
  if (trimmed.includes('—')) failed.push('noEmDash');
  if (BANNED.test(trimmed)) failed.push('noBannedWords');
  if (TRANSLATIONESE.test(trimmed)) failed.push('noTranslationese');
  return { valid: failed.length === 0, failed };
}

function buildPrompt(concept, topPosts, relatedNames) {
  const postLines = topPosts.slice(0, 3)
    .map(p => `- ${p.title}: ${p.summary || ''}`).join('\n') || '- (요약 없음)';
  const rel = (relatedNames || []).slice(0, 3).join(', ') || '없음';
  return [
    `다음 개념의 정의를 한국어 1-2문장으로 작성하세요.`,
    `규칙: 종결어미는 ~입니다/~합니다. em dash(—) 금지. 각 문장 60자 이내.`,
    `금지: 혁명적, 획기적, 폭발적, 패러다임 시프트, 게임 체인저, "~라고 할 수 있겠습니다".`,
    ``,
    `개념명: ${concept.name}`,
    `자주 등장한 포스트:`,
    postLines,
    `관련 개념: ${rel}`,
    ``,
    `JSON으로만 답하세요: {"definition": "..."}`
  ].join('\n');
}

function fallbackDefinition(concept) {
  return `${concept.name}는 AI ROASTING 블로그에서 자주 다루는 핵심 개념입니다.`;
}

function extractDefinition(text) {
  const m = text.match(/"definition"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
  if (m) return m[1].replace(/\\"/g, '"').trim();
  return text.trim();
}

async function generateOne(client, concept, topPosts, relatedNames, { model, maxRetries = 3 }) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const base = buildPrompt(concept, topPosts, relatedNames);
    const prompt = attempt === 1 ? base : base + `\n\n이전 시도가 규칙을 위반했습니다. 규칙을 엄격히 지키세요.`;
    try {
      const resp = await client.messages.create({
        model,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      });
      const text = resp.content[0].text;
      const def = extractDefinition(text);
      const v = validateDefinition(def);
      if (v.valid) return { definition: def, attempts: attempt };
    } catch (e) {
      if (attempt === maxRetries) {
        return { definition: fallbackDefinition(concept), attempts: attempt, error: e.message, needsReview: true };
      }
    }
  }
  return { definition: fallbackDefinition(concept), attempts: maxRetries, needsReview: true };
}

async function generateAll(concepts, postsBySlug, relationships, client, { model = 'claude-haiku-4-5-20251001', concurrency = 8, skip = new Set() } = {}) {
  const relMap = new Map();
  for (const e of relationships) {
    if (!relMap.has(e.source)) relMap.set(e.source, []);
    if (!relMap.has(e.target)) relMap.set(e.target, []);
    relMap.get(e.source).push({ name: e.target, strength: e.strength });
    relMap.get(e.target).push({ name: e.source, strength: e.strength });
  }

  const out = new Map();
  let idx = 0;
  let done = 0;
  const total = concepts.length;
  async function worker() {
    while (idx < concepts.length) {
      const i = idx++;
      const c = concepts[i];
      if (skip.has(c.name)) {
        out.set(c.name, { definition: c.definition || fallbackDefinition(c) });
        done++;
        continue;
      }
      const topPosts = (c.posts || []).slice(0, 3).map(slug => postsBySlug.get(slug)).filter(Boolean);
      const related = (relMap.get(c.name) || []).sort((a, b) => b.strength - a.strength).map(r => r.name);
      const r = await generateOne(client, c, topPosts, related, { model });
      out.set(c.name, r);
      done++;
      if (done % 10 === 0) console.log(`  definitions: ${done}/${total}`);
    }
  }
  await Promise.all(Array(Math.min(concurrency, concepts.length)).fill(0).map(worker));
  return out;
}

module.exports = { validateDefinition, buildPrompt, fallbackDefinition, generateOne, generateAll, extractDefinition };
