import {findRoute} from '../src/navigation.mjs';
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { WORLD } from '../src/world.mjs';
import { createGame, stepMovement, interact, isHidden } from '../src/rules.mjs';

test('lower-campus landmarks follow the supplied map: library left of hall, field above-right, gate below',()=>{
 const library=WORLD.obstacles.find(o=>o.kind==='library');
 const hall=WORLD.obstacles.find(o=>o.kind==='hall');
 const field=WORLD.pranks.find(o=>o.id==='field');
 assert.ok(library.x+library.w<hall.x,'library must be left of hall');
 assert.ok(field.x>hall.x+hall.w && field.y<hall.y+hall.h,'field above-right of hall');
 assert.ok(WORLD.start.y>hall.y+hall.h && WORLD.start.x>library.x && WORLD.start.x<hall.x,'gate below the central campus');
});

test('new gate home can hide and patrols do not pass through campus buildings',()=>{
 const b=WORLD.bushes[0];
 assert.ok(Math.hypot(b.x+b.w/2-WORLD.start.x,b.y+b.h/2-WORLD.start.y)<180,'hiding bush stays near entry');
 assert.ok(isHidden({...createGame(WORLD),player:{x:b.x+b.w/2,y:b.y+b.h/2,curled:true}},WORLD),'roadside home must have a hiding bush');
 for(const human of WORLD.humans){
  const [a,b]=human.route;
  for(let i=0;i<=100;i++){
   const p={x:a.x+(b.x-a.x)*i/100,y:a.y+(b.y-a.y)*i/100};
   assert.ok(!WORLD.obstacles.some(o=>p.x>=o.x&&p.x<=o.x+o.w&&p.y>=o.y&&p.y<=o.y+o.h),`${human.id} route crosses a building`);
  }
 }
});

test('the tributary and east riverbanks stop walking into the water',()=>{
 const s=createGame(WORLD);
 const right=stepMovement({...s,player:{x:4512,y:2000}}, {right:true},.05,WORLD);
 assert.equal(right.player.x,4512);
 const top=stepMovement({...s,player:{x:600,y:2136}}, {up:true},.05,WORLD);
 assert.equal(top.player.y,2136);
});

test('a walkable route reaches all three tasks and returns to the new gate',()=>{
 let s=createGame(WORLD);
 function walkTo(target){
  const route=findRoute(s.player,target,WORLD,false);assert.ok(route,'route must exist');
  for(const p of route.slice(1)){
   for(let n=0;n<100;n++){
    const dx=p.x-s.player.x,dy=p.y-s.player.y;if(Math.hypot(dx,dy)<.2)break;
    const horizontal=Math.abs(dx)>.1;
    const next=stepMovement(s,horizontal?{right:dx>0,left:dx<0}:{down:dy>0,up:dy<0},Math.min(.05,Math.abs(horizontal?dx:dy)/120),WORLD);
    assert.ok(next.player.moving,`blocked near ${s.player.x},${s.player.y}`);s=next;
   }
   assert.ok(Math.hypot(p.x-s.player.x,p.y-s.player.y)<.3,'must reach waypoint');
  }
 }
 for(const id of ['library','hall','field']){
  const target=WORLD.pranks.find(p=>p.id===id);walkTo(target);
  s=interact(s,WORLD);assert.ok(s.completedPranks.includes(id));
 }
 walkTo(WORLD.start);
 assert.equal(interact(s,WORLD).won,true);
});
