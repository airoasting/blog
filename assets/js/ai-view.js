/* ═══════════════════════════════════════════
   AI ROASTING — ai-view.js
   포스트 페이지 AI 뷰: 까만 바탕 + 마크다운 원본
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  function initPostAiView() {
    const toggleBtns = document.querySelectorAll('.view-toggle button');
    const overlay = document.getElementById('aiMdOverlay');
    const closeBtn = document.getElementById('aiMdClose');
    let currentView = 'human';

    if (!overlay || !toggleBtns.length) return;

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        if (view === currentView) return;

        toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
        currentView = view;

        if (view === 'ai') {
          showMd(overlay);
        } else {
          hideMd(overlay);
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.toggle('active', b.dataset.view === 'human'));
        currentView = 'human';
        hideMd(overlay);
      });
    }
  }

  function showMd(overlay) {
    const content = document.getElementById('aiMdContent');
    if (!content) return;

    // Read data from the page's data attributes
    const data = document.getElementById('postData');
    if (!data) return;

    const d = data.dataset;
    const lines = [
      '---',
      'title: ' + (d.title || ''),
      'date: ' + (d.date || ''),
      'category: ' + (d.category || ''),
      'source: ' + (d.source || ''),
      'tags: [' + (d.tags || '') + ']',
      'original_url: ' + (d.originalUrl || ''),
      'roasting_quote: "' + (d.roastingQuote || '') + '"',
    ];
    if (d.nextPost) lines.push('next_post: ' + d.nextPost);
    lines.push('---');
    lines.push('');

    // All sections
    const sections = document.querySelectorAll('.post-section');
    sections.forEach(section => {
      const label = section.querySelector('.post-section-label');
      if (!label) return;
      const title = label.textContent.trim();
      lines.push('## ' + title);

      // Decision points (special structure)
      const points = section.querySelectorAll('.decision-point');
      if (points.length) {
        points.forEach(p => {
          const role = p.querySelector('.decision-role');
          const text = p.querySelector('span:last-child');
          if (role && text) {
            lines.push(role.textContent + ': ' + text.textContent);
          }
        });
        lines.push('');
        return;
      }

      // Roasting blockquote
      const quote = section.querySelector('#roastingQuote');
      if (quote) {
        lines.push('"' + quote.textContent.replace(/\n/g, '\n ') + '"');
        lines.push('');
        return;
      }

      // References list
      const listItems = section.querySelectorAll('li');
      if (listItems.length) {
        listItems.forEach(li => lines.push('- ' + li.textContent.trim()));
        lines.push('');
        return;
      }

      // Regular paragraphs
      const paragraphs = section.querySelectorAll('p');
      paragraphs.forEach(p => lines.push(p.textContent));
      lines.push('');
    });

    content.innerHTML = renderLines(lines);
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function hideMd(overlay) {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  function renderLines(lines) {
    return lines.map((line, i) => {
      const num = i + 1;
      const colored = colorize(line);
      return '<div class="md-line"><span class="line-num">' + num + '</span><span class="line-text">' + colored + '</span></div>';
    }).join('');
  }

  function colorize(line) {
    const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (esc === '---') return '<span class="fm-delimiter">---</span>';
    if (/^##\s/.test(esc)) return '<span class="md-heading">' + esc + '</span>';
    if (/^"/.test(esc)) return '<span class="md-quote">' + esc + '</span>';
    if (/^(\w[\w_]*):/.test(esc)) {
      const idx = esc.indexOf(':');
      return '<span class="fm-key">' + esc.slice(0, idx) + '</span>:<span class="fm-value">' + esc.slice(idx + 1) + '</span>';
    }
    return esc || '&nbsp;';
  }

  document.addEventListener('DOMContentLoaded', initPostAiView);
})();
