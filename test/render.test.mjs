import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { cameraFor } from '../src/render.mjs';

test('phone camera keeps the starting pangolin above the touch controls', () => {
  const camera = cameraFor({ x: 120, y: 748 }, { width: 1320, height: 900 }, { width: 343, height: 706, touch: true });
  assert.ok(748 - camera.y < 464);
});
