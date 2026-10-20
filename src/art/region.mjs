// v15 region viewer: draws one surveyed campus region (src/regions/*.mjs, metres,
// from wenzhotw/nccu100) in the top-down 3/4 faceted style. Ground is flat on the
// page; anything with height rises straight up by h * M * K.
import { P, SHADOW } from './palette.mjs';
import * as S from './sprites.mjs';

export const M = 28;   // world units per metre (walkers are drawn ≈ 2.5 m tall: cartoon scale)
const ACTOR = 72;
const K = .62;         // how much a metre of height rises on screen
const X = x => x * M, Y = z => z * M, H = h => h * M * K;

/* ---------- characters: the original faceted sheets, recoloured ---------- */
const SHEETS = { human: 'assets/flat/human/sheet-transparent.webp', pangolin: 'assets/flat/pangolin/sheet-transparent.webp', curl: 'assets/flat/curl/curl-1.webp' };
const ROW = { east: 0, west: 1, south: 2, north: 3 };
const OUTFITS = { student: null, guard: { hat: [45, 74, 107], pack: [52, 80, 107] }, jogger: { hat: [228, 93, 76], pack: [63, 111, 181] }, reader: { hat: [90, 156, 110], pack: [242, 184, 75] } };
const sheets = {}, art = {};
// Original pangolin-game illustrations reused as-is in the region.
const ART = { booth: 'assets/campus/gatehouse-v12.webp', tree: 'assets/flat/tree.webp', bush: 'assets/flat/pack/pack-1.webp', board: 'assets/flat/pack/pack-2.webp', cat: 'assets/campus/quest-cat.webp', grass: 'assets/campus/grass.webp' };
function hsv(r, g, b) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return [0, 0, mx / 255]; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, d / mx, mx / 255]; }
function recolour(img, outfit) {
  const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const x = cv.getContext('2d'); x.drawImage(img, 0, 0); if (!outfit) return cv;
  const data = x.getImageData(0, 0, cv.width, cv.height), px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 10) continue;
    const [h, sat, v] = hsv(px[i], px[i + 1], px[i + 2]);
    const t = sat > .45 && v > .3 ? (h >= 32 && h <= 58 ? outfit.hat : h >= 2 && h < 32 ? outfit.pack : null) : null;
    if (t) { const k = v / .85; px[i] = Math.min(255, t[0] * k); px[i + 1] = Math.min(255, t[1] * k); px[i + 2] = Math.min(255, t[2] * k); }
  }
  x.putImageData(data, 0, 0); return cv;
}
const ready = Promise.all(Object.entries({ ...SHEETS, ...ART }).map(([k, url]) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok([k, i]); i.onerror = fail; i.src = url; })))
  .then(list => { const raw = Object.fromEntries(list); for (const [n, o] of Object.entries(OUTFITS)) sheets[n] = recolour(raw.human, o); sheets.pangolin = raw.pangolin; sheets.curl = raw.curl; for (const k of Object.keys(ART)) art[k] = raw[k]; });
function actor(c, sheet, row, col, x, y, size) {
  if (!sheets[sheet]) return;
  c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 4, y + 1, size * .24, size * .07, 0, 0, 7); c.fill();
  c.drawImage(sheets[sheet], col * 128, row * 128, 128, 128, x - size / 2, y - size * .91, size, size);
}

/* ---------- SVG sprite cache ---------- */
const cache = new Map(); let raster = 1;
function sprite(c, key, make, x, y, scale = 1, flip = false) {
  const k = `${key}@${raster * scale}`;
  if (!cache.has(k)) { const s = make(), img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(S.svgMarkup(s, raster * scale)); cache.set(k, { img, s }); }
  const { img, s } = cache.get(k); if (!img.complete) return;
  c.save(); c.translate(x, y); if (flip) c.scale(-1, 1); c.drawImage(img, -s.w * scale / 2, -s.h * scale, s.w * scale, s.h * scale); c.restore();
}

/* ---------- drawing helpers ---------- */
const fill = (c, col) => { c.fillStyle = P[col] ?? col; };
function rect(c, x0, y0, x1, y1, col) { fill(c, col); c.fillRect(x0, y0, x1 - x0, y1 - y0); }
function poly(c, pts, col) { fill(c, col); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); }
function shadowRect(c, x0, x1, zS, w = .9) { c.fillStyle = SHADOW; c.fillRect(X(x0) + 6, Y(zS) - 2, X(x1) - X(x0), M * w * .45); }
/** A box seen from above and the south: top face lifted by its height, front face below it. */
function box(c, x0, x1, zN, zS, h0, h1, top, front, edge) {
  rect(c, X(x0), Y(zN) - H(h1), X(x1), Y(zS) - H(h1), top);
  rect(c, X(x0), Y(zS) - H(h1), X(x1), Y(zS) - H(h0), front);
  if (edge) rect(c, X(x0), Y(zS) - H(h1), X(x1), Y(zS) - H(h1) + 3, edge);
}
function text(c, t, x, y, font, col, align = 'center') { c.save(); fill(c, col); c.font = font; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(t, x, y); c.restore(); }
const SERIF = '"Noto Serif TC","Songti TC","PingFang TC",serif', SANS = '"PingFang TC","Noto Sans TC",system-ui,sans-serif';

/* ---------- ground ---------- */
let grassTile = null, seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
function grass(c) {
  if (!grassTile && art.grass) { grassTile = c.createPattern(art.grass, 'repeat'); return grassTile; }
  if (!grassTile) {
    const t = document.createElement('canvas'); t.width = t.height = 240; const g = t.getContext('2d');
    g.fillStyle = P.grass; g.fillRect(0, 0, 240, 240); seed = 41;
    for (let i = 0; i < 900; i++) { const x = rand() * 240, y = rand() * 240, h = 6 + rand() * 11, w = 1.1 + rand() * 1.5; g.fillStyle = rand() < .55 ? P.bladeDark : P.bladeLight; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + (rand() - .5) * 2, y - h); g.lineTo(x + w, y); g.fill(); }
    for (let i = 0; i < 2; i++) { g.fillStyle = P.flowerYellow; g.beginPath(); g.arc(rand() * 240, rand() * 240, 2.2, 0, 7); g.fill(); }
    grassTile = c.createPattern(t, 'repeat');
  }
  return grassTile;
}
const JOINT = { sidewalk: 'sidewalkJoint', paver: 'origStoneJoint' };
// The original game's ground colours (landscape.mjs): asphalt, stone, kerb.
const TONE = { road: 'origAsphalt', asphalt: 'origAsphalt', paver: 'origStone', paverRing: 'origStone', paint: 'origCrossing' };
function drawGround(c, region, t) {
  c.fillStyle = grass(c); c.fillRect(X(region.bounds.x0) - 2000, Y(region.bounds.z0) - 2000, X(region.bounds.x1 - region.bounds.x0) + 4000, Y(region.bounds.z1 - region.bounds.z0) + 4000);
  for (const g of region.ground) {
    if (g.type === 'rect') {
      rect(c, X(g.x0), Y(g.z0), X(g.x1), Y(g.z1), TONE[g.fill] ?? g.fill);
      if (g.joints) { c.globalAlpha = .55; fill(c, JOINT[g.fill] ?? 'paverJoint'); const j = g.fill === 'paver' ? 1.5 : g.joints; for (let x = g.x0; x < g.x1; x += j) c.fillRect(X(x), Y(g.z0), 1, Y(g.z1) - Y(g.z0)); if (g.fill === 'paver') for (let z = g.z0; z < g.z1; z += j) c.fillRect(X(g.x0), Y(z), X(g.x1) - X(g.x0), 1); c.globalAlpha = 1; }
    } else if (g.type === 'circle') {
      fill(c, 'origBorder'); c.beginPath(); c.arc(X(g.x), Y(g.z), X(g.r) + 6, 0, 7); c.fill();
      fill(c, TONE[g.fill] ?? g.fill); c.beginPath(); c.arc(X(g.x), Y(g.z), X(g.r), 0, 7); c.fill();
      c.strokeStyle = P.origStoneJoint; c.lineWidth = 1; for (let r = 1; r < g.r; r += .9) { c.beginPath(); c.arc(X(g.x), Y(g.z), X(r), 0, 7); c.stroke(); }
    } else if (g.type === 'road') {
      const pts = []; for (let x = g.from; x <= g.to; x += 2) pts.push([x, g.z(x)]);
      c.lineCap = 'butt'; c.lineJoin = 'round';
      c.strokeStyle = P.origBorder; c.lineWidth = X(g.width) + 12; c.beginPath(); pts.forEach(([x, z], i) => (i ? c.lineTo(X(x), Y(z)) : c.moveTo(X(x), Y(z)))); c.stroke();
      c.strokeStyle = P.origAsphalt; c.lineWidth = X(g.width); c.stroke();
    } else if (g.type === 'zebra') {
      fill(c, 'origCrossing'); for (let z = g.z0; z < g.z1; z += g.step) { if (z > g.skip[0] && z < g.skip[1]) continue; c.fillRect(X(g.x0), Y(z), X(g.x1) - X(g.x0), M * g.bar); }
    } else if (g.type === 'zebraX') {
      fill(c, 'origCrossing'); for (let x = g.x0; x < g.x1; x += 1) c.fillRect(X(x), Y(g.z - g.depth / 2), M * .5, M * g.depth);
    } else if (g.type === 'dashes') {
      fill(c, g.fill); for (let x = g.from; x < g.to; x += g.every) if (x < g.gap[0] || x > g.gap[1]) c.fillRect(X(x), Y(g.z) - 3, X(g.len), 6);
    } else if (g.type === 'curb') {
      rect(c, X(g.x0), Y(g.z) - 6, X(g.x1), Y(g.z) + 6, 'origBorder'); rect(c, X(g.x0), Y(g.z) + 4, X(g.x1), Y(g.z) + 6, 'curbShade');
    } else if (g.type === 'roadText') {
      text(c, g.text, X(g.x), Y(g.z), `900 ${M * .95}px ${SANS}`, 'paint');
    }
  }
}

/* ---------- objects (each returns its south edge for depth sorting) ---------- */
/* ---------- illustrated objects, in the original game's 3/4 style ----------
   Like gatehouse-v12 and gate-1: front face toward the viewer, the east side and the
   top visible, flat colours (top lightest, side darkest) and a thin dark outline. */
const OUT = 1.6;
/** Projection for one object: a = metres east along its front, b = metres back (north), h = metres up. */
const iso = (ox, oy) => (a, b, h) => [ox + a * M + b * M * .42, oy + a * M * .1 - b * M * .3 - h * M * .74];
function face(c, pts, col, line = true) {
  fill(c, col); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
  if (line) { c.strokeStyle = P.outline; c.lineWidth = OUT; c.lineJoin = 'round'; c.stroke(); }
}
function ibox(c, p, a0, a1, b0, b1, h0, h1, [top, front, side], line = true) {
  face(c, [p(a0, b0, h0), p(a1, b0, h0), p(a1, b0, h1), p(a0, b0, h1)], front, line);
  face(c, [p(a1, b0, h0), p(a1, b1, h0), p(a1, b1, h1), p(a1, b0, h1)], side, line);
  face(c, [p(a0, b0, h1), p(a1, b0, h1), p(a1, b1, h1), p(a0, b1, h1)], top, line);
}
/** A rectangle painted on the front face (b = b0). */
const onFront = (c, p, b, a0, a1, h0, h1, col, line = false) => face(c, [p(a0, b, h0), p(a1, b, h0), p(a1, b, h1), p(a0, b, h1)], col, line);
const onSide = (c, p, a, b0, b1, h0, h1, col, line = false) => face(c, [p(a, b0, h0), p(a, b1, h0), p(a, b1, h1), p(a, b0, h1)], col, line);
function window(c, p, b, a0, a1, h0, h1) {
  onFront(c, p, b - .01, a0 - .08, a1 + .08, h0 - .08, h1 + .08, 'frame', true);
  onFront(c, p, b - .02, a0, a1, h0, h1, 'glassTeal');
  onFront(c, p, b - .03, a0 + (a1 - a0) * .15, a0 + (a1 - a0) * .4, h0 + (h1 - h0) * .2, h1 - (h1 - h0) * .1, 'glassTealLight');
}
function groundShadow(c, pts) { c.fillStyle = SHADOW; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); }
function img(c, key, x, y, w) { const i = art[key]; if (!i) return; const h = w * i.height / i.width; c.drawImage(i, x - w / 2, y - h, w, h); }

const BANNER = [['bannerRed', '政'], ['bannerYellow', 'N']];
const DRAW = {
  gatehouse(c, o) {
    // two-storey red-brick gatehouse under a wide concrete canopy (nccu100 main-gate)
    const { cx, dir } = o, p = iso(X(cx - 3.5), Y(14.5)), inner = dir > 0 ? 0 : 7;
    groundShadow(c, [p(0, 0, 0), p(7.6, 0, 0), p(9, 3, 0), p(9, 7, 0), p(1, 7, 0)].map(([x, y]) => [x + 10, y + 4]));
    ibox(c, p, 0, 7, 0, 5, 0, 5.4, ['brickTop', 'brickFront', 'brickSide']);
    c.save(); c.globalAlpha = .35; for (let h = .45; h < 5.4; h += .45) { const [x0, y0] = p(0, 0, h), [x1, y1] = p(7, 0, h), [x2, y2] = p(7, 5, h); c.strokeStyle = P.brickSide; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); c.stroke(); } c.restore();
    onFront(c, p, 0, 0, 7, 0, .5, 'brickBase', true);
    // ground-floor passage on the avenue side, with one brick pillar
    const pa0 = Math.min(inner, inner - 2.1 * (inner ? 1 : -1)), pa1 = Math.max(inner, inner - 2.1 * (inner ? 1 : -1));
    onFront(c, p, -.01, pa0, pa1, 0, 2.6, 'passage', true);
    const pil = inner ? 6.7 : .3; onFront(c, p, -.02, pil - .3, pil + .3, 0, 2.6, 'brickFront', true);
    onFront(c, p, -.03, pil - .22, pil + .22, 1.75, 1.97, 'busBlue');
    // windows: four upstairs, two downstairs on the outer side
    [1.3, 2.75, 4.25, 5.7].forEach(a => window(c, p, 0, a - .5, a + .5, 4.05, 4.85));
    (inner ? [1, 1.9] : [5.1, 6]).forEach(a => window(c, p, 0, a - .4, a + .4, 1.05, 2.15));
    [1.2, 2.6, 3.9].forEach(b => onSide(c, p, 7.01, b - .4, b + .4, 4.05, 4.85, 'glassTeal', true));
    onFront(c, p, -.01, 0, 7, 2.55, 2.68, 'brickSide');
    // concrete canopy: thick slab, lighter recessed panel on top
    ibox(c, p, -1.7, 8.7, -.4, 6.7, 5.4, 6.4, ['concreteTopLight', 'concreteFront', 'concreteSide']);
    face(c, [p(-1.1, .3, 6.4), p(8.1, .3, 6.4), p(8.1, 6, 6.4), p(-1.1, 6, 6.4)], 'concreteFront', false);
    face(c, [p(-.9, .5, 6.4), p(7.9, .5, 6.4), p(7.9, 5.8, 6.4), p(-.9, 5.8, 6.4)], 'concreteTopLight', false);
    onFront(c, p, -.41, -1.7, 8.7, 5.4, 5.55, 'concreteSide');
    return 14.5;
  },
  booth(c, o) { img(c, 'booth', X(o.x) + M * .2, Y(o.z + 1.3), M * 4.4); return o.z + 1.2; },
  island(c, o) {
    const p = iso(X(o.x0), Y(o.z1));
    ibox(c, p, 0, o.x1 - o.x0, 0, o.z1 - o.z0, 0, .45, ['origStone', 'origBorder', 'origStoneJoint']);
    for (let b = .5; b < o.z1 - o.z0; b += 1.1) { const [x, y] = p((o.x1 - o.x0) / 2, b, .45); img(c, 'bush', x, y + 8, M * 1.1); }
    return o.z1;
  },
  barrier(c, o) {
    const p = iso(X(o.x - .22), Y(o.z + .22));
    ibox(c, p, 0, .44, 0, .44, 0, 1.1, ['boomYellow', 'boomYellow', 'cone']);
    const [x0, y0] = p(.22, .22, 1), len = o.len * M * o.dir;
    for (let i = 0; i < o.len / .5; i++) { fill(c, i % 2 ? 'white' : 'boomRed'); c.fillRect(x0 + (o.dir > 0 ? i : -i - 1) * M * .5, y0 + (o.dir > 0 ? i : -i - 1) * M * .05 - 3, M * .5, 6); }
    c.strokeStyle = P.outline; c.lineWidth = 1.2; c.strokeRect(Math.min(x0, x0 + len), y0 - 3 + Math.min(0, len * .1), Math.abs(len), 6 + Math.abs(len * .1));
    return o.z + .22;
  },
  cone(c, o) { const x = X(o.x), y = Y(o.z); face(c, [[x - 7, y], [x, y - M * .6], [x + 7, y]], 'cone'); face(c, [[x - 4, y - M * .28], [x + 4, y - M * .28], [x + 3, y - M * .36], [x - 3, y - M * .36]], 'white', false); return o.z; },
  obelisk(c, o) {
    // the red name tower, drawn like the game's gate-1 illustration but with the real name on it
    const p = iso(X(o.x - 2.6), Y(o.z + 1.6));
    groundShadow(c, [p(0, 0, 0), p(5.2, 0, 0), p(9, 1.5, 0), p(9, 3.2, 0), p(3, 3.2, 0)].map(([x, y]) => [x + 8, y + 3]));
    ibox(c, p, 0, 5.2, 0, 3.2, 0, 1.3, ['obeliskTop', 'obeliskFront', 'obeliskSide']);
    ibox(c, p, .8, 4.4, .4, 2.8, 1.3, 2.7, ['obeliskTop', 'obeliskFront', 'obeliskSide']);
    const t0 = .65, t1 = .4, cxA = 2.6, cxB = 1.6, top = 17;
    face(c, [p(cxA - 1.25, cxB - 1.25 + t0 - t0, 2.7), p(cxA + 1.25, cxB - 1.25, 2.7), p(cxA + .85, cxB - .85, top), p(cxA - .85, cxB - .85, top)], 'obeliskFront');
    face(c, [p(cxA + 1.25, cxB - 1.25, 2.7), p(cxA + 1.25, cxB + 1.25, 2.7), p(cxA + .85, cxB + .85, top), p(cxA + .85, cxB - .85, top)], 'obeliskSide');
    face(c, [p(cxA - .85, cxB - .85, top), p(cxA + .85, cxB - .85, top), p(cxA + .85, cxB + .85, top), p(cxA - .85, cxB + .85, top)], 'obeliskTop');
    const [bx, by] = p(cxA, cxB - 1.05, 15.2);
    c.fillStyle = P.plaque; c.beginPath(); c.arc(bx, by, 11, 0, 7); c.fill(); c.strokeStyle = P.outline; c.lineWidth = OUT; c.stroke();
    text(c, '政', bx, by + 1, `900 11px ${SERIF}`, 'badgeBlue');
    const [qx0, qy0] = p(cxA - .42, cxB - 1.15, 13.6), [, qy1] = p(cxA - .42, cxB - 1.15, 5.2);
    fill(c, 'plaque'); c.beginPath(); c.roundRect(qx0, qy0, M * .84, qy1 - qy0, 3); c.fill(); c.stroke();
    '國立政治大學'.split('').forEach((ch, i) => text(c, ch, qx0 + M * .42, qy0 + 16 + i * ((qy1 - qy0 - 22) / 5), `900 15px ${SERIF}`, 'graniteDark'));
    return o.z + 1.6;
  },
  nameWall(c, o) {
    const p = iso(X(o.x0), Y(o.z + .3)), w = o.x1 - o.x0;
    groundShadow(c, [p(0, 0, 0), p(w, 0, 0), p(w + 1, .6, 0), p(1, .6, 0)].map(([x, y]) => [x + 6, y + 6]));
    ibox(c, p, 0, w, 0, .6, 0, 1.1, ['obeliskTop', 'obeliskFront', 'obeliskSide']);
    const [x0, y0] = p(w / 2, 0, .55); c.save(); c.translate(x0, y0); c.rotate(Math.atan2(.1, 1));
    text(c, 'NATIONAL CHENGCHI UNIVERSITY', 0, 0, `700 ${M * .4}px Georgia,${SERIF}`, 'plaque'); c.restore();
    return o.z + .3;
  },
  flowerBed(c, o) {
    const p = iso(X(o.x0), Y(o.z1)), w = o.x1 - o.x0, d = o.z1 - o.z0;
    ibox(c, p, 0, w, 0, d, 0, .35, ['planter', 'origBorder', 'origStoneJoint']);
    seed = 5; for (let i = 0; i < 170; i++) { const [x, y] = p(.2 + rand() * (w - .4), .15 + rand() * (d - .3), .35); fill(c, i % 5 ? 'flowerRed' : 'flowerOrange'); c.beginPath(); c.arc(x, y - rand() * 5, 3.2 + rand() * 2, 0, 7); c.fill(); }
    return o.z1;
  },
  coneShrub(c, o) { const x = X(o.x), y = Y(o.z); face(c, [[x - 16, y], [x, y - M * 2.3], [x, y + 3]], 'pineLight'); face(c, [[x, y - M * 2.3], [x + 16, y], [x, y + 3]], 'pineDark'); return o.z; },
  trafficLight(c, o) {
    const x = X(o.x), y = Y(o.z);
    face(c, [[x - 2.5, y], [x + 2.5, y], [x + 2.5, y - M * 3.9], [x - 2.5, y - M * 3.9]], 'poleGrey');
    face(c, [[x, y - M * 3.75], [x + M * 2.3, y - M * 3.75 + 5], [x + M * 2.3, y - M * 3.6 + 5], [x, y - M * 3.6]], 'poleGrey');
    face(c, [[x + M * 1.9, y - M * 3.9 + 4], [x + M * 2.7, y - M * 3.9 + 5], [x + M * 2.7, y - M * 3.45 + 5], [x + M * 1.9, y - M * 3.45 + 4]], 'metal');
    c.fillStyle = P.signalGreen; c.beginPath(); c.arc(x + M * 2.5, y - M * 3.67 + 5, 3.5, 0, 7); c.fill();
    return o.z;
  },
  hedge(c, o) {
    const p = iso(X(o.x0), Y(o.z + .55)), w = o.x1 - o.x0;
    ibox(c, p, 0, w, 0, 1.1, 0, 1.1, ['hedgeTop', 'hedge', 'hedgeSide']);
    seed = Math.round(o.x0 * 7); for (let a = .4; a < w; a += .8) { const [x, y] = p(a, .55, 1.1); fill(c, 'leafLight'); c.beginPath(); c.arc(x, y, 4 + rand() * 3, 0, 7); c.fill(); }
    return o.z + .55;
  },
  shrub(c, o) { img(c, 'bush', X(o.x), Y(o.z) + 6, M * 1.6); return o.z; },
  bowl(c, o) {
    const x = X(o.x), y = Y(o.z);
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 6, y + 3, M, M * .3, 0, 0, 7); c.fill();
    face(c, [[x - M, y - M * .35], [x + M, y - M * .35], [x + M * .7, y], [x - M * .7, y]], 'bowlShade');
    c.fillStyle = P.bowl; c.beginPath(); c.ellipse(x, y - M * .35, M, M * .32, 0, 0, 7); c.fill(); c.strokeStyle = P.outline; c.lineWidth = OUT; c.stroke();
    img(c, 'bush', x, y - M * .1, M * 1.5);
    seed = Math.round(o.x * 13); for (let i = 0; i < 12; i++) { fill(c, 'lavender'); c.beginPath(); c.arc(x + (rand() - .5) * M * 1.1, y - M * .9 - rand() * 16, 3, 0, 7); c.fill(); }
    return o.z;
  },
  bannerPole(c, o) {
    const x = X(o.x), y = Y(o.z), hp = M * 3.6;
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 4, y + 1, 9, 3, 0, 0, 7); c.fill();
    face(c, [[x - 2.5, y], [x + 2.5, y], [x + 2.5, y - hp], [x - 2.5, y - hp]], 'poleGrey');
    BANNER.forEach(([col, ch], i) => {
      const bx = i ? x + 4 : x - 4 - M * .85;
      face(c, [[bx, y - hp * .84], [bx + M * .85, y - hp * .84], [bx + M * .85, y - hp * .48], [bx, y - hp * .48]], col);
      c.fillStyle = P.white; c.beginPath(); c.arc(bx + M * .42, y - hp * .66, 6, 0, 7); c.fill();
      text(c, ch, bx + M * .42, y - hp * .66 + 1, `800 8px ${SERIF}`, i ? 'badgeBlue' : 'bannerRed');
    });
    c.fillStyle = P.lamp; c.beginPath(); c.arc(x, y - hp - 6, 7, 0, 7); c.fill(); c.strokeStyle = P.outline; c.lineWidth = OUT; c.stroke();
    return o.z;
  },
  noticeBoard(c, o) { img(c, 'board', X(o.x), Y(o.z) + 8, M * 2.6); return o.z; },
  mapBoard(c, o) {
    const p = iso(X(o.x - 1.1), Y(o.z));
    [.2, 2].forEach(a => face(c, [p(a - .06, 0, 0), p(a + .06, 0, 0), p(a + .06, 0, 1), p(a - .06, 0, 1)], 'metal'));
    ibox(c, p, 0, 2.2, 0, .12, .9, 2.1, ['metalLight', 'metal', 'metal']);
    onFront(c, p, -.01, .12, 2.08, 1, 2, 'boardBlue');
    const [tx, ty] = p(1.1, 0, 1.78); text(c, '校園導覽圖', tx, ty, `700 9px ${SANS}`, 'white');
    return o.z;
  },
  bollard(c, o) { const p = iso(X(o.x - .14), Y(o.z + .14)); c.fillStyle = SHADOW; c.beginPath(); c.ellipse(X(o.x) + 3, Y(o.z) + 2, 6, 2, 0, 0, 7); c.fill(); ibox(c, p, 0, .28, 0, .28, 0, .85, ['poleGrey', 'bowl', 'bowlShade']); return o.z; },
  fountain(c, o, t) {
    const x = X(o.x), y = Y(o.z), r = X(o.r), lip = M * .55;
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 10, y + 8, r + 6, r * .98, 0, 0, 7); c.fill();
    c.fillStyle = P.basin; c.beginPath(); c.ellipse(x, y, r, r, 0, 0, Math.PI); c.lineTo(x - r, y - lip); c.ellipse(x, y - lip, r, r, 0, Math.PI, 0, true); c.closePath(); c.fill(); c.strokeStyle = P.outline; c.lineWidth = OUT; c.stroke();
    c.fillStyle = P.basinTop; c.beginPath(); c.arc(x, y - lip, r, 0, 7); c.fill(); c.stroke();
    c.fillStyle = P.water; c.beginPath(); c.arc(x, y - lip, r - M * .5, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = P.waterLight; c.lineWidth = 3;
    for (let k = 0; k < 3; k++) { const rr = (t * 22 + k * 50) % (r - M * .7); c.globalAlpha = 1 - rr / r; c.beginPath(); c.arc(x, y - lip, rr, 0, 7); c.stroke(); }
    c.globalAlpha = .75; c.fillStyle = P.white;
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + t * .8; c.beginPath(); c.arc(x + Math.cos(a) * 7, y - lip - 16 - Math.abs(Math.sin(t * 3 + k)) * 12, 3, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    return o.z + o.r;
  },
  busStop(c, o) {
    const x = X(o.x), y = Y(o.z);
    face(c, [[x - 2, y], [x + 2, y], [x + 2, y - M * 2.2], [x - 2, y - M * 2.2]], 'metal');
    face(c, [[x - M * .45, y - M * 2.5], [x + M * .45, y - M * 2.5], [x + M * .45, y - M * 1.6], [x - M * .45, y - M * 1.6]], 'busBlue');
    text(c, '政大', x, y - M * 2.2, `900 10px ${SANS}`, 'white'); text(c, '公車站', x, y - M * 1.85, `600 7px ${SANS}`, 'white');
    return o.z;
  },
  scooter(c, o) {
    const cols = ['white', 'boomRed', 'boomYellow', 'shirtBlue', 'glass', 'metal'], x = X(o.x), y = Y(o.z);
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 4, y + 2, 11, 20, 0, 0, 7); c.fill();
    c.fillStyle = P[cols[o.colour]]; c.beginPath(); c.roundRect(x - 8, y - 32, 16, 38, 6); c.fill(); c.strokeStyle = P.outline; c.lineWidth = OUT; c.stroke();
    fill(c, 'metal'); c.beginPath(); c.roundRect(x - 6, y - 18, 12, 16, 4); c.fill();
    face(c, [[x - 13, y - 34], [x + 13, y - 34], [x + 13, y - 31], [x - 13, y - 31]], 'metal');
    return o.z;
  },
  tree(c, o) { img(c, 'tree', X(o.x), Y(o.z) + 6, M * 5 * o.s); return o.z; },
  palm(c, o) { sprite(c, 'palm', () => S.palm(false), X(o.x), Y(o.z), 1.25, o.x < 0); return o.z; },
  fanPalm(c, o) { sprite(c, 'fanPalm', () => S.palm(true), X(o.x), Y(o.z), 1.1, o.x < 0); return o.z; },
  cat(c, o, t) {
    const x = X(o.x), y = Y(o.z);
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 3, y, 13, 4, 0, 0, 7); c.fill();
    img(c, 'cat', x, y + 2 + Math.sin(t * 2.4) * .6, M * 1.25);
    fill(c, 'ink'); c.beginPath(); c.roundRect(x - 9, y - M * 2.1 - 12, 18, 22, 8); c.fill(); text(c, '!', x, y - M * 2.1 - 1, '900 14px system-ui', 'white');
    return o.z;
  },
};
// south edge used for depth sorting without drawing
const SORT = {
  gatehouse: () => 14.5, booth: o => o.z + 1.2, island: o => o.z1, barrier: o => o.z + .22, obelisk: o => o.z + 1.6, nameWall: o => o.z + .3,
  flowerBed: o => o.z1, hedge: o => o.z + .55, fountain: o => o.z + o.r,
};
const sortZ = o => (SORT[o.type] ? SORT[o.type](o) : o.z);

/* ---------- collision footprints (metres) ---------- */
function solids(region) {
  const out = [];
  for (const o of region.objects) {
    if (o.type === 'gatehouse') { out.push([Math.min(o.cx + 3.5 * o.dir, o.cx - 1.1 * o.dir), Math.max(o.cx + 3.5 * o.dir, o.cx - 1.1 * o.dir), 9.5, 14.5]); const px = o.cx - 3.2 * o.dir; out.push([px - .3, px + .3, 9.5, 14.5]); }
    else if (o.type === 'booth') out.push([o.x - 1.3, o.x + 1.3, o.z - 1.2, o.z + 1.2]);
    else if (o.type === 'island') out.push([o.x0, o.x1, o.z0, o.z1]);
    else if (o.type === 'obelisk') out.push([o.x - 2.6, o.x + 2.6, o.z - 1.6, o.z + 1.6]);
    else if (o.type === 'nameWall') out.push([o.x0, o.x1, o.z - .3, o.z + .3]);
    else if (o.type === 'flowerBed') out.push([o.x0, o.x1, o.z0, o.z1]);
    else if (o.type === 'hedge') out.push([o.x0, o.x1, o.z - .55, o.z + .55]);
    else if (['tree', 'palm', 'fanPalm', 'bannerPole', 'bollard', 'coneShrub', 'busStop', 'trafficLight'].includes(o.type)) out.push({ x: o.x, z: o.z, r: o.type === 'bollard' ? .15 : .35 });
    else if (o.type === 'fountain') out.push({ x: o.x, z: o.z, r: o.r + .2 });
    else if (o.type === 'bowl') out.push({ x: o.x, z: o.z, r: .95 });
  }
  return out;
}
export function blocked(list, x, z, rad = .35) {
  return list.some(s => (Array.isArray(s) ? x > s[0] - rad && x < s[1] + rad && z > s[2] - rad && z < s[3] + rad : Math.hypot(x - s.x, z - s.z) < s.r + rad));
}

/* ---------- habit bubble ---------- */
function bubble(c, x, y, kind, t) {
  c.save(); c.fillStyle = P.white; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill();
  c.beginPath(); c.moveTo(x - 4, y + 9); c.lineTo(x, y + 16); c.lineTo(x + 3, y + 9); c.fill();
  if (kind === 'phone') { c.fillStyle = P.metal; c.beginPath(); c.roundRect(x - 4.5, y - 7, 9, 14, 2); c.fill(); c.fillStyle = P.glass; c.fillRect(x - 3, y - 5, 6, 9); }
  else { text(c, 'Z', x, y + 1, '800 13px system-ui', 'ink'); for (let k = 0; k < 3; k++) { const p = (t * .5 + k / 3) % 1; c.globalAlpha = 1 - p; text(c, 'z', x + 14 + p * 12, y - 6 - p * 22, `800 ${8 + p * 6}px system-ui`, 'white'); } }
  c.restore();
}

/* ---------- the viewer ---------- */
/** Bushes, rocks and mushrooms on open grass only: never on paving, roads or anything solid. */
function decor(region, walls) {
  const out = [], paved = region.ground.filter(g => g.type === 'rect' || g.type === 'circle');
  const onPaving = (x, z) => paved.some(g => (g.type === 'rect' ? x > g.x0 - 1 && x < g.x1 + 1 && z > g.z0 - 1 && z < g.z1 + 1 : Math.hypot(x - g.x, z - g.z) < g.r + 1)) ||
    region.ground.some(g => g.type === 'road' && Math.abs(z - g.z(x)) < g.width / 2 + 1.2) || blocked(walls, x, z, 1.6);
  seed = 2024;
  for (let i = 0; i < 260 && out.length < 70; i++) {
    const x = region.bounds.x0 + rand() * (region.bounds.x1 - region.bounds.x0), z = region.bounds.z0 + rand() * (region.bounds.z1 - region.bounds.z0), k = rand();
    if (onPaving(x, z)) continue;
    out.push({ type: k < .35 ? 'decorBush' : k < .7 ? 'decorRock' : 'decorMushroom', x, z, flowers: k < .18 });
  }
  return out;
}
Object.assign(DRAW, {
  decorBush(c, o) { img(c, 'bush', X(o.x), Y(o.z) + 6, M * (o.flowers ? 1.5 : 1.2)); return o.z; },
  decorRock(c, o) { sprite(c, 'rock', S.rock, X(o.x), Y(o.z), .9); return o.z; },
  decorMushroom(c, o) { sprite(c, 'mushroom', S.mushroom, X(o.x), Y(o.z), .9); return o.z; },
});

export function start(canvas, region) {
  const c = canvas.getContext('2d'), view = { w: 0, h: 0, dpr: 1 };
  const walls = solids(region), B = region.bounds, scenery = [...region.objects, ...decor(region, walls)];
  const player = { x: region.spawn.x, z: region.spawn.z, dir: 'north', moving: false, curled: false, anim: 0 };
  const people = region.people.map(p => ({ ...p, x: p.x ?? p.route[0][0], z: p.z ?? p.route[0][1], dir: p.dir ?? 'south', anim: 0, back: false }));
  const pigeons = region.pigeons.map(([x, z], i) => ({ x, z, home: { x, z }, t: i * .4, fled: 0, vx: 0 }));
  const keys = new Set(), stick = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  const resize = () => { const r = canvas.getBoundingClientRect(); view.dpr = Math.min(devicePixelRatio || 1, 2); view.w = r.width; view.h = r.height; canvas.width = Math.round(r.width * view.dpr); canvas.height = Math.round(r.height * view.dpr); };
  new ResizeObserver(resize).observe(canvas); resize();
  const map = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', c: 'curl', shift: 'curl' };
  addEventListener('keydown', e => { const k = map[e.key.toLowerCase()]; if (k) { keys.add(k); e.preventDefault(); } });
  addEventListener('keyup', e => { const k = map[e.key.toLowerCase()]; if (k) keys.delete(k); });
  addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointerdown', e => { if (stick.id !== null) return; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (e.pointerId !== stick.id) return; const dx = e.clientX - stick.ox, dy = e.clientY - stick.oy, d = Math.hypot(dx, dy), s = Math.min(1, d / 50); stick.x = d ? dx / d * s : 0; stick.y = d ? dy / d * s : 0; });
  for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, e => { if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; } });

  function update(dt) {
    let dx = (keys.has('right') - keys.has('left')) + stick.x, dz = (keys.has('down') - keys.has('up')) + stick.y;
    const m = Math.hypot(dx, dz); player.curled = keys.has('curl'); player.moving = m > .1 && !player.curled;
    if (player.moving) {
      dx /= Math.max(1, m); dz /= Math.max(1, m);
      const nx = Math.max(B.x0, Math.min(B.x1, player.x + dx * 3.6 * dt)), nz = Math.max(B.z0, Math.min(B.z1, player.z + dz * 3.6 * dt));
      if (!blocked(walls, nx, player.z)) player.x = nx;
      if (!blocked(walls, player.x, nz)) player.z = nz;
      player.dir = Math.abs(dx) >= Math.abs(dz) ? (dx > 0 ? 'east' : 'west') : (dz > 0 ? 'south' : 'north');
      player.anim += dt * 9;
    }
    for (const p of people) {
      if (!p.route) continue;
      const [a, b] = p.route, [tx, tz] = p.back ? a : b, ddx = tx - p.x, ddz = tz - p.z, d = Math.hypot(ddx, ddz);
      if (d < .1) { p.back = !p.back; continue; }
      p.x += ddx / d * p.speed * dt; p.z += ddz / d * p.speed * dt; p.anim += dt * p.speed * 3.5;
      p.dir = Math.abs(ddx) > Math.abs(ddz) ? (ddx > 0 ? 'east' : 'west') : (ddz > 0 ? 'south' : 'north');
    }
    for (const b of pigeons) {
      if (!b.fled && Math.hypot(player.x - b.x, player.z - b.z) < 2) { b.fled = .01; b.vx = Math.sign(b.x - player.x) || 1; }
      if (b.fled) { b.x += b.vx * 5 * dt; b.fled += dt; if (b.fled > 2.5) { b.x = b.home.x; b.z = b.home.z; b.fled = 0; } }
    }
  }

  function frame(t) {
    const { w, h, dpr } = view, zoom = h / (h < 500 ? 400 : 520);
    raster = Math.ceil(zoom * dpr * 2) / 2;
    const vw = w / zoom, vh = h / zoom;
    const camX = Math.max(X(B.x0) - 60, Math.min(X(B.x1) + 60 - vw, X(player.x) - vw / 2));
    const camY = Math.max(Y(B.z0) - 400, Math.min(Y(B.z1) + 40 - vh, Y(player.z) - vh * .58));
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    c.save(); c.scale(zoom, zoom); c.translate(-camX, -camY);
    drawGround(c, region, t);
    const seen = (x, z) => X(x) > camX - 500 && X(x) < camX + vw + 500 && Y(z) > camY - 80 && Y(z) < camY + vh + 800;
    const items = [];
    for (const o of scenery) if (seen(o.x ?? o.cx ?? o.x0, sortZ(o))) items.push({ y: Y(sortZ(o)), draw: () => DRAW[o.type](c, o, t) });
    for (const b of pigeons) items.push({ y: Y(b.z), draw: () => { const f = b.fled ? 0 : Math.floor(t * 2 + b.t * 3) % 2; sprite(c, `pigeon${f}`, () => S.pigeon(f), X(b.x), Y(b.z) - (b.fled ? b.fled * 40 : 0), 1.15, b.fled ? b.vx < 0 : false); } });
    for (const p of people) items.push({ y: Y(p.z), draw: () => { actor(c, p.look, ROW[p.dir], p.route ? Math.floor(p.anim) % 4 : 0, X(p.x), Y(p.z), ACTOR); if (p.habit) bubble(c, X(p.x), Y(p.z) - ACTOR - 4, p.habit, t); } });
    items.push({ y: Y(player.z), draw: () => {
      if (player.curled) { if (sheets.curl) { c.fillStyle = SHADOW; c.beginPath(); c.ellipse(X(player.x) + 4, Y(player.z) + 2, 20, 6, 0, 0, 7); c.fill(); c.drawImage(sheets.curl, X(player.x) - 25, Y(player.z) - 46, 50, 50); } }
      else actor(c, 'pangolin', ROW[player.dir], player.moving ? Math.floor(player.anim) % 4 : 0, X(player.x), Y(player.z), ACTOR);
    } });
    items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
    c.restore();
  }
  let last = performance.now();
  const loop = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); frame(now / 1000); requestAnimationFrame(loop); };
  ready.then(() => requestAnimationFrame(loop));
  return { player, set(x, z) { player.x = x; player.z = z; } };
}
