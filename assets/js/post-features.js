/* Reading Progress Bar */
(function() {
  const fill = document.querySelector('.reading-progress-fill');
  if (!fill) return;

  // Set category color
  const post = document.querySelector('.post[data-category]');
  if (post) {
    const colors = {
      research: '#2D7FF9',
      leader: '#111',
      company: '#E8590C',
      tech: '#7048E8',
      survival: '#D6336C'
    };
    const cat = post.getAttribute('data-category');
    if (colors[cat]) fill.style.background = colors[cat];
  }

  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    fill.style.width = progress + '%';
  });
})();

/* Smooth Scroll for TOC links */
(function() {
  function smoothScrollTo(targetId) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var start = window.scrollY;
    var end = target.getBoundingClientRect().top + window.scrollY - 80;
    var distance = end - start;
    var duration = Math.min(800, Math.max(400, Math.abs(distance) * 0.4));
    var startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.addEventListener('click', function(e) {
    var link = e.target.closest('.toc-link');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href[0] !== '#') return;
    e.preventDefault();
    smoothScrollTo(href.slice(1));
  });
})();

/* TOC Sidebar + Mobile FAB */
(function() {
  var fab = document.getElementById('tocFab');
  var overlay = document.getElementById('tocMobileOverlay');

  if (fab && overlay) {
    fab.addEventListener('click', function() {
      overlay.classList.toggle('open');
    });
    overlay.querySelectorAll('.toc-link').forEach(function(link) {
      link.addEventListener('click', function() {
        overlay.classList.remove('open');
      });
    });
  }

  // Show FAB only after scrolling past hero
  var hero = document.querySelector('.post-thumbnail-hero');
  var heroBottom = hero ? hero.offsetTop + hero.offsetHeight + 40 : 300;

  function updateFabVisibility() {
    var show = window.scrollY > heroBottom;
    if (fab) {
      fab.style.opacity = show ? '1' : '0';
      fab.style.visibility = show ? 'visible' : 'hidden';
      fab.style.pointerEvents = show ? 'auto' : 'none';
    }
  }

  // Active section highlighting
  var sections = document.querySelectorAll('.post-section[id]');
  var tocLinks = document.querySelectorAll('.toc-link');

  function updateActive() {
    var scrollPos = window.scrollY + 120;
    var current = '';
    sections.forEach(function(section) {
      if (section.offsetTop <= scrollPos) {
        current = section.id;
      }
    });
    tocLinks.forEach(function(link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', function() {
    updateFabVisibility();
    if (sections.length > 0 && tocLinks.length > 0) updateActive();
  });
  updateFabVisibility();
  if (sections.length > 0 && tocLinks.length > 0) updateActive();
})();

/* Prompt Copy */
function copyLink() {
  var url = (typeof PAGE_URL !== 'undefined') ? PAGE_URL : window.location.href;
  navigator.clipboard.writeText(url).then(function() {
    document.querySelectorAll('.share-btn[onclick="copyLink()"]').forEach(function(btn) {
      btn.textContent = '링크 복사됨 ✓';
      setTimeout(function() { btn.textContent = '링크 복사'; }, 2000);
    });
  });
}

function copyPrompt(btn) {
  var text = btn.previousElementSibling.textContent;
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = '복사됨';
    setTimeout(function() { btn.textContent = '복사'; }, 2000);
  });
}
