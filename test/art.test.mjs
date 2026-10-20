import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as S from '../src/art/sprites.mjs';
import { PALETTE_VALUES } from '../src/art/palette.mjs';

const all = () => [S.tree(0), S.tree(1), S.bush(), S.bush(false), S.bench(), S.lamp(), S.bin(), S.bicycle(), S.rock(), S.mushroom(), S.fallenLeaf(), S.tuft(), S.pigeon(), S.gatePillar(), S.nameWall(), S.guardBooth(),
  ...['student', 'jogger', 'guard'].flatMap(l => ['south', 'north', 'east'].flatMap(d => [0, 1].map(f => S.person(l, d, f, { phone: true })))), S.pangolin(0), S.pangolin(1), S.pangolin(0, true)];

test('every sprite colour comes from the art-bible palette', () => {
  for (const sprite of all()) {
    for (const [, colour] of sprite.body.matchAll(/(?:fill|stroke)="([^"]+)"/g)) {
      if (colour === 'none') continue;
      assert.ok(PALETTE_VALUES.has(colour), `off-palette colour ${colour}`);
    }
  }
});

test('sprites are valid standalone SVG with a positive size', () => {
  for (const sprite of all()) {
    const svg = S.svgMarkup(sprite, 2);
    assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="\d+" height="\d+"/);
    assert.ok(sprite.w > 0 && sprite.h > 0);
    assert.equal((svg.match(/</g) || []).length, (svg.match(/>/g) || []).length);
  }
});
