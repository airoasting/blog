const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { loadAllSources } = require('../load-sources');

const ROOT = path.resolve(__dirname, '../../..');

test('loadAllSources returns posts and newsletters', async () => {
  const { posts, newsletters } = await loadAllSources(ROOT);
  assert.ok(posts.length >= 180, `expected 180+ posts, got ${posts.length}`);
  assert.ok(newsletters.length >= 40, `expected 40+ newsletters, got ${newsletters.length}`);

  const sample = posts[0];
  assert.ok(sample.slug, 'post must have slug');
  assert.ok(sample.title, 'post must have title');
  assert.ok(Array.isArray(sample.tags), 'tags must be array');
  assert.ok(typeof sample.content === 'string', 'content must be string');
  assert.ok(['md', 'html'].includes(sample.source), 'source must be md or html');
});

test('loadAllSources merges metadata from posts-index.json', async () => {
  const { posts } = await loadAllSources(ROOT);
  const withTags = posts.filter(p => p.tags && p.tags.length > 0);
  assert.ok(withTags.length >= 100, `expected most posts to have tags, got ${withTags.length}`);
});
