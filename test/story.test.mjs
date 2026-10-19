import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {createStoryState,advanceStory,previousStory} from '../src/story-state.mjs';
test('story advances once per step, finishes after last panel, and cannot go out of bounds',()=>{
 let s=createStoryState(3);assert.equal(s.index,0);
 s=previousStory(s);assert.equal(s.index,0);
 s=advanceStory(s);assert.equal(s.index,1);assert.equal(s.done,false);
 s=advanceStory(s);assert.equal(s.index,2);assert.equal(s.done,false);
 s=advanceStory(s);assert.equal(s.done,true);assert.equal(s.index,2);
 assert.deepEqual(advanceStory(s),s);
 assert.equal(createStoryState(3).done,false);
});
