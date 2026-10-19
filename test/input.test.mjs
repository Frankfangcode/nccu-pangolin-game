import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { emptyInput, reduceInput } from '../src/input.mjs';

test('blur and release clear held movement', () => {
  const pressed = reduceInput(emptyInput(), { type: 'press', action: 'right' });
  assert.equal(reduceInput(pressed, { type: 'blur' }).right, false);
  assert.equal(reduceInput(pressed, { type: 'release', action: 'right' }).right, false);
});

test('quick tap survives pointer release until the next frame', () => {
  const pressed = reduceInput(emptyInput(), { type: 'press', action: 'tap' });
  assert.equal(reduceInput(pressed, { type: 'release', action: 'tap' }).tap, true);
});

test('map search fields keep their typing and arrow keys',async()=>{
 const {acceptGameKey}=await import('../src/input.mjs');
 assert.equal(acceptGameKey({tagName:'INPUT'}),false);
 assert.equal(acceptGameKey({tagName:'SELECT'}),false);
 assert.equal(acceptGameKey({tagName:'CANVAS'}),true);
});
