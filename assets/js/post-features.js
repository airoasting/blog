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
function copyPrompt(btn) {
  var text = btn.previousElementSibling.textContent;
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = '복사됨';
    setTimeout(function() { btn.textContent = '복사'; }, 2000);
  });
}
