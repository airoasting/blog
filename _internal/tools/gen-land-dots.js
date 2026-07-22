/* 세계 지도 육지 도트 격자 생성기 (insights/graph.html의 LAND_DOTS 데이터 원본)
   equal-area 근사 격자를 point-in-polygon으로 육지 판정 → [lon, lat] 배열 출력

   사용법:
   1. curl -sL "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json" -o world.geo.json
   2. node gen-land-dots.js  → land-dots.json 생성
   3. land-dots.json 내용을 insights/graph.html의 `const LAND_DOTS = [...]` 자리에 교체

   주의: 대륙 분류 함수(continent)는 graph.html의 continentOf와 동일하게 유지할 것. */
const fs = require('fs');
const geo = require('./world.geo.json');

/* point-in-polygon (ray casting) */
function inRing(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}
function inPolygon(pt, coords) {
  /* coords: [outerRing, hole1, ...] */
  if (!inRing(pt, coords[0])) return false;
  for (let k = 1; k < coords.length; k++) {
    if (inRing(pt, coords[k])) return false;
  }
  return true;
}

/* 전체 폴리곤 목록 + bbox 준비 */
const polys = [];
geo.features.forEach(f => {
  if (f.id === 'ATA') return; // 남극 제외
  const g = f.geometry;
  if (!g) return;
  const list = g.type === 'Polygon' ? [g.coordinates]
             : g.type === 'MultiPolygon' ? g.coordinates : [];
  list.forEach(coords => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    coords[0].forEach(([x, y]) => {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    });
    polys.push({ coords, bbox: [minX, minY, maxX, maxY] });
  });
});

function isLand(lon, lat) {
  for (const p of polys) {
    const [a, b, c, d] = p.bbox;
    if (lon < a || lon > c || lat < b || lat > d) continue;
    if (inPolygon([lon, lat], p.coords)) return true;
  }
  return false;
}

/* 격자 샘플링: 위도 고정 스텝, 경도는 cos(lat) 보정으로 equal-area 근사 */
const LAT_STEP = 1.9;
const LON_BASE = 1.9;
const dots = [];
for (let lat = -55.5; lat <= 74.5; lat += LAT_STEP) {
  const lonStep = LON_BASE / Math.max(0.25, Math.cos(lat * Math.PI / 180));
  const offset = ((lat / LAT_STEP) % 2) * lonStep / 2; // 격자 지그재그
  for (let lon = -180 + offset; lon <= 180; lon += lonStep) {
    if (isLand(lon, lat)) {
      dots.push([Math.round(lon * 10) / 10, Math.round(lat * 10) / 10]);
    }
  }
}

console.error('total dots:', dots.length);

/* 대륙 분류 (lon/lat 박스, 근사) */
function continent(lon, lat) {
  if (lat >= 12 && lon >= -170 && lon <= -52) return 'NA';   // 북아메리카
  if (lat < 12 && lon >= -90 && lon <= -30) return 'SA';     // 남아메리카
  if (lat >= 34 && lon >= -25 && lon < 42 ) return 'EU';     // 유럽
  if (lat < 34 && lon >= -20 && lon < 52 && lat >= -40) return 'AF'; // 아프리카 (사하라 포함)
  if (lat < -8 && lon >= 110) return 'OC';                   // 오세아니아
  if (lon >= 42 || lon <= -170) return 'AS';                 // 아시아
  return 'AF';
}
const byCont = {};
dots.forEach(([lon, lat]) => {
  const c = continent(lon, lat);
  byCont[c] = (byCont[c] || 0) + 1;
});
console.error('by continent:', byCont);

/* 출력: 압축 배열 */
fs.writeFileSync('land-dots.json', JSON.stringify(dots));
console.error('written land-dots.json,', (JSON.stringify(dots).length / 1024).toFixed(1), 'KB');
