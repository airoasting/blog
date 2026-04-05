/* ═══════════════════════════════════════════
   AI ROASTING — search.js
   Fuse.js 기반 퍼지 검색
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  const CATEGORY_LABELS = {
    research: '리서치',
    leader: '리더',
    company: '기업',
    tech: '기술',
    survival: '생존',
    newsletter: '뉴스레터'
  };

  // Detect URL prefix based on page depth
  const loc = window.location.pathname;
  const urlPrefix = /\/(research|leader|company|tech|survival|newsletter|about)\//.test(loc) ? '../' : './';

  let fuse = null;
  let allPosts = [];

  // --- Init Fuse.js ---
  function initSearch(posts) {
    allPosts = posts;
    fuse = new Fuse(posts, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'summary', weight: 0.3 },
        { name: 'source', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    });
  }

  // --- Render search results ---
  function renderResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = '<div class="search-no-result">검색 결과가 없습니다.</div>';
      return;
    }

    container.innerHTML = results.map(r => {
      const post = r.item || r;
      const catLabel = CATEGORY_LABELS[post.category] || post.category;
      const isExternal = !!post.url;
      const url = post.url || (urlPrefix + post.category + '/' + post.slug + '.html');
      const target = isExternal ? ' target="_blank" rel="noopener"' : '';
      return `
        <a href="${url}"${target} class="search-result-card" data-category="${post.category}">
          <span class="card-badge">${catLabel}</span>
          <span class="search-result-title">${post.title}</span>
          <span class="card-date">${post.date}</span>
        </a>
      `;
    }).join('');
  }

  // --- Toggle search overlay ---
  function openSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (overlay) {
      overlay.classList.add('open');
      if (input) {
        input.value = '';
        input.focus();
      }
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSearch() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    const results = document.getElementById('searchResults');
    if (results) results.innerHTML = '';
  }

  // --- Event bindings ---
  document.addEventListener('DOMContentLoaded', () => {
    // Search trigger
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', openSearch);
    }

    // Close button
    const closeBtn = document.getElementById('searchClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSearch);
    }

    // Click outside to close
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSearch();
      });
    }

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
    });

    // Live search on typing
    const input = document.getElementById('searchInput');
    if (input) {
      input.addEventListener('input', () => {
        const query = input.value.trim();
        if (!fuse || query.length < 2) {
          const results = document.getElementById('searchResults');
          if (results) results.innerHTML = '';
          return;
        }
        const matches = fuse.search(query).slice(0, 10);
        renderResults(matches);
      });
    }

    // Mobile search input — open overlay on focus
    const mobileInput = document.getElementById('mobileSearchInput');
    if (mobileInput) {
      mobileInput.addEventListener('focus', () => {
        openSearch();
        mobileInput.blur();
      });
    }
  });

  // --- Listen for posts data ---
  window.addEventListener('postsLoaded', (e) => {
    const posts = e.detail.posts || [];
    // Merge newsletter data if available
    const nlData = (window.NEWSLETTER_DATA || []).map(n => ({
      title: n.title,
      date: n.date,
      category: 'newsletter',
      slug: '',
      url: n.url,
      summary: '#' + n.ep + ' 뉴스레터'
    }));
    initSearch(posts.concat(nlData));
  });

})();
