#!/usr/bin/env node
/**
 * AI ROASTING - Post Creator Dashboard
 * Usage: node tools/create-post-server.js
 * Opens: http://localhost:3000
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3000;
const ROOT = path.join(__dirname, '..');

// ─── Category config ───
const CATEGORIES = {
  research: { ko: '리서치', color: '#1A1A1A' },
  leader:   { ko: '리더',   color: '#C43500' },
  company:  { ko: '기업',   color: '#1A4A7A' },
  tech:     { ko: '기술',   color: '#145C35' },
  survival: { ko: '생존',   color: '#7A1F1F' },
};

// ─── URL Fetcher ───
function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    };

    const req = client.get(options, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, targetUrl).toString();
        fetchUrl(redirectUrl).then(resolve).catch(reject);
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── HTML Content Extractor ───
function extractMetadata(html, sourceUrl) {
  const get = (pattern) => {
    const m = html.match(pattern);
    return m ? m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim() : '';
  };

  const title = get(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    || get(/<title[^>]*>([^<]+)<\/title>/i)
    || get(/<h1[^>]*>([^<]+)<\/h1>/i)
    || '';

  const description = get(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
    || get(/<meta\s+name="description"\s+content="([^"]+)"/i)
    || '';

  const siteName = get(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i) || '';

  // Extract main text content (strip tags, first 3000 chars)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let bodyText = '';
  if (bodyMatch) {
    bodyText = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);
  }

  // Generate slug from URL
  const urlPath = new URL(sourceUrl).pathname;
  const lastSegment = urlPath.split('/').filter(Boolean).pop() || '';
  let suggestedSlug = lastSegment
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  if (!suggestedSlug || suggestedSlug.length < 3) {
    suggestedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)
      .replace(/-$/, '');
  }

  const domain = new URL(sourceUrl).hostname.replace(/^www\./, '');

  return {
    title,
    description,
    siteName,
    domain,
    suggestedSlug,
    bodyText,
    sourceUrl,
  };
}

// ─── Post Creator ───
function createPost(data) {
  const { title, category, date, slug, tags, source, summary, roastingQuote, sourceUrl } = data;

  const fullSlug = `${date}-${slug}`;
  const imageDir = `${category}/images/${date.replace(/-/g, '_')}_${slug}`;
  const htmlFile = `${category}/${fullSlug}.html`;

  const imageDirAbs = path.join(ROOT, imageDir);
  const htmlFileAbs = path.join(ROOT, htmlFile);

  const results = [];

  // 1. Create image directory
  fs.mkdirSync(imageDirAbs, { recursive: true });
  results.push({ step: 'directory', status: 'ok', path: imageDir });

  // 2. Generate thumbnail
  try {
    const thumbPath = path.join(imageDirAbs, 'thumbnail.png');
    const pyScript = path.join(__dirname, 'generate-thumbnail.py');
    execSync(`python3 "${pyScript}" --category ${category} --output "${thumbPath}" --seed "${fullSlug}"`, {
      cwd: ROOT,
      timeout: 30000,
    });
    results.push({ step: 'thumbnail', status: 'ok', path: `${imageDir}/thumbnail.png` });
  } catch (err) {
    results.push({ step: 'thumbnail', status: 'error', message: err.message });
  }

  // 3. Create HTML file
  const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
  const catKo = CATEGORIES[category]?.ko || category;
  const tagsMeta = tagsArray.map(t => `  <meta property="article:tag" content="${t}">`).join('\n');
  const tagsHtml = tagsArray.map(t => `            <a href="../index.html?tag=${t}" class="post-tag">#${t}</a>`).join('\n');
  const tagsJson = JSON.stringify(tagsArray);

  const htmlContent = generateHtml({
    title, category, catKo, date, fullSlug, slug, imageDir,
    tagsArray, tagsMeta, tagsHtml, source, summary,
    roastingQuote, sourceUrl,
  });

  fs.writeFileSync(htmlFileAbs, htmlContent, 'utf-8');
  results.push({ step: 'html', status: 'ok', path: htmlFile });

  // 4. Update posts-index.json
  const indexPath = path.join(ROOT, 'posts-index.json');
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

  const newEntry = {
    title,
    date,
    category,
    source,
    tags: tagsArray,
    slug: fullSlug,
    file: htmlFile,
    summary,
    roasting_quote: roastingQuote,
    next_post: '',
  };

  // Add at the beginning
  indexData.posts.unshift(newEntry);
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2) + '\n', 'utf-8');
  results.push({ step: 'posts-index.json', status: 'ok' });

  // 5. Sync posts-data.js
  try {
    execSync('node sync-posts.js', { cwd: ROOT, timeout: 5000 });
    results.push({ step: 'posts-data.js', status: 'ok' });
  } catch (err) {
    results.push({ step: 'posts-data.js', status: 'error', message: err.message });
  }

  return {
    success: true,
    htmlFile,
    imageDir,
    results,
  };
}

// ─── HTML Template Generator ───
function generateHtml(d) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${d.title} | AI ROASTING</title>
  <meta name="description" content="${d.summary}">

  <!-- Open Graph -->
  <meta property="og:title" content="${d.title}">
  <meta property="og:description" content="${d.summary}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://airoasting.github.io/blog/${d.category}/${d.fullSlug}.html">
  <meta property="og:image" content="https://airoasting.github.io/blog/${d.imageDir}/thumbnail.png">
  <meta property="og:locale" content="ko_KR">
  <meta property="article:published_time" content="${d.date}">
  <meta property="article:section" content="${d.catKo}">
${d.tagsMeta}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${d.title}">
  <meta name="twitter:description" content="${d.summary}">
  <meta name="twitter:image" content="https://airoasting.github.io/blog/${d.imageDir}/thumbnail.png">

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;800&family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Stylesheet -->
  <link rel="stylesheet" href="../assets/css/style.css">

  <!-- JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${d.title}",
    "datePublished": "${d.date}",
    "author": { "@type": "Person", "name": "AI ROASTING" },
    "publisher": { "@type": "Organization", "name": "AI ROASTING", "url": "https://airoasting.github.io/blog/" },
    "description": "${d.summary}",
    "mainEntityOfPage": "https://airoasting.github.io/blog/${d.category}/${d.fullSlug}.html",
    "articleSection": "${d.catKo}"
  }
  </script>
</head>
<body>

  <!-- Header -->
  <header class="site-header">
    <div class="container">
      <div class="header-top">
        <a href="../index.html" class="site-logo">AI ROASTING</a>
        <div class="header-utils">
          <a href="../about/index.html" class="about-link">About</a>
          <button class="search-btn" id="searchBtn" aria-label="검색">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <div class="view-toggle">
            <button data-view="human" class="active">Human</button>
            <button data-view="ai">AI</button>
          </div>
          <button class="hamburger" id="hamburger" aria-label="메뉴 열기">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>
    <div class="nav-bar">
      <div class="container">
        <nav class="main-nav">
          <a href="../research/index.html" data-cat="research"${d.category === 'research' ? ' class="active"' : ''}>리서치</a>
          <a href="../leader/index.html" data-cat="leader"${d.category === 'leader' ? ' class="active"' : ''}>리더</a>
          <a href="../company/index.html" data-cat="company"${d.category === 'company' ? ' class="active"' : ''}>기업</a>
          <a href="../tech/index.html" data-cat="tech"${d.category === 'tech' ? ' class="active"' : ''}>기술</a>
          <a href="../survival/index.html" data-cat="survival"${d.category === 'survival' ? ' class="active"' : ''}>생존</a>
        </nav>
      </div>
    </div>
    <div class="mobile-nav container" id="mobileNav">
      <div class="mobile-search">
        <input type="text" class="mobile-search-input" id="mobileSearchInput" placeholder="검색어를 입력하세요" autocomplete="off">
      </div>
      <a href="../research/index.html">리서치</a>
      <a href="../leader/index.html">리더</a>
      <a href="../company/index.html">기업</a>
      <a href="../tech/index.html">기술</a>
      <a href="../survival/index.html">생존</a>
    </div>
  </header>

  <!-- Reading Progress Bar -->
  <div class="reading-progress-bar"><div class="reading-progress-fill"></div></div>

  <main>
    <!-- Mobile TOC -->
    <button class="toc-fab" id="tocFab" aria-label="목차">목차</button>
    <div class="toc-mobile-overlay" id="tocMobileOverlay">
      <ul class="toc-list">
        <li><a href="#section-summary" class="toc-link">3줄 요약</a></li>
        <li><a href="#section-roasting" class="toc-link">Roasting</a></li>
        <li><a href="#section-hook" class="toc-link">왜 읽어야 하나</a></li>
        <li><a href="#section-context" class="toc-link">왜 지금 중요한가</a></li>
        <li><a href="#section-insight" class="toc-link">핵심 인사이트</a></li>
        <li><a href="#section-cost" class="toc-link">비즈니스 비용</a></li>
        <li><a href="#section-action" class="toc-link">내일 당장</a></li>
        <li><a href="#section-risk" class="toc-link">리스크</a></li>
        <li><a href="#section-closing" class="toc-link">한 줄 정리</a></li>
        <li><a href="#section-decision" class="toc-link">결정 포인트</a></li>
        <li><a href="#section-references" class="toc-link">참고자료</a></li>
      </ul>
    </div>

    <article class="post" data-category="${d.category}">
      <!-- Thumbnail Hero -->
      <div class="post-thumbnail-hero" data-category="${d.category}">
        <div class="post-color-bar"></div>
        <img src="./images/${d.date.replace(/-/g, '_')}_${d.slug}/thumbnail.png" alt="${d.title} 썸네일" onerror="this.style.display='none'">
        <div class="post-hero-meta">
          <span class="post-category" data-category="${d.category}">${d.catKo}</span>
          <span class="post-date">${d.date}</span>
        </div>
        <div class="post-thumbnail-overlay">
          <h1 class="post-title" id="postTitle">${d.title}</h1>
        </div>
        <div class="post-hero-bottom">
          <div class="post-hero-source">
            <span>${d.source}</span>
            <span><a href="${d.sourceUrl}" target="_blank" rel="noopener">원문 보기 ↗</a></span>
          </div>
          <div class="post-hero-tags">
${d.tagsHtml}
          </div>
        </div>
      </div>

      <div class="post-body">

        <!-- [A] 3줄 요약 -->
        <section class="post-section" id="section-summary">
          <div class="post-section-label">3줄 요약</div>
          <div class="summary-box">
            <p data-summary="1">[TODO: 첫 번째 요약 문장]</p>
            <p data-summary="2">[TODO: 두 번째 요약 문장]</p>
            <p data-summary="3">[TODO: 세 번째 요약 문장]</p>
          </div>
        </section>

        <!-- [B] Roasting -->
        <section class="post-section" id="section-roasting">
          <div class="post-section-label">Roasting</div>
          <blockquote class="roasting-quote">
            ${d.roastingQuote || '[TODO: 도발적 코멘트]'}
          </blockquote>
        </section>

        <!-- [1] 이 글, 왜 읽어야 하나 -->
        <section class="post-section" id="section-hook">
          <div class="post-section-label">이 글, 왜 읽어야 하나</div>
          <p>[TODO: 훅 - 반직관 팩트, 현실 질문, 시간 압박, 비유 전환, 또는 손실 프레이밍 중 택 1]</p>
        </section>

        <!-- [2] 왜 지금 중요한가 -->
        <section class="post-section" id="section-context">
          <div class="post-section-label">왜 지금 중요한가</div>
          <p>[TODO: 시장 → 산업 → 독자 현실 순서로 좁혀 들어가기. 5문장 이내.]</p>
        </section>

        <!-- [3] 핵심 인사이트 -->
        <section class="post-section" id="section-insight">
          <div class="post-section-label">핵심 인사이트</div>
          <p>[TODO: 핵심 인사이트. 각 포인트는 <strong> 볼드 첫 문장 + 후속 설명 구조.]</p>
        </section>

        <!-- [3.5] 비즈니스 비용 -->
        <section class="post-section" id="section-cost">
          <div class="post-section-label">비즈니스 비용</div>
          <p>[TODO: 인사이트를 무시했을 때의 구체적 비용을 수치로 제시]</p>
        </section>

        <!-- [4] 내일 당장 할 수 있는 것 -->
        <section class="post-section" id="section-action">
          <div class="post-section-label">내일 당장 할 수 있는 것</div>
          <div class="action-steps">
            <div class="action-step">
              <span class="action-num">1</span>
              <div class="action-body">
                <p>[TODO: 구체적 행동 1]</p>
              </div>
            </div>
            <div class="action-step">
              <span class="action-num">2</span>
              <div class="action-body">
                <p>[TODO: 구체적 행동 2]</p>
              </div>
            </div>
            <div class="action-step">
              <span class="action-num">3</span>
              <div class="action-body">
                <p>[TODO: 구체적 행동 3]</p>
              </div>
            </div>
          </div>
        </section>

        <!-- [5] 리스크 & 주의점 -->
        <section class="post-section" id="section-risk">
          <div class="post-section-label">리스크 & 주의점</div>
          <p>[TODO: 기술 한계와 현실 제약을 솔직하게 작성]</p>
        </section>

        <!-- [6] 한 줄 정리 -->
        <section class="post-section" id="section-closing">
          <div class="post-section-label">한 줄 정리</div>
          <p>[TODO: 핵심 메시지 1~2문장 압축]</p>
        </section>

        <!-- [C] 리더의 결정 포인트 -->
        <section class="post-section" id="section-decision">
          <div class="post-section-label">리더의 결정 포인트</div>
          <div class="decision-points">
            <div class="decision-point">
              <span class="decision-role">창업자</span>
              <p>[TODO: 창업자 행동 지침 1문장]</p>
            </div>
            <div class="decision-point">
              <span class="decision-role">팀장</span>
              <p>[TODO: 팀장 행동 지침 1문장]</p>
            </div>
            <div class="decision-point">
              <span class="decision-role">임원</span>
              <p>[TODO: 임원 행동 지침 1문장]</p>
            </div>
          </div>
        </section>

        <!-- [D] 참고자료 -->
        <section class="post-section" id="section-references">
          <div class="post-section-label">참고자료</div>
          <ul class="references-list">
            <li><a href="${d.sourceUrl}" target="_blank" rel="noopener">${d.source}</a></li>
          </ul>
        </section>

      </div>
    </article>
  </main>

  <script src="../assets/js/posts-data.js"></script>
  <script src="../assets/js/post-features.js"></script>
  <script src="../assets/js/search.js"></script>
  <script src="../assets/js/ai-view.js"></script>
</body>
</html>`;
}

// ─── Dashboard HTML ───
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI ROASTING - Post Creator</title>
  <style>
    :root {
      --bg: #0d1117;
      --surface: #161b22;
      --surface2: #21262d;
      --border: #30363d;
      --text: #e6edf3;
      --text-dim: #8b949e;
      --accent: #58a6ff;
      --accent-hover: #79c0ff;
      --green: #3fb950;
      --red: #f85149;
      --orange: #d29922;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 0;
    }

    .header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: 0.05em;
    }

    .logo span { color: var(--accent); }

    .subtitle {
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .main {
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 20px;
    }

    .card-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 20px;
    }

    .input-row {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }

    .input-row:last-child { margin-bottom: 0; }

    label {
      display: block;
      font-size: 0.82rem;
      color: var(--text-dim);
      margin-bottom: 6px;
      font-weight: 500;
    }

    input, select, textarea {
      width: 100%;
      padding: 10px 14px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }

    input:focus, select:focus, textarea:focus {
      border-color: var(--accent);
    }

    textarea { resize: vertical; min-height: 80px; }

    .field { flex: 1; margin-bottom: 14px; }
    .field-sm { flex: 0 0 160px; margin-bottom: 14px; }

    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%238b949e' fill='none' stroke-width='1.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 24px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface2);
      color: var(--text);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }

    .btn:hover { border-color: var(--accent); color: var(--accent); }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: #fff; }

    .btn-full { width: 100%; justify-content: center; }

    .status-list {
      list-style: none;
      padding: 0;
    }

    .status-list li {
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-list li:last-child { border-bottom: none; }

    .status-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      flex-shrink: 0;
    }

    .status-ok { background: rgba(63, 185, 80, 0.15); color: var(--green); }
    .status-error { background: rgba(248, 81, 73, 0.15); color: var(--red); }
    .status-pending { background: rgba(210, 153, 34, 0.15); color: var(--orange); }

    .result-link {
      display: block;
      margin-top: 16px;
      padding: 12px 16px;
      background: rgba(88, 166, 255, 0.08);
      border: 1px solid rgba(88, 166, 255, 0.2);
      border-radius: 8px;
      color: var(--accent);
      text-decoration: none;
      font-size: 0.88rem;
      transition: background 0.15s;
    }

    .result-link:hover { background: rgba(88, 166, 255, 0.15); }

    .hidden { display: none !important; }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .cat-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fff;
    }

    .tag-input-wrap { position: relative; }
    .tag-hint {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin-top: 4px;
    }

    .divider {
      height: 1px;
      background: var(--border);
      margin: 20px 0;
    }

    @media (max-width: 600px) {
      .input-row { flex-direction: column; gap: 0; }
      .field-sm { flex: 1; }
      .main { padding: 20px 16px; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="container">
      <div class="logo">AI <span>ROASTING</span></div>
      <div class="subtitle">Post Creator</div>
    </div>
  </div>

  <div class="main">

    <!-- Step 1: URL Input -->
    <div class="card" id="step1">
      <div class="card-title">1. 소스 URL 입력</div>
      <div class="input-row">
        <div class="field">
          <input type="url" id="sourceUrl" placeholder="https://example.com/article" autofocus>
        </div>
        <div style="flex: 0 0 auto; padding-top: 0; display: flex; align-items: flex-end;">
          <button class="btn btn-primary" id="fetchBtn" onclick="fetchMetadata()">
            Fetch
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Metadata Edit -->
    <div class="card hidden" id="step2">
      <div class="card-title">2. 메타데이터 확인 & 수정</div>

      <div class="field">
        <label>제목</label>
        <input type="text" id="postTitle" placeholder="글 제목">
      </div>

      <div class="input-row">
        <div class="field-sm">
          <label>카테고리</label>
          <select id="postCategory">
            <option value="research">리서치</option>
            <option value="leader">리더</option>
            <option value="company">기업</option>
            <option value="tech">기술</option>
            <option value="survival">생존</option>
          </select>
        </div>
        <div class="field-sm">
          <label>날짜</label>
          <input type="date" id="postDate">
        </div>
        <div class="field">
          <label>Slug (영문, kebab-case)</label>
          <input type="text" id="postSlug" placeholder="my-article-slug">
        </div>
      </div>

      <div class="field">
        <label>출처</label>
        <input type="text" id="postSource" placeholder="HBR (Author Name)">
      </div>

      <div class="field">
        <label>태그 (쉼표 구분)</label>
        <input type="text" id="postTags" placeholder="AI전략, 임원, 창업자">
        <div class="tag-hint">쉼표로 구분하세요. 예: AI전략, 임원, 창업자</div>
      </div>

      <div class="field">
        <label>요약 (Summary)</label>
        <textarea id="postSummary" rows="2" placeholder="1~2문장 요약"></textarea>
      </div>

      <div class="field">
        <label>Roasting Quote</label>
        <textarea id="postRoasting" rows="2" placeholder="도발적 코멘트 1~2문장"></textarea>
      </div>

      <div class="divider"></div>

      <button class="btn btn-primary btn-full" id="createBtn" onclick="createPost()">
        포스트 생성
      </button>
    </div>

    <!-- Step 3: Results -->
    <div class="card hidden" id="step3">
      <div class="card-title">3. 생성 결과</div>
      <ul class="status-list" id="statusList"></ul>
      <div id="resultLinks"></div>
    </div>

  </div>

  <script>
    // Default date = today
    document.getElementById('postDate').value = new Date().toISOString().slice(0, 10);

    async function fetchMetadata() {
      const url = document.getElementById('sourceUrl').value.trim();
      if (!url) return alert('URL을 입력하세요.');

      const btn = document.getElementById('fetchBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Fetching...';

      try {
        const res = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        document.getElementById('postTitle').value = data.title || '';
        document.getElementById('postSlug').value = data.suggestedSlug || '';
        document.getElementById('postSource').value = data.siteName || data.domain || '';
        document.getElementById('postSummary').value = data.description || '';

        document.getElementById('step2').classList.remove('hidden');
        document.getElementById('postTitle').focus();
      } catch (err) {
        alert('Fetch 실패: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Fetch';
      }
    }

    async function createPost() {
      const btn = document.getElementById('createBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> 생성 중...';

      const data = {
        title: document.getElementById('postTitle').value.trim(),
        category: document.getElementById('postCategory').value,
        date: document.getElementById('postDate').value,
        slug: document.getElementById('postSlug').value.trim(),
        tags: document.getElementById('postTags').value.trim(),
        source: document.getElementById('postSource').value.trim(),
        summary: document.getElementById('postSummary').value.trim(),
        roastingQuote: document.getElementById('postRoasting').value.trim(),
        sourceUrl: document.getElementById('sourceUrl').value.trim(),
      };

      if (!data.title || !data.slug || !data.date) {
        alert('제목, Slug, 날짜는 필수입니다.');
        btn.disabled = false;
        btn.innerHTML = '포스트 생성';
        return;
      }

      try {
        const res = await fetch('/api/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (result.error) throw new Error(result.error);

        // Show results
        const statusList = document.getElementById('statusList');
        statusList.innerHTML = '';
        result.results.forEach(r => {
          const icon = r.status === 'ok' ? '\\u2713' : '\\u2717';
          const cls = r.status === 'ok' ? 'status-ok' : 'status-error';
          const detail = r.path ? ' \\u2014 ' + r.path : (r.message ? ' \\u2014 ' + r.message : '');
          statusList.innerHTML += '<li><span class="status-icon ' + cls + '">' + icon + '</span>' + r.step + detail + '</li>';
        });

        const linksDiv = document.getElementById('resultLinks');
        linksDiv.innerHTML = '';
        if (result.htmlFile) {
          linksDiv.innerHTML += '<a class="result-link" href="http://localhost:8080/' + result.htmlFile + '" target="_blank">\\uD83D\\uDCC4 ' + result.htmlFile + ' (localhost:8080)</a>';
        }

        document.getElementById('step3').classList.remove('hidden');
      } catch (err) {
        alert('생성 실패: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '포스트 생성';
      }
    }

    // Enter key on URL input triggers fetch
    document.getElementById('sourceUrl').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') fetchMetadata();
    });
  </script>

</body>
</html>`;

// ─── HTTP Server ───
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);

  // Dashboard
  if (req.method === 'GET' && parsed.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(DASHBOARD_HTML);
    return;
  }

  // Fetch URL metadata
  if (req.method === 'POST' && parsed.pathname === '/api/fetch-url') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { url: targetUrl } = JSON.parse(body);
        const html = await fetchUrl(targetUrl);
        const metadata = extractMetadata(html, targetUrl);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(metadata));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Create post
  if (req.method === 'POST' && parsed.pathname === '/api/create') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const result = createPost(data);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n  AI ROASTING - Post Creator Dashboard`);
  console.log(`  ────────────────────────────────────`);
  console.log(`  Dashboard:  http://localhost:${PORT}`);
  console.log(`  Blog:       http://localhost:8080`);
  console.log(`\n  Ctrl+C to stop\n`);
});
