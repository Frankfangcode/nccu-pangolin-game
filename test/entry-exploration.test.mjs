import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {WORLD} from '../src/world.mjs';
import {createGame,stepMovement} from '../src/rules.mjs';
import {cameraFor} from '../src/render.mjs';
test('walk straight from outside the main gate into campus without hitting the monument',()=>{
 let state=createGame(WORLD);
 for(let i=0;i<80;i++)state=stepMovement(state,{up:true},.05,WORLD);
 assert.ok(state.player.y<=WORLD.start.y-450,'entry lane must be clear');
});
test('desktop camera shows a neighborhood rather than the entire entrance district',()=>{
 const camera=cameraFor(WORLD.start,WORLD,{width:1280,height:800,touch:false});
 assert.ok(camera.zoom>=1.6);
 assert.ok(camera.width<=800);
 assert.ok(Math.abs((WORLD.start.x-camera.x)*camera.zoom-640)<1);
});
test('unexplored distant buildings stay off the map until approached or visited',async()=>{
 const {knownPlaces}=await import('../src/exploration.mjs');
 assert.equal(typeof knownPlaces,'function');
 const fresh=createGame(WORLD),far=WORLD.landmarks.find(p=>p.name==='醉夢湖');
 assert.ok(!knownPlaces(fresh,WORLD).some(p=>p.id===far.id));
 assert.ok(knownPlaces({...fresh,player:far.entry},WORLD).some(p=>p.id===far.id));
 assert.ok(knownPlaces({...fresh,visited:[far.id]},WORLD).some(p=>p.id===far.id));
});
test('entrance road reaches the gate and campus streets have distinct surfaces',()=>{
 assert.ok(WORLD.roadStyles?.some(r=>r.name==='正門入口'&&r.surface==='asphalt'));
 assert.ok(WORLD.roadStyles.some(r=>r.name==='四維道'&&r.surface==='brick'));
});
test('first instruction is entering the gate, then the animal objective resumes',async()=>{
 const {entryObjective}=await import('../src/exploration.mjs');
 assert.equal(typeof entryObjective,'function');
 const gate=WORLD.landmarks.find(p=>p.name==='政大校門');
 assert.equal(entryObjective(createGame(WORLD),WORLD)?.id,gate.id);
 assert.equal(entryObjective({...createGame(WORLD),visited:[gate.id]},WORLD),null);
});
