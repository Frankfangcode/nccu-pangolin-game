import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readSave,writeSave} from '../src/save.mjs';
import {createGame} from '../src/rules.mjs';
import {WORLD} from '../src/world.mjs';
const memory=()=>{let value=null;return {getItem:()=>value,setItem:(_k,v)=>{value=v}}};
test('saved quest, visited places and pranks resume with safe spawn',()=>{
 const storage=memory(),state={...createGame(WORLD),quest:{stage:'report-cat'},visited:[WORLD.landmarks[0].id],completedPranks:['hall']};
 assert.equal(writeSave(storage,state),true);
 const result=readSave(storage,WORLD);
 assert.equal(result.data.quest.stage,'report-cat');
 assert.deepEqual(result.data.visited,state.visited);
 assert.deepEqual(result.data.completedPranks,['hall']);
 assert.equal(result.data.player,undefined);
});
test('invalid, oversized and foreign saves are rejected without overwriting them',()=>{
 for(const value of ['{',JSON.stringify({version:99,quest:{stage:'complete'}}),JSON.stringify({version:1,quest:{stage:'hacked'},visited:[],completedPranks:[]}),JSON.stringify({version:1,quest:{stage:'complete'},visited:['<script>'],completedPranks:[]}),JSON.stringify({version:1,quest:{stage:'complete'},visited:null,completedPranks:[]}), ' '.repeat(20000)]){
  const storage={getItem:()=>value,setItem:()=>assert.fail('must not overwrite')};
  assert.equal(readSave(storage,WORLD).data,null);
  assert.equal(readSave(storage,WORLD).error,true);
 }
});
test('disabled or full browser storage never crashes gameplay',()=>{
 const broken={getItem(){throw Error('denied')},setItem(){throw Error('quota')}};
 assert.equal(readSave(broken,WORLD).error,true);
 assert.equal(writeSave(broken,{quest:{stage:'complete'}}),false);
 assert.equal(readSave(memory(),WORLD).data,null);
});
