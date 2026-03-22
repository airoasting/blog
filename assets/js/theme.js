/* ═══════════════════════════════════════════
   AI ROASTING — theme.js
   라이트/다크 테마 토글 + localStorage 저장
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  function getPreferred() {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateIcon(theme);
  }

  function updateIcon(theme) {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var sun = btn.querySelector('.theme-icon-sun');
    var moon = btn.querySelector('.theme-icon-moon');
    if (sun) sun.style.display = theme === 'dark' ? 'block' : 'none';
    if (moon) moon.style.display = theme === 'dark' ? 'none' : 'block';
  }

  function init() {
    var theme = getPreferred();
    apply(theme);

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') || 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        apply(next);
      });
    }

    // OS 테마 변경 감지 (수동 설정이 없을 때만)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem('theme')) {
        apply(e.matches ? 'dark' : 'light');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
