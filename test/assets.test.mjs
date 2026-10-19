import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { loadAssets, depthSort } from '../src/assets.mjs';

test('missing generated artwork rejects loading instead of silently starting an empty scene', async () => {
  const image = { set src(value) { queueMicrotask(() => this.onerror(new Error(value))); } };
  await assert.rejects(loadAssets({ terrain: 'missing.png' }, () => image), /missing.png/);
});

test('objects behind the player draw first while foreground trees draw after', () => {
  const objects = [{ id: 'frontTree', sortY: 300 }, { id: 'player', sortY: 200 }, { id: 'building', sortY: 100 }];
  assert.deepEqual(depthSort(objects).map(x => x.id), ['building', 'player', 'frontTree']);
  assert.equal(objects[0].id, 'frontTree');
});
