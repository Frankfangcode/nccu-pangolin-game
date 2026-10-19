import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('local launcher serves the playable page on a loopback URL', async () => {
  const child = spawn('python3', ['play.py', '--no-browser'], {
    cwd: new URL('..', import.meta.url),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    const [chunk] = await Promise.race([
      once(child.stdout, 'data'),
      once(child, 'exit').then(([code]) => { throw new Error(`launcher exited before it was ready (${code})`); }),
    ]);
    const url = String(chunk).trim();
    assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/$/);
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /穿山甲出沒 · 政大校園小冒險/);
  } finally {
    if (child.exitCode === null) { child.kill(); await once(child, 'close'); }
  }
});
