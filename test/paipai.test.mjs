import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {createPaiPai,stepPaiPai,discoverFromAir,restorePaiPai} from '../src/paipai-state.mjs';
import {paipaiCamera,paipaiMotionPose} from '../src/paipai-render.mjs';

const world={width:500,height:500,start:{x:50,y:50},obstacles:[{x:58,y:35,w:40,h:40}],water:[],bridges:[],landmarks:[{id:'gate',name:'政大校門',entry:{x:50,y:50}},{id:'hall',name:'四維堂',entry:{x:180,y:50}}]};

test('派派起點在正門，地面被建築阻擋，起飛後可以飛過',()=>{
 const start=createPaiPai(world);
 assert.deepEqual({x:start.x,y:start.y},world.start);
 assert.equal(stepPaiPai(start,{right:true},.05,world).x,50);
 let flying=start;
 for(let i=0;i<8;i++)flying=stepPaiPai(flying,{fly:true},.05,world);
 assert.ok(flying.altitude>0);
 assert.ok(stepPaiPai(flying,{right:true},.05,world).x>50);
});

test('派派不能降落在屋頂正中，離開後才能降落',()=>{
 const above={...createPaiPai(world),x:70,y:50,altitude:1};
 let bird=above;
 for(let i=0;i<15;i++)bird=stepPaiPai(bird,{},.05,world);
 assert.ok(bird.altitude>.2);
 bird={...bird,x:140};
 for(let i=0;i<15;i++)bird=stepPaiPai(bird,{},.05,world);
 assert.equal(bird.altitude,0);
});

test('飛近建築才加入探索紀錄，重複經過不重複記錄',()=>{
 const bird={...createPaiPai(world),x:180,y:120,altitude:.8};
 const first=discoverFromAir([],bird,world);
 assert.deepEqual(first,['hall']);
 assert.deepEqual(discoverFromAir(first,bird,world),first);
});

test('損壞的存檔回到正門，與穿山甲進度分開',()=>{
 const restored=restorePaiPai({x:-999,y:'bad',visited:['hall','fake']},world);
 assert.deepEqual({x:restored.bird.x,y:restored.bird.y},world.start);
 assert.deepEqual(restored.visited,['hall']);
});

test('屋頂內的存檔回到可移動的正門，過長進度只保留校園地點',()=>{
 const restored=restorePaiPai({x:70,y:50,visited:Array(1000).fill('hall')},world);
 assert.deepEqual({x:restored.bird.x,y:restored.bird.y},world.start);
 assert.deepEqual(restored.visited,['hall']);
});

test('起飛鏡頭拉遠，降落鏡頭回到較近視角',()=>{
 const ground=paipaiCamera({x:250,y:250,altitude:0},{width:1000,height:1000},800,600);
 const air=paipaiCamera({x:250,y:250,altitude:1},{width:1000,height:1000},800,600);
 assert.ok(air.zoom<ground.zoom);
 assert.ok(air.width>ground.width);
});

test('走路步伐只跟實際移動距離前進，停住或撞牆時不空踏步',()=>{
 const start=createPaiPai(world);
 const blocked=stepPaiPai(start,{right:true},.05,world);
 assert.equal(blocked.stride,0);
 const walking=stepPaiPai(start,{down:true},.05,world);
 assert.ok(walking.stride>0);
 assert.equal(stepPaiPai(walking,{},.05,world).stride,walking.stride);
});

test('空中停留仍會拍翅，落地後停止拍翅',()=>{
 const start=createPaiPai(world);
 const flying=stepPaiPai(start,{fly:true},.05,world);
 assert.ok(flying.wingPhase>0);
 let landed=flying;
 for(let i=0;i<4;i++)landed=stepPaiPai(landed,{},.05,world);
 assert.equal(landed.altitude,0);
 assert.equal(stepPaiPai(landed,{},.05,world).wingPhase,landed.wingPhase);
});

test('站定使用休息姿勢，走路切換步姿，飛行切換翅膀，減少動態偏好維持安定',()=>{
 const bird=createPaiPai(world);
 assert.equal(paipaiMotionPose(bird).walkStep,0);
 assert.ok(paipaiMotionPose({...bird,moving:true,stride:10}).walkStep>.5);
 const flying=paipaiMotionPose({...bird,altitude:1,wingPhase:Math.PI});
 assert.ok(flying.flight>0);
 assert.ok(flying.wingDown>0);
 const calm=paipaiMotionPose({...bird,moving:true,stride:10,altitude:1,wingPhase:Math.PI},true);
 assert.equal(calm.walkStep,0);
 assert.equal(calm.wingDown,0);
 assert.equal(calm.bob,0);
});

test('走路時身體固定，頭部轉動且腳步交替；停下與減少動態時頭會安定',()=>{
 const bird={...createPaiPai(world),moving:true,stride:6.5};
 const walking=paipaiMotionPose(bird);
 assert.equal(walking.bodyBob,0);
 assert.equal(walking.bodyAngle,0);
 assert.ok(Math.abs(walking.headAngle)>0);
 assert.ok(walking.walkStep>0);
 const opposite=paipaiMotionPose({...bird,stride:19.5});
 assert.ok(walking.headAngle*opposite.headAngle<0);
 assert.equal(paipaiMotionPose({...bird,moving:false}).headAngle,0);
 assert.equal(paipaiMotionPose(bird,true).headAngle,0);
});
