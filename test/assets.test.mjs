import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { loadAssets, depthSort } from '../src/assets.mjs';
import {manifest} from '../src/manifest.mjs';
import {WORLD} from '../src/world.mjs';
import {access} from 'node:fs/promises';

test('missing generated artwork rejects loading instead of silently starting an empty scene', async () => {
  const image = { set src(value) { queueMicrotask(() => this.onerror(new Error(value))); } };
  await assert.rejects(loadAssets({ terrain: 'missing.png' }, () => image), /missing.png/);
});

test('objects behind the player draw first while foreground trees draw after', () => {
  const objects = [{ id: 'frontTree', sortY: 300 }, { id: 'player', sortY: 200 }, { id: 'building', sortY: 100 }];
  assert.deepEqual(depthSort(objects).map(x => x.id), ['building', 'player', 'frontTree']);
  assert.equal(objects[0].id, 'frontTree');
});

test('PaiPai and the eighth classroom use shipped WebP artwork',async()=>{
 assert.equal(manifest['paipai-flying'],'assets/campus/paipai-flying-v14.webp');
 assert.equal(WORLD.landmarks.find(p=>p.name==='校友服務中心').asset,'alumni');
 assert.equal(manifest.alumni,'assets/campus/alumni-v14.webp');
 await access(new URL('../'+manifest['paipai-flying'],import.meta.url));
 await access(new URL('../'+manifest.alumni,import.meta.url));
});
