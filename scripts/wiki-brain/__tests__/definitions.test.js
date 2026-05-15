const test = require('node:test');
const assert = require('node:assert');
const { validateDefinition, buildPrompt, fallbackDefinition, extractDefinition } = require('../definitions');

test('validateDefinition accepts valid Korean definition', () => {
  const r = validateDefinition('AI를 자동화 도구로 활용하는 시스템입니다.');
  assert.strictEqual(r.valid, true);
});

test('validateDefinition rejects em dash', () => {
  const r = validateDefinition('AI는 — 매우 강력합니다.');
  assert.strictEqual(r.valid, false);
  assert.ok(r.failed.includes('noEmDash'));
});

test('validateDefinition rejects banned words', () => {
  const r = validateDefinition('혁명적인 AI 기술입니다.');
  assert.strictEqual(r.valid, false);
  assert.ok(r.failed.includes('noBannedWords'));
});

test('validateDefinition rejects wrong ending', () => {
  const r = validateDefinition('AI 도구다.');
  assert.strictEqual(r.valid, false);
  assert.ok(r.failed.includes('endingForm'));
});

test('buildPrompt includes concept name and post info', () => {
  const p = buildPrompt({ name: 'AI 에이전트' }, [{ title: 'T1', summary: 'S1' }], ['자동화']);
  assert.ok(p.includes('AI 에이전트'));
  assert.ok(p.includes('T1'));
  assert.ok(p.includes('자동화'));
});

test('fallbackDefinition uses concept name with valid ending', () => {
  const d = fallbackDefinition({ name: 'AI 에이전트' });
  assert.ok(d.includes('AI 에이전트'));
  assert.ok(/입니다\.?\s*$/.test(d.trim()));
});

test('extractDefinition parses JSON response', () => {
  assert.strictEqual(extractDefinition('{"definition": "AI 시스템입니다."}'), 'AI 시스템입니다.');
  assert.strictEqual(extractDefinition('plain text'), 'plain text');
});
