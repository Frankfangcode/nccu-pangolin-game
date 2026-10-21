import test from 'node:test';
import assert from 'node:assert/strict';
import {createPostcard} from '../src/postcards-state.mjs';
test('postcard preserves international text and rejects blank or oversized wishes',()=>{
 const input={name:' Léa ',country:'FR',kind:'exchange',design:'hall',message:'  政大生日快樂！\nMerci NCCU.  ',public:true};
 const card=createPostcard(input,'demo-1');
 assert.equal(card.name,'Léa'); assert.equal(card.message,'政大生日快樂！\nMerci NCCU.'); assert.equal(card.id,'demo-1');
 assert.throws(()=>createPostcard({...input,message:'  '}));
 assert.throws(()=>createPostcard({...input,message:'a'.repeat(501)}));
 assert.throws(()=>createPostcard({...input,country:'INVALID'}));
});

test('saving is idempotent, survives reload, and never reports a failed write as success',async()=>{
 const {saveCard,readCards,STORE_KEY}=await import('../src/postcards-state.mjs');
 const map=new Map();const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 const card=createPostcard({name:'Sam',country:'FR',kind:'degree',design:'hall',message:'Hello',public:false},'same');
 saveCard(storage,card);saveCard(storage,card);
 assert.equal(readCards(storage).length,1);assert.equal(readCards(storage)[0].public,false);
 assert.throws(()=>saveCard({...storage,setItem(){throw Error('quota');}}, {...card,id:'new'}));
 map.set(STORE_KEY,'broken');assert.throws(()=>readCards(storage));
});

test('journey starts at NCCU, collects at the selected country, returns carrying the card',async()=>{
 const {journeyFrame}=await import('../src/postcards-state.mjs');
 const start=journeyFrame(0,'FR'),pickup=journeyFrame(.5,'FR'),end=journeyFrame(1,'FR');
 assert.equal(start.carrying,false);assert.equal(pickup.carrying,true);
 assert.deepEqual([start.x,start.y],[end.x,end.y]);
 assert.ok(pickup.x<start.x);assert.equal(end.phase,'arrived');
 assert.notEqual(journeyFrame(.5,'JP').x,pickup.x);
});
