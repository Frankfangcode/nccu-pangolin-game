// Code-drawn flat sprites (v15 art bible). Rules:
// - top-down 3/4: you see the top and the south-facing front of everything
// - no outlines; shading is the same hue darker; one soft shadow down-right
// - anchor is the bottom-centre of the box (where the thing touches the ground)
import { P, SHADOW } from './palette.mjs';

const c = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
const e = (x, y, rx, ry, f) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"/>`;
const r = (x, y, w, h, f, rad = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${f}"/>`;
const path = (d, f) => `<path d="${d}" fill="${f}"/>`;
const line = (d, s, w) => `<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const shadow = (x, y, rx, ry) => e(x, y, rx, ry, SHADOW);

export function svgMarkup({ w, h, body }, scale = 1) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(w * scale)}" height="${Math.round(h * scale)}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
}

export function tree(kind = 0) {
  const s = kind === 1 ? 0.8 : 1;
  const k = (x, y, rad, f) => c(60 + (x - 60) * s, 100 + (y - 100) * s, rad * s, f);
  return {
    w: 120, h: 150,
    body: shadow(68, 140, 46 * s, 10 * s) +
      r(54, 100, 12, 44, P.trunk, 3) + r(60, 100, 6, 44, P.trunkDark, 2) +
      k(38, 90, 30, P.leafDark) + k(82, 90, 30, P.leafDark) + k(60, 100, 30, P.leafDark) +
      k(36, 72, 30, P.leaf) + k(84, 72, 30, P.leaf) + k(60, 54, 34, P.leaf) + k(60, 80, 33, P.leaf) +
      k(48, 46, 15, P.leafLight) + k(32, 64, 10, P.leafLight) + k(72, 38, 9, P.leafLight) + k(42, 30, 6, P.leafLight),
  };
}

export function bush(flowers = true) {
  const fl = (x, y) => [0, 1, 2, 3, 4].map(i => c(x + Math.cos(i * 1.256) * 2.6, y + Math.sin(i * 1.256) * 2.6, 2, P.petal)).join('') + c(x, y, 1.4, P.pollen);
  return {
    w: 72, h: 52,
    body: shadow(40, 46, 32, 6) + c(22, 34, 16, P.bushDark) + c(50, 34, 16, P.bushDark) + c(36, 38, 15, P.bushDark) +
      c(22, 28, 15, P.bush) + c(50, 28, 15, P.bush) + c(36, 20, 16, P.bush) + c(36, 31, 15, P.bush) +
      c(30, 15, 6, P.leafLight) + c(16, 24, 4, P.leafLight) +
      (flowers ? fl(24, 26) + fl(44, 18) + fl(52, 32) + fl(34, 36) : ''),
  };
}

export function bench() {
  return {
    w: 80, h: 48,
    body: shadow(44, 44, 36, 4) + r(10, 34, 5, 10, P.metal) + r(65, 34, 5, 10, P.metal) +
      r(6, 4, 68, 9, P.wood, 2) + r(6, 10, 68, 3, P.woodDark) +
      r(6, 16, 68, 20, P.wood, 2) + r(6, 22, 68, 1.5, P.woodDark) + r(6, 28, 68, 1.5, P.woodDark) + r(6, 34, 68, 4, P.woodDark, 1),
  };
}

export function lamp() {
  return {
    w: 26, h: 96,
    body: shadow(16, 92, 9, 3) + r(7, 84, 12, 8, P.metal, 2) + r(11, 16, 4, 70, P.metal) + r(13, 16, 1.5, 70, P.metalLight) +
      r(4, 4, 18, 13, P.metal, 4) + e(13, 17, 6, 3, P.lamp),
  };
}

export function bin() {
  return {
    w: 30, h: 40,
    body: shadow(17, 37, 12, 3) + r(5, 10, 20, 26, P.leafDark, 4) + r(5, 30, 20, 6, P.trunkDark, 3) + e(15, 11, 10, 4, P.metal) + e(15, 11, 6, 2.2, P.metalLight),
  };
}

export function bicycle(color = P.red) {
  return {
    w: 58, h: 36,
    body: shadow(30, 34, 24, 3) + line('M12 25 L24 25 L33 13 L19 13 Z M33 13 L45 25 M24 25 L19 11', color, 3) +
      `<circle cx="12" cy="25" r="9" fill="none" stroke="${P.metal}" stroke-width="3"/><circle cx="45" cy="25" r="9" fill="none" stroke="${P.metal}" stroke-width="3"/>` +
      r(15, 8, 9, 3, P.metal, 1.5) + line('M33 13 L35 6 L40 6', P.metal, 2.5),
  };
}

export function rock() {
  return { w: 30, h: 20, body: shadow(17, 17, 12, 3) + path('M3 16 Q2 6 12 4 Q24 2 27 12 Q28 17 20 17 Z', P.rock) + path('M12 4 Q22 3 25 9 Q18 8 12 10 Z', P.wall) + path('M3 16 Q14 18 27 14 Q26 18 18 18 L6 18 Z', P.rockDark) };
}

export function mushroom() {
  return { w: 22, h: 22, body: shadow(12, 20, 7, 2) + r(9, 10, 5, 9, P.mushroomStem, 2) + path('M2 12 Q11 -2 20 12 Z', P.mushroom) + c(8, 8, 1.6, P.white) + c(14, 6, 1.3, P.white) };
}

export function fallenLeaf(kind = 0) {
  return { w: 14, h: 10, body: path('M1 6 Q6 -1 13 4 Q8 10 1 6 Z', kind ? P.leafFall2 : P.leafFall1) };
}

export function tuft() {
  return { w: 16, h: 12, body: path('M2 12 L5 3 L7 12 Z M6 12 L9 0 L11 12 Z M10 12 L13 4 L14 12 Z', P.tuft) };
}

export function pigeon(frame = 0) {
  const peck = frame % 2 ? 3 : 0;
  return { w: 24, h: 18, body: shadow(13, 16, 8, 2) + e(11, 10, 8, 5, P.pigeon) + path('M4 9 L-1 7 L3 12 Z', P.pigeonDark) + c(18, 7 + peck, 4, P.pigeonDark) + path(`M21 ${6 + peck} L24 ${7 + peck} L21 ${8 + peck} Z`, P.mushroom) + c(19, 6 + peck, 0.9, P.eye) + r(9, 14, 1.4, 3, P.mushroom) + r(13, 14, 1.4, 3, P.mushroom) };
}

export function gatePillar() {
  return {
    w: 60, h: 128,
    body: shadow(36, 124, 28, 5) + r(6, 30, 46, 90, P.wall) + r(40, 30, 12, 90, P.wallShade) + r(6, 104, 46, 16, P.brick) + r(40, 104, 12, 16, P.brickJoint) +
      r(6, 14, 46, 18, P.wallTop) + r(2, 8, 54, 10, P.red, 2) + r(2, 14, 54, 4, P.redDark) + r(16, 46, 26, 34, P.wallShade, 2),
  };
}

export function nameWall() {
  return {
    w: 270, h: 70,
    body: shadow(140, 66, 132, 5) + r(4, 8, 262, 14, P.wallTop) + r(4, 20, 262, 44, P.wall) + r(4, 50, 262, 14, P.brick) + r(4, 58, 262, 6, P.brickJoint) +
      r(30, 24, 210, 22, P.wallShade, 3),
  };
}

export function guardBooth() {
  return {
    w: 116, h: 124,
    body: shadow(64, 120, 56, 6) + r(10, 58, 96, 60, P.wall) + r(86, 58, 20, 60, P.wallShade) +
      r(18, 68, 44, 28, P.glassDark, 3) + r(20, 70, 40, 24, P.glass, 2) + path('M24 92 L40 70 L48 70 L32 92 Z', P.wallTop) +
      r(70, 70, 22, 48, P.door, 2) + c(88, 95, 1.8, P.pollen) +
      r(2, 6, 112, 46, P.roof, 6) + r(2, 46, 112, 12, P.roofDark, 3) + r(10, 12, 96, 4, P.metalLight, 2),
  };
}

// Big-headed, round-bodied campus people. dir: 'south' | 'north' | 'east' (west = mirrored east)
export const LOOKS = {
  student: { skin: P.skin1, hair: P.hair1, shirt: P.shirtRed, legs: P.jeans, pack: P.shirtYellow },
  jogger: { skin: P.skin2, hair: P.hair3, shirt: P.shirtBlue, legs: P.navy },
  reader: { skin: P.skin2, hair: P.hair2, shirt: P.shirtGreen, legs: P.jeans },
  guard: { skin: P.skin3, hair: P.hair2, shirt: P.guard, legs: P.guardDark, cap: P.cap },
};
export function person(look, dir = 'south', frame = 0, extras = {}) {
  const L = LOOKS[look] ?? look;
  const step = frame % 2 ? 2.5 : 0;
  let body = shadow(22, 58, 13, 4);
  body += r(14, 46 - step, 6, 10, L.legs, 3) + r(24, 46 - (step ? 0 : 2.5), 6, 10, L.legs, 3);
  if (L.pack && dir === 'north') body += r(11, 28, 22, 18, L.pack, 6);
  body += r(11, 30, 22, 20, L.shirt, 9) + r(11, 42, 22, 8, SHADOW, 6);
  body += e(10, 38 + (step ? 1 : -1), 3.6, 6.5, L.shirt) + e(34, 38 - (step ? 1 : -1), 3.6, 6.5, L.shirt);
  body += c(10, 44 + (step ? 1 : -1), 2.8, L.skin) + c(34, 44 - (step ? 1 : -1), 2.8, L.skin);
  if (L.pack && dir === 'south') body += r(14, 31, 2.5, 12, L.pack, 1) + r(27.5, 31, 2.5, 12, L.pack, 1);
  if (extras.phone && dir !== 'north') body += r(17, 38, 9, 12, P.metal, 2) + r(18.5, 39.5, 6, 8, P.glass, 1);
  // head: seen from above, so hair takes the top half
  body += c(22, 19, 14, L.skin);
  if (dir === 'north') body += c(22, 18, 14.4, L.hair);
  else if (dir === 'east') body += path('M8 18 Q8 4 22 4 Q34 4 36 14 Q28 12 24 16 Q20 22 12 26 Q8 24 8 18 Z', L.hair);
  else body += path('M8 19 Q8 4 22 4 Q36 4 36 19 Q32 11 22 12 Q12 11 8 19 Z', L.hair);
  // a cap sits on the crown; the brim stops above the eyes
  if (L.cap) body += path('M8 16 Q8 3 22 3 Q36 3 36 16 Z', L.cap) + (dir === 'north' ? '' : dir === 'east' ? e(33, 15, 7, 2.6, L.cap) : e(22, 15.5, 12, 2.6, L.cap));
  if (dir === 'east') body += c(30, 21, 1.8, P.eye);
  else if (dir === 'south') body += c(17, 21, 1.8, P.eye) + c(27, 21, 1.8, P.eye) + r(20, 26, 4, 1.4, P.skin3, 0.7);
  if (extras.sitting) body = body.replace(r(14, 46 - step, 6, 10, L.legs, 3), '');
  return { w: 44, h: 62, body };
}

// The robot pangolin, top-down 3/4, facing east.
export function pangolin(frame = 0, curled = false) {
  if (curled) return { w: 48, h: 40, body: shadow(26, 36, 20, 4) + c(24, 22, 16, P.pangolin) + [0, 1, 2].map(i => `<path d="M${10 + i * 2} ${14 + i * 7} Q24 ${6 + i * 7} ${38 - i * 2} ${14 + i * 7}" fill="none" stroke="${P.pangolinDark}" stroke-width="3" stroke-linecap="round"/>`).join('') + c(33, 28, 1.6, P.glass) };
  const a = frame % 2 ? 2 : -2;
  const scales = [0, 1, 2].map(row => [0, 1, 2, 3].map(i => `<path d="M${16 + i * 9 + row * 2} ${16 + row * 6} q4.5 -5 9 0" fill="none" stroke="${P.pangolinDark}" stroke-width="2.2" stroke-linecap="round"/>`).join('')).join('');
  return {
    w: 76, h: 44,
    body: shadow(38, 40, 28, 4) +
      e(18 + a, 36, 3.5, 4, P.pangolinDark) + e(46 - a, 36, 3.5, 4, P.pangolinDark) +
      path('M14 24 Q2 26 1 36 Q8 30 18 30 Z', P.pangolin) + e(32, 24, 20, 12, P.pangolin) + e(32, 30, 18, 6, P.pangolinDark) + scales +
      e(26 - a, 37, 3.5, 4, P.pangolin) + e(52 + a, 36, 3.5, 4, P.pangolin) +
      e(55, 25, 9, 7.5, P.pangolinBelly) + path('M60 22 L74 27 L61 30 Z', P.pangolinBelly) + c(58, 23, 1.8, P.eye) + c(48, 22, 1.8, P.glass),
  };
}
