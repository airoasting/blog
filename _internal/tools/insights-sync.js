#!/usr/bin/env node
// insights/insights.html 정합성 점검·동기화
//
// 사용법:
//   node _internal/tools/insights-sync.js          점검 후 파생 값 자동 수정
//   node _internal/tools/insights-sync.js --check  점검만 (문제 있으면 exit 1)
//
// 정본(단일 소스):
//   posts-index.json            포스트 제목·날짜
//   assets/js/newsletter-data.js 뉴스레터 회차·날짜
//
// 자동 수정하는 파생 값:
//   - 포스트 카드 source(제목)·date를 posts-index.json에 맞춤
//   - 뉴스레터 카드 date를 newsletter-data.js에 맞춤
//   - 날짜와 다른 분기에 들어간 카드를 올바른 분기로 이동
//   - epRange("뉴스레터 #a~b · 포스트 N개"), 탭 q-tab-count, 히어로 통계, meta description
//
// 사람이 채워야 하는 것(보고만 함):
//   - 카드가 없는 포스트·뉴스레터, 인덱스에 없는 카드, 중복 카드, 필수 필드 누락

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const FILE = path.join(ROOT, 'insights', 'insights.html');
const CHECK_ONLY = process.argv.includes('--check');

const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'posts-index.json'), 'utf8')).posts;
const nlSrc = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'newsletter-data.js'), 'utf8');
const newsletters = JSON.parse(nlSrc.replace('window.NEWSLETTER_DATA = ', '').replace(/;\s*$/, ''));

const postByFile = new Map(posts.map(p => [p.file || `${p.category}/${p.slug}.html`, p]));
const nlByEp = new Map(newsletters.map(n => [n.ep, n]));

// 분기 id: 2025 Q2 = 0 (페이지의 activePhase 계산과 동일)
const phaseId = date => {
  const [y, m] = date.split('-').map(Number);
  return (y - 2025) * 4 + Math.ceil(m / 3) - 2;
};

const original = fs.readFileSync(FILE, 'utf8');
const lines = original.split('\n');

// ── 분기 블록과 카드 줄 파싱 ────────────────────────────────────────────────
const phases = [];
for (let i = 0; i < lines.length; i++) {
  const idm = lines[i].match(/^\s*id: (-?\d+), quarter: "([^"]+)"/);
  if (!idm) continue;
  const phase = { id: Number(idm[1]), quarter: idm[2], epRangeLine: -1, open: -1, close: -1, cards: [] };
  for (let j = i + 1; j < lines.length; j++) {
    if (/^\s*epRange: "/.test(lines[j])) phase.epRangeLine = j;
    if (/^\s*insights: \[\s*$/.test(lines[j])) phase.open = j;
    if (phase.open > -1 && /^      \],?\s*$/.test(lines[j])) { phase.close = j; break; }
  }
  if (phase.open < 0 || phase.close < 0) throw new Error(`분기 ${phase.id} 블록을 찾지 못했습니다`);
  for (let j = phase.open + 1; j < phase.close; j++) {
    if (!lines[j].trim() || lines[j].trim() === ",") continue;
    if (!/^\s*\{ theme: .*\},?\s*$/.test(lines[j])) throw new Error(`분기 ${phase.id}: 한 줄 카드가 아닌 줄 ${j + 1}`);
    const obj = new Function(`return ${lines[j].trim().replace(/,\s*$/, '')}`)();
    phase.cards.push({ text: lines[j].replace(/,\s*$/, ''), obj, from: phase.id });
  }
  phases.push(phase);
}
const phaseById = new Map(phases.map(p => [p.id, p]));

const setField = (text, key, value) => {
  const re = new RegExp(`(\\b${key}: )"(?:[^"\\\\]|\\\\.)*"`);
  const val = JSON.stringify(value);
  return re.test(text)
    ? text.replace(re, (_, k) => k + val)
    : text.replace(/(\burl: "(?:[^"\\]|\\.)*"|\bsource: "(?:[^"\\]|\\.)*")/, m => `${m}, ${key}: ${val}`);
};

const problems = [];   // 사람이 처리해야 하는 것
const changes = [];    // 자동 수정한 것
const seen = new Map();

// ── 카드별 정본 대조 ────────────────────────────────────────────────────────
for (const phase of phases) {
  for (const card of phase.cards) {
    const c = card.obj;
    let target = phase.id;
    const epm = (c.source || '').match(/^뉴스레터 #(\d+)$/);
    if (c.url) {
      const file = c.url.replace(/^\.\.\//, '');
      if (seen.has(file)) problems.push(`중복 카드: ${file}`);
      seen.set(file, true);
      const p = postByFile.get(file);
      if (!p) { problems.push(`posts-index.json에 없는 카드: ${file}`); continue; }
      if (!fs.existsSync(path.join(ROOT, file))) problems.push(`파일 없는 카드: ${file}`);
      for (const f of ['theme', 'tag', 'body', 'roasting']) if (!c[f]) problems.push(`필드 누락 ${f}: ${file}`);
      if (!Array.isArray(c.summaries) || c.summaries.length !== 3) problems.push(`summaries 3개 아님: ${file}`);
      if (c.source !== p.title) { changes.push(`제목 ${file}: "${c.source}" → "${p.title}"`); card.text = setField(card.text, 'source', p.title); }
      if (c.date !== p.date) { changes.push(`날짜 ${file}: ${c.date || '없음'} → ${p.date}`); card.text = setField(card.text, 'date', p.date); }
      target = phaseId(p.date);
    } else if (epm) {
      const ep = Number(epm[1]);
      if (seen.has(`nl#${ep}`)) problems.push(`중복 뉴스레터 카드: #${ep}`);
      seen.set(`nl#${ep}`, true);
      const n = nlByEp.get(ep);
      if (!n) { problems.push(`newsletter-data.js에 없는 회차: #${ep}`); continue; }
      if (c.date !== n.date) { changes.push(`날짜 뉴스레터 #${ep}: ${c.date || '없음'} → ${n.date}`); card.text = setField(card.text, 'date', n.date); }
      target = phaseId(n.date);
    } else {
      problems.push(`분류할 수 없는 카드(분기 ${phase.id}): ${c.source}`);
    }
    if (target !== phase.id) {
      if (!phaseById.has(target)) { problems.push(`분기 ${target}가 없습니다: ${c.url || c.source}`); continue; }
      changes.push(`분기 이동 ${c.url || c.source}: ${phase.quarter} → ${phaseById.get(target).quarter}`);
      card.move = target;
    }
  }
}
const moving = phases.flatMap(p => p.cards.filter(c => c.move !== undefined));
phases.forEach(p => { p.cards = p.cards.filter(c => c.move === undefined); });
moving.forEach(c => phaseById.get(c.move).cards.push(c));

// ── 빠진 카드 보고 ─────────────────────────────────────────────────────────
for (const file of postByFile.keys()) if (!seen.has(file)) problems.push(`카드 없는 포스트: ${file}`);
for (const n of newsletters) if (!seen.has(`nl#${n.ep}`)) problems.push(`카드 없는 뉴스레터: #${n.ep} (${n.date})`);

// ── 카드 줄 다시 쓰기 (쉼표 정리 포함) ────────────────────────────────────
const rebuilt = [];
{
  let cursor = 0;
  for (const phase of phases) {
    rebuilt.push(...lines.slice(cursor, phase.open + 1));
    phase.cards.forEach((c, i) => rebuilt.push(c.text + (i < phase.cards.length - 1 ? ',' : '')));
    cursor = phase.close;
  }
  rebuilt.push(...lines.slice(cursor));
}
let html = rebuilt.join('\n');

// ── 파생 숫자 ──────────────────────────────────────────────────────────────
const replaceOnce = (re, fn, label) => {
  const before = html;
  html = html.replace(re, fn);
  if (html !== before) changes.push(label);
};
for (const phase of phases) {
  const nls = newsletters.filter(n => phaseId(n.date) === phase.id).map(n => n.ep).sort((a, b) => a - b);
  const postCount = posts.filter(p => phaseId(p.date) === phase.id).length;
  if (nls.length) {
    const range = nls.length > 1 ? `#${nls[0]}~${nls[nls.length - 1]}` : `#${nls[0]}`;
    const epRange = `뉴스레터 ${range}${postCount ? ` · 포스트 ${postCount}개` : ''}`;
    replaceOnce(new RegExp(`(id: ${phase.id}, quarter: "[^"]+",\\s*\\n\\s*period: "[^"]*",\\s*\\n\\s*epRange: )"[^"]*"`),
      (m, pre) => m.endsWith(`"${epRange}"`) ? m : `${pre}"${epRange}"`, `epRange ${phase.quarter}: ${epRange}`);
  }
  const count = phase.cards.length;
  replaceOnce(new RegExp(`(data-phase="${phase.id}"[\\s\\S]*?q-tab-count">)(\\d+)(<)`),
    (m, a, n, b) => (Number(n) === count ? m : `${a}${count}${b}`), `탭 ${phase.quarter}: ${count}`);
}
replaceOnce(/(<div class="ins-stat-num">)(\d+)(<\/div>\s*<div class="ins-stat-label">뉴스레터)/,
  (m, a, n, b) => (Number(n) === newsletters.length ? m : `${a}${newsletters.length}${b}`), `히어로 뉴스레터 수: ${newsletters.length}`);
replaceOnce(/(<div class="ins-stat-num">)(\d+)(<\/div>\s*<div class="ins-stat-label">(?:블로그 )?포스트)/,
  (m, a, n, b) => (Number(n) === posts.length ? m : `${a}${posts.length}${b}`), `히어로 포스트 수: ${posts.length}`);

const withCards = phases.filter(p => p.cards.length);
const first = withCards.reduce((a, b) => (a.id < b.id ? a : b));
const last = withCards.reduce((a, b) => (a.id > b.id ? a : b));
const firstYM = (() => { const [y, q] = first.quarter.split(' Q'); return `20${y}년 ${(Number(q) - 1) * 3 + 1}월`; })();
const lastYM = (() => { const [y, q] = last.quarter.split(' Q'); return `20${y}년 ${Number(q) * 3}월`; })();
const meta = `AI 로스팅 뉴스레터 ${newsletters.length}화와 블로그 포스트 ${posts.length}개, 총 ${newsletters.length + posts.length}화에서 추출한 인사이트. ${firstYM}부터 ${lastYM}까지 ${withCards.length}개 분기 핵심 인사이트를 분기별로 정리합니다.`;
replaceOnce(/(<meta name="description" content=")AI 로스팅 뉴스레터[^"]*(")/,
  (m, a, b) => (m === `${a}${meta}${b}` ? m : `${a}${meta}${b}`), `meta description: ${meta}`);

// ── 결과 ───────────────────────────────────────────────────────────────────
const changed = html !== original;
console.log(`포스트 ${posts.length} · 뉴스레터 ${newsletters.length} · 카드 ${phases.reduce((s, p) => s + p.cards.length, 0)}`);
if (changes.length) console.log(`\n${CHECK_ONLY ? '맞지 않는 파생 값' : '자동 수정'} ${changes.length}건\n` + changes.map(c => `  - ${c}`).join('\n'));
if (problems.length) console.log(`\n직접 처리할 문제 ${problems.length}건\n` + problems.map(p => `  - ${p}`).join('\n'));
if (!changes.length && !problems.length) console.log('문제 없음');

if (CHECK_ONLY) process.exit(changed || problems.length ? 1 : 0);
if (changed) {
  new Function(html.match(/const PHASES = \[[\s\S]*?\n  \];/)[0]); // 문법 검증
  fs.writeFileSync(FILE, html);
  console.log('\ninsights/insights.html 저장');
}
