const test = require('node:test');
const assert = require('node:assert');
const { validateDefinition, buildPrompt, fallbackDefinition, extractDefinition, isFallbackDefinition, pickDefinition } = require('../definitions');

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

test('pickDefinition prefers manual, then valid existing, never reuses fallback', () => {
  const fb = fallbackDefinition({ name: 'X' });
  assert.strictEqual(isFallbackDefinition(fb), true);
  assert.strictEqual(isFallbackDefinition('AI를 자동화 도구로 활용하는 시스템입니다.'), false);

  const manual = { X: '수동 정의입니다.' };
  assert.deepStrictEqual(pickDefinition('X', manual, { definition: '기존 정의입니다.' }),
    { definition: '수동 정의입니다.', source: 'manual', needsReview: false });
  assert.strictEqual(pickDefinition('X', {}, { definition: '기존 정의입니다.' }).source, 'existing');
  // 검수 표시 없이 저장된 fallback 문장도 재사용하지 않습니다.
  assert.strictEqual(pickDefinition('X', {}, { definition: fb, needsReview: false }), null);
  assert.strictEqual(pickDefinition('X', {}, { definition: fb }, { allowReview: true }), null);
  assert.strictEqual(pickDefinition('X', {}, { definition: '기존 정의입니다.', needsReview: true }), null);
  assert.strictEqual(pickDefinition('X', {}, undefined), null);
});
