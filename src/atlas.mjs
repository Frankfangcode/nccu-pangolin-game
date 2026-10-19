import {questTarget} from './quest.mjs?v=12';
import {filterPlaces,knownPlaces} from './exploration.mjs';
import {drawAtlas} from './landscape.mjs?v=12';
export function createAtlas(world,getState,getAssets,onSelect){
 const dialog=document.querySelector('#atlas'),canvas=document.querySelector('#atlas-map'),list=document.querySelector('#place-list'),query=document.querySelector('#place-search'),zone=document.querySelector('#zone-filter');
 let selected=null;
 function paint(){
  const rect=canvas.getBoundingClientRect();canvas.width=Math.round(rect.width);canvas.height=Math.round(rect.height);
  drawAtlas(canvas.getContext('2d'),world,getAssets(),getState(),questTarget(getState().quest)??selected);
 }
 function select(p){selected=p;onSelect(p);dialog.close();document.querySelector('#game').focus();}
 function refresh(){
  const state=getState(),places=filterPlaces(knownPlaces(state,world),query.value,zone.value);
  list.replaceChildren();
  document.querySelector('#atlas-progress').textContent=`已發現 ${state.visited?.length??0} / ${world.landmarks.length} 個地點`;
  document.querySelector('#atlas-results').textContent=places.length?`${places.length} 個地點 · 選一個開始找路`:'這裡還沒有足跡。走近校舍，地圖就會記下它。';
  for(const p of places){
   const button=document.createElement('button');button.type='button';button.className='place-row';
   const name=document.createElement('strong'),detail=document.createElement('small'),arrow=document.createElement('span');
   name.textContent=p.name;detail.textContent=`${p.zone} · ${state.visited?.includes(p.id)?'已發現':'尚未探索'}`;arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
   button.append(name,detail,arrow);button.onclick=()=>select(p);list.append(button);
  }
  const goal=questTarget(state.quest);
  document.querySelector('#atlas-quest').textContent=goal?`任務帶路：${goal.name} ↗`:'委託完成 · 藍鵲正在替你偵察';
  document.querySelector('#atlas-quest').disabled=!goal;
  document.querySelector('#scout-legend').hidden=state.quest?.stage!=='complete';
  paint();
 }
 function open(){dialog.showModal();refresh();}
 document.querySelector('#map-toggle').onclick=open;
 document.querySelector('#close-map').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>document.querySelector('#game').focus());
 document.querySelector('#go-home').onclick=()=>select({id:'home',name:'秘密基地',entry:world.start});
 query.addEventListener('input',refresh);zone.addEventListener('change',refresh);
 new ResizeObserver(()=>{if(dialog.open)paint();}).observe(canvas);
 canvas.addEventListener('click',event=>{
  const rect=canvas.getBoundingClientRect(),scale=Math.min(rect.width/world.width,rect.height/world.height),ox=(rect.width-world.width*scale)/2,oy=(rect.height-world.height*scale)/2;
  const x=(event.clientX-rect.left-ox)/scale,y=(event.clientY-rect.top-oy)/scale;
  const nearest=knownPlaces(getState(),world).reduce((a,b)=>!a||Math.hypot(b.x-x,b.y-y)<Math.hypot(a.x-x,a.y-y)?b:a,null);
  if(nearest&&Math.hypot(nearest.x-x,nearest.y-y)<260)select(nearest);
 });
 document.querySelector('#atlas-quest').onclick=()=>{const goal=questTarget(getState().quest);if(goal)select(goal);};
 return {dialog,open};
}
