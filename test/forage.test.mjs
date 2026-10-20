import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createGame, stepMovement, isHidden } from '../src/rules.mjs';
import { drainStamina, isTired, nearbyAnthill, finishForage, forageGain, spawnAnt, antPosition, ANTHILL_RESPAWN, STAMINA } from '../src/forage.mjs';
import { isBlocked } from '../src/navigation.mjs';
import { WORLD } from '../src/world.mjs';
import { makeWorld } from './fixtures.mjs';

test('walking uses stamina, standing still does not, and it never drops below zero', () => {
  let s = createGame(makeWorld());
  assert.equal(s.stamina, 1);
  assert.equal(drainStamina(s, .05, false).stamina, 1);
  for (let i = 0; i < 20000; i++) s = drainStamina(s, .05, true);
  assert.equal(s.stamina, 0);
  assert.ok(isTired(s));
});

test('a tired pangolin walks slower', () => {
  const w = makeWorld(), fresh = createGame(w), tired = { ...fresh, stamina: STAMINA.low / 2 };
  const a = stepMovement(fresh, { right: true }, .05, w).player.x - fresh.player.x;
  const b = stepMovement(tired, { right: true }, .05, w).player.x - tired.player.x;
  assert.ok(b < a && b > 0);
});

test('anthills are reachable only up close and only when the ants are back', () => {
  const w = makeWorld({ anthills: [{ id: 'a', x: 70, y: 50 }] }), s = createGame(w);
  assert.equal(nearbyAnthill(s, w, 0)?.id, 'a');
  assert.equal(nearbyAnthill({ ...s, player: { x: 200, y: 200 } }, w, 0), null);
  const fed = finishForage({ ...s, stamina: .1 }, w.anthills[0], 10, 5);
  assert.ok(fed.stamina > .1 && fed.stamina <= 1);
  assert.equal(nearbyAnthill(fed, w, 5 + ANTHILL_RESPAWN - 1), null, 'empty for a while');
  assert.equal(nearbyAnthill(fed, w, 5 + ANTHILL_RESPAWN)?.id, 'a', 'ants come back');
});

test('score converts to stamina and caps at full', () => {
  assert.equal(forageGain(0), 0);
  assert.ok(forageGain(5) > 0 && forageGain(5) < 1);
  assert.equal(forageGain(100), 1);
  assert.equal(finishForage({ ...createGame(makeWorld()), stamina: .9 }, { id: 'a' }, 100, 0).stamina, 1);
});

test('ants crawl upward inside the panel and about one in five is a soldier', () => {
  const ants = Array.from({ length: 50 }, (_, i) => spawnAnt(i + 1));
  const soldiers = ants.filter(a => a.soldier).length;
  assert.ok(soldiers >= 5 && soldiers <= 15);
  const a = { ...ants[0], t: .5 }, p = antPosition(a, 300, 200);
  assert.ok(p.x > 0 && p.x < 300 && p.y > 0 && p.y < 200);
});

test('campus anthills sit on open ground and two are right inside the gate', () => {
  assert.ok(WORLD.anthills.length >= 10);
  for (const h of WORLD.anthills) assert.equal(isBlocked(h.x, h.y, WORLD), false, `${h.id} is inside something solid`);
  assert.ok(WORLD.anthills.filter(h => Math.hypot(h.x - WORLD.start.x, h.y - WORLD.start.y) < 400).length >= 2);
  assert.equal(new Set(WORLD.anthills.map(h => h.id)).size, WORLD.anthills.length);
});
