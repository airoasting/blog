const test = require('node:test');
const assert = require('node:assert');
const { extractRawTerms } = require('../extract');
const { normalize } = require('../normalize');

const aliases = {
  domainKeywords: ['AI에이전트', 'Claude', 'MCP'],
  blacklist: ['AI'],
  canonical: {
    'AI 에이전트': ['AI에이전트', 'AI agent', '에이전트'],
    'Claude': ['claude', 'Claude AI']
  }
};

test('extractRawTerms picks up tags and domain keywords', () => {
  const source = {
    title: 'test',
    tags: ['AI에이전트', '자동화'],
    content: `## 핵심 인사이트
- **MCP**가 핵심입니다.
- Claude는 강력합니다.`
  };
  const terms = extractRawTerms(source, aliases);
  const names = terms.map(t => t.name);
  assert.ok(names.includes('AI에이전트'), 'tag extracted');
  assert.ok(names.includes('Claude'), 'domain keyword extracted');
  assert.ok(names.includes('MCP'), 'bold text extracted');
  assert.ok(!names.includes('AI'), 'blacklist filtered');
});

test('extractRawTerms blacklist removes generic words', () => {
  const a2 = { ...aliases, blacklist: ['AI', '데이터'] };
  const source = { tags: ['AI', '데이터', '진짜개념'], content: '' };
  const terms = extractRawTerms(source, a2);
  const names = terms.map(t => t.name);
  assert.ok(!names.includes('AI'));
  assert.ok(!names.includes('데이터'));
  assert.ok(names.includes('진짜개념'));
});

test('normalize collapses aliases to canonical form', () => {
  const out = normalize([
    { name: 'AI에이전트', weight: 3 },
    { name: '에이전트', weight: 1 },
    { name: 'AI agent', weight: 2 },
    { name: 'Claude', weight: 5 },
    { name: 'claude', weight: 1 }
  ], aliases);
  const map = new Map(out.map(t => [t.name, t]));
  assert.strictEqual(map.get('AI 에이전트').weight, 6);
  assert.strictEqual(map.get('Claude').weight, 6);
});

test('normalize keeps unknown terms', () => {
  const out = normalize([{ name: '신기술', weight: 2 }], aliases);
  assert.strictEqual(out[0].name, '신기술');
});
