import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {localProjection} from '../src/minimap.mjs';
test('local map keeps the moving player centered while nearby scenery scrolls',()=>{
 const first=localProjection({x:1000,y:900},240,1000);
 assert.deepEqual(first({x:1000,y:900}),{x:120,y:120});
 assert.deepEqual(first({x:1250,y:900}),{x:180,y:120});
 const moved=localProjection({x:1250,y:900},240,1000);
 assert.deepEqual(moved({x:1250,y:900}),{x:120,y:120});
 assert.deepEqual(moved({x:1000,y:900}),{x:60,y:120});
});
test('distant objective stays on circular edge, nearby objective stays in place',async()=>{
 const {objectiveMarker}=await import('../src/minimap.mjs');
 assert.deepEqual(objectiveMarker({x:140,y:120},240,100),{x:140,y:120,edge:false,angle:0});
 const far=objectiveMarker({x:520,y:-280},240,100);
 assert.equal(far.edge,true);
 assert.ok(Math.abs(Math.hypot(far.x-120,far.y-120)-100)<.001);
 assert.ok(far.x>120&&far.y<120);
});
