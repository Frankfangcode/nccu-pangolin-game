// v16 吃螞蟻覓食：體力、蟻丘、點螞蟻小遊戲。
// 小遊戲是右下角的面板，不是對話框：世界照常運作，路人看過來就會被打斷，
// 所以要挑路人打瞌睡或滑手機的時候吃。
export const STAMINA = { drainPerSecond: 1 / 150, low: .2, slow: .6 };
export const ANTHILL_RESPAWN = 60;      // 秒（場景時間）
export const FORAGE_SECONDS = 15;
const REACH = 34;

/** 走路慢慢耗體力；站著不耗。 */
export function drainStamina(state, dt, moving) {
  if (!moving) return state;
  return { ...state, stamina: Math.max(0, (state.stamina ?? 1) - STAMINA.drainPerSecond * Math.min(Math.max(dt, 0), .05)) };
}
export const isTired = state => (state.stamina ?? 1) < STAMINA.low;
export const anthillReady = (state, hill, now) => (state.anthills?.[hill.id] ?? 0) <= now;
/** 伸手可及、而且螞蟻已經回來的蟻丘。 */
export function nearbyAnthill(state, world, now) {
  return (world.anthills ?? []).find(h => Math.hypot(h.x - state.player.x, h.y - state.player.y) < REACH && anthillReady(state, h, now)) ?? null;
}
/** 一局的分數換成體力：吃 15 隻左右就吃飽。 */
export const forageGain = score => Math.max(0, Math.min(1, score * .07));
export function finishForage(state, hill, score, now) {
  return { ...state, stamina: Math.min(1, (state.stamina ?? 1) + forageGain(score)), anthills: { ...state.anthills, [hill.id]: now + ANTHILL_RESPAWN } };
}

/** 一隻螞蟻：從蟻道口爬出來、沿著彎曲路線往上走。兵蟻比較大、紅色，點到會被咬。 */
export function spawnAnt(seed, lanes = 3) {
  const lane = seed % lanes, soldier = (seed * 7919) % 5 === 0;
  return { lane, soldier, t: 0, speed: soldier ? .22 : .3 + (seed % 4) * .04, wiggle: (seed % 6) / 6 * Math.PI * 2, alive: true };
}
export function antPosition(ant, width, height) {
  const x0 = width * (ant.lane + .5) / 3, y = height * (1 - ant.t);
  return { x: x0 + Math.sin(ant.t * 9 + ant.wiggle) * width * .07, y };
}

export function createForage(root) {
  const canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d'), scoreEl = root.querySelector('[data-score]'), timeEl = root.querySelector('[data-time]'), hintEl = root.querySelector('[data-hint]');
  let ants = [], score = 0, left = 0, spawnIn = 0, seed = 1, onEnd = null, running = false, last = 0, shake = 0;
  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() { const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); return r; }
  function draw() {
    const { width: w, height: h } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, w, h);
    ctx.save(); if (shake > 0 && !still()) ctx.translate((Math.random() - .5) * 8 * shake, 0);
    ctx.fillStyle = '#8a6440'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#6e4e31'; for (let i = 0; i < 3; i++) { const x = w * (i + .5) / 3; ctx.beginPath(); ctx.ellipse(x, h - 6, 26, 12, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#a77d55'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc((i * 97) % w, (i * 53) % h, 2, 0, 7); ctx.fill(); }
    for (const a of ants) {
      if (!a.alive) continue;
      const { x, y } = antPosition(a, w, h), s = a.soldier ? 1.6 : 1;
      ctx.fillStyle = a.soldier ? '#c9442f' : '#2a1d14';
      [-7, 0, 7].forEach((dy, i) => { ctx.beginPath(); ctx.ellipse(x, y + dy * s, (i === 1 ? 3.4 : 4.4) * s, (i === 1 ? 3.6 : 4.6) * s, 0, 0, 7); ctx.fill(); });
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.4 * s;
      for (const side of [-1, 1]) for (const dy of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(x, y + dy * s); ctx.lineTo(x + side * 9 * s, y + (dy + 3) * s); ctx.stroke(); }
    }
    ctx.restore();
  }
  function step(now) {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; left -= dt; shake = Math.max(0, shake - dt * 3);
    spawnIn -= dt; if (spawnIn <= 0) { ants.push(spawnAnt(seed++)); spawnIn = .38 + (seed % 3) * .08; }
    for (const a of ants) a.t += a.speed * dt;
    ants = ants.filter(a => a.alive && a.t < 1.05);
    timeEl.style.setProperty('--left', Math.max(0, left / FORAGE_SECONDS));
    draw();
    if (left <= 0) return end('done');
    requestAnimationFrame(step);
  }
  function tap(e) {
    if (!running) return; e.preventDefault();
    const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    let best = null, bestD = 30;
    for (const a of ants) { if (!a.alive) continue; const { x, y } = antPosition(a, r.width, r.height), d = Math.hypot(px - x, py - y); if (d < bestD) { best = a; bestD = d; } }
    if (!best) return;
    best.alive = false;
    if (best.soldier) { score = Math.max(0, score - 2); shake = 1; hintEl.textContent = '痛！兵蟻咬人，別點紅色的'; }
    else { score++; hintEl.textContent = score >= 12 ? '快吃飽了！' : '好吃！'; }
    scoreEl.textContent = score;
  }
  canvas.addEventListener('pointerdown', tap);
  function end(reason) {
    if (!running) return; running = false; root.hidden = true;
    const done = onEnd; onEnd = null; done?.(score, reason);
  }
  return {
    get active() { return running; },
    start(callback) {
      root.hidden = false; size(); ants = []; score = 0; left = FORAGE_SECONDS; spawnIn = 0; shake = 0; onEnd = callback; running = true;
      scoreEl.textContent = '0'; hintEl.textContent = '點黑色的螞蟻，別點紅色的兵蟻';
      last = performance.now(); requestAnimationFrame(step);
    },
    abort(reason) { end(reason); },
  };
}
