import {clearLine} from './navigation.mjs';
export function discoverPlaces(state,world){
 const visited=state.visited??[];
 const newly=world.landmarks.filter(p=>!visited.includes(p.id)&&Math.hypot(p.entry.x-state.player.x,p.entry.y-state.player.y)<52&&clearLine(state.player,p.entry,world));
 if(!newly.length)return state;
 return {...state,visited:[...visited,...newly.map(p=>p.id)],message:`發現 ${newly.map(p=>p.name).join('、')} · ${visited.length+newly.length} / ${world.landmarks.length}`};
}
export function nearestPlace(player,world){return world.landmarks.reduce((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)<Math.hypot(b.x-player.x,b.y-player.y)?a:b);}
export function filterPlaces(places,query='',zone='全部'){
 const text=query.trim().toLocaleLowerCase();
 return places.filter(p=>(zone==='全部'||p.zone===zone)&&p.name.toLocaleLowerCase().includes(text));
}

// Remember landmarks reached on foot; the immediate neighborhood is visible too.
export function knownPlaces(state,world){
 return world.landmarks.filter(p=>state.visited?.includes(p.id)||Math.hypot(p.entry.x-state.player.x,p.entry.y-state.player.y)<380);
}
export function exploredAreas(state,world){
 return [{...state.player,radius:440},...world.landmarks.filter(p=>state.visited?.includes(p.id)).map(p=>({...p.entry,radius:440}))];
}
export function entryObjective(state,world){
 const gate=world.landmarks.find(p=>p.name==='政大校門');
 return gate&&!state.visited?.includes(gate.id)?gate:null;
}
