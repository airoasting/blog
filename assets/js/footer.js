(function () {
  var loc = window.location.pathname;
  var prefix = './';
  if (/\/(research|leader|company|tech|survival|about|newsletter)\//.test(loc)) {
    prefix = '../';
  }

  var html =
    '<div class="footer-inner">' +
      '<div class="footer-grid">' +
        '<div>' +
          '<div class="footer-brand">AI ROASTING</div>' +
          '<p class="footer-desc">AI 시대를 살아남는 비즈니스 리더를 위한 인사이트</p>' +
          '<a href="https://www.linkedin.com/newsletters/ai-%EB%A1%9C%EC%8A%A4%ED%8C%85-7321517076899127296/" target="_blank" rel="noopener" class="footer-newsletter-btn"><span class="footer-newsletter-brand">AI ROASTING</span> 뉴스레터 구독하기</a>' +
        '</div>' +
        '<div>' +
          '<div class="footer-heading">카테고리</div>' +
          '<ul class="footer-links">' +
            '<li><a href="' + prefix + 'research/index.html">리서치</a></li>' +
            '<li><a href="' + prefix + 'leader/index.html">리더</a></li>' +
            '<li><a href="' + prefix + 'company/index.html">기업</a></li>' +
            '<li><a href="' + prefix + 'tech/index.html">기술</a></li>' +
            '<li><a href="' + prefix + 'survival/index.html">생존</a></li>' +
          '</ul>' +
        '</div>' +
        '<div>' +
          '<div class="footer-heading">정보</div>' +
          '<ul class="footer-links">' +
            '<li><a href="' + prefix + 'about/index.html">프로젝트 소개</a></li>' +
          '</ul>' +
          '<div class="footer-heading footer-social-heading">소셜</div>' +
          '<div class="footer-social">' +
            '<a href="https://www.linkedin.com/in/jayden-kang/" target="_blank" rel="noopener" aria-label="LinkedIn">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' +
            '</a>' +
            '<a href="https://www.facebook.com/jayden.kang" target="_blank" rel="noopener" aria-label="Facebook">' +
              '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="footer-heading">아카이브</div>' +
          '<ul class="footer-links" id="footer-archive"></ul>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '<span>&copy; 2026 AI ROASTING. All rights reserved.</span>' +
      '<div class="footer-ai-toggle">' +
        '<div class="view-toggle footer-view-toggle">' +
          '<button data-view="human" class="active">Human</button>' +
          '<button data-view="ai">AI</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  var footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = html;
  }

  // Build archive from posts data
  function buildArchive(posts) {
    var counts = {};
    posts.forEach(function (p) {
      var ym = p.date.substring(0, 7); // "2026-03"
      counts[ym] = (counts[ym] || 0) + 1;
    });

    // Group by year
    var years = {};
    Object.keys(counts).forEach(function (ym) {
      var y = ym.split('-')[0];
      if (!years[y]) years[y] = [];
      years[y].push(ym);
    });

    var currentYear = new Date().getFullYear().toString();
    var sortedYears = Object.keys(years).sort().reverse();

    var archiveEl = document.getElementById('footer-archive');
    if (!archiveEl) return;

    var html = '';
    sortedYears.forEach(function (year) {
      var months = years[year].sort().reverse();
      var yearTotal = months.reduce(function (sum, ym) { return sum + counts[ym]; }, 0);
      var isOpen = year === currentYear;

      html += '<li class="footer-archive-year' + (isOpen ? ' open' : '') + '">';
      html += '<button class="footer-archive-toggle" type="button">';
      html += '<span>' + year + '년</span>';
      html += ' <span class="footer-archive-count">' + yearTotal + '</span>';
      html += '<svg class="footer-archive-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>';
      html += '</button>';
      html += '<ul class="footer-archive-months"' + (isOpen ? '' : ' style="display:none"') + '>';
      months.forEach(function (ym) {
        var m = parseInt(ym.split('-')[1], 10);
        var href = prefix + 'index.html?archive=' + ym;
        html += '<li><a href="' + href + '">' + m + '월 <span class="footer-archive-count">' + counts[ym] + '</span></a></li>';
      });
      html += '</ul></li>';
    });

    archiveEl.innerHTML = html;

    // Toggle listeners
    archiveEl.querySelectorAll('.footer-archive-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var li = btn.parentElement;
        var months = li.querySelector('.footer-archive-months');
        var isOpen = li.classList.contains('open');
        if (isOpen) {
          li.classList.remove('open');
          months.style.display = 'none';
        } else {
          li.classList.add('open');
          months.style.display = '';
        }
      });
    });
  }

  // Combine posts + newsletters for archive counts
  function buildCombined(posts, newsletters) {
    var combined = posts.slice();
    (newsletters || []).forEach(function (nl) {
      combined.push({ date: nl.date });
    });
    buildArchive(combined);
  }

  function loadAndBuild(posts) {
    // Try window.NEWSLETTER_DATA first (available on pages that loaded it)
    if (window.NEWSLETTER_DATA) {
      buildCombined(posts, window.NEWSLETTER_DATA);
    } else {
      fetch(prefix + 'newsletter-index.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { buildCombined(posts, d.newsletters || []); })
        .catch(function () { buildArchive(posts); });
    }
  }

  if (window.POSTS_DATA && window.POSTS_DATA.posts) {
    loadAndBuild(window.POSTS_DATA.posts);
  } else {
    fetch(prefix + 'posts-index.json')
      .then(function (r) { return r.json(); })
      .then(function (d) { loadAndBuild(d.posts || []); })
      .catch(function () {});
  }
})();
