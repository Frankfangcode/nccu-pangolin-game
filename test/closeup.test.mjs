import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { SCENES } from '../src/closeup.mjs';
import { WORLD } from '../src/world.mjs';

test('every campus prank has a close-up scene with a reachable target', () => {
  for (const prank of WORLD.pranks) {
    const scene = SCENES[prank.id];
    assert.ok(scene, `${prank.id} needs a close-up`);
    assert.ok(scene.target.x > 0 && scene.target.x < 400 && scene.target.y > 0 && scene.target.y < 260);
    assert.ok(scene.cta && scene.hint);
    assert.ok(!/<script|on\w+=/i.test(scene.svg), 'scene art is static markup');
  }
});
