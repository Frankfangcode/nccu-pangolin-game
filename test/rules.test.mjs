import { test } from 'node:test';

test('walking changes sprite direction and stopping keeps the last facing', () => {
  const world = makeWorld();
  const walking = stepMovement(createGame(world), { left: true }, 0.05, world);
  assert.equal(walking.player.direction, 'west');
  assert.equal(walking.player.moving, true);
  const stopped = stepMovement(walking, {}, 0.05, world);
  assert.equal(stopped.player.direction, 'west');
  assert.equal(stopped.player.moving, false);
});
import { strict as assert } from 'node:assert';
import { createGame, stepMovement, isHidden, canHumanSee, advanceHumans, advanceAwareness, advanceChase, capturePlayer, interact } from '../src/rules.mjs';
import { makeWorld } from './fixtures.mjs';

test('diagonal movement does not exceed straight-line speed', () => {
  const world = makeWorld();
  const after = stepMovement(createGame(world), { right: true, down: true }, 0.05, world);
  assert.ok(Math.hypot(after.player.x - 50, after.player.y - 50) <= 6.001);
});

test('obstacle stops the pangolin before a wall', () => {
  const world = makeWorld({ obstacles: [{ x: 58, y: 35, w: 20, h: 30 }] });
  const after = stepMovement(createGame(world), { right: true }, 0.05, world);
  assert.equal(after.player.x, 50);
});

test('curling stops movement', () => {
  const world = makeWorld();
  const after = stepMovement(createGame(world), { right: true, curl: true }, 0.05, world);
  assert.equal(after.player.x, 50);
  assert.equal(after.player.curled, true);
});

test('curling hides only inside a bush', () => {
  const world = makeWorld({ bushes: [{ x: 35, y: 35, w: 30, h: 30 }] });
  const curled = stepMovement(createGame(world), { curl: true }, 0.05, world);
  assert.equal(isHidden(curled, world), true);
  assert.equal(isHidden({ ...curled, player: { x: 100, y: 100, curled: true } }, world), false);
});

test('human sees in front but not behind', () => {
  const world = makeWorld();
  const human = { x: 100, y: 100, facing: 0, range: 90 };
  assert.equal(canHumanSee(human, { x: 130, y: 100, curled: false }, world), true);
  assert.equal(canHumanSee(human, { x: 70, y: 100, curled: false }, world), false);
});

test('solid obstacle blocks human vision', () => {
  const world = makeWorld({ obstacles: [{ x: 112, y: 90, w: 12, h: 20 }] });
  assert.equal(canHumanSee({ x: 100, y: 100, facing: 0, range: 90 }, { x: 140, y: 100, curled: false }, world), false);
});

test('patrolling human turns at a route endpoint', () => {
  const world = makeWorld({ humans: [{ x: 100, y: 50, facing: 0, route: [{ x: 50, y: 50 }, { x: 100, y: 50 }], waypointIndex: 1, routeDirection: 1, mode: 'route', awareness: 0 }] });
  const after = advanceHumans(createGame(world), 0.05, world);
  assert.equal(after.humans[0].routeDirection, -1);
  assert.ok(after.humans[0].x <= 100);
});

test('continuous sight starts chase after a warning', () => {
  const world = makeWorld({ humans: [{ x: 20, y: 50, facing: 0, range: 90, route: [], mode: 'route', awareness: 0 }] });
  let state = createGame(world);
  state = advanceAwareness(state, 0.05, world);
  assert.equal(state.status, 'alert');
  for (let i = 0; i < 19; i++) state = advanceAwareness(state, 0.05, world);
  assert.equal(state.status, 'chase');
});

test('chase update keeps alert status before pursuit starts', () => {
  const world = makeWorld({ humans: [{ x: 20, y: 50, facing: 0, range: 90, route: [], mode: 'route', awareness: 0 }] });
  const alert = advanceAwareness(createGame(world), 0.05, world);
  assert.equal(advanceChase(alert, 0.05, world).status, 'alert');
});

test('chasing human closes the gap without distant capture', () => {
  const world = makeWorld({ humans: [{ x: 200, y: 50, facing: Math.PI, range: 180, route: [{ x: 200, y: 50 }, { x: 250, y: 50 }], waypointIndex: 0, routeDirection: 1, mode: 'chase', awareness: 1, searchLeft: 1.5 }] });
  const before = createGame(world);
  const after = advanceChase(before, 0.05, world);
  assert.ok(after.humans[0].x < before.humans[0].x);
  assert.equal(after.captureCount, 0);
});

test('hiding until search expires ends pursuit', () => {
  const world = makeWorld({ bushes: [{ x: 35, y: 35, w: 30, h: 30 }], humans: [{ x: 130, y: 50, facing: Math.PI, range: 90, route: [{ x: 130, y: 50 }, { x: 180, y: 50 }], waypointIndex: 1, routeDirection: 1, mode: 'chase', awareness: 1, searchLeft: 0.04 }] });
  const state = { ...createGame(world), player: { x: 50, y: 50, curled: true }, status: 'chase' };
  const after = advanceChase(state, 0.05, world);
  assert.equal(after.humans[0].mode, 'route');
  assert.equal(after.status, 'safe');
});

test('chaser searches last seen spot instead of tracking a hidden pangolin', () => {
  const world = makeWorld({ obstacles: [{ x: 85, y: 90, w: 5, h: 20 }], humans: [{ x: 100, y: 100, facing: 0, range: 90, route: [], mode: 'chase', awareness: 1, searchLeft: 1, lastSeen: { x: 140, y: 100 } }] });
  const state = { ...createGame(world), player: { x: 70, y: 100, curled: false } };
  const after = advanceChase(state, 0.05, world);
  assert.ok(after.humans[0].x > 100);
});

test('capture resets position but preserves completed pranks', () => {
  const world = makeWorld();
  const before = { ...createGame(world), player: { x: 200, y: 200, curled: false }, completedPranks: ['hall'] };
  const after = capturePlayer(before, world);
  assert.deepEqual({ x: after.player.x, y: after.player.y }, world.start);
  assert.deepEqual(after.completedPranks, ['hall']);
  assert.equal(after.captureCount, 1);
});

test('human captures only after touching the pangolin', () => {
  const world = makeWorld({ humans: [{ x: 57, y: 50, facing: Math.PI, range: 90, route: [{ x: 57, y: 50 }, { x: 100, y: 50 }], waypointIndex: 1, routeDirection: 1, mode: 'chase', awareness: 1, searchLeft: 1.5 }] });
  const after = advanceChase(createGame(world), 0.05, world);
  assert.equal(after.captureCount, 1);
});

test('distant prank cannot be activated', () => {
  const world = makeWorld({ pranks: [{ id: 'hall', x: 200, y: 200 }] });
  const after = interact(createGame(world), world);
  assert.deepEqual(after.completedPranks, []);
  assert.equal(after.won, false);
});

test('nearby prank is completed once', () => {
  const world = makeWorld({ pranks: [{ id: 'hall', x: 60, y: 50 }] });
  const first = interact(createGame(world), world);
  const second = interact(first, world);
  assert.deepEqual(first.completedPranks, ['hall']);
  assert.deepEqual(second.completedPranks, ['hall']);
});

test('pangolin cannot play a prank during a chase', () => {
  const world = makeWorld({ pranks: [{ id: 'hall', x: 60, y: 50 }] });
  const state = { ...createGame(world), status: 'chase' };
  assert.deepEqual(interact(state, world).completedPranks, []);
});

test('three pranks allow victory only back at the start', () => {
  const world = makeWorld({ pranks: [{ id: 'hall', x: 150, y: 50 }, { id: 'library', x: 200, y: 50 }, { id: 'field', x: 250, y: 50 }] });
  const complete = { ...createGame(world), completedPranks: ['field', 'hall', 'library'] };
  assert.equal(interact({ ...complete, player: { x: 120, y: 120, curled: false } }, world).won, false);
  assert.equal(interact(complete, world).won, true);
});
