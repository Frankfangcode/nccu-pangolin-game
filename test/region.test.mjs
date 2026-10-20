import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { MAIN_GATE } from '../src/regions/main-gate.mjs';

const source = readFileSync(new URL('../src/art/region.mjs', import.meta.url), 'utf8');

test('every object in region one has a drawing routine', () => {
  for (const type of new Set(MAIN_GATE.objects.map(o => o.type))) assert.match(source, new RegExp(`\\n  ${type}\\(c, o`), `no DRAW.${type}`);
});

test('region one keeps the surveyed nccu100 landmarks in place', () => {
  const find = t => MAIN_GATE.objects.filter(o => o.type === t);
  assert.deepEqual(find('gatehouse').map(g => g.cx).sort((a, b) => a - b), [-10, 10]);
  assert.deepEqual(find('obelisk').map(o => [o.x, o.z]), [[-19, 13.4]]);
  assert.deepEqual(find('fountain').map(o => [o.x, o.z, o.r]), [[0, -32, 5.6]]);
  assert.equal(find('palm').length, 8);
  const { x0, x1, z0, z1 } = MAIN_GATE.bounds;
  assert.ok(MAIN_GATE.spawn.x > x0 && MAIN_GATE.spawn.x < x1 && MAIN_GATE.spawn.z > z0 && MAIN_GATE.spawn.z < z1);
});
