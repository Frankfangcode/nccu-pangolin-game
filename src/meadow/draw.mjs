// 溪邊篇的畫面：沿用原本穿山甲遊戲的畫風（草地紋理、3/4 立體小物、細深描線、原本的角色圖）。
import { visionOf, activityOf, isWaking } from '../rules.mjs?v=16';
import { habitBubble } from '../render.mjs?v=16';
import { depthSort } from '../assets.mjs';
import { ITEMS, REQUESTS, spotReady, REACH } from './play.mjs?v=16';

const OUT = '#2f3330', SHADOW = '#183e342b';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function cameraFor(player, world, { width, height, touch }) {
  const zoom = touch ? clamp(height / 430, .78, 1.15) : 1.35, vw = width / zoom, vh = height / zoom;
  return { zoom, vw, vh, x: clamp(player.x - vw / 2, 0, Math.max(0, world.width - vw)), y: clamp(player.y - vh * .56, 0, Math.max(0, world.height - vh)) };
}

/* ---------- characters: original sheets, recoloured for variety ---------- */
const OUTFITS = { student: null, guard: { hat: [45, 74, 107], pack: [52, 80, 107] }, jogger: { hat: [228, 93, 76], pack: [63, 111, 181] }, reader: { hat: [90, 156, 110], pack: [242, 184, 75] } };
const outfits = new WeakMap();
function hsv(r, g, b) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (!d) return [0, 0, mx / 255]; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [(h * 60 + 360) % 360, d / mx, mx / 255]; }
function sheetFor(a, look) {
  let set = outfits.get(a.human); if (!set) { set = {}; outfits.set(a.human, set); }
  if (set[look]) return set[look];
  const img = a.human, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const x = cv.getContext('2d'); x.drawImage(img, 0, 0); const o = OUTFITS[look];
  if (o) { const d = x.getImageData(0, 0, cv.width, cv.height), p = d.data;
    for (let i = 0; i < p.length; i += 4) { if (p[i + 3] < 10) continue; const [h, s, v] = hsv(p[i], p[i + 1], p[i + 2]); const t = s > .45 && v > .3 ? (h >= 32 && h <= 58 ? o.hat : h >= 2 && h < 32 ? o.pack : null) : null; if (t) { const k = v / .85; p[i] = Math.min(255, t[0] * k); p[i + 1] = Math.min(255, t[1] * k); p[i + 2] = Math.min(255, t[2] * k); } }
    x.putImageData(d, 0, 0); }
  return (set[look] = cv);
}
const ROW = { east: 0, west: 1, south: 2, north: 3 };
function actor(c, img, p, size, row, col) {
  c.fillStyle = SHADOW; c.beginPath(); c.ellipse(p.x + 5, p.y + 2, size * .21, size * .07, 0, 0, 7); c.fill();
  c.drawImage(img, col * 128, row * 128, 128, 128, p.x - size / 2, p.y - size * .91, size, size);
}
const rowFor = f => (Math.abs(Math.cos(f)) > .6 ? (Math.cos(f) > 0 ? 0 : 1) : (Math.sin(f) > 0 ? 2 : 3));

/* ---------- small helpers ---------- */
function text(c, t, x, y, size = 14, col = '#fff9e7', weight = 700) { c.font = `${weight} ${size}px "PingFang TC","Noto Sans TC",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(t, x, y); }
function pill(c, t, x, y) { c.font = '700 14px "PingFang TC","Noto Sans TC",sans-serif'; const w = c.measureText(t).width + 28; c.fillStyle = '#203f36ec'; c.beginPath(); c.roundRect(x - w / 2, y - 15, w, 30, 12); c.fill(); text(c, t, x, y); }
function poly(c, pts, fill, line = true) { c.fillStyle = fill; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); if (line) { c.strokeStyle = OUT; c.lineWidth = 1.6; c.lineJoin = 'round'; c.stroke(); } }
function shadow(c, x, y, rx, ry = rx * .3) { c.fillStyle = SHADOW; c.beginPath(); c.ellipse(x + 6, y + 3, rx, ry, 0, 0, 7); c.fill(); }
/** 3/4 box like the original illustrations: front, east side, top. */
function box(c, x, y, w, d, h, [top, front, side]) {
  const dx = d * .45, dy = d * .32;
  poly(c, [[x, y], [x + w, y], [x + w, y - h], [x, y - h]], front);
  poly(c, [[x + w, y], [x + w + dx, y - dy], [x + w + dx, y - dy - h], [x + w, y - h]], side);
  poly(c, [[x, y - h], [x + w, y - h], [x + w + dx, y - dy - h], [x + dx, y - dy - h]], top);
}

/* ---------- food icons ---------- */
export function drawItem(c, id, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 1.4; c.strokeStyle = OUT;
  const f = (col, path) => { c.fillStyle = col; c.beginPath(); path(); c.fill(); c.stroke(); };
  if (id === 'chicken') { f('#d9933d', () => c.roundRect(-13, -9, 26, 18, 6)); c.fillStyle = '#efb661'; c.fillRect(-9, -5, 6, 3); c.fillRect(2, 0, 7, 3); }
  else if (id === 'boba') { f('#e8cfa8', () => { c.moveTo(-8, -12); c.lineTo(8, -12); c.lineTo(6, 12); c.lineTo(-6, 12); c.closePath(); }); c.fillStyle = '#3a2a22'; for (const [px, py] of [[-3, 8], [2, 9], [0, 5], [-2, 4]]) { c.beginPath(); c.arc(px, py, 1.8, 0, 7); c.fill(); } c.strokeStyle = '#e45d4c'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(2, -12); c.lineTo(5, -19); c.stroke(); }
  else if (id === 'sandwich') { f('#f2d6a0', () => { c.moveTo(-13, 8); c.lineTo(13, 8); c.lineTo(0, -12); c.closePath(); }); c.fillStyle = '#68b34e'; c.fillRect(-9, 3, 18, 3); }
  else if (id === 'sausage') { f('#a8432f', () => c.roundRect(-14, -5, 28, 10, 5)); c.strokeStyle = '#6e2a1c'; c.beginPath(); c.moveTo(-6, -4); c.lineTo(-4, 4); c.moveTo(2, -4); c.lineTo(4, 4); c.stroke(); }
  else if (id === 'yakult') { f('#f4f0e2', () => c.roundRect(-6, -12, 12, 22, 4)); c.fillStyle = '#e0604f'; c.fillRect(-6, -13, 12, 5); }
  else if (id === 'fish') { f('#6fa3c6', () => { c.ellipse(-2, 0, 12, 6, 0, 0, 7); }); f('#5a8fb3', () => { c.moveTo(9, 0); c.lineTo(16, -6); c.lineTo(16, 6); c.closePath(); }); c.fillStyle = OUT; c.beginPath(); c.arc(-9, -1, 1.5, 0, 7); c.fill(); }
  else if (id === 'bento') { f('#f4f0e2', () => c.roundRect(-13, -8, 26, 16, 3)); c.fillStyle = '#e8735c'; c.fillRect(-9, -4, 8, 6); c.fillStyle = '#68b34e'; c.fillRect(2, -4, 7, 6); }
  else if (id === 'cap') { f('#f2c94c', () => c.arc(0, 0, 8, 0, 7)); c.fillStyle = '#fff6c9'; c.beginPath(); c.arc(-2, -2, 3, 0, 7); c.fill(); }
  c.restore();
}

/* ---------- props ---------- */
function blanket(c, p) {
  const [a, b] = p.colour === 'red' ? ['#d9363c', '#fff4e0'] : ['#3f6fb5', '#fff4e0'], n = 6, sx = p.w / n, sy = p.h / 4, x0 = p.x - p.w / 2, y0 = p.y - p.h / 2;
  shadow(c, p.x, p.y + p.h / 2 - 6, p.w * .5, 10);
  for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? a : b; c.fillRect(x0 + i * sx + j * 6, y0 + j * sy, sx, sy); }
  c.strokeStyle = OUT; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + p.w, y0); c.lineTo(x0 + p.w + 24, y0 + p.h); c.lineTo(x0 + 24, y0 + p.h); c.closePath(); c.stroke();
}
const PROPS = {
  tent(c, p) {
    const x = p.x - p.w / 2, y = p.y + p.h / 2, apex = 130;
    shadow(c, p.x + 20, y, p.w * .6, 18);
    poly(c, [[x + p.w, y], [x + p.w + 60, y - 50], [x + p.w / 2 + 60, y - apex - 50], [x + p.w / 2, y - apex]], '#d9a441');
    poly(c, [[x, y], [x + p.w, y], [x + p.w / 2, y - apex]], '#f2c26b');
    poly(c, [[x + p.w / 2 - 34, y], [x + p.w / 2 + 34, y], [x + p.w / 2, y - apex + 34]], '#8a5a3b');
    c.strokeStyle = '#3f4a48'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 8, y + 6); c.lineTo(x + 18, y - 26); c.moveTo(x + p.w + 8, y + 6); c.lineTo(x + p.w - 18, y - 26); c.stroke();
  },
  grill(c, p, t, fx) {
    const x = p.x, y = p.y;
    shadow(c, x, y, 34, 9);
    c.strokeStyle = OUT; c.lineWidth = 3; c.beginPath(); for (const dx of [-18, 0, 18]) { c.moveTo(x + dx * .6, y - 30); c.lineTo(x + dx, y); } c.stroke();
    c.fillStyle = '#2f3330'; c.beginPath(); c.ellipse(x, y - 38, 34, 16, 0, 0, Math.PI); c.lineTo(x - 34, y - 42); c.closePath(); c.fill();
    c.fillStyle = '#d0cbbb'; c.beginPath(); c.ellipse(x, y - 42, 34, 12, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#e9862e'; c.beginPath(); c.ellipse(x, y - 42, 28, 8, 0, 0, 7); c.fill();
    if (!fx.reduceMotion) for (let k = 0; k < 3; k++) { const ph = (t * .5 + k / 3) % 1; c.globalAlpha = (1 - ph) * .5; c.fillStyle = '#f4f0e2'; c.beginPath(); c.arc(x + Math.sin(t + k) * 8, y - 60 - ph * 60, 8 + ph * 10, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  },
  cooler(c, p) { shadow(c, p.x, p.y, 40, 10); box(c, p.x - 34, p.y, 68, 34, 34, ['#ffffff', '#3f8fc6', '#2f74a8']); poly(c, [[p.x - 36, p.y - 34], [p.x + 34, p.y - 34], [p.x + 34, p.y - 40], [p.x - 36, p.y - 40]], '#f4f0e2'); c.strokeStyle = '#f4f0e2'; c.lineWidth = 4; c.beginPath(); c.moveTo(p.x - 18, p.y - 44); c.lineTo(p.x - 18, p.y - 54); c.lineTo(p.x + 18, p.y - 54); c.lineTo(p.x + 18, p.y - 44); c.stroke(); },
  bucket(c, p) { shadow(c, p.x, p.y, 18, 6); poly(c, [[p.x - 16, p.y - 32], [p.x + 16, p.y - 32], [p.x + 13, p.y], [p.x - 13, p.y]], '#9aa3ab'); c.fillStyle = '#5f8f89'; c.beginPath(); c.ellipse(p.x, p.y - 32, 16, 6, 0, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.6; c.stroke(); },
  trash(c, p) { shadow(c, p.x, p.y, 18, 6); poly(c, [[p.x - 15, p.y - 40], [p.x + 15, p.y - 40], [p.x + 13, p.y], [p.x - 13, p.y]], '#478f38'); c.fillStyle = '#3f4a48'; c.beginPath(); c.ellipse(p.x, p.y - 41, 17, 6, 0, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.6; c.stroke(); text(c, '♻', p.x, p.y - 18, 13, '#f4f0e2'); },
  sign(c, p, t, fx, a) { const img = a.board; if (img) { const w = 110, h = w * img.height / img.width; c.drawImage(img, p.x - w / 2, p.y - h + 10, w, h); } text(c, p.text, p.x + 2, p.y - 60, 11, '#5d3f22', 800); },
};
function den(c, d) {
  shadow(c, d.x, d.y + 10, 70, 16);
  poly(c, [[d.x - 70, d.y + 14], [d.x - 40, d.y - 30], [d.x + 30, d.y - 36], [d.x + 72, d.y + 14]], '#9a6f45');
  c.fillStyle = '#2a1d14'; c.beginPath(); c.ellipse(d.x, d.y + 2, 30, 18, 0, Math.PI, 0); c.lineTo(d.x + 30, d.y + 12); c.lineTo(d.x - 30, d.y + 12); c.fill();
  c.fillStyle = '#7d5a37'; c.fillRect(d.x - 60, d.y + 10, 132, 6);
}
function anthill(c, h, ready, clock, still) {
  c.fillStyle = SHADOW; c.beginPath(); c.ellipse(h.x + 4, h.y + 2, 26, 8, 0, 0, 7); c.fill();
  poly(c, [[h.x - 24, h.y], [h.x - 6, h.y - 26], [h.x + 6, h.y - 26], [h.x + 24, h.y]], '#8a6440');
  c.fillStyle = '#4a3320'; c.beginPath(); c.ellipse(h.x, h.y - 22, 4, 2.5, 0, 0, 7); c.fill();
  if (ready) for (let k = 0; k < 6; k++) { const a = (still ? 0 : clock * 1.6) + k * 1.05, r = 16 + (k % 2) * 6; c.fillStyle = '#2a1d14'; c.beginPath(); c.arc(h.x + Math.cos(a) * r, h.y - 6 + Math.sin(a) * r * .35, 1.8, 0, 7); c.fill(); }
}
function duck(c, d, clock, still) {
  const bob = still ? 0 : Math.sin(clock * 2 + d.x) * 2;
  c.fillStyle = '#ffffff55'; c.beginPath(); c.ellipse(d.x, d.y + 4, 18, 5, 0, 0, 7); c.fill();
  poly(c, [[d.x - 14, d.y + bob], [d.x + 10, d.y + bob], [d.x + 14, d.y - 8 + bob], [d.x - 10, d.y - 10 + bob]], '#fff4e0');
  c.fillStyle = '#3f8a3e'; c.beginPath(); c.arc(d.x + 10, d.y - 14 + bob, 6, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#f0a020'; c.beginPath(); c.moveTo(d.x + 15, d.y - 14 + bob); c.lineTo(d.x + 22, d.y - 12 + bob); c.lineTo(d.x + 15, d.y - 10 + bob); c.fill();
}

/* ---------- ground ---------- */
const patterns = new WeakMap();
function pattern(c, img) { let m = patterns.get(c); if (!m) { m = new Map(); patterns.set(c, m); } if (!m.has(img)) m.set(img, c.createPattern(img, 'repeat')); return m.get(img); }
function stroke(c, pts, width, paint) { c.strokeStyle = paint; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
function ground(c, w, a, clock) {
  c.fillStyle = pattern(c, a.grass); c.fillRect(-600, -600, w.width + 1200, w.height + 1200);
  stroke(c, w.path, 84, '#d0cbbb'); stroke(c, w.path, 70, pattern(c, a.path));
  for (const r of w.water) { stroke(c, r.points, r.width + 26, '#a0c895'); stroke(c, r.points, r.width, pattern(c, a.water)); }
  // dock planks over the creek
  for (const b of w.bridges) { c.fillStyle = '#b07a4c'; c.fillRect(b.x, b.y, b.w, b.h); c.fillStyle = '#8f5f38'; for (let y = b.y; y < b.y + b.h; y += 22) c.fillRect(b.x, y, b.w, 3); c.strokeStyle = OUT; c.lineWidth = 1.6; c.strokeRect(b.x, b.y, b.w, b.h); }
  for (const p of w.props) if (p.type === 'blanket') blanket(c, p);
}

/* ---------- frame ---------- */
export function render(c, game, play, world, v, a) {
  const { width, height, touch } = v, clock = v.reduceMotion ? 0 : v.time;
  c.clearRect(0, 0, width, height); if (!a) return;
  const cam = cameraFor(game.player, world, v); c.save(); c.scale(cam.zoom, cam.zoom); c.translate(-cam.x, -cam.y);
  ground(c, world, a, clock);
  for (const d of world.ducks) duck(c, { x: d[0] + Math.sin(clock * .3 + d[1]) * 40, y: d[1] }, clock, v.reduceMotion);
  for (const h of game.humans) { const s = visionOf(h); if (s.range < 12) continue; c.save(); c.translate(h.x, h.y); c.rotate(h.facing); const g = c.createRadialGradient(0, 0, 10, 0, 0, s.range); g.addColorStop(0, h.awareness > 0 ? '#ff7d434d' : '#fff3af55'); g.addColorStop(1, '#fff3af05'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, s.range, -s.half, s.half); c.closePath(); c.fill(); c.restore(); }
  const items = [];
  items.push({ sortY: world.den.y, draw: () => den(c, world.den) });
  for (const t of world.trees) items.push({ sortY: t.y, draw: () => { c.save(); if (Math.abs(game.player.x - t.x) < 70 && game.player.y < t.y && game.player.y > t.y - 160) c.globalAlpha = .4; const w = 170, h = w * a.tree.height / a.tree.width; c.drawImage(a.tree, t.x - w / 2, t.y - h + 8, w, h); c.restore(); } });
  for (const b of world.bushes) items.push({ sortY: b.y + b.h, draw: () => { const inside = game.player.x >= b.x && game.player.x <= b.x + b.w && game.player.y >= b.y && game.player.y <= b.y + b.h; c.save(); c.globalAlpha = inside ? .3 : 1; const w = b.w + 34, h = w * a.shrub.height / a.shrub.width; c.drawImage(a.shrub, b.x + b.w / 2 - w / 2, b.y + b.h - h + 14, w, h); c.restore(); } });
  for (const p of world.props) if (PROPS[p.type]) items.push({ sortY: p.y + (p.type === 'tent' ? p.h / 2 : 0), draw: () => PROPS[p.type](c, p, clock, v, a) });
  for (const s of world.spots) if (spotReady(play, s, v.sceneTime)) items.push({ sortY: s.y - 1, draw: () => drawItem(c, s.item, s.x, s.y - (s.item === 'sausage' ? 42 : s.item === 'yakult' ? 46 : s.item === 'fish' ? 30 : 6), s.item === 'fish' ? .8 : 1) });
  for (const h of world.anthills) items.push({ sortY: h.y, draw: () => anthill(c, h, (game.anthills?.[h.id] ?? 0) <= v.sceneTime, clock, v.reduceMotion) });
  items.push({ sortY: world.cat.y, draw: () => { const img = a.cat, w = 46, hh = w * img.height / img.width; shadow(c, world.cat.x, world.cat.y, 16, 4); c.drawImage(img, world.cat.x - w / 2, world.cat.y - hh + 2 + (v.reduceMotion ? 0 : Math.sin(clock * 2.4) * .6), w, hh); } });
  for (const h of game.humans) items.push({ sortY: h.y, draw: () => actor(c, sheetFor(a, h.look), h, 84, rowFor(h.facing), activityOf(h) === 'walk' && h.route[0].x !== h.route[1].x && !v.reduceMotion ? Math.floor(clock * 8) % 4 : 0) });
  items.push({ sortY: game.player.y, draw: () => { const p = game.player; if (p.curled) { shadow(c, p.x, p.y, 20, 6); c.drawImage(a.curl, p.x - 29, p.y - 53, 58, 58); } else actor(c, a.pangolin, p, 85, ROW[p.direction] ?? 0, p.moving && !v.reduceMotion ? Math.floor(clock * 8) % 4 : 0); } });
  depthSort(items).forEach(i => i.draw());
  // things floating above everything: habit bubbles, alarm marks, prompts
  for (const h of game.humans) { if (h.awareness > 0) pill(c, h.mode === 'chase' ? '!' : '?', h.x, h.y - 88); else if (activityOf(h) !== 'walk') habitBubble(c, h, activityOf(h), clock, isWaking(h), v.reduceMotion); }
  if (REQUESTS[play.quest]) { c.fillStyle = '#203f36ec'; c.beginPath(); c.roundRect(world.cat.x - 13, world.cat.y - 86, 26, 26, 9); c.fill(); text(c, '!', world.cat.x, world.cat.y - 73, 16); }
  if (!v.busy && v.prompt) pill(c, v.prompt.label, v.prompt.x, v.prompt.y);
  c.restore();
}
export { REACH };
