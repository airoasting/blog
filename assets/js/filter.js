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

    // Collect tags with counts
    const tagCount = {};
    allPosts.forEach(p => {
      if (p.tags) p.tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
    });

    const tagHTML = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => {
        const isActive = activeTag === tag;
        return `<button class="filter-pill${isActive ? ' active' : ''}" data-tag="${tag}">#${tag}<span class="filter-pill-count">${count}</span></button>`;
      }).join('');

    const nlTab = `<button class="filter-tab filter-tab-newsletter" data-category="newsletter" style="--cat-color:var(--cat-newsletter,#7C3AED)">뉴스레터</button>`;
    const hasActiveTag = !!activeTag;
    const wasOpen = document.getElementById('filterPillsWrap')?.classList.contains('open') || hasActiveTag;

    container.innerHTML = `
      <div class="filter-bar-row">
        <div class="filter-tabs-scroll"><div class="filter-tabs">${catHTML}${nlTab}</div></div>
        <button class="filter-pills-toggle${hasActiveTag ? ' has-active' : ''}${wasOpen ? ' open' : ''}" id="filterPillsToggle"># 태그</button>
      </div>
      <div class="filter-pills-wrap${wasOpen ? ' open' : ''}" id="filterPillsWrap">
        <div class="filter-pills" id="filterPills">${tagHTML}</div>
      </div>
    `;
    if (wasOpen) container.classList.add('pills-open');

    // Bind events
    container.querySelectorAll('.filter-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const barTop = container.getBoundingClientRect().top;
        const cat = btn.dataset.category;
        if (cat === 'newsletter') {
          activeCategory = 'newsletter';
        } else {
          activeCategory = cat === 'all' ? null : cat;
        }
        updateURL();
        renderFilterBar();
        applyFilter();
        window.scrollBy(0, container.getBoundingClientRect().top - barTop);
      });
    });

    container.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const barTop = container.getBoundingClientRect().top;
        const tag = btn.dataset.tag;
        activeTag = activeTag === tag ? null : tag;
        updateURL();
        renderFilterBar();
        applyFilter();
        window.scrollBy(0, container.getBoundingClientRect().top - barTop);
      });
    });

    // Toggle button for pills
    var wrap = document.getElementById('filterPillsWrap');
    var toggle = document.getElementById('filterPillsToggle');
    if (wrap && toggle) {
      // Keep open if a tag is active
      if (hasActiveTag) wrap.classList.add('open');
      toggle.addEventListener('click', function () {
        var open = wrap.classList.toggle('open');
        toggle.classList.toggle('open', open);
        document.getElementById('filterBar')?.classList.toggle('pills-open', open);
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

    // Always sort by date descending
    filtered = filtered.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

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
