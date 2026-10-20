// v15 style sample: the plaza inside NCCU's main gate, drawn entirely from
// code (src/art/sprites.mjs). Separate page so the live game is untouched.
import { P, SHADOW } from './palette.mjs';
import * as S from './sprites.mjs';

const W = 1800, H = 1200;
const ROAD = { y: 1020, h: 100 }, SIDEWALK = { y: 968, h: 52 };
const PLAZA = { x: 640, y: 760, w: 520, h: 208 }, PATH = { x: 840, w: 120 };

// Deterministic scatter so the scene is identical on every load.
let seed = 7; const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const onPaving = (x, y) => (x > PATH.x - 20 && x < PATH.x + PATH.w + 20 && y < PLAZA.y + 20) ||
  (x > PLAZA.x - 20 && x < PLAZA.x + PLAZA.w + 20 && y > PLAZA.y - 20) || y > SIDEWALK.y - 30;

const props = [];
const add = (sprite, key, x, y, extra = {}) => props.push({ sprite, key, x, y, ...extra });
// gate, name wall and guard booth
add(S.gatePillar(), 'pillar', 812, 966); add(S.gatePillar(), 'pillar', 988, 966);
add(S.nameWall(), 'namewall', 1180, 962, { label: '國立政治大學' });
add(S.nameWall(), 'namewall', 620, 962, { label: 'NATIONAL CHENGCHI UNIVERSITY', small: true });
add(S.guardBooth(), 'booth', 1240, 860);
// avenue of trees
for (let y = 130, i = 0; y < 720; y += 125, i++) { add(S.tree(i % 2), `tree${i % 2}`, 770, y); add(S.tree((i + 1) % 2), `tree${(i + 1) % 2}`, 1030, y + 40); }
for (const [x, y, k] of [[420, 260, 0], [300, 560, 1], [520, 700, 0], [1380, 300, 1], [1540, 620, 0], [1300, 640, 1], [160, 860, 0], [1660, 880, 1]]) add(S.tree(k), `tree${k}`, x, y);
// plaza furniture
add(S.bench(), 'bench', 700, 820); add(S.bench(), 'bench', 1100, 820);
add(S.lamp(), 'lamp', 652, 780); add(S.lamp(), 'lamp', 1148, 780); add(S.lamp(), 'lamp', 440, 1012); add(S.lamp(), 'lamp', 1360, 1012);
// avenue furniture: lamps and benches facing the path
for (let y = 210; y < 700; y += 250) { add(S.lamp(), 'lamp', 826, y); add(S.lamp(), 'lamp', 974, y + 110); }
add(S.bench(), 'bench', 700, 470); add(S.bench(), 'bench', 1110, 300); add(S.bin(), 'bin', 1160, 312);
add(S.bin(), 'bin', 768, 830);
for (const [i, color] of [P.red, P.shirtBlue, P.shirtYellow].entries()) add(S.bicycle(color), `bike${i}`, 520 + i * 26, 900 + i * 8);
// flower beds and hedges
for (const [x, y, f] of [[600, 760, 1], [1200, 760, 1], [700, 700, 0], [1110, 700, 0], [470, 930, 1], [1340, 940, 1], [812, 748, 1], [990, 748, 1], [690, 520, 1], [1160, 360, 0], [210, 420, 1], [1500, 400, 1]]) add(S.bush(Boolean(f)), f ? 'bushF' : 'bush', x, y);
// small life: rocks, mushrooms, tufts, fallen leaves
for (let i = 0; i < 140; i++) {
  const x = rand() * W, y = rand() * (SIDEWALK.y - 40);
  if (onPaving(x, y)) continue;
  const kind = rand();
  if (kind < .7) add(S.tuft(), 'tuft', x, y, { flat: true });
  else if (kind < .82) add(S.rock(), 'rock', x, y);
  else add(S.mushroom(), 'mushroom', x, y);
}
const leaves = Array.from({ length: 70 }, () => ({ x: PATH.x - 30 + rand() * (PATH.w + 60), y: rand() * PLAZA.y, k: rand() < .5 ? 0 : 1, a: rand() * 6 }));

const pigeons = [[860, 860], [890, 875], [930, 850], [720, 900]].map(([x, y], i) => ({ x, y, home: { x, y }, t: i * .37, fled: 0 }));
const people = [
  { look: 'student', x: 900, y: 600, route: [[900, 250], [900, 900]], speed: 34, phone: true, habit: 'phone' },
  { look: 'jogger', x: 300, y: 996, route: [[120, 996], [1700, 996]], speed: 80 },
  { look: 'reader', x: 700, y: 470, route: null, dir: 'south', sitting: true },
  { look: 'guard', x: 1306, y: 868, route: null, habit: 'nap', dir: 'south' },
].map(p => ({ ...p, leg: 0, dir: p.dir ?? 'south', anim: 0 }));

const player = { x: 900, y: 940, dir: 'east', moving: false, curled: false, anim: 0 };
const keys = new Set(), stick = { x: 0, y: 0, id: null, ox: 0, oy: 0 };

// --- sprite cache: SVG -> Image, rasterised at the current zoom for crisp edges
const cache = new Map(); let rasterScale = 1;
function image(key, sprite) {
  const k = `${key}@${rasterScale}`;
  if (!cache.has(k)) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(S.svgMarkup(sprite, rasterScale)); cache.set(k, img); }
  return cache.get(k);
}
function draw(ctx, key, sprite, x, y, flip = false) {
  const img = image(key, sprite); if (!img.complete) return;
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -sprite.w / 2, -sprite.h, sprite.w, sprite.h); ctx.restore();
}

function ground(ctx) {
  ctx.fillStyle = P.grass; ctx.fillRect(-400, -400, W + 800, H + 800);
  seed = 99;
  for (let i = 0; i < 70; i++) { ctx.fillStyle = rand() < .55 ? P.grassDark : P.grassLight; ctx.beginPath(); ctx.ellipse(rand() * W, rand() * SIDEWALK.y, 30 + rand() * 70, 14 + rand() * 30, 0, 0, 7); ctx.fill(); }
  // brick avenue
  ctx.fillStyle = P.brick; ctx.fillRect(PATH.x, -400, PATH.w, PLAZA.y + 400);
  ctx.fillStyle = P.brickJoint; for (let y = -400; y < PLAZA.y; y += 22) { ctx.fillRect(PATH.x, y, PATH.w, 2); for (let x = PATH.x + ((y / 22) % 2 ? 0 : 20); x < PATH.x + PATH.w; x += 40) ctx.fillRect(x, y, 2, 22); }
  ctx.fillStyle = P.curb; ctx.fillRect(PATH.x - 6, -400, 6, PLAZA.y + 400); ctx.fillRect(PATH.x + PATH.w, -400, 6, PLAZA.y + 400);
  // stone plaza
  ctx.fillStyle = P.curb; ctx.fillRect(PLAZA.x - 6, PLAZA.y - 6, PLAZA.w + 12, PLAZA.h + 12);
  ctx.fillStyle = P.stone; ctx.fillRect(PLAZA.x, PLAZA.y, PLAZA.w, PLAZA.h);
  ctx.fillStyle = P.stoneJoint; for (let x = PLAZA.x; x < PLAZA.x + PLAZA.w; x += 52) ctx.fillRect(x, PLAZA.y, 2, PLAZA.h); for (let y = PLAZA.y; y < PLAZA.y + PLAZA.h; y += 52) ctx.fillRect(PLAZA.x, y, PLAZA.w, 2);
  ctx.fillStyle = P.brick; ctx.beginPath(); ctx.arc(900, 864, 56, 0, 7); ctx.fill(); ctx.fillStyle = P.stone; ctx.beginPath(); ctx.arc(900, 864, 40, 0, 7); ctx.fill();
  ctx.fillStyle = P.bushDark; ctx.beginPath(); ctx.arc(900, 864, 30, 0, 7); ctx.fill(); ctx.fillStyle = P.bush; ctx.beginPath(); ctx.arc(898, 860, 26, 0, 7); ctx.fill();
  // sidewalk, road, crosswalk
  ctx.fillStyle = P.stone; ctx.fillRect(-400, SIDEWALK.y, W + 800, SIDEWALK.h);
  ctx.fillStyle = P.stoneJoint; for (let x = -400; x < W + 400; x += 40) ctx.fillRect(x, SIDEWALK.y, 2, SIDEWALK.h);
  ctx.fillStyle = P.curb; ctx.fillRect(-400, ROAD.y - 8, W + 800, 8); ctx.fillStyle = P.curbShade; ctx.fillRect(-400, ROAD.y - 2, W + 800, 2);
  ctx.fillStyle = P.asphalt; ctx.fillRect(-400, ROAD.y, W + 800, ROAD.h + 400);
  ctx.fillStyle = P.asphaltDark; ctx.fillRect(-400, ROAD.y + ROAD.h - 30, W + 800, 30);
  ctx.fillStyle = P.paint; for (let x = -400; x < W + 400; x += 80) if (x < 800 || x > 1000) ctx.fillRect(x, ROAD.y + ROAD.h / 2 - 2, 44, 4);
  for (let x = 820; x < 980; x += 26) ctx.fillRect(x, ROAD.y + 8, 14, ROAD.h - 16);
  // fallen leaves on the avenue
  for (const l of leaves) { ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.a); draw(ctx, `leaf${l.k}`, S.fallenLeaf(l.k), 0, 5); ctx.restore(); }
}

function bubble(ctx, x, y, kind, t) {
  ctx.save(); ctx.fillStyle = P.white; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 4, y + 9); ctx.lineTo(x, y + 16); ctx.lineTo(x + 3, y + 9); ctx.fill();
  if (kind === 'phone') { ctx.fillStyle = P.metal; ctx.beginPath(); ctx.roundRect(x - 4.5, y - 7, 9, 14, 2); ctx.fill(); ctx.fillStyle = P.glass; ctx.fillRect(x - 3, y - 5, 6, 9); }
  else { ctx.fillStyle = P.ink; ctx.font = '800 13px "Avenir Next", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Z', x, y + 1);
    for (let k = 0; k < 3; k++) { const p = (t * .5 + k / 3) % 1; ctx.globalAlpha = 1 - p; ctx.fillStyle = P.white; ctx.font = `800 ${8 + p * 6}px system-ui`; ctx.fillText('z', x + 14 + p * 12, y - 6 - p * 22); } }
  ctx.restore();
}

function wallText(ctx, p) {
  ctx.save(); ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = p.small ? '700 11px "Avenir Next", system-ui, sans-serif' : '800 17px "PingFang TC", "Noto Sans TC", system-ui, sans-serif';
  if (!p.small) ctx.letterSpacing = '6px';
  ctx.fillText(p.label, p.x + (p.small ? 0 : 3), p.y - 35); ctx.restore();
}

function update(dt, t) {
  let dx = (keys.has('right') - keys.has('left')) + stick.x, dy = (keys.has('down') - keys.has('up')) + stick.y;
  const m = Math.hypot(dx, dy); player.curled = keys.has('curl');
  player.moving = m > 0.1 && !player.curled;
  if (player.moving) {
    dx /= Math.max(1, m); dy /= Math.max(1, m);
    player.x = Math.max(20, Math.min(W - 20, player.x + dx * 130 * dt)); player.y = Math.max(40, Math.min(H - 20, player.y + dy * 130 * dt));
    if (Math.abs(dx) > .2) player.dir = dx > 0 ? 'east' : 'west';
    player.anim += dt * 9;
  }
  for (const p of people) {
    if (!p.route) continue;
    const [a, b] = p.route, target = p.back ? a : b, ddx = target[0] - p.x, ddy = target[1] - p.y, d = Math.hypot(ddx, ddy);
    if (d < 3) { p.back = !p.back; continue; }
    p.x += ddx / d * p.speed * dt; p.y += ddy / d * p.speed * dt; p.anim += dt * (p.speed / 9);
    p.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'east' : 'west') : (ddy > 0 ? 'south' : 'north');
  }
  for (const b of pigeons) {
    const near = Math.hypot(player.x - b.x, player.y - b.y) < 70;
    if (near && !b.fled) { b.fled = 1; b.vx = (b.x - player.x) || 1; b.vy = -40; }
    if (b.fled) { b.x += Math.sign(b.vx) * 160 * dt; b.y += b.vy * dt; b.fled += dt; if (b.fled > 2.5) { b.x = b.home.x; b.y = b.home.y; b.fled = 0; } }
  }
}

function frame(ctx, view, t) {
  const { width, height, dpr } = view;
  const zoom = height / 520;
  const scale = Math.ceil(zoom * dpr * 2) / 2;
  if (scale !== rasterScale) { rasterScale = scale; }
  const camX = Math.max(-200, Math.min(W + 200 - width / zoom, player.x - width / zoom / 2));
  const camY = Math.max(-100, Math.min(H + 60 - height / zoom, player.y - height / zoom * .58));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  ctx.save(); ctx.scale(zoom, zoom); ctx.translate(-camX, -camY);
  ground(ctx);
  const items = [];
  const visible = (x, y, w = 300, h = 300) => x > camX - w && x < camX + width / zoom + w && y > camY - 40 && y < camY + height / zoom + h;
  for (const p of props) if (visible(p.x, p.y)) {
    if (p.flat) draw(ctx, p.key, p.sprite, p.x, p.y);
    else items.push({ y: p.y, draw: () => { draw(ctx, p.key, p.sprite, p.x, p.y); if (p.label) wallText(ctx, p); } });
  }
  for (const b of pigeons) items.push({ y: b.y, draw: () => draw(ctx, `pigeon${b.fled ? 0 : Math.floor(t * 2 + b.t * 3) % 2}`, S.pigeon(b.fled ? 0 : Math.floor(t * 2 + b.t * 3) % 2), b.x, b.y - (b.fled ? b.fled * 30 : 0), b.fled ? b.vx < 0 : false) });
  for (const p of people) items.push({ y: p.y + (p.sitting ? 1 : 0), draw: () => {
    const dir = p.dir === 'west' ? 'east' : p.dir, f = Math.floor(p.anim) % 2;
    draw(ctx, `${p.look}-${dir}-${f}-${p.phone ? 1 : 0}-${p.sitting ? 1 : 0}`, S.person(p.look, dir, p.route ? f : 0, { phone: p.phone, sitting: p.sitting }), p.x, p.y - (p.sitting ? 10 : 0), p.dir === 'west');
    if (p.habit) bubble(ctx, p.x, p.y - 74, p.habit, t);
  } });
  items.push({ y: player.y, draw: () => {
    const f = Math.floor(player.anim) % 2;
    if (player.curled) draw(ctx, 'curl', S.pangolin(0, true), player.x, player.y);
    else draw(ctx, `pangolin${f}`, S.pangolin(player.moving ? f : 0), player.x, player.y, player.dir === 'west');
  } });
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
  ctx.restore();
}

export function start(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { width: 0, height: 0, dpr: 1 };
  const resize = () => { const r = canvas.getBoundingClientRect(); view.dpr = Math.min(devicePixelRatio || 1, 2); view.width = r.width; view.height = r.height; canvas.width = Math.round(r.width * view.dpr); canvas.height = Math.round(r.height * view.dpr); };
  new ResizeObserver(resize).observe(canvas); resize();
  const map = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right', c: 'curl', shift: 'curl' };
  addEventListener('keydown', e => { const k = map[e.key.toLowerCase()]; if (k) { keys.add(k); e.preventDefault(); } });
  addEventListener('keyup', e => { const k = map[e.key.toLowerCase()]; if (k) keys.delete(k); });
  addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointerdown', e => { if (stick.id !== null) return; stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (e.pointerId !== stick.id) return; const dx = e.clientX - stick.ox, dy = e.clientY - stick.oy, d = Math.hypot(dx, dy); const s = Math.min(1, d / 50); stick.x = d ? dx / d * s : 0; stick.y = d ? dy / d * s : 0; });
  for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, e => { if (e.pointerId === stick.id) { stick.id = null; stick.x = stick.y = 0; } });
  let last = performance.now();
  const loop = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt, now / 1000); frame(ctx, view, now / 1000); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  return { player, people, set: (x, y) => { player.x = x; player.y = y; } };
}
