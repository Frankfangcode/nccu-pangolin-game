import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WORLD} from '../src/world.mjs';
import {readFileSync} from 'node:fs';
test('every supplied campus label has a unique playable destination and zone',()=>{
 const expected=JSON.parse(readFileSync(new URL('../data/campus-layout.json',import.meta.url)));
 assert.equal(WORLD.landmarks.length,62);
 assert.equal(new Set(WORLD.landmarks.map(p=>p.id)).size,62);
 assert.deepEqual(WORLD.landmarks.map(p=>p.name),expected.landmarks.map(p=>p.name));
 for(const p of WORLD.landmarks){assert.ok(p.entry&&Number.isFinite(p.entry.x)&&Number.isFinite(p.entry.y),p.name);assert.ok(p.zone);}
});
test('discovery requires reaching an entrance and is only counted once',async()=>{
 const {discoverPlaces}=await import('../src/exploration.mjs');
 const w={width:300,height:300,obstacles:[],landmarks:[{id:'a',entry:{x:100,y:100},name:'圖書館',zone:'山下'}]};
 let s={player:{x:200,y:100},visited:[]};
 assert.deepEqual(discoverPlaces(s,w).visited,[]);
 s=discoverPlaces({...s,player:{x:110,y:100}},w);assert.deepEqual(s.visited,['a']);
 assert.deepEqual(discoverPlaces(s,w).visited,['a']);
 assert.deepEqual(discoverPlaces({player:{x:110,y:100},visited:[]},{...w,obstacles:[{x:103,y:80,w:2,h:40}]}).visited,[]);
});
test('atlas search combines region and text without hiding unvisited places',async()=>{
 const {filterPlaces}=await import('../src/exploration.mjs');
 assert.equal(filterPlaces(WORLD.landmarks,'圖書館','全部').length,2);
 assert.equal(filterPlaces(WORLD.landmarks,'','自強宿舍').length,6);
 assert.deepEqual(filterPlaces(WORLD.landmarks,'不存在的校舍','全部'),[]);
 assert.equal(filterPlaces(WORLD.landmarks,'  中正  ','全部')[0].name,'中正圖書館');
});
