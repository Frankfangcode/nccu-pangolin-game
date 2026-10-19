import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {joystickVector} from '../src/touch.mjs';
test('joystick dead zone stops drift and clamps diagonal travel',()=>{
 assert.deepEqual(joystickVector(2,2),{x:0,y:0});
 const small=joystickVector(16,0);assert.ok(small.x>0&&small.x<1);
 const edge=joystickVector(100,100);assert.ok(Math.abs(Math.hypot(edge.x,edge.y)-1)<.001);
});
test('analog movement supports slow travel without exceeding keyboard speed',async()=>{
 const {createGame,stepMovement}=await import('../src/rules.mjs');const {makeWorld}=await import('./fixtures.mjs');const w=makeWorld(),s=createGame(w);
 const slow=stepMovement(s,{axisX:.5,axisY:0},.05,w);assert.equal(slow.player.x-s.player.x,3);
 const fast=stepMovement(s,{axisX:2,axisY:2},.05,w);assert.ok(Math.hypot(fast.player.x-s.player.x,fast.player.y-s.player.y)<=6.001);
});
