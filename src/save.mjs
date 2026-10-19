import {QUEST_STEPS} from './quest.mjs';
export const SAVE_KEY='nccu-pangolin-quest-v1';
export function writeSave(storage,state){
 try{storage.setItem(SAVE_KEY,JSON.stringify({version:1,quest:state.quest,visited:state.visited,completedPranks:state.completedPranks}));return true;}catch{return false;}
}
export function readSave(storage,world){
 try{
  const raw=storage.getItem(SAVE_KEY);if(!raw)return {data:null};
  if(raw.length>12000)throw Error('size');
  const data=JSON.parse(raw);
  const validList=(value,allowed)=>Array.isArray(value)&&value.length<=allowed.length&&value.every(id=>typeof id==='string'&&allowed.includes(id));
  if(data?.version!==1||!['complete',...Object.keys(QUEST_STEPS)].includes(data.quest?.stage)||!validList(data.visited,world.landmarks.map(p=>p.id))||!validList(data.completedPranks,world.pranks.map(p=>p.id)))throw Error('invalid');
  return {data:{quest:{stage:data.quest.stage},visited:[...new Set(data.visited)],completedPranks:[...new Set(data.completedPranks)]}};
 }catch{return {data:null,error:true};}
}
