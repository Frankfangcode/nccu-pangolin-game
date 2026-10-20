// 溪邊篇主程式：輸入 → 規則 → 畫面。手機橫向優先，按住畫面任何地方就是搖桿。
import { loadAssets } from '../assets.mjs';
import { createInput } from '../input.mjs?v=16';
import { createTouchControls } from '../touch.mjs?v=16';
import { createGame, stepMovement, advanceActivities, advanceHumans, advanceAwareness, advanceChase } from '../rules.mjs?v=16';
import { createForage, drainStamina, nearbyAnthill, finishForage, isTired } from '../forage.mjs?v=16';
import { MEADOW } from './world.mjs?v=16';
import { ITEMS, REQUESTS, createMeadowState, nearbySpot, steal, eat, rummage, talkToCat, questText, confiscate, glance, saveMeadow, loadMeadow, REACH } from './play.mjs?v=16';
import { render, drawItem } from './draw.mjs?v=16';

const ART = {
  grass: 'assets/campus/grass.webp', path: 'assets/campus/path.webp', water: 'assets/campus/water.webp',
  tree: 'assets/flat/tree.webp', shrub: 'assets/flat/pack/pack-1.webp', board: 'assets/flat/pack/pack-2.webp', cat: 'assets/campus/quest-cat.webp',
  human: 'assets/flat/human/sheet-transparent.webp', pangolin: 'assets/flat/pangolin/sheet-transparent.webp', curl: 'assets/flat/curl/curl-1.webp',
};
const $ = s => document.querySelector(s);
const canvas = $('#game'), ctx = canvas.getContext('2d');
const input = createInput(canvas), touch = createTouchControls(canvas), forage = createForage($('#forage'));
let storage; try { storage = window.localStorage; } catch {}
const saved = storage ? loadMeadow(storage) : null;
let game = { ...createGame(MEADOW), stamina: saved?.stamina ?? 1 }, play = saved?.play ?? createMeadowState();
let assets = null, started = false, sceneTime = 0, previous = performance.now(), messageAt = 0, foragingAt = null, lastSave = '';

// Read-only snapshot for browser tests.
export function snapshot() { return structuredClone({ game, play, sceneTime }); }
window.__meadow = { snapshot, set(fn) { ({ game, play } = fn({ game, play })); } };

/* ---------- intro, help, cat dialogue ---------- */
const startButton = $('#start'), intro = $('#intro'), help = $('#help-dialog'), talk = $('#cat-dialog');
loadAssets(ART, undefined, (n, total) => { startButton.textContent = `素材載入中… ${Math.round(n / total * 100)}%`; })
  .then(a => { assets = a; startButton.disabled = false; startButton.textContent = saved ? '繼續溪邊的冒險 →' : '溜進草地 →'; })
  .catch(() => { startButton.disabled = false; startButton.textContent = '載入失敗，點此重試'; startButton.onclick = () => location.reload(); });
startButton.onclick = () => { if (!assets) return; intro.hidden = true; started = true; canvas.focus(); };
$('#help').onclick = () => help.showModal();
$('#close-help').onclick = () => help.close();
help.addEventListener('close', () => canvas.focus());
$('#cat-close').onclick = () => talk.close();
talk.addEventListener('close', () => canvas.focus());
function catSays(title, body) { $('#cat-title').textContent = title; $('#cat-text').textContent = body; talk.showModal(); }

/* ---------- backpack ---------- */
const packButton = $('#backpack'), packPanel = $('#pack-panel'), slots = $('#pack-slots');
packButton.onclick = () => { packPanel.hidden = !packPanel.hidden; drawPack(); };
$('#pack-close').onclick = () => { packPanel.hidden = true; canvas.focus(); };
function drawPack() {
  packButton.querySelector('b').textContent = play.backpack.length;
  if (packPanel.hidden) return;
  slots.replaceChildren(...Array.from({ length: 6 }, (_, i) => {
    const id = play.backpack[i], b = document.createElement('button');
    b.className = 'slot'; b.disabled = !id;
    if (id) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 96; const x = cv.getContext('2d'); x.scale(2, 2); drawItem(x, id, 24, 26, 1.3);
      const label = document.createElement('span'); label.textContent = ITEMS[id].food ? `吃掉${ITEMS[id].name}` : ITEMS[id].name;
      b.append(cv, label); b.setAttribute('aria-label', label.textContent);
      if (ITEMS[id].food) b.onclick = () => { ({ game, play } = eat(game, play, i)); drawPack(); };
      else b.onclick = () => { game = { ...game, message: '閃亮瓶蓋：黑貓說以後可以拿來換東西。' }; };
    }
    return b;
  }));
}

/* ---------- what 互動 does here ---------- */
const near = (p, q, r = REACH) => Math.hypot(p.x - q.x, p.y - q.y) < r;
function contextAction() {
  const p = game.player;
  if (near(p, MEADOW.cat, 60)) return { kind: 'cat', label: REQUESTS[play.quest] && play.backpack.includes(REQUESTS[play.quest].item) ? `交給黑貓：${ITEMS[REQUESTS[play.quest].item].name}` : '和黑貓說話', at: MEADOW.cat, dy: 96 };
  const spot = nearbySpot(play, MEADOW, p, sceneTime);
  if (spot) return { kind: 'steal', spot, label: `偷${ITEMS[spot.item].name}`, at: spot, dy: 70 };
  if (near(p, MEADOW.trash, 56)) return { kind: 'trash', label: '翻垃圾桶', at: MEADOW.trash, dy: 76 };
  const hill = nearbyAnthill(game, MEADOW, sceneTime);
  if (hill) return { kind: 'ants', hill, label: '吃螞蟻', at: hill, dy: 50 };
  return null;
}
function act(action) {
  if (!action) return;
  if (game.status === 'chase') { game = { ...game, message: '先甩掉追你的人！' }; return; }
  if (action.kind === 'cat') { const r = talkToCat(play); play = r.play; catSays(r.title, r.text); if (play.finished && r.delivered) $('#finish').hidden = false; }
  else if (action.kind === 'steal') ({ game, play } = steal(game, play, MEADOW, action.spot, sceneTime));
  else if (action.kind === 'trash') ({ game, play } = rummage(game, play, MEADOW, sceneTime));
  else if (action.kind === 'ants') {
    if (game.status !== 'safe') { game = { ...game, message: '有人在看，等一下再吃。' }; return; }
    foragingAt = { ...game.player };
    forage.start((score, reason) => {
      if (reason === 'spotted') { game = { ...game, message: '被發現了！螞蟻先放著，快躲起來。' }; return; }
      game = { ...finishForage(game, action.hill, score, sceneTime), message: score ? `吃了 ${score} 隻螞蟻！` : '一隻都沒吃到……' };
    });
  }
  drawPack();
}
$('#finish-continue').onclick = () => { $('#finish').hidden = true; canvas.focus(); };

/* ---------- loop ---------- */
function resize() { const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d); ctx.setTransform(d, 0, 0, d, 0, 0); }
new ResizeObserver(resize).observe(canvas); resize();

function frame(now) {
  const dt = Math.min((now - previous) / 1000, .05); previous = now;
  const keys = input.read(), finger = touch.read();
  const actions = { ...keys, axisX: finger.axisX, axisY: finger.axisY, interact: keys.interact || finger.interact, curl: keys.curl || finger.curl };
  const modal = help.open || talk.open || !$('#finish').hidden;
  const playing = started && !modal;
  if (playing) {
    sceneTime += dt;
    const before = game.humans, captures = game.captureCount;
    game = stepMovement(game, actions, dt, MEADOW);
    game = drainStamina(game, dt, game.player.moving);
    game = advanceActivities(game, dt);
    game = { ...game, humans: glance(game.humans, before) };
    game = advanceHumans(game, dt, MEADOW);
    game = advanceAwareness(game, dt, MEADOW);
    game = advanceChase(game, dt, MEADOW);
    // The den is home: chasers give up once the pangolin dives in.
    if (near(game.player, MEADOW.den, 80) && game.status !== 'safe') game = { ...game, status: 'safe', awareness: 0, humans: game.humans.map(h => (h.mode === 'chase' || h.awareness > 0 ? { ...h, mode: 'route', awareness: 0, searchLeft: 0 } : h)), message: game.status === 'chase' ? '呼，安全回到洞穴。' : game.message };
    if (game.captureCount !== captures) { play = confiscate(play); game = { ...game, stamina: game.stamina, message: '被抓到了！食物被沒收，回到洞穴。' }; drawPack(); }
    if (forage.active && (game.status === 'chase' || Math.hypot(game.player.x - foragingAt.x, game.player.y - foragingAt.y) > 40)) forage.abort('spotted');
    if (actions.interact && !forage.active) act(contextAction());
  }
  if (game.message) { if (!messageAt) messageAt = now; else if (now - messageAt > 2600) { game = { ...game, message: '' }; messageAt = 0; } } else messageAt = 0;

  // HUD
  const isTouch = window.matchMedia('(pointer: coarse)').matches || canvas.clientWidth < 600;
  touch.show(isTouch && playing);
  $('#touch-controls').classList.toggle('foraging', forage.active);
  if (game.player.moving) $('#touch-controls').classList.add('learned');
  const st = $('#stamina'); st.style.setProperty('--fill', game.stamina ?? 1); st.classList.toggle('tired', isTired(game)); st.setAttribute('aria-label', `體力 ${Math.round((game.stamina ?? 1) * 100)}%`);
  $('#quest').textContent = questText(play);
  const toast = $('#toast'); toast.hidden = !game.message; toast.textContent = game.message || '';
  const danger = $('#danger'); danger.hidden = game.status === 'safe'; danger.textContent = game.status === 'chase' ? '被發現了！躲進花叢或逃回洞穴' : '有人看過來了…';
  packButton.querySelector('b').textContent = play.backpack.length;
  const snap = JSON.stringify([play.backpack, play.quest, play.finished, Math.round((game.stamina ?? 1) * 20)]);
  if (started && storage && snap !== lastSave) { lastSave = snap; saveMeadow(storage, play, game.stamina); }

  const action = playing && !forage.active ? contextAction() : null;
  const prompt = action && { label: (isTouch ? '互動 · ' : 'E · ') + action.label, x: action.at.x, y: action.at.y - action.dy };
  render(ctx, game, play, MEADOW, { width: canvas.clientWidth, height: canvas.clientHeight, touch: isTouch, time: now / 1000, sceneTime, reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, prompt, busy: modal }, assets);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
