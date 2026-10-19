import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WORLD} from '../src/world.mjs';
import {isBlocked} from '../src/navigation.mjs';
test('river stops movement except on a bridge, including radius at the bank',()=>{
 const w={width:300,height:300,obstacles:[],water:[{points:[[0,150],[300,150]],width:40}],bridges:[{x:130,y:100,w:40,h:100}]};
 assert.equal(isBlocked(70,150,w),true);
 assert.equal(isBlocked(70,124,w),true);
 assert.equal(isBlocked(70,120,w),false);
 assert.equal(isBlocked(150,150,w),false);
 assert.equal(isBlocked(132,150,w),true,'edge of bridge must respect radius');
});
test('routing distinguishes an open detour from a sealed wall',async()=>{
 const {findRoute}=await import('../src/navigation.mjs');
 const w={width:240,height:240,obstacles:[{x:100,y:0,w:40,h:160}]};
 assert.ok(findRoute({x:48,y:48},{x:192,y:48},w)?.length>3);
 const sealed={...w,obstacles:[{x:100,y:0,w:40,h:240}]};
 assert.equal(findRoute({x:48,y:48},{x:192,y:48},sealed),null);
});
test('every campus destination has a collision-safe route from the gate',async()=>{
 const {findRoute,clearLine}=await import('../src/navigation.mjs');
 const failures=[];
 for(const p of WORLD.landmarks){
  const route=findRoute(WORLD.start,p.entry,WORLD);
  if(!route){failures.push(p.name);continue;}
  for(let i=1;i<route.length;i++)assert.ok(clearLine(route[i-1],route[i],WORLD),p.name);
 }
 assert.deepEqual(failures,[]);
});
test('actual player movement respects the river geometry',async()=>{
 const {createGame,stepMovement}=await import('../src/rules.mjs');
 const w={width:300,height:300,start:{x:70,y:120},humans:[],obstacles:[],water:[{points:[[0,150],[300,150]],width:40}],bridges:[]};
 const s=stepMovement(createGame(w),{down:true},.05,w);
 assert.equal(s.player.y,120);
});
test('a guard returning to patrol does not walk through a building',async()=>{
 const {advanceHumans}=await import('../src/rules.mjs');
 const w={width:300,height:300,obstacles:[{x:120,y:80,w:60,h:140}]};
 let state={humans:[{x:110,y:150,mode:'route',route:[{x:240,y:150},{x:240,y:240}],waypointIndex:0,routeDirection:1,speed:50}]};
 for(let i=0;i<100;i++){state=advanceHumans(state,.05,w);assert.equal(isBlocked(state.humans[0].x,state.humans[0].y,w),false);}
});
test('building ground footprints never sit in a river',async()=>{
 const {segmentDistance}=await import('../src/navigation.mjs');const wet=[];
 for(const o of WORLD.obstacles){
  let overlaps=false;
  for(let x=o.x;x<=o.x+o.w;x+=10)for(let y=o.y;y<=o.y+o.h;y+=10){
   if(WORLD.water.some(r=>r.points.slice(1).some((p,i)=>segmentDistance(x,y,r.points[i],p)<r.width/2)))overlaps=true;
  }
  if(overlaps)wet.push(WORLD.landmarks.find(p=>p.id===o.id)?.name);
 }
 assert.deepEqual(wet,[]);
});
test('each named bridge is traversable from bank to bank',async()=>{
 const {clearLine}=await import('../src/navigation.mjs');
 for(const p of WORLD.landmarks.filter(p=>p.kind==='bridge')){
  const a=p.vertical?{x:p.x,y:p.y-p.h-20}:{x:p.x-p.w/2-20,y:p.y-p.h/2};
  const b=p.vertical?{x:p.x,y:p.y+20}:{x:p.x+p.w/2+20,y:p.y-p.h/2};
  assert.ok(clearLine(a,b,WORLD),p.name);
 }
});
