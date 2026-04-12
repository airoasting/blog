/* ═══════════════════════════════════════════
   AI ROASTING — header.js
   헤더 컴포넌트 (검색 · 다크모드 토글 · 햄버거)
   ═══════════════════════════════════════════ */

(function () {
  var loc = window.location.pathname;
  var prefix = './';
  if (/\/(research|leader|company|tech|survival|newsletter|about|insights)\//.test(loc)) {
    prefix = '../';
  }

  var config = window.HEADER_CONFIG || {};
  var activeCat = config.activeCat || '';

  function navLink(cat, label) {
    var cls = cat === activeCat ? ' class="active"' : '';
    return '<a href="' + prefix + cat + '/index.html" data-cat="' + cat + '"' + cls + '>' + label + '</a>';
  }

  function mobileLink(cat, label) {
    return '<a href="' + prefix + cat + '/index.html">' + label + '</a>';
  }

  var html =
    '<div class="container">' +
      '<div class="header-top">' +
        '<a href="' + prefix + 'index.html" class="site-logo">AI ROASTING</a>' +
        '<div class="header-utils">' +
          '<button class="search-btn" id="searchBtn" aria-label="검색">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="11" cy="11" r="8"></circle>' +
              '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
            '</svg>' +
          '</button>' +
          '<button class="theme-toggle" id="themeToggle" aria-label="테마 전환">' +
            '<svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="12" r="5"></circle>' +
              '<line x1="12" y1="1" x2="12" y2="3"></line>' +
              '<line x1="12" y1="21" x2="12" y2="23"></line>' +
              '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>' +
              '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>' +
              '<line x1="1" y1="12" x2="3" y2="12"></line>' +
              '<line x1="21" y1="12" x2="23" y2="12"></line>' +
              '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>' +
              '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' +
            '</svg>' +
            '<svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' +
            '</svg>' +
          '</button>' +
          '<button class="hamburger" id="hamburger" aria-label="메뉴 열기">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="nav-bar">' +
      '<div class="container">' +
        '<nav class="main-nav">' +
          navLink('research', '리서치') +
          navLink('leader', '리더') +
          navLink('company', '기업') +
          navLink('tech', '기술') +
          navLink('survival', '생존') +
          '<a href="' + prefix + 'newsletter/index.html" class="nav-newsletter' + (activeCat === 'newsletter' ? ' active' : '') + '">뉴스레터</a>' +
          '<a href="' + prefix + 'insights/graph.html" class="nav-graph' + (activeCat === 'graph' ? ' active' : '') + '">지식 그래프</a>' +
        '</nav>' +
      '</div>' +
    '</div>' +
    '<div class="mobile-nav container" id="mobileNav">' +
      '<div class="mobile-search">' +
        '<input type="text" class="mobile-search-input" id="mobileSearchInput" placeholder="검색어를 입력하세요" autocomplete="off">' +
      '</div>' +
      mobileLink('research', '리서치') +
      mobileLink('leader', '리더') +
      mobileLink('company', '기업') +
      mobileLink('tech', '기술') +
      mobileLink('survival', '생존') +
      '<a href="' + prefix + 'newsletter/index.html">뉴스레터</a>' +
      '<a href="' + prefix + 'insights/graph.html">지식 그래프</a>' +
    '</div>';

  var header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = html;
  }

  // Format post dates: "2026-03-17" → "2026년 3월 17일"
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.post-date').forEach(function (el) {
      var raw = el.textContent.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        var parts = raw.split('-');
        el.textContent = parts[0] + '년 ' + parseInt(parts[1], 10) + '월 ' + parseInt(parts[2], 10) + '일';
      }
    });
  });

  // Hamburger toggle
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
    });
  }
})();
