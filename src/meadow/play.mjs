// 溪邊篇的遊戲規則：偷東西、背包、吃東西、翻垃圾桶、黑貓的委託、存檔。
// 全部是純函式，畫面與輸入在 main.mjs。
import { canHumanSee } from '../rules.mjs?v=16';

export const ITEMS = {
  chicken: { name: '雞排', stamina: .45, food: true },
  boba: { name: '珍奶', stamina: .3, food: true },
  sandwich: { name: '三明治', stamina: .35, food: true },
  sausage: { name: '烤香腸', stamina: .3, food: true },
  yakult: { name: '養樂多', stamina: .15, food: true },
  fish: { name: '魚', stamina: .4, food: true },
  bento: { name: '半個便當', stamina: .25, food: true },
  cap: { name: '閃亮瓶蓋', stamina: 0, food: false },
};
export const BACKPACK_SIZE = 6;
export const REACH = 46;
export const TRASH_COOLDOWN = 40;

/** 黑貓的三個委託，照順序。 */
export const REQUESTS = [
  { item: 'sausage', ask: '烤香腸的味道飄過來了……幫我拿一根，別被烤肉的人發現。', thanks: '嗯，焦焦的最好吃。' },
  { item: 'fish', ask: '碼頭那個釣客的水桶裡有魚。他一直盯著水面，從背後去。', thanks: '新鮮！你比看起來有用。' },
  { item: 'yakult', ask: '最後一個：冷藏箱裡的養樂多。烤肉的人走來走去，看準時機。', thanks: '好，你是我們這邊的了。溪邊的大家都會記得你。' },
];

export function createMeadowState() {
  return { backpack: [], quest: 0, spots: {}, trashReadyAt: 0, rummages: 0, finished: false };
}
export const spotReady = (play, spot, now) => (play.spots[spot.id] ?? 0) <= now;
const near = (a, b, r = REACH) => Math.hypot(a.x - b.x, a.y - b.y) < r;

/** 玩家伸手可及、而且東西還在的偷竊點。 */
export function nearbySpot(play, world, player, now) {
  return world.spots.find(s => near(player, s) && spotReady(play, s, now)) ?? null;
}
/** 誰正看著穿山甲（被看到的時候不能偷）。 */
export const watchers = (game, world) => game.humans.filter(h => h.mode !== 'chase' && canHumanSee(h, game.player, world));

/**
 * 偷東西。被看到 → 那些人立刻追過來；背包滿 → 拿不了；成功 → 放進背包，這個點要等補貨。
 * 回傳 { game, play, result: 'taken' | 'seen' | 'full' }
 */
export function steal(game, play, world, spot, now) {
  const seenBy = watchers(game, world);
  if (seenBy.length) {
    const ids = new Set(seenBy.map(h => h.id));
    const humans = game.humans.map(h => (ids.has(h.id) ? { ...h, mode: 'chase', awareness: 1, activity: 'walk', searchLeft: 1.5, lastSeen: { x: game.player.x, y: game.player.y } } : h));
    return { game: { ...game, humans, status: 'chase', message: '被看到了！快跑！' }, play, result: 'seen' };
  }
  if (play.backpack.length >= BACKPACK_SIZE) return { game: { ...game, message: '背包滿了，先吃點東西吧。' }, play, result: 'full' };
  return {
    game: { ...game, message: `偷到了${ITEMS[spot.item].name}！` },
    play: { ...play, backpack: [...play.backpack, spot.item], spots: { ...play.spots, [spot.id]: now + spot.respawn } },
    result: 'taken',
  };
}

/** 吃掉背包裡第 index 個東西，回體力。 */
export function eat(game, play, index) {
  const id = play.backpack[index], item = ITEMS[id];
  if (!item?.food) return { game, play };
  return {
    game: { ...game, stamina: Math.min(1, (game.stamina ?? 1) + item.stamina), message: `吃掉${item.name}，體力回來了。` },
    play: { ...play, backpack: play.backpack.filter((_, i) => i !== index) },
  };
}

/** 翻垃圾桶：會翻到瓶蓋或半個便當，但聲音會讓附近的人注意到這邊。 */
export function rummage(game, play, world, now) {
  if (now < play.trashReadyAt) return { game: { ...game, message: '剛翻過了，裡面沒東西。' }, play };
  const roll = play.rummages % 5, found = roll === 4 ? null : roll % 2 ? 'cap' : 'bento';
  const humans = game.humans.map(h => (h.mode !== 'chase' && near(h, world.trash, 280) ? { ...h, awareness: Math.min(.95, (h.awareness ?? 0) + .6), lastSeen: { ...world.trash } } : h));
  const full = found && play.backpack.length >= BACKPACK_SIZE;
  return {
    game: { ...game, humans, message: !found ? '只有空瓶子……' : full ? '背包滿了，拿不下。' : `翻到了${ITEMS[found].name}！喀啦喀啦好吵。` },
    play: { ...play, rummages: play.rummages + 1, trashReadyAt: now + TRASH_COOLDOWN, backpack: found && !full ? [...play.backpack, found] : play.backpack },
  };
}

/** 跟黑貓說話：交出她要的東西就前進一步。回傳對話內容。 */
export function talkToCat(play) {
  const req = REQUESTS[play.quest];
  if (!req) return { play, title: '溪邊的大家都認得你了', text: '今天就到這裡。等你準備好，我們去宿舍區看看。' };
  const at = play.backpack.indexOf(req.item);
  if (at < 0) return { play, title: '黑貓在等', text: req.ask };
  const next = { ...play, backpack: play.backpack.filter((_, i) => i !== at), quest: play.quest + 1 };
  if (next.quest >= REQUESTS.length) next.finished = true;
  const after = REQUESTS[next.quest];
  return { play: next, title: req.thanks, text: after ? `下一個：${after.ask}` : '溪邊篇完成！你偷遍了整片草地。', delivered: req.item };
}
export const questText = play => (REQUESTS[play.quest] ? `黑貓想要：${ITEMS[REQUESTS[play.quest].item].name}` : '溪邊篇完成 ✓');

/** 被抓到：背包裡的食物被沒收，瓶蓋留著。 */
export const confiscate = play => ({ ...play, backpack: play.backpack.filter(id => !ITEMS[id].food) });

/** 坐著的人輪到「抬頭」時換一個方向看。 */
export function glance(humans, before) {
  return humans.map((h, i) => {
    if (!h.faces || h.mode === 'chase' || h.route[0].x !== h.route[1].x) return h;
    if (before[i]?.activityIndex === h.activityIndex && before[i]?.facing !== undefined) return h;
    const turns = (h.turns ?? 0) + 1;
    return { ...h, turns, facing: h.faces[turns % h.faces.length] };
  });
}

export const SAVE_KEY = 'pangolin-meadow-v1';
export function saveMeadow(storage, play, stamina) {
  try { storage.setItem(SAVE_KEY, JSON.stringify({ v: 1, backpack: play.backpack, quest: play.quest, finished: play.finished, stamina })); return true; } catch { return false; }
}
export function loadMeadow(storage) {
  try {
    const d = JSON.parse(storage.getItem(SAVE_KEY) ?? 'null');
    if (!d || d.v !== 1 || !Array.isArray(d.backpack) || d.backpack.length > BACKPACK_SIZE || !d.backpack.every(id => ITEMS[id])) return null;
    if (!Number.isInteger(d.quest) || d.quest < 0 || d.quest > REQUESTS.length) return null;
    return { play: { ...createMeadowState(), backpack: d.backpack, quest: d.quest, finished: Boolean(d.finished) }, stamina: Math.max(0, Math.min(1, Number(d.stamina) || 1)) };
  } catch { return null; }
}
