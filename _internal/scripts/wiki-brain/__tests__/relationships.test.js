const test = require('node:test');
const assert = require('node:assert');
const { buildConceptIndex, calculateRelationships, pickCategory } = require('../relationships');

test('buildConceptIndex filters by minFrequency', () => {
  const sources = [
    { slug: 'p1', type: 'post', category: 'tech', date: '2026-01-01', concepts: [{ name: 'A', weight: 3 }, { name: 'B', weight: 2 }] },
    { slug: 'p2', type: 'post', category: 'tech', date: '2026-01-02', concepts: [{ name: 'A', weight: 1 }, { name: 'C', weight: 1 }] },
    { slug: 'p3', type: 'post', category: 'tech', date: '2026-01-03', concepts: [{ name: 'A', weight: 2 }] },
    { slug: 'p4', type: 'post', category: 'tech', date: '2026-01-04', concepts: [{ name: 'B', weight: 1 }] }
  ];
  const concepts = buildConceptIndex(sources, { minFrequency: 3 });
  const names = concepts.map(c => c.name);
  assert.ok(names.includes('A'));
  assert.ok(!names.includes('B'));
  assert.ok(!names.includes('C'));
});

test('calculateRelationships produces strength >= 2 edges', () => {
  const concepts = [
    { name: 'A', posts: ['p1', 'p2', 'p3'], newsletters: [] },
    { name: 'B', posts: ['p1', 'p2'], newsletters: [] },
    { name: 'C', posts: ['p3'], newsletters: [] }
  ];
  const edges = calculateRelationships(concepts, { minStrength: 2 });
  assert.strictEqual(edges.length, 1);
  assert.strictEqual(edges[0].strength, 2);
});

test('pickCategory uses tie-breaker priority', () => {
  assert.strictEqual(pickCategory({ tech: 3, leader: 3 }), 'tech');
  assert.strictEqual(pickCategory({ survival: 5, leader: 3 }), 'survival');
});

test('buildConceptIndex captures date range', () => {
  const sources = [
    { slug: 'p1', type: 'post', category: 'tech', date: '2025-01-01', concepts: [{ name: 'X' }] },
    { slug: 'p2', type: 'post', category: 'tech', date: '2026-05-01', concepts: [{ name: 'X' }] },
    { slug: 'p3', type: 'post', category: 'tech', date: '2025-09-01', concepts: [{ name: 'X' }] }
  ];
  const [x] = buildConceptIndex(sources, { minFrequency: 3 });
  assert.strictEqual(x.firstSeen, '2025-01-01');
  assert.strictEqual(x.lastSeen, '2026-05-01');
});
