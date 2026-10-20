import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createGame, canHumanSee, advanceActivities, advanceHumans, advanceAwareness, visionOf, isWaking, nearbyPrank, WAKE_WARNING } from '../src/rules.mjs';
import { WORLD } from '../src/world.mjs';
import { makeWorld } from './fixtures.mjs';

const person = extra => ({ x: 100, y: 100, facing: 0, range: 120, mode: 'route', awareness: 0, ...extra });
const tick = (state, seconds) => { for (let t = 0; t < seconds; t += 0.05) state = advanceActivities(state, 0.05); return state; };

test('a napping person sees nothing, even right in front of them', () => {
  const world = makeWorld();
  assert.equal(canHumanSee(person({ activity: 'nap' }), { x: 130, y: 100 }, world), false);
  assert.equal(canHumanSee(person({ activity: 'walk' }), { x: 130, y: 100 }, world), true);
});

test('a person on their phone only notices things close and straight ahead', () => {
  const world = makeWorld();
  const phone = person({ activity: 'phone' });
  assert.equal(canHumanSee(phone, { x: 140, y: 100 }, world), true, 'close and ahead');
  assert.equal(canHumanSee(phone, { x: 190, y: 100 }, world), false, 'beyond the short cone');
  assert.equal(canHumanSee(phone, { x: 140, y: 125 }, world), false, 'off to the side');
  assert.ok(visionOf(phone).range < visionOf(person()).range);
});

test('chasing overrides habits so a startled person can see again', () => {
  const world = makeWorld();
  assert.equal(canHumanSee(person({ activity: 'nap', mode: 'chase' }), { x: 130, y: 100 }, world), true);
});

test('habits cycle on schedule and warn before the person looks up', () => {
  let state = { humans: [person({ schedule: [['nap', 3], ['walk', 2]] })] };
  state = tick(state, 0.1);
  assert.equal(state.humans[0].activity, 'nap');
  assert.equal(isWaking(state.humans[0]), false);
  state = tick(state, 3 - 0.1 - WAKE_WARNING + 0.2);
  assert.equal(state.humans[0].activity, 'nap');
  assert.equal(isWaking(state.humans[0]), true, 'warning before waking');
  state = tick(state, WAKE_WARNING);
  assert.equal(state.humans[0].activity, 'walk');
  state = tick(state, 2);
  assert.equal(state.humans[0].activity, 'nap', 'loops back');
});

test('sleepers stay put and phone users shuffle slowly', () => {
  const route = [{ x: 0, y: 100 }, { x: 300, y: 100 }];
  const base = { route, waypointIndex: 1, routeDirection: 1, speed: 50 };
  const after = advanceHumans({ humans: [person({ ...base, activity: 'nap' }), person({ ...base, activity: 'phone' }), person({ ...base, activity: 'walk' })] }, 0.05, null);
  const moved = after.humans.map(h => h.x - 100);
  assert.equal(moved[0], 0);
  assert.ok(moved[1] > 0 && moved[1] < moved[2]);
});

test('noticing someone wakes them into a normal chase', () => {
  const world = makeWorld({ humans: [person({ activity: 'phone', awareness: 0.99 })] });
  const state = { ...createGame(world), player: { x: 130, y: 100, curled: false } };
  const after = advanceAwareness(state, 0.05, world);
  assert.equal(after.humans[0].mode, 'chase');
  assert.equal(after.humans[0].activity, 'walk');
});

test('campus visitors have readable habits, including one near the treasure', () => {
  assert.ok(WORLD.humans.every(h => h.schedule?.length >= 2));
  assert.ok(WORLD.humans.some(h => h.schedule.some(([kind]) => kind === 'nap')));
  const guard = WORLD.humans.find(h => Math.hypot(h.x - 2680, h.y - 2680) < 120);
  assert.ok(guard.schedule.some(([kind]) => kind === 'phone'), 'treasure guard takes phone breaks');
});

test('only unfinished pranks within reach open a close-up', () => {
  const world = makeWorld({ pranks: [{ id: 'hall', x: 60, y: 50 }] });
  const game = createGame(world);
  assert.equal(nearbyPrank(game, world)?.id, 'hall');
  assert.equal(nearbyPrank({ ...game, completedPranks: ['hall'] }, world), null);
  assert.equal(nearbyPrank({ ...game, player: { x: 200, y: 200 } }, world), null);
});
