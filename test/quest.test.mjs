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
