export function createStoryState(count){return {index:0,count,done:false};}
export function advanceStory(s){return s.done?s:s.index<s.count-1?{...s,index:s.index+1}:{...s,done:true};}
export function previousStory(s){return {...s,index:Math.max(0,s.index-1),done:false};}
