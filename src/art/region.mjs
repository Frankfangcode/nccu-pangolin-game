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
const sheets = {};
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
const ready = Promise.all(Object.entries(SHEETS).map(([k, url]) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok([k, i]); i.onerror = fail; i.src = url; })))
  .then(list => { const raw = Object.fromEntries(list); for (const [n, o] of Object.entries(OUTFITS)) sheets[n] = recolour(raw.human, o); sheets.pangolin = raw.pangolin; sheets.curl = raw.curl; });
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
  if (!grassTile) {
    const t = document.createElement('canvas'); t.width = t.height = 240; const g = t.getContext('2d');
    g.fillStyle = P.grass; g.fillRect(0, 0, 240, 240); seed = 41;
    for (let i = 0; i < 900; i++) { const x = rand() * 240, y = rand() * 240, h = 6 + rand() * 11, w = 1.1 + rand() * 1.5; g.fillStyle = rand() < .55 ? P.bladeDark : P.bladeLight; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + (rand() - .5) * 2, y - h); g.lineTo(x + w, y); g.fill(); }
    for (let i = 0; i < 2; i++) { g.fillStyle = P.flowerYellow; g.beginPath(); g.arc(rand() * 240, rand() * 240, 2.2, 0, 7); g.fill(); }
    grassTile = c.createPattern(t, 'repeat');
  }
  return grassTile;
}
const JOINT = { sidewalk: 'sidewalkJoint', paver: 'paverJoint' };
function drawGround(c, region, t) {
  c.fillStyle = grass(c); c.fillRect(X(region.bounds.x0) - 2000, Y(region.bounds.z0) - 2000, X(region.bounds.x1 - region.bounds.x0) + 4000, Y(region.bounds.z1 - region.bounds.z0) + 4000);
  for (const g of region.ground) {
    if (g.type === 'rect') {
      rect(c, X(g.x0), Y(g.z0), X(g.x1), Y(g.z1), g.fill);
      if (g.joints) { c.globalAlpha = .55; fill(c, JOINT[g.fill] ?? 'paverJoint'); const j = g.fill === 'paver' ? 1.5 : g.joints; for (let x = g.x0; x < g.x1; x += j) c.fillRect(X(x), Y(g.z0), 1, Y(g.z1) - Y(g.z0)); if (g.fill === 'paver') for (let z = g.z0; z < g.z1; z += j) c.fillRect(X(g.x0), Y(z), X(g.x1) - X(g.x0), 1); c.globalAlpha = 1; }
    } else if (g.type === 'circle') {
      fill(c, 'paverJoint'); c.beginPath(); c.arc(X(g.x), Y(g.z), X(g.r) + 4, 0, 7); c.fill();
      fill(c, g.fill); c.beginPath(); c.arc(X(g.x), Y(g.z), X(g.r), 0, 7); c.fill();
      c.strokeStyle = P.paverJoint; c.lineWidth = 1.5; for (let r = 1; r < g.r; r += .9) { c.beginPath(); c.arc(X(g.x), Y(g.z), X(r), 0, 7); c.stroke(); }
    } else if (g.type === 'road') {
      const pts = []; for (let x = g.from; x <= g.to; x += 2) pts.push([x, g.z(x)]);
      c.lineCap = 'butt'; c.lineJoin = 'round';
      c.strokeStyle = P.curb; c.lineWidth = X(g.width) + 8; c.beginPath(); pts.forEach(([x, z], i) => (i ? c.lineTo(X(x), Y(z)) : c.moveTo(X(x), Y(z)))); c.stroke();
      c.strokeStyle = P.road; c.lineWidth = X(g.width); c.stroke();
    } else if (g.type === 'zebra') {
      fill(c, 'paint'); for (let z = g.z0; z < g.z1; z += g.step) { if (z > g.skip[0] && z < g.skip[1]) continue; c.fillRect(X(g.x0), Y(z), X(g.x1) - X(g.x0), M * g.bar); }
    } else if (g.type === 'zebraX') {
      fill(c, 'paint'); for (let x = g.x0; x < g.x1; x += 1) c.fillRect(X(x), Y(g.z - g.depth / 2), M * .5, M * g.depth);
    } else if (g.type === 'dashes') {
      fill(c, g.fill); for (let x = g.from; x < g.to; x += g.every) if (x < g.gap[0] || x > g.gap[1]) c.fillRect(X(x), Y(g.z) - 3, X(g.len), 6);
    } else if (g.type === 'curb') {
      rect(c, X(g.x0), Y(g.z) - 5, X(g.x1), Y(g.z) + 5, 'curb'); rect(c, X(g.x0), Y(g.z) + 3, X(g.x1), Y(g.z) + 5, 'curbShade');
    } else if (g.type === 'roadText') {
      text(c, g.text, X(g.x), Y(g.z), `900 ${M * .95}px ${SANS}`, 'paint');
    }
  }
}

/* ---------- objects (each returns its south edge for depth sorting) ---------- */
const BANNER = [['bannerRed', '政治大學'], ['bannerYellow', 'NCCU']];
const DRAW = {
  gatehouse(c, o) {
    const { cx, dir } = o, x0 = cx - 3.5, x1 = cx + 3.5, zN = 9.5, zS = 14.5;
    shadowRect(c, cx - 5.2, cx + 5.2, 14.9, 1.4);
    // brick front: solid outer part, inner passage with one pillar
    box(c, x0, x1, zN, zS, 0, 5.4, 'brickRed', 'brickRed');
    const solid0 = Math.min(cx + 3.5 * dir, cx - 1.1 * dir), solid1 = Math.max(cx + 3.5 * dir, cx - 1.1 * dir);
    const pass0 = Math.min(cx - 1.1 * dir, cx - 3.2 * dir), pass1 = Math.max(cx - 1.1 * dir, cx - 3.2 * dir);
    rect(c, X(pass0), Y(zS) - H(2.6), X(pass1), Y(zS), 'passage');
    rect(c, X(x0), Y(zS) - H(2.6), X(x1), Y(zS) - H(2.6) + 4, 'brickRedDark');
    fill(c, 'brickRedDark'); for (let h = .45; h < 5.4; h += .45) c.fillRect(X(x0), Y(zS) - H(h), X(x1) - X(x0), 1);
    rect(c, X(solid0), Y(zS) - H(.5), X(solid1), Y(zS), 'brickBase');
    [-2.2, -.75, .75, 2.2].forEach(dx => { rect(c, X(cx + dx - .55), Y(zS) - H(4.95), X(cx + dx + .55), Y(zS) - H(4.05), 'concreteTop'); rect(c, X(cx + dx - .48), Y(zS) - H(4.88), X(cx + dx + .48), Y(zS) - H(4.12), 'winDark'); rect(c, X(cx + dx - .48), Y(zS) - H(4.88), X(cx + dx - .1), Y(zS) - H(4.5), 'winLight'); });
    [2.5, 1.6].forEach(d => rect(c, X(cx + d * dir - .4), Y(zS) - H(2.15), X(cx + d * dir + .4), Y(zS) - H(1.05), 'winDark'));
    const px = cx - 3.5 * dir + .3 * dir; rect(c, X(px - .3), Y(zS) - H(2.6), X(px + .3), Y(zS), 'brickRedLight');
    rect(c, X(px - .25), Y(zS) - H(1.95), X(px + .25), Y(zS) - H(1.75), 'busBlue');
    // concrete canopy (trimmed so the upper windows stay visible from above)
    box(c, cx - 5.2, cx + 5.2, 7.8, 14.55, 5.4, 6.45, 'concreteTop', 'concrete', 'white');
    rect(c, X(cx - 5.2), Y(14.55) - H(5.6), X(cx + 5.2), Y(14.55) - H(5.4), 'concreteDark');
    rect(c, X(cx - 4.4), Y(8.6) - H(6.45), X(cx + 4.4), Y(13.8) - H(6.45), 'concrete');
    rect(c, X(cx - 4.2), Y(8.8) - H(6.45), X(cx + 4.2), Y(13.6) - H(6.45), 'concreteTop');
    return 14.9;
  },
  booth(c, o) {
    shadowRect(c, o.x - 1.7, o.x + 1.7, o.z + 1.55);
    box(c, o.x - 1.3, o.x + 1.3, o.z - 1.2, o.z + 1.2, 0, .3, 'paverJoint', 'planter');
    box(c, o.x - 1.05, o.x + 1.05, o.z - .95, o.z + .95, .3, 2.4, 'booth', 'booth');
    rect(c, X(o.x - .9), Y(o.z + .95) - H(2.2), X(o.x - .2), Y(o.z + .95) - H(.6), 'boothDark');
    box(c, o.x - 1.7, o.x + 1.7, o.z - 1.55, o.z + 1.55, 2.4, 2.8, 'concreteTop', 'concrete', 'white');
    return o.z + 1.55;
  },
  island(c, o) {
    box(c, o.x0, o.x1, o.z0, o.z1, 0, .5, 'planter', 'paverJoint');
    for (let z = o.z0 + .5; z < o.z1; z += 1.1) sprite(c, 'bush0', () => S.bush(false), X((o.x0 + o.x1) / 2), Y(z + .4) - H(.5), .55);
    return o.z1;
  },
  barrier(c, o) {
    box(c, o.x - .22, o.x + .22, o.z - .22, o.z + .22, 0, 1.1, 'boomYellow', 'boomYellow');
    const ax0 = Math.min(o.x, o.x + o.dir * o.len), ax1 = Math.max(o.x, o.x + o.dir * o.len), y = Y(o.z) - H(1);
    for (let x = ax0, i = 0; x < ax1; x += .5, i++) rect(c, X(x), y - 3, X(Math.min(ax1, x + .5)), y + 3, i % 2 ? 'white' : 'boomRed');
    return o.z + .22;
  },
  cone(c, o) { poly(c, [[X(o.x) - 7, Y(o.z)], [X(o.x), Y(o.z) - H(.7)], [X(o.x) + 7, Y(o.z)]], 'cone'); rect(c, X(o.x) - 4, Y(o.z) - H(.4), X(o.x) + 4, Y(o.z) - H(.3), 'white'); return o.z; },
  obelisk(c, o) {
    const x = X(o.x), y = Y(o.z + 1.6);
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 34, y + 2, M * 3.6, M * .7, 0, 0, 7); c.fill();
    box(c, o.x - 2.6, o.x + 2.6, o.z - 1.6, o.z + 1.6, 0, 1.4, 'graniteLight', 'granite', 'gold');
    box(c, o.x - 1.7, o.x + 1.9, o.z - 1.3, o.z + 1.3, 1.4, 2.8, 'graniteLight', 'granite');
    // tapered tower turned 45°: the west face catches the light
    const mx = x + M * .1, base = Y(o.z + 1.3) - H(2.8), top = base - H(14), b = 1.6 * M, t = 1.05 * M;
    poly(c, [[mx - b, base], [mx, base + 8], [mx, top + 6], [mx - t, top]], 'graniteLight');
    poly(c, [[mx, base + 8], [mx + b, base], [mx + t, top], [mx, top + 6]], 'granite');
    poly(c, [[mx - t, top], [mx, top - 8], [mx + t, top], [mx, top + 6]], 'graniteDark');
    // badge and the gold vertical name on the lit face
    const bx = mx - t * .5, by = top + H(1.3);
    c.fillStyle = P.white; c.beginPath(); c.arc(bx, by, 12, 0, 7); c.fill(); c.strokeStyle = P.badgeBlue; c.lineWidth = 2.5; c.beginPath(); c.arc(bx, by, 9.5, 0, 7); c.stroke();
    text(c, '政', bx, by + 1, `900 10px ${SERIF}`, 'badgeBlue');
    '國立政治大學'.split('').forEach((ch, i) => text(c, ch, mx - t * .55 - i * .9, top + H(3.2) + i * 22, `900 17px ${SERIF}`, 'gold'));
    return o.z + 1.6;
  },
  nameWall(c, o) {
    shadowRect(c, o.x0, o.x1, o.z + .3, .6);
    box(c, o.x0, o.x1, o.z - .3, o.z + .3, 0, 1.1, 'graniteLight', 'granite');
    text(c, 'NATIONAL CHENGCHI UNIVERSITY', X((o.x0 + o.x1) / 2), Y(o.z + .3) - H(.55), `700 ${M * .42}px Georgia,${SERIF}`, 'gold');
    return o.z + .3;
  },
  flowerBed(c, o) {
    box(c, o.x0, o.x1, o.z0, o.z1, 0, .3, 'planter', 'paverJoint');
    seed = 5; for (let i = 0; i < 160; i++) { fill(c, i % 5 ? 'flowerRed' : 'flowerOrange'); c.beginPath(); c.arc(X(o.x0 + .3 + rand() * (o.x1 - o.x0 - .6)), Y(o.z0 + .15 + rand() * (o.z1 - o.z0 - .3)) - H(.3), 3 + rand() * 2, 0, 7); c.fill(); }
    return o.z1;
  },
  coneShrub(c, o) { const x = X(o.x), y = Y(o.z); poly(c, [[x - 22, y], [x, y - H(2.9)], [x, y + 4]], 'pineLight'); poly(c, [[x, y - H(2.9)], [x + 22, y], [x, y + 4]], 'pineDark'); return o.z; },
  trafficLight(c, o) {
    const x = X(o.x), y = Y(o.z);
    rect(c, x - 3, y - H(5.2), x + 3, y, 'poleGrey'); rect(c, x, y - H(4.9), x + M * 2.8, y - H(4.7), 'poleGrey');
    rect(c, x + M * 2.3, y - H(4.95), x + M * 3.2, y - H(4.3), 'metal');
    c.fillStyle = P.signalGreen; c.beginPath(); c.arc(x + M * 3.0, y - H(4.6), 4, 0, 7); c.fill();
    return o.z;
  },
  hedge(c, o) {
    box(c, o.x0, o.x1, o.z - .55, o.z + .55, 0, 1.1, 'hedgeTop', 'hedge');
    fill(c, 'hedgeDark'); for (let x = o.x0; x < o.x1; x += 2.1) c.fillRect(X(x), Y(o.z + .55) - H(1.1), 2, H(1.1));
    seed = Math.round(o.x0 * 7); for (let x = o.x0 + .5; x < o.x1; x += .9) { fill(c, 'leafLight'); c.beginPath(); c.arc(X(x), Y(o.z - .2) - H(1.1), 5 + rand() * 4, 0, 7); c.fill(); }
    return o.z + .55;
  },
  shrub(c, o) { sprite(c, 'bush0', () => S.bush(false), X(o.x), Y(o.z), .8); return o.z; },
  bowl(c, o) {
    const x = X(o.x), y = Y(o.z);
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 6, y + 4, M, M * .3, 0, 0, 7); c.fill();
    poly(c, [[x - M, y - H(.4)], [x + M, y - H(.4)], [x + M * .7, y], [x - M * .7, y]], 'bowlShade');
    c.fillStyle = P.bowl; c.beginPath(); c.ellipse(x, y - H(.4), M, M * .32, 0, 0, 7); c.fill();
    sprite(c, 'bush0', () => S.bush(false), x, y - H(.25), .65);
    seed = Math.round(o.x * 13); for (let i = 0; i < 12; i++) { fill(c, 'lavender'); c.beginPath(); c.arc(x + (rand() - .5) * M * 1.1, y - H(1) - rand() * 18, 3, 0, 7); c.fill(); }
    return o.z;
  },
  bannerPole(c, o) {
    const x = X(o.x), y = Y(o.z);
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 4, y + 1, 9, 3, 0, 0, 7); c.fill();
    rect(c, x - 2.5, y - H(5), x + 2.5, y, 'poleGrey');
    BANNER.forEach(([col, word], i) => {
      const bx = i ? x + 4 : x - 4 - M * .9;
      rect(c, bx, y - H(4.2), bx + M * .9, y - H(2.4), col);
      c.fillStyle = P.white; c.beginPath(); c.arc(bx + M * .45, y - H(3.3), 6, 0, 7); c.fill();
      text(c, word === 'NCCU' ? 'N' : '政', bx + M * .45, y - H(3.3) + 1, `800 8px ${SERIF}`, i ? 'badgeBlue' : 'bannerRed');
    });
    c.fillStyle = P.lamp; c.beginPath(); c.arc(x, y - H(5.15), 8, 0, 7); c.fill();
    return o.z;
  },
  noticeBoard(c, o) {
    const x = X(o.x), y = Y(o.z);
    [-1, 1].forEach(s => rect(c, x + s * M - 2, y - H(2.2), x + s * M + 2, y, 'boardWood'));
    rect(c, x - M * 1.2, y - H(2.3), x + M * 1.2, y - H(.7), 'boardWood'); rect(c, x - M * 1.05, y - H(2.15), x + M * 1.05, y - H(.85), 'boardBlue');
    rect(c, x - M * 1.3, y - H(2.4), x + M * 1.3, y - H(2.3), 'trunkDark');
    return o.z;
  },
  mapBoard(c, o) {
    const x = X(o.x), y = Y(o.z);
    rect(c, x - M * 1.1, y - H(2.05), x + M * 1.1, y - H(.85), 'metal'); rect(c, x - M, y - H(1.95), x + M, y - H(.95), 'concreteDark');
    text(c, '校園導覽圖', x, y - H(1.75), `700 9px ${SANS}`, 'white');
    [-.9, .9].forEach(d => rect(c, x + d * M - 2, y - H(.85), x + d * M + 2, y, 'metal'));
    return o.z;
  },
  bollard(c, o) { const x = X(o.x), y = Y(o.z); c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 3, y + 1, 6, 2, 0, 0, 7); c.fill(); rect(c, x - 4.5, y - H(.85), x + 4.5, y, 'bowl'); rect(c, x - 5, y - H(.88), x + 5, y - H(.75), 'poleGrey'); return o.z; },
  fountain(c, o, t) {
    const x = X(o.x), y = Y(o.z), r = X(o.r), lip = H(.6);
    c.fillStyle = P.basin; c.beginPath(); c.ellipse(x, y, r, r, 0, 0, Math.PI); c.lineTo(x - r, y - lip); c.ellipse(x, y - lip, r, r, 0, Math.PI, 0, true); c.closePath(); c.fill();
    c.fillStyle = P.basinTop; c.beginPath(); c.arc(x, y - lip, r, 0, 7); c.fill();
    c.fillStyle = P.water; c.beginPath(); c.arc(x, y - lip, r - M * .55, 0, 7); c.fill();
    c.strokeStyle = P.waterLight; c.lineWidth = 3;
    for (let k = 0; k < 3; k++) { const rr = ((t * 22 + k * 50) % (r - M * .7)); c.globalAlpha = 1 - rr / r; c.beginPath(); c.arc(x, y - lip, rr, 0, 7); c.stroke(); }
    c.globalAlpha = 1;
    c.fillStyle = P.white; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + t * .8; c.globalAlpha = .7; c.beginPath(); c.arc(x + Math.cos(a) * 6, y - lip - 14 - Math.abs(Math.sin(t * 3 + k)) * 10, 3, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    return o.z + o.r;
  },
  busStop(c, o) {
    const x = X(o.x), y = Y(o.z);
    rect(c, x - 2, y - H(2.8), x + 2, y, 'metal'); rect(c, x - M * .45, y - H(3.15), x + M * .45, y - H(2.05), 'busBlue');
    text(c, '政大', x, y - H(2.75), `900 11px ${SANS}`, 'white'); text(c, '公車站', x, y - H(2.35), `600 7px ${SANS}`, 'white');
    return o.z;
  },
  scooter(c, o) {
    const cols = ['white', 'boomRed', 'boomYellow', 'shirtBlue', 'glass', 'metal'], x = X(o.x), y = Y(o.z);
    c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 4, y + 2, 12, 22, 0, 0, 7); c.fill();
    rect(c, x - 3, y - 26 - H(.5), x + 3, y - 20 - H(.5), 'metal');
    c.fillStyle = P[cols[o.colour]]; c.beginPath(); c.roundRect(x - 8, y - 22 - H(.5), 16, 40, 6); c.fill();
    c.fillStyle = P.metal; c.beginPath(); c.roundRect(x - 6, y - 6 - H(.6), 12, 18, 4); c.fill();
    rect(c, x - 13, y - 22 - H(.9), x + 13, y - 19 - H(.9), 'metal');
    return o.z;
  },
  tree(c, o) { sprite(c, `tree${(Math.abs(Math.round(o.x * 3)) % 2)}`, () => S.tree(Math.abs(Math.round(o.x * 3)) % 2), X(o.x), Y(o.z), 1.55 * o.s); return o.z; },
  palm(c, o) { sprite(c, 'palm', () => S.palm(false), X(o.x), Y(o.z), 1.25, o.x < 0); return o.z; },
  fanPalm(c, o) { sprite(c, 'fanPalm', () => S.palm(true), X(o.x), Y(o.z), 1.1, o.x < 0); return o.z; },
};
// south edge used for depth sorting without drawing
const SORT = {
  gatehouse: () => 14.9, booth: o => o.z + 1.55, island: o => o.z1, barrier: o => o.z + .22, obelisk: o => o.z + 1.6, nameWall: o => o.z + .3,
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
  decorBush(c, o) { sprite(c, o.flowers ? 'bushF' : 'bush0', () => S.bush(o.flowers), X(o.x), Y(o.z), .75); return o.z; },
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
