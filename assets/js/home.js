/* ═══════════════════════════════════════════
   AI ROASTING — home.js
   홈 목록 · 스켈레톤 · Human/AI 토글
   페이지네이션 · 필터 연동 · 시리즈 배지
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const CATEGORY_LABELS = {
    research: '리서치',
    leader: '리더',
    company: '기업',
    tech: '기술',
    survival: '생존'
  };

  const PAGE_SIZE = 10;
  const DECODE_CHARS = '01/\\|▓▒░█⌗';
  const DECODE_SPEED = 40;

  // --- Source tag helper ---
  const SOURCE_SHORT = {
    'HBR': 'HBR',
    'BCG': 'BCG',
    'a16z': 'a16z',
    'Anthropic': 'Anthropic',
    'Google DeepMind': 'DeepMind',
    'NeurIPS': 'NeurIPS',
    'Financial Times': 'FT',
    'The Guardian': 'The Guardian',
    'trueup.io': 'TrueUp',
    'World Economic Forum': 'WEF',
    'GitHub': 'GitHub',
    'Societies': 'MDPI'
  };

  function getSourceTag(source) {
    if (!source) return '';
    for (var key in SOURCE_SHORT) {
      if (source.indexOf(key) !== -1) return SOURCE_SHORT[key];
    }
    return source.split('(')[0].split(':')[0].trim();
  }

  // --- DOM refs ---
  const skeletonGrid = document.getElementById('skeletonGrid');
  const postGrid = document.getElementById('postGrid');
  const emptyState = document.getElementById('emptyState');
  const featuredHero = document.getElementById('featuredHero');
  const aiBanner = document.getElementById('aiBanner');
  const toggleBtns = document.querySelectorAll('.view-toggle button');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  const postCountEl = document.getElementById('postCount');

  let currentView = 'human';
  let postsData = [];
  let displayedPosts = [];  // currently filtered/full list
  let visibleCount = 0;
  let isArchiveMode = false;

  // --- Load posts (from global or fetch) ---
  async function loadPosts() {
    try {
      let data;
      if (window.POSTS_DATA) {
        data = window.POSTS_DATA;
      } else {
        const res = await fetch('./posts-index.json');
        data = await res.json();
      }
      postsData = data.posts || [];

      // Sort by date descending
      postsData.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Check for archive filter from URL
      const archiveParam = new URLSearchParams(window.location.search).get('archive');
      let renderList = postsData;

      if (archiveParam && /^\d{4}-\d{2}$/.test(archiveParam)) {
        isArchiveMode = true;
        renderList = postsData.filter(p => p.date.substring(0, 7) === archiveParam);
        const parts = archiveParam.split('-');
        const archiveLabel = parts[0] + '년 ' + parseInt(parts[1], 10) + '월';
        const archiveHeader = document.getElementById('archiveHeader');
        if (archiveHeader) {
          archiveHeader.innerHTML =
            '<h2 class="section-title">' + archiveLabel + ' <span class="post-count">총 ' + renderList.length + '개</span></h2>' +
            '<p class="section-desc">아카이브</p>';
          archiveHeader.style.display = '';
        }
        // Hide filter bar and section header in archive mode
        const filterBar = document.getElementById('filterBar');
        if (filterBar) filterBar.style.display = 'none';
        const sectionHeader = document.querySelector('#posts > .section-header');
        if (sectionHeader) sectionHeader.style.display = 'none';
      }

      // Render featured hero with the most recent post
      if (renderList.length > 0) {
        renderFeaturedHero(renderList[0]);
      }

      displayedPosts = renderList.slice(1); // exclude featured hero post
      visibleCount = 0;
      updatePostCount(renderList.length);
      showMore();

      // Dispatch event for filter.js and search.js
      window.dispatchEvent(new CustomEvent('postsLoaded', {
        detail: { posts: postsData }
      }));
    } catch (e) {
      console.warn('posts-index.json 로드 실패:', e);
      if (skeletonGrid) skeletonGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    }
  }

  // --- Show more (pagination) ---
  function showMore() {
    const nextBatch = displayedPosts.slice(visibleCount, visibleCount + PAGE_SIZE);
    visibleCount += nextBatch.length;

    if (visibleCount === nextBatch.length) {
      // First batch — replace
      renderPosts(displayedPosts.slice(0, visibleCount));
    } else {
      // Append
      appendPosts(nextBatch);
    }

    updateLoadMoreBtn();
  }

  function updatePostCount(total) {
    if (postCountEl) postCountEl.textContent = '총 ' + total + '개';
  }

  function updateLoadMoreBtn() {
    if (!loadMoreBtn) return;
    if (visibleCount >= displayedPosts.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }

  // --- Featured Hero ---
  function getThumbnailPath(post) {
    // slug: "2026-03-05-brain-fry" → "2026_03_05_brain-fry"
    const parts = post.slug.split('-');
    const dirName = parts[0] + '_' + parts[1] + '_' + parts[2] + '_' + parts.slice(3).join('-');
    return './' + post.category + '/images/' + dirName + '/thumbnail.png';
  }

  function renderFeaturedHero(post) {
    if (!featuredHero) return;
    const catLabel = CATEGORY_LABELS[post.category] || post.category;
    const url = './' + post.category + '/' + post.slug + '.html';
    const thumbPath = getThumbnailPath(post);

    featuredHero.innerHTML = `
      <a href="${url}" class="featured-hero-link">
        <div class="featured-hero-image">
          <img src="${thumbPath}" alt="${post.title}" onerror="this.parentElement.classList.add('no-image')">
          <div class="featured-hero-overlay">
            <span class="featured-hero-badge">${catLabel}</span>
            <span class="featured-hero-date">${post.date}</span>
          </div>
        </div>
        <div class="featured-hero-content">
          <h2 class="featured-hero-title">${post.title.replace(/: /g, ':\u00a0')}</h2>
          <p class="featured-hero-summary">${post.summary || ''}</p>
          ${post.source ? `<span class="featured-hero-source-tag">${getSourceTag(post.source)}</span>` : ''}
        </div>
      </a>
    `;
    featuredHero.style.display = 'block';
  }

  // --- Render cards ---
  function renderPosts(posts) {
    if (!postGrid) return;

    if (posts.length === 0) {
      if (skeletonGrid) skeletonGrid.style.display = 'none';
      postGrid.style.display = 'none';
      if (emptyState && !isArchiveMode) emptyState.style.display = 'block';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    postGrid.innerHTML = posts.map(postToCard).join('');

    if (skeletonGrid) skeletonGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    postGrid.style.display = 'grid';
  }

  function appendPosts(posts) {
    if (!postGrid) return;
    postGrid.insertAdjacentHTML('beforeend', posts.map(postToCard).join(''));
  }

  function postToCard(post) {
    const catLabel = CATEGORY_LABELS[post.category] || post.category;
    const url = './' + post.category + '/' + post.slug + '.html';
    const thumbPath = getThumbnailPath(post);

    // Series badge
    let seriesBadge = '';
    if (post.series) {
      const order = post.series_order ? ` #${post.series_order}` : '';
      seriesBadge = `<span class="card-series-badge">${post.series}${order}</span>`;
    }

    // Format date as "YYYY년 M월 D일"
    const d = new Date(post.date + 'T00:00:00');
    const dateStr = d.getFullYear() + '년 ' + (d.getMonth()+1) + '월 ' + d.getDate() + '일';

    return `
      <a href="${url}" class="card" data-category="${post.category}">
        <div class="card-thumb">
          <img src="${thumbPath}" alt="${post.title}" onerror="this.parentElement.classList.add('no-image'); this.remove();">
        </div>
        <div class="card-meta">
          <span class="card-badge">${catLabel}</span>
          <span class="card-date">${dateStr}</span>
        </div>
        ${seriesBadge}
        <div class="card-title">${post.title.replace(/: /g, ':\u00a0')}</div>
        ${post.source ? `<span class="card-source-tag">${getSourceTag(post.source)}</span>` : ''}
      </a>
    `;
  }

  // --- Filter event listener ---
  window.addEventListener('postsFiltered', (e) => {
    if (isArchiveMode) return;
    const filtered = e.detail.posts || [];
    if (filtered.length > 0) {
      renderFeaturedHero(filtered[0]);
      displayedPosts = filtered.slice(1); // exclude featured hero post
    } else {
      if (featuredHero) featuredHero.style.display = 'none';
      displayedPosts = [];
    }
    visibleCount = 0;
    updatePostCount(filtered.length);
    showMore();

    // When hero is showing a result but cards are empty, hide empty state
    if (filtered.length > 0 && displayedPosts.length === 0) {
      if (emptyState) emptyState.style.display = 'none';
      if (postGrid) postGrid.style.display = 'none';
    }
  });

  // --- Human / AI Toggle ---
  function initToggle() {
    const overlay = document.getElementById('aiMdOverlay');
    const closeBtn = document.getElementById('aiMdClose');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view === currentView) return;

        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = view;

        if (view === 'ai') {
          showAiMarkdown(overlay);
        } else {
          hideAiMarkdown(overlay);
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // Switch back to Human
        toggleBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.view === 'human');
        });
        currentView = 'human';
        hideAiMarkdown(overlay);
      });
    }
  }

  // --- AI Markdown View ---
  function showAiMarkdown(overlay) {
    if (!overlay) return;
    const content = document.getElementById('aiMdContent');
    if (!content) return;

    // Build markdown text from posts data
    const md = buildPostsMarkdown();
    content.innerHTML = renderMdWithLineNumbers(md);
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function hideAiMarkdown(overlay) {
    if (!overlay) return;
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function buildPostsMarkdown() {
    const lines = [];
    postsData.forEach(post => {
      lines.push('---');
      lines.push('title: ' + post.title);
      lines.push('date: ' + post.date);
      lines.push('category: ' + post.category);
      lines.push('source: ' + (post.source || ''));
      lines.push('tags: [' + (post.tags || []).join(', ') + ']');
      lines.push('slug: ' + post.slug);
      lines.push('roasting_quote: "' + (post.roasting_quote || '') + '"');
      if (post.next_post) lines.push('next_post: ' + post.next_post);
      lines.push('---');
      lines.push('');
      lines.push('## 3줄 요약');
      if (post.summary) {
        post.summary.split(/[.。]\s*/).filter(Boolean).forEach(s => {
          lines.push(s.trim() + (s.endsWith('.') || s.endsWith('다') ? '' : '.'));
        });
      }
      lines.push('');
      lines.push('## Roasting');
      lines.push('"' + (post.roasting_quote || '') + '"');
      lines.push('');
      lines.push('');
    });
    return lines;
  }

  function renderMdWithLineNumbers(lines) {
    return lines.map((line, i) => {
      const num = i + 1;
      const colored = colorizeMdLine(line);
      return `<div class="md-line"><span class="line-num">${num}</span><span class="line-text">${colored}</span></div>`;
    }).join('');
  }

  function colorizeMdLine(line) {
    const esc = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    if (esc === '---') return '<span class="fm-delimiter">---</span>';
    if (/^##\s/.test(esc)) return '<span class="md-heading">' + esc + '</span>';
    if (/^"/.test(esc)) return '<span class="md-quote">' + esc + '</span>';
    if (/^(\w[\w_]*):/.test(esc)) {
      const idx = esc.indexOf(':');
      return '<span class="fm-key">' + esc.slice(0, idx) + '</span>:<span class="fm-value">' + esc.slice(idx + 1) + '</span>';
    }
    return esc || '&nbsp;';
  }

  // --- Load More button ---
  function initLoadMore() {
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', showMore);
    }
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    initToggle();
    initLoadMore();
  });

})();
