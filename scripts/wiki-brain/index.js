#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { loadAllSources } = require('./load-sources');
const { extractRawTerms } = require('./extract');
const { normalize } = require('./normalize');
const { buildConceptIndex, calculateRelationships } = require('./relationships');
const { assignSlugs, applyTranslatedSlugs } = require('./slugs');
const { generateAll, fallbackDefinition } = require('./definitions');
const { writeConceptPages } = require('./render-concept');
const { renderIndex } = require('./render-index');
const { renderGraph } = require('./render-graph');
const { injectAll } = require('./inject-links');

const ROOT = path.resolve(__dirname, '../..');
const ALIASES_PATH = path.join(ROOT, 'config/concept-aliases.json');
const DATA_PATH = path.join(ROOT, 'wiki/concepts-data.json');
const REPORT_PATH = path.join(ROOT, 'wiki/build-report.json');

function flags() {
  const a = process.argv.slice(2);
  return {
    enrich: a.includes('--enrich'),
    dryRun: a.includes('--dry-run'),
    skipDefinitions: a.includes('--skip-definitions'),
    forceRegenerate: a.includes('--force-regenerate'),
    prune: a.includes('--prune'),
    noInject: a.includes('--no-inject')
  };
}

function loadJSON(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

async function translateKoreanToSlug(client, names) {
  if (!names.length) return {};
  const prompt = `다음 한국어 개념을 영문 kebab-case slug로 변환하세요.
의미가 통하는 영문 표기를 사용하세요. 결과는 JSON 객체로만:
{"한국어1": "english-slug1", ...}

개념 목록:
${names.map(n => '- ' + n).join('\n')}`;
  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });
    const text = resp.content[0].text;
    const m = text.match(/\{[\s\S]+\}/);
    return m ? JSON.parse(m[0]) : {};
  } catch (e) {
    console.warn('slug translation failed:', e.message);
    return {};
  }
}

async function main() {
  const f = flags();
  console.log('▶ wiki-brain build starting...', f);
  const t0 = Date.now();

  const aliases = loadJSON(ALIASES_PATH, { canonical: {}, slugMap: {}, blacklist: [], domainKeywords: [] });
  const existing = loadJSON(DATA_PATH, { concepts: [], relationships: [] });
  const existingSlugByName = Object.fromEntries(existing.concepts.map(c => [c.name, c.slug]));
  const existingDefinitions = Object.fromEntries(existing.concepts.map(c => [c.name, { definition: c.definition, needsReview: c.needs_manual_review }]));

  const { posts, newsletters } = await loadAllSources(ROOT);
  console.log(`✓ loaded ${posts.length} posts, ${newsletters.length} newsletters`);

  const allSources = [
    ...posts.map(p => ({ ...p, type: 'post' })),
    ...newsletters.map(n => ({ ...n, type: 'newsletter', slug: n.id, category: 'newsletter' }))
  ];

  for (const s of allSources) {
    s.concepts = normalize(extractRawTerms(s, aliases), aliases);
  }

  let concepts = buildConceptIndex(allSources, { minFrequency: 3 });
  console.log(`✓ filtered to ${concepts.length} concepts (min 3 occurrences)`);

  if (concepts.length < 30) {
    console.error('❌ FAIL: <30 concepts. Aliases or extraction may be misconfigured.');
    process.exitCode = 1;
  }

  const relationships = calculateRelationships(concepts, { minStrength: 2 });
  console.log(`✓ ${relationships.length} relationships (strength >= 2)`);

  const slugResult = assignSlugs(concepts, aliases, { existing: existingSlugByName });
  concepts = slugResult.concepts;

  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  let client = null;
  function ensureClient() {
    if (client) return client;
    client = new Anthropic();
    return client;
  }

  if (slugResult.pending.length) {
    if (hasApiKey) {
      console.log(`▶ translating ${slugResult.pending.length} Korean concepts to slugs (Claude API)...`);
      const translations = await translateKoreanToSlug(ensureClient(), slugResult.pending);
      concepts = applyTranslatedSlugs(concepts, translations, aliases);
      saveJSON(ALIASES_PATH, aliases);
    } else {
      console.log(`⚠ no ANTHROPIC_API_KEY — using fallback slugs for ${slugResult.pending.length} Korean concepts`);
      concepts = applyTranslatedSlugs(concepts, {}, aliases);
    }
  }

  const postsBySlug = new Map(posts.map(p => [p.slug, p]));
  const skip = new Set();
  if (!f.forceRegenerate && !f.skipDefinitions) {
    for (const c of concepts) {
      const ex = existingDefinitions[c.name];
      if (ex && ex.definition && !ex.needsReview) {
        c.definition = ex.definition;
        skip.add(c.name);
      }
    }
  } else if (f.skipDefinitions) {
    for (const c of concepts) {
      const ex = existingDefinitions[c.name];
      if (ex && ex.definition) { c.definition = ex.definition; skip.add(c.name); }
    }
  }

  if (!f.skipDefinitions && skip.size < concepts.length) {
    if (hasApiKey) {
      console.log(`▶ generating definitions for ${concepts.length - skip.size} concepts (Claude API)...`);
      const defs = await generateAll(concepts, postsBySlug, relationships, ensureClient(), { skip });
      for (const c of concepts) {
        if (skip.has(c.name)) continue;
        const r = defs.get(c.name);
        c.definition = r.definition;
        if (r.needsReview) c.needs_manual_review = true;
      }
    } else {
      console.log(`⚠ no ANTHROPIC_API_KEY — using fallback definitions for ${concepts.length - skip.size} concepts`);
      for (const c of concepts) {
        if (skip.has(c.name)) continue;
        c.definition = fallbackDefinition(c);
        c.needs_manual_review = true;
      }
    }
  }

  for (const c of concepts) {
    if (!c.definition) c.definition = fallbackDefinition(c);
  }

  const data = {
    generatedAt: new Date().toISOString(),
    version: 1,
    stats: {
      totalConcepts: concepts.length,
      totalRelationships: relationships.length,
      totalPosts: posts.length,
      totalNewsletters: newsletters.length
    },
    concepts: concepts.map(c => ({
      id: c.slug,
      slug: c.slug,
      name: c.name,
      aliases: aliases.canonical?.[c.name] || [],
      definition: c.definition,
      frequency: c.frequency,
      category: c.category,
      posts: c.posts,
      newsletters: c.newsletters,
      firstSeen: c.firstSeen,
      lastSeen: c.lastSeen,
      needs_manual_review: !!c.needs_manual_review
    })),
    relationships
  };

  if (f.dryRun) {
    console.log('(dry-run) would write', concepts.length, 'concepts and', relationships.length, 'relationships');
    return;
  }

  saveJSON(DATA_PATH, data);
  console.log(`✓ wrote ${DATA_PATH}`);

  writeConceptPages(concepts, { postsBySlug, relationships }, path.join(ROOT, 'wiki/concepts'));
  console.log(`✓ rendered ${concepts.length} concept pages`);

  renderIndex(concepts, path.join(ROOT, 'wiki/index.html'));
  renderGraph(ROOT, path.join(ROOT, 'wiki/graph.html'));
  console.log('✓ rendered wiki/index.html and wiki/graph.html');

  let injectStats = { updated: 0, inserted: 0, unchanged: 0, skipped: 0 };
  if (!f.noInject) {
    const conceptsBySlug = new Map(concepts.map(c => [c.slug, c]));
    injectStats = injectAll(ROOT, conceptsBySlug, posts);
    console.log(`✓ post links: ${JSON.stringify(injectStats)}`);
  }

  const conceptsBySlug = new Map(concepts.map(c => [c.slug, c]));
  const report = {
    buildAt: data.generatedAt,
    duration: (Date.now() - t0) / 1000,
    concepts: {
      total: concepts.length,
      validDefinitions: concepts.filter(c => !c.needs_manual_review).length,
      needsReview: concepts.filter(c => c.needs_manual_review).length
    },
    relationships: { total: relationships.length },
    coverage: {
      postsWithConcepts: posts.filter(p => [...conceptsBySlug.values()].some(c => (c.posts || []).includes(p.slug))).length,
      totalPosts: posts.length
    },
    inject: injectStats,
    needsManualReview: concepts.filter(c => c.needs_manual_review).map(c => ({ name: c.name, slug: c.slug }))
  };
  saveJSON(REPORT_PATH, report);
  console.log('\n=== Build Report ===');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error(e); process.exitCode = 1; });
