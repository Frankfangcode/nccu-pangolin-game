import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createGame, advanceActivities } from '../src/rules.mjs';
import { isBlocked } from '../src/navigation.mjs';
import { MEADOW } from '../src/meadow/world.mjs';
import { createMeadowState, nearbySpot, steal, eat, rummage, talkToCat, confiscate, glance, saveMeadow, loadMeadow, ITEMS, REQUESTS, BACKPACK_SIZE } from '../src/meadow/play.mjs';

const at = (game, x, y) => ({ ...game, player: { ...game.player, x, y, curled: false } });
const asleep = game => ({ ...game, humans: game.humans.map(h => ({ ...h, activity: 'nap' })) });
const memoryStorage = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('the meadow is walkable where it matters', () => {
  assert.equal(isBlocked(MEADOW.start.x, MEADOW.start.y, MEADOW), false, 'den');
  for (const s of MEADOW.spots) assert.equal(isBlocked(s.x, s.y + 30, MEADOW), false, `${s.id} can be reached from the south`);
  for (const h of MEADOW.anthills) assert.equal(isBlocked(h.x, h.y, MEADOW), false, h.id);
  assert.equal(isBlocked(MEADOW.cat.x, MEADOW.cat.y + 30, MEADOW), false, 'cat');
  assert.equal(isBlocked(1715, 250, MEADOW), false, 'the dock crosses the water');
  assert.equal(isBlocked(1000, 170, MEADOW), true, 'the creek itself is water');
  for (const s of MEADOW.spots) assert.ok(MEADOW.humans.some(h => h.id === s.owner), `${s.id} has an owner`);
});

test('stealing while nobody looks puts the item in the backpack and empties the spot', () => {
  const spot = MEADOW.spots.find(s => s.id === 'chicken'), game = at(asleep(createGame(MEADOW)), spot.x, spot.y + 20);
  let play = createMeadowState();
  assert.equal(nearbySpot(play, MEADOW, game.player, 0)?.id, 'chicken');
  const r = steal(game, play, MEADOW, spot, 0);
  assert.equal(r.result, 'taken'); play = r.play;
  assert.deepEqual(play.backpack, ['chicken']);
  assert.equal(nearbySpot(play, MEADOW, game.player, 1), null, 'gone until it restocks');
  assert.equal(nearbySpot(play, MEADOW, game.player, spot.respawn)?.id, 'chicken');
});

test('stealing in plain sight starts a chase and takes nothing', () => {
  const spot = MEADOW.spots.find(s => s.id === 'chicken');
  const game = at(createGame(MEADOW), spot.x, spot.y + 40);
  const awake = { ...game, humans: game.humans.map(h => (h.id === 'napper' ? { ...h, activity: 'walk', facing: Math.atan2(game.player.y - h.y, game.player.x - h.x) } : { ...h, activity: 'nap' })) };
  const r = steal(awake, createMeadowState(), MEADOW, spot, 0);
  assert.equal(r.result, 'seen');
  assert.equal(r.play.backpack.length, 0);
  assert.equal(r.game.status, 'chase');
  assert.equal(r.game.humans.find(h => h.id === 'napper').mode, 'chase');
});

test('a full backpack refuses more and eating frees a slot and restores stamina', () => {
  const spot = MEADOW.spots[0], game = { ...at(asleep(createGame(MEADOW)), spot.x, spot.y + 20), stamina: .1 };
  const full = { ...createMeadowState(), backpack: Array(BACKPACK_SIZE).fill('cap') };
  assert.equal(steal(game, full, MEADOW, spot, 0).result, 'full');
  const fed = eat(game, { ...createMeadowState(), backpack: ['cap', 'chicken'] }, 1);
  assert.deepEqual(fed.play.backpack, ['cap']);
  assert.ok(Math.abs(fed.game.stamina - (.1 + ITEMS.chicken.stamina)) < 1e-9);
  assert.equal(eat(game, { ...createMeadowState(), backpack: ['cap'] }, 0).play.backpack.length, 1, 'caps are not food');
});

test('rummaging finds things, is noisy, and needs a cooldown', () => {
  const game = at(createGame(MEADOW), MEADOW.trash.x, MEADOW.trash.y + 30);
  const r = rummage(game, createMeadowState(), MEADOW, 0);
  assert.equal(r.play.backpack.length, 1);
  const noisy = r.game.humans.filter(h => Math.hypot(h.x - MEADOW.trash.x, h.y - MEADOW.trash.y) < 280);
  assert.ok(noisy.every(h => h.awareness > 0));
  assert.equal(rummage(r.game, r.play, MEADOW, 1).play.backpack.length, 1, 'cooldown');
});

test('the cat asks for three things in order and the chapter finishes', () => {
  let play = createMeadowState();
  assert.equal(talkToCat(play).play.quest, 0, 'nothing to give yet');
  for (const req of REQUESTS) {
    play = { ...play, backpack: [...play.backpack, 'cap', req.item] };
    const r = talkToCat(play);
    assert.equal(r.delivered, req.item); play = r.play;
    assert.ok(!play.backpack.includes(req.item));
  }
  assert.equal(play.finished, true);
  assert.deepEqual(play.backpack, ['cap', 'cap', 'cap']);
});

test('getting caught loses the food but keeps shiny caps', () => {
  assert.deepEqual(confiscate({ ...createMeadowState(), backpack: ['cap', 'fish', 'boba', 'cap'] }).backpack, ['cap', 'cap']);
});

test('sitting people look somewhere new each time they look up', () => {
  const before = createGame(MEADOW).humans;
  let state = { humans: before };
  for (let t = 0; t < 12; t += .05) state = advanceActivities(state, .05);
  const after = glance(state.humans, before);
  const napper = after.find(h => h.id === 'napper');
  assert.notEqual(napper.facing, before.find(h => h.id === 'napper').facing);
  assert.equal(after.find(h => h.id === 'griller').facing, state.humans.find(h => h.id === 'griller').facing, 'walkers face where they walk');
});

test('progress saves and reloads; bad saves are ignored', () => {
  const store = memoryStorage();
  saveMeadow(store, { ...createMeadowState(), backpack: ['fish'], quest: 1 }, .4);
  const back = loadMeadow(store);
  assert.deepEqual(back.play.backpack, ['fish']); assert.equal(back.play.quest, 1); assert.equal(back.stamina, .4);
  store.setItem('pangolin-meadow-v1', JSON.stringify({ v: 1, backpack: ['diamond'], quest: 0 }));
  assert.equal(loadMeadow(store), null);
  store.setItem('pangolin-meadow-v1', '{oops');
  assert.equal(loadMeadow(store), null);
});
