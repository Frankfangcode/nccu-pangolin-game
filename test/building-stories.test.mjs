import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {WORLD} from '../src/world.mjs';
import {buildingStory} from '../src/building-stories.mjs';

test('每棟校舍都有明確來源、辨識線索，未核實外觀不得說成還原',()=>{
 for(const place of WORLD.landmarks.filter(p=>p.kind==='building')){
  const story=buildingStory(place);
  assert.ok(story.name===place.name);
  assert.ok(story.source?.startsWith('https://'));
  assert.ok(story.clue?.length>5);
  assert.ok(['文字核對','外觀待核實'].includes(story.status));
 }
});

test('正門旁校友服務中心連到第八教室史料，指出可辨識的立面',()=>{
 const place=WORLD.landmarks.find(p=>p.name==='校友服務中心');
 const story=buildingStory(place);
 assert.ok(decodeURIComponent(story.source).endsWith('/第八教室'));
 assert.match(story.clue,/文化瓦.*玻璃帷幕/);
});
