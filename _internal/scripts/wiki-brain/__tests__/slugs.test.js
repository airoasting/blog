const test = require('node:test');
const assert = require('node:assert');
const { assignSlugs, applyTranslatedSlugs } = require('../slugs');

test('assignSlugs uses cached slug from slugMap', () => {
  const aliases = { slugMap: { 'AI 에이전트': 'ai-agent' } };
  const r = assignSlugs([{ name: 'AI 에이전트' }], aliases, { existing: {} });
  assert.strictEqual(r.concepts[0].slug, 'ai-agent');
});

test('assignSlugs preserves slug from previous build', () => {
  const r = assignSlugs([{ name: 'NewConcept' }], { slugMap: {} }, { existing: { NewConcept: 'new-concept-x' } });
  assert.strictEqual(r.concepts[0].slug, 'new-concept-x');
});

test('assignSlugs kebab-cases ASCII names', () => {
  const r = assignSlugs([{ name: 'Claude Code' }, { name: 'AI Safety' }], { slugMap: {} }, { existing: {} });
  assert.strictEqual(r.concepts[0].slug, 'claude-code');
  assert.strictEqual(r.concepts[1].slug, 'ai-safety');
});

test('assignSlugs handles slug collision with suffix', () => {
  const r = assignSlugs([{ name: 'Foo Bar' }, { name: 'foo-bar' }], { slugMap: {} }, { existing: {} });
  assert.notStrictEqual(r.concepts[0].slug, r.concepts[1].slug);
});

test('assignSlugs collects pending Korean concepts', () => {
  const r = assignSlugs([{ name: '메타인지' }], { slugMap: {} }, { existing: {} });
  assert.ok(r.pending.includes('메타인지'));
});

test('applyTranslatedSlugs writes back to slugMap', () => {
  const aliases = { slugMap: {} };
  let { concepts, pending } = assignSlugs([{ name: '메타인지' }], aliases, { existing: {} });
  concepts = applyTranslatedSlugs(concepts, { '메타인지': 'meta-cognition' }, aliases);
  assert.strictEqual(concepts[0].slug, 'meta-cognition');
  assert.strictEqual(aliases.slugMap['메타인지'], 'meta-cognition');
});
