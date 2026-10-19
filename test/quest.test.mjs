import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {createQuest,interactQuest,questTarget,QUEST_ACTORS} from '../src/quest.mjs';
import {WORLD} from '../src/world.mjs';
import {createGame} from '../src/rules.mjs';
const at=(quest,id)=>({...createGame(WORLD),quest,player:{...QUEST_ACTORS[id].entry}});
test('black cat starts a commission and points to the magpie',()=>{
 const initial=createQuest();
 assert.equal(questTarget(initial).id,'cat');
 const result=interactQuest(at(initial,'cat'),WORLD);
 assert.equal(result.state.quest.stage,'meet-magpie');
 assert.equal(questTarget(result.state.quest).id,'magpie');
 assert.equal(result.dialogue.speaker,'半山腰的黑貓');
});
test('commission follows collection and return order, with a persistent scouting reward',()=>{
 let quest=createQuest();
 for(const [id,next] of [['cat','meet-magpie'],['magpie','collect'],['treasure','return-magpie'],['magpie','report-cat'],['cat','complete']]){
  const result=interactQuest(at(quest,id),WORLD);
  assert.equal(result.state.quest.stage,next);
  assert.ok(result.dialogue.text);quest=result.state.quest;
 }
 assert.equal(questTarget(quest),null);
 assert.equal(interactQuest(at(quest,'cat'),WORLD).state.quest.stage,'complete');
});
test('cannot collect while seen or chased, from afar, or through a wall',()=>{
 const near=at({stage:'collect'},'treasure');
 for(const status of ['alert','chase'])assert.equal(interactQuest({...near,status},WORLD).state.quest.stage,'collect');
 assert.equal(interactQuest({...near,player:WORLD.start},WORLD).state.quest.stage,'collect');
 const wall={...WORLD,obstacles:[{x:2670,y:2670,w:20,h:20}]};
 assert.equal(interactQuest(near,wall).state.quest.stage,'collect');
});
test('all quest destinations connect to campus paths and collection survives capture',async()=>{
 const {findRoute}=await import('../src/navigation.mjs');
 const {capturePlayer}=await import('../src/rules.mjs');
 for(const actor of Object.values(QUEST_ACTORS))assert.ok(findRoute(WORLD.start,actor.entry,WORLD),actor.name);
 const carrying=at({stage:'return-magpie'},'treasure');
 assert.equal(capturePlayer(carrying,WORLD).quest.stage,'return-magpie');
});
test('first friend is reachable on the entrance walk without a cross-campus detour',async()=>{
 const {findRoute}=await import('../src/navigation.mjs');
 const route=findRoute(WORLD.start,QUEST_ACTORS.cat.entry,WORLD);
 assert.ok(route);
 const length=route.reduce((sum,p,i)=>i?sum+Math.hypot(p.x-route[i-1].x,p.y-route[i-1].y):sum,0);
 assert.ok(length<600,`first meeting takes ${length} world units`);
});
test('pickup and handoff provide one scene event; hints cannot duplicate rewards',()=>{
 const pickup=interactQuest(at({stage:'collect'},'treasure'),WORLD);
 assert.deepEqual(pickup.feedback,{kind:'pickup',actor:'treasure',label:'收藏已收好'});
 const again=interactQuest(at(pickup.state.quest,'treasure'),WORLD);
 assert.equal(again.feedback,undefined);
 const handoff=interactQuest(at(pickup.state.quest,'magpie'),WORLD);
 assert.deepEqual(handoff.feedback,{kind:'handoff',actor:'magpie',label:'物歸原主'});
 const finish=interactQuest(at({stage:'report-cat'},'cat'),WORLD);
 assert.equal(finish.feedback.kind,'friendship');
 assert.equal(interactQuest(at(finish.state.quest,'cat'),WORLD).feedback,undefined);
 for(const status of ['alert','chase'])assert.equal(interactQuest({...at({stage:'collect'},'treasure'),status},WORLD).feedback,undefined);
});
test('scene cue shows carried treasure only until handoff, and greeting only nearby in safety',async()=>{
 const {questScene}=await import('../src/quest.mjs');
 const carrying=at({stage:'return-magpie'},'magpie');
 assert.equal(questScene(carrying).carrying,true);
 assert.equal(questScene(carrying).greeting,'magpie');
 assert.equal(questScene({...carrying,status:'chase'}).greeting,null);
 assert.equal(questScene({...carrying,player:WORLD.start}).greeting,null);
 assert.equal(questScene(at({stage:'report-cat'},'cat')).carrying,false);
 assert.equal(questScene(at({stage:'complete'},'cat')).greeting,'cat');
});
