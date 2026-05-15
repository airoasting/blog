const fs = require('fs');
const path = require('path');

function renderGraph(rootDir, outPath) {
  const baseHtml = fs.readFileSync(path.join(rootDir, 'insights/graph.html'), 'utf8');
  let html = baseHtml;

  html = html.replace(
    /<link rel="stylesheet" href="\.\.\/assets\/css\/style\.css">/,
    '<link rel="stylesheet" href="../assets/css/style.css">\n  <link rel="stylesheet" href="../assets/css/wiki.css">'
  );

  html = html.replace(/<title>[^<]*<\/title>/, '<title>Concept Graph · AI ROASTING · Blog</title>');

  const newScript = `
<!-- D3.js v7 -->
<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
(function() {
  'use strict';
  const CAT = {
    research:   { stroke: '#60A5FA', fill: 'rgba(96,165,250,0.18)',   text: '#93C5FD', badge: '#2563EB' },
    leader:     { stroke: '#FB923C', fill: 'rgba(251,146,60,0.18)',   text: '#FCA86A', badge: '#EA580C' },
    company:    { stroke: '#38BDF8', fill: 'rgba(56,189,248,0.18)',   text: '#67D4FC', badge: '#0284C7' },
    tech:       { stroke: '#4ADE80', fill: 'rgba(74,222,128,0.18)',   text: '#86EFAC', badge: '#16A34A' },
    survival:   { stroke: '#F87171', fill: 'rgba(248,113,113,0.18)', text: '#FCA5A5', badge: '#DC2626' },
    newsletter: { stroke: '#C084FC', fill: 'rgba(192,132,252,0.18)', text: '#D8B4FE', badge: '#9333EA' }
  };
  const CAT_LABEL = { research: '리서치', leader: '리더', company: '기업', tech: '기술', survival: '생존', newsletter: '뉴스레터' };
  const isMobile = ('ontouchstart' in window) || (window.innerWidth <= 768);
  const tooltip = document.getElementById('graphTooltip');

  function showTooltip(event, d) {
    const c = CAT[d.category] || CAT.research;
    tooltip.innerHTML = '<div class="tt-badge" style="background:' + c.badge + ';">' + (CAT_LABEL[d.category] || d.category) + '</div>'
      + '<div class="tt-title">' + d.name + '</div>'
      + '<div class="tt-meta">' + d.frequency + '개 콘텐츠에서 등장</div>'
      + '<div class="tt-meta" style="margin-top:8px;line-height:1.5;color:#555;">' + (d.definition || '') + '</div>'
      + '<div class="tt-connections">연결 개념 <span>' + d.degree + '</span>개 · 상위 ' + Math.min(d.degree, 6) + '개 강조</div>'
      + (isMobile ? '<a href="concepts/' + d.slug + '.html" style="display:inline-block;margin-top:10px;padding:7px 16px;background:' + c.badge + ';color:#fff;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">Wiki 페이지 열기 →</a>' : '');
    tooltip.classList.add('show');
    if (!isMobile) moveTooltip(event);
  }
  function moveTooltip(event) {
    if (isMobile) return;
    const pad = 16, tw = tooltip.offsetWidth || 300, th = tooltip.offsetHeight || 120;
    let x = event.clientX + pad, y = event.clientY + pad;
    if (x + tw > window.innerWidth - pad) x = event.clientX - tw - pad;
    if (y + th > window.innerHeight - pad) y = event.clientY - th - pad;
    tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
  }
  function hideTooltip() { tooltip.classList.remove('show'); }
  if (isMobile) {
    tooltip.style.pointerEvents = 'auto';
    document.addEventListener('touchstart', e => {
      if (!tooltip.contains(e.target) && !e.target.closest('circle, .g-node, svg')) hideTooltip();
    }, { passive: true });
  }

  fetch('concepts-data.json')
    .then(r => r.json())
    .then(data => buildWikiGraph(data))
    .catch(err => {
      const el = document.getElementById('graphLoading');
      if (el) el.innerHTML = '<div style="color:#F87171;font-size:14px;">데이터 로드 실패: ' + err.message + '</div>';
    });

  function buildWikiGraph(data) {
    const nameToSlug = new Map(data.concepts.map(c => [c.name, c.slug]));
    const nodes = data.concepts.map(c => ({
      id: c.slug, name: c.name, slug: c.slug, category: c.category || 'research',
      frequency: c.frequency, definition: c.definition
    }));
    const links = data.relationships.map(r => ({
      source: nameToSlug.get(r.source), target: nameToSlug.get(r.target), weight: r.strength
    })).filter(l => l.source && l.target);

    const wrap = document.querySelector('.graph-canvas-wrap');
    wrap.innerHTML = '<svg id="graphSvg"></svg>';
    const svg = d3.select('#graphSvg');
    const W = wrap.clientWidth, H = wrap.clientHeight;

    const rMin = isMobile ? 9 : 7;
    const rMax = isMobile ? 24 : 20;
    const maxFreq = d3.max(nodes, n => n.frequency) || 1;
    const rScale = d3.scaleSqrt().domain([0, maxFreq]).range([rMin, rMax]);
    nodes.forEach(n => { n.r = rScale(n.frequency); });

    const degreeMap = {};
    links.forEach(l => { degreeMap[l.source] = (degreeMap[l.source] || 0) + 1; degreeMap[l.target] = (degreeMap[l.target] || 0) + 1; });
    nodes.forEach(n => { n.degree = degreeMap[n.id] || 0; });
    const hubThreshold = d3.quantile(nodes.map(n => n.degree).sort(d3.ascending), 0.9) || 0;

    const stats = document.getElementById('graphStats');
    if (stats) stats.innerHTML = '<strong>' + nodes.length + '</strong>개 개념 · <strong>' + links.length + '</strong>개 관계';

    const g = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.2, 4]).on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);

    const link = g.append('g').selectAll('line').data(links).enter().append('line')
      .attr('class', 'g-link').attr('stroke', '#ffffff')
      .attr('stroke-width', d => Math.max(0.5, Math.min(3, d.weight * 0.5)));

    const node = g.append('g').selectAll('g').data(nodes).enter().append('g')
      .attr('class', d => 'g-node' + (d.degree >= hubThreshold && hubThreshold > 0 ? ' hub' : '') + (d.degree <= 1 ? ' isolated' : ''))
      .on('click', (e, d) => { if (!isMobile) window.location.href = 'concepts/' + d.slug + '.html'; })
      .on('mouseover', (e, d) => { highlight(d); showTooltip(e, d); })
      .on('mousemove', (e) => moveTooltip(e))
      .on('mouseout', () => { unhighlight(); if (!isMobile) hideTooltip(); });

    node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => CAT[d.category].fill)
      .attr('stroke', d => CAT[d.category].stroke)
      .attr('stroke-width', 1.5);

    node.append('text').attr('class', 'node-label')
      .attr('y', d => d.r + 14)
      .attr('font-size', d => Math.max(10, Math.min(14, d.r * 0.7)))
      .attr('fill', d => CAT[d.category].text)
      .text(d => d.name);

    function highlight(d) {
      const linked = new Set([d.id]);
      const myEdges = links
        .filter(l => (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id)
        .sort((a, b) => b.weight - a.weight).slice(0, 6);
      myEdges.forEach(l => {
        linked.add(typeof l.source === 'object' ? l.source.id : l.source);
        linked.add(typeof l.target === 'object' ? l.target.id : l.target);
      });
      node.classed('faded', n => !linked.has(n.id)).classed('highlighted', n => n.id === d.id);
      link.classed('faded', l => !myEdges.includes(l)).classed('highlighted', l => myEdges.includes(l));
    }
    function unhighlight() {
      node.classed('faded', false).classed('highlighted', false);
      link.classed('faded', false).classed('highlighted', false);
    }

    d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80).strength(d => Math.min(0.6, d.weight * 0.1)))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide(d => d.r + 6))
      .on('tick', () => {
        link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
        node.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');
      });

    const resetBtn = document.getElementById('zoomReset');
    if (resetBtn) resetBtn.onclick = () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
  }
})();
</script>
</body>
</html>`;

  const scriptStart = html.indexOf('<!-- D3.js v7 -->');
  if (scriptStart === -1) throw new Error('Could not find D3.js script marker in insights/graph.html');
  const bodyEnd = html.lastIndexOf('</body>');
  html = html.slice(0, scriptStart) + newScript;

  fs.writeFileSync(outPath, html);
}

module.exports = { renderGraph };
