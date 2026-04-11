/* ═══════════════════════════════════════════
   AI ROASTING — filter.js
   카테고리 · 태그 필터 (posts-index.json 기반)
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

  let allPosts = [];
  let activeCategory = null;
  let activeTag = null;

  // --- Init from URL params ---
  function getParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get('category') || null,
      tag: params.get('tag') || null
    };
  }

  function updateURL() {
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (activeTag) params.set('tag', activeTag);
    const qs = params.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    window.history.replaceState(null, '', url);
  }

  // --- Render filter bar ---
  function renderFilterBar() {
    const container = document.getElementById('filterBar');
    if (!container) return;

    // Category tabs
    const categories = ['all', ...Object.keys(CATEGORY_LABELS)];
    const catHTML = categories.map(cat => {
      const label = cat === 'all' ? '전체' : CATEGORY_LABELS[cat];
      const isActive = cat === 'all' ? !activeCategory : activeCategory === cat;
      return `<button class="filter-tab${isActive ? ' active' : ''}"
                data-category="${cat}"
                ${cat !== 'all' ? `style="--cat-color: var(--cat-${cat})"` : ''}>
                ${label}
              </button>`;
    }).join('');

    // Collect unique tags from posts (source excluded — shown on cards separately)
    const allTags = new Set();
    allPosts.forEach(p => {
      if (p.tags) p.tags.forEach(t => allTags.add(t));
    });

    const tagHTML = Array.from(allTags).map(tag => {
      const isActive = activeTag === tag;
      return `<button class="filter-pill${isActive ? ' active' : ''}"
                data-tag="${tag}">#${tag}</button>`;
    }).join('');

    const nlTab = `<button class="filter-tab filter-tab-newsletter" data-category="newsletter" style="--cat-color:var(--cat-newsletter,#7C3AED)">뉴스레터</button>`;

    container.innerHTML = `
      <div class="filter-tabs">${catHTML}${nlTab}</div>
      <div class="filter-pills-wrap">
        <div class="filter-pills" id="filterPills">${tagHTML}</div>
        <button class="filter-pills-toggle" id="filterPillsToggle">전체 보기 +</button>
      </div>
    `;

    // Bind events
    container.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        if (cat === 'newsletter') {
          activeCategory = 'newsletter';
          updateURL();
          renderFilterBar();
          applyFilter();
          return;
        }
        activeCategory = cat === 'all' ? null : cat;
        updateURL();
        renderFilterBar();
        applyFilter();
      });
    });

    container.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        activeTag = activeTag === tag ? null : tag;
        updateURL();
        renderFilterBar();
        applyFilter();
      });
    });

    // Toggle button for pills collapse/expand
    var pills = document.getElementById('filterPills');
    var toggle = document.getElementById('filterPillsToggle');
    if (pills && toggle) {
      toggle.addEventListener('click', function () {
        var expanded = pills.classList.toggle('expanded');
        toggle.textContent = expanded ? '접기 −' : '전체 보기 +';
      });
    }
  }

  // --- Apply filter ---
  function applyFilter() {
    let filtered = allPosts;

    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (activeTag) {
      filtered = filtered.filter(p => p.tags && p.tags.includes(activeTag));
    }

    // Dispatch custom event for home.js to pick up
    window.dispatchEvent(new CustomEvent('postsFiltered', {
      detail: { posts: filtered, category: activeCategory, tag: activeTag }
    }));
  }

  // --- Listen for posts loaded ---
  window.addEventListener('postsLoaded', (e) => {
    allPosts = e.detail.posts || [];
    const params = getParams();
    activeCategory = params.category;
    activeTag = params.tag;
    renderFilterBar();
    if (activeCategory || activeTag) {
      applyFilter();
    }
  });

  // --- Also init on DOMContentLoaded if posts already loaded ---
  document.addEventListener('DOMContentLoaded', () => {
    // filter bar will render once postsLoaded event fires
  });

})();
