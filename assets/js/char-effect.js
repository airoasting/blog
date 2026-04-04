/* ─────────────────────────────────────────────
   char-effect.js  — Shared interactive char canvas
   Used by: home.js, category index pages
   ───────────────────────────────────────────── */
(function(global) {
  'use strict';

  const CHARS    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=/<>';
  const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
  const CAT_RGB  = {
    research: '122,64,48',
    leader:   '196,53,0',
    company:  '26,74,122',
    tech:     '20,92,53',
    survival: '122,31,31'
  };

  function rndChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  /* Wave scramble: chars resolve left→right */
  function scrambleWave(el, orig, frames, interval) {
    let f = 0;
    const t = setInterval(() => {
      const p = f / frames;
      el.textContent = orig.split('').map((ch, i) => {
        if (ch === ' ' || ch === '\u00a0' || ch === ':') return ch;
        if (p > (i / orig.length) * 0.78 + 0.17) return ch;
        return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }).join('');
      if (++f > frames) {
        clearInterval(t);
        el.textContent = orig;
        el._scrambling = false;
      }
    }, interval);
  }

  /* ── Hero interactive (home index) ── */
  function initHero(hero, cat) {
    const canvas = hero.querySelector('.hero-char-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const FS = 13, RADIUS = 110, R2 = RADIUS * RADIUS;
    const accentRGB = CAT_RGB[cat] || '26,26,26';

    let tX = -9999, tY = -9999, cX = -9999, cY = -9999;
    let decay = 0, decayTimer = null, rafId = null;
    let cols, rows, grid;

    function setup() {
      canvas.width  = hero.clientWidth;
      canvas.height = hero.clientHeight;
      cols = Math.floor(canvas.width  / FS);
      rows = Math.floor(canvas.height / FS);
      grid = Array.from({length: rows}, () =>
        Array.from({length: cols}, () => rndChar())
      );
    }

    function draw() {
      if (!canvas.isConnected) { cancelAnimationFrame(rafId); return; }
      const isDark = document.documentElement.dataset.theme === 'dark';
      const base = isDark ? '255,255,255' : '26,26,26';

      cX += (tX - cX) * 0.11;
      cY += (tY - cY) * 0.11;

      if (Math.random() < 0.55) {
        grid[Math.floor(Math.random() * rows)][Math.floor(Math.random() * cols)] = rndChar();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FS - 1}px 'Courier New', monospace`;
      ctx.textBaseline = 'top';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * FS, y = r * FS;
          const dx = x + FS/2 - cX, dy = y + FS/2 - cY;
          const d2 = dx*dx + dy*dy;

          if (d2 < R2 && decay > 0.01) {
            const t = (1 - Math.sqrt(d2) / RADIUS) * decay;
            ctx.fillStyle = t > 0.45
              ? `rgba(${accentRGB},${t * 0.48})`
              : `rgba(${base},${0.10 + t * 0.30})`;
            if (Math.random() < t * 0.18) grid[r][c] = rndChar();
          } else {
            ctx.fillStyle = `rgba(${base},0.10)`;
          }
          ctx.fillText(grid[r][c], x, y);
        }
      }
      rafId = requestAnimationFrame(draw);
    }

    setup();
    draw();

    function onMouseMove(e) {
      const rect = hero.getBoundingClientRect();
      tX = e.clientX - rect.left;
      tY = e.clientY - rect.top;
      decay = 1;
      if (decayTimer) { clearInterval(decayTimer); decayTimer = null; }
    }

    function onMouseLeave() {
      if (decayTimer) clearInterval(decayTimer);
      decayTimer = setInterval(() => {
        decay *= 0.78;
        if (decay < 0.01) {
          decay = 0; tX = tY = cX = cY = -9999;
          clearInterval(decayTimer); decayTimer = null;
        }
      }, 30);
    }

    function onMouseEnter() {
      decay = 1;
      if (decayTimer) { clearInterval(decayTimer); decayTimer = null; }
      const titleEl = hero.querySelector('.featured-hero-title');
      if (titleEl && !titleEl._scrambling) {
        titleEl._scrambling = true;
        scrambleWave(titleEl, titleEl.textContent, 22, 28);
      }
    }

    // Scramble title on initial load
    const titleElInit = hero.querySelector('.featured-hero-title');
    if (titleElInit && !titleElInit._scrambling) {
      titleElInit._scrambling = true;
      scrambleWave(titleElInit, titleElInit.textContent, 22, 28);
    }

    hero.addEventListener('mouseenter', onMouseEnter);
    hero.addEventListener('mousemove',  onMouseMove);
    hero.addEventListener('mouseleave', onMouseLeave);

    return function cleanup() {
      cancelAnimationFrame(rafId);
      if (decayTimer) clearInterval(decayTimer);
      hero.removeEventListener('mouseenter', onMouseEnter);
      hero.removeEventListener('mousemove',  onMouseMove);
      hero.removeEventListener('mouseleave', onMouseLeave);
    };
  }

  /* ── Card interactive (home + category pages) ── */
  function initCard(card) {
    if (card._charInited) return;
    card._charInited = true;

    const canvas = card.querySelector('.card-char-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const FS = 11, RADIUS = 80, R2 = RADIUS * RADIUS;
    const cat = card.dataset.category || '';
    const accentRGB = CAT_RGB[cat] || '26,26,26';

    let tX = -9999, tY = -9999, cX = -9999, cY = -9999;
    let decay = 0, decayTimer = null, rafId = null, ambientTimer = null;
    let cols, rows, grid;

    function setup() {
      if (!card.clientWidth) return;
      canvas.width  = card.clientWidth;
      canvas.height = card.clientHeight;
      cols = Math.floor(canvas.width  / FS);
      rows = Math.floor(canvas.height / FS);
      grid = Array.from({length: rows}, () =>
        Array.from({length: cols}, () => rndChar())
      );
    }

    function drawAmbient() {
      if (!canvas.isConnected) { stopAmbient(); return; }
      if (!cols || !rows) return;
      const isDark = document.documentElement.dataset.theme === 'dark';
      const base = isDark ? '255,255,255' : '26,26,26';
      grid[Math.floor(Math.random() * rows)][Math.floor(Math.random() * cols)] = rndChar();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FS - 1}px 'Courier New', monospace`;
      ctx.textBaseline = 'top';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = `rgba(${base},0.038)`;
          ctx.fillText(grid[r][c], c * FS, r * FS);
        }
      }
    }

    function startAmbient() {
      if (ambientTimer) return;
      ambientTimer = setInterval(drawAmbient, 120);
    }

    function stopAmbient() {
      if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; }
    }

    function draw() {
      if (!canvas.isConnected) { cancelAnimationFrame(rafId); return; }
      const isDark = document.documentElement.dataset.theme === 'dark';
      const base = isDark ? '255,255,255' : '26,26,26';

      cX += (tX - cX) * 0.14;
      cY += (tY - cY) * 0.14;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FS - 1}px 'Courier New', monospace`;
      ctx.textBaseline = 'top';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * FS, y = r * FS;
          const dx = x + FS/2 - cX, dy = y + FS/2 - cY;
          const d2 = dx*dx + dy*dy;

          if (d2 < R2 && decay > 0.01) {
            const t = (1 - Math.sqrt(d2) / RADIUS) * decay;
            ctx.fillStyle = t > 0.32
              ? `rgba(${accentRGB},${t * 0.45})`
              : `rgba(${base},${0.038 + t * 0.28})`;
            if (Math.random() < t * 0.15) grid[r][c] = rndChar();
          } else {
            ctx.fillStyle = `rgba(${base},0.038)`;
          }
          ctx.fillText(grid[r][c], x, y);
        }
      }
      rafId = requestAnimationFrame(draw);
    }

    requestAnimationFrame(() => { setup(); startAmbient(); });

    card.addEventListener('mouseenter', () => {
      stopAmbient();
      decay = 1;
      if (decayTimer) { clearInterval(decayTimer); decayTimer = null; }
      if (!cols) setup();
      if (!rafId) draw();

      const titleEl = card.querySelector('.card-title');
      if (titleEl && !titleEl._scrambling) {
        titleEl._scrambling = true;
        scrambleWave(titleEl, titleEl.textContent, 16, 28);
      }
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      tX = e.clientX - rect.left;
      tY = e.clientY - rect.top;
    });

    card.addEventListener('mouseleave', () => {
      tX = tY = -9999;
      if (decayTimer) clearInterval(decayTimer);
      decayTimer = setInterval(() => {
        decay *= 0.75;
        if (decay < 0.01) {
          decay = 0; cX = cY = -9999;
          clearInterval(decayTimer); decayTimer = null;
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          startAmbient();
        }
      }, 30);
    });
  }

  function initCards(container) {
    (container || document).querySelectorAll('.card').forEach(initCard);
    initReveal(container);
  }

  /* ── Scroll Reveal via IntersectionObserver ── */
  let _revealObserver = null;

  function initReveal(container) {
    if (!_revealObserver) {
      _revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            _revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    }

    const scope = container || document;
    scope.querySelectorAll('.card:not(.revealed)').forEach(el => _revealObserver.observe(el));
    scope.querySelectorAll('.featured-hero:not(.revealed)').forEach(el => _revealObserver.observe(el));
  }

  /* ── Post title scramble (content pages) ── */
  function initPostTitle(container) {
    const titleEl = (container || document).querySelector('.post-title');
    if (!titleEl) return;
    const orig = titleEl.textContent;

    // Initial scramble on load
    scrambleWave(titleEl, orig, 24, 30);

    // Hover scramble
    titleEl.addEventListener('mouseenter', function() {
      if (!titleEl._scrambling) {
        titleEl._scrambling = true;
        scrambleWave(titleEl, orig, 18, 28);
      }
    });

    titleEl.style.cursor = 'default';
  }

  /* ── Section title scramble (index pages) ── */
  function initSectionTitle() {
    const titleEl = document.querySelector('.section-title');
    if (!titleEl) return;
    // Only scramble the text node, not child elements (post-count badge)
    const textNode = Array.from(titleEl.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
    if (!textNode) return;
    const orig = textNode.textContent;
    let f = 0, frames = 20, interval = 30;
    const t = setInterval(() => {
      const p = f / frames;
      textNode.textContent = orig.split('').map((ch, i) => {
        if (ch === ' ') return ch;
        if (p > (i / orig.length) * 0.78 + 0.17) return ch;
        return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }).join('');
      if (++f > frames) { clearInterval(t); textNode.textContent = orig; }
    }, interval);
  }

  /* ── Card titles staggered scramble on page load ── */
  function initCardTitles(container) {
    const cards = Array.from((container || document).querySelectorAll('.card'));
    cards.forEach((card, i) => {
      const titleEl = card.querySelector('.card-title');
      if (!titleEl) return;
      const orig = titleEl.textContent;
      setTimeout(() => {
        if (!titleEl._scrambling) {
          titleEl._scrambling = true;
          scrambleWave(titleEl, orig, 14, 28);
        }
      }, i * 60);
    });
  }

  global.CharEffect = { initHero, initCard, initCards, initReveal, scrambleWave, initPostTitle, initSectionTitle, initCardTitles };
})(window);
