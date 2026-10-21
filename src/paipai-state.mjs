import {isBlocked} from './navigation.mjs';
export function restorePaiPai(data,world){
 const source=data&&typeof data==='object'?data:{};
 const valid=Number.isFinite(source.x)&&Number.isFinite(source.y)&&source.x>=0&&source.x<=world.width&&source.y>=0&&source.y<=world.height&&!isBlocked(source.x,source.y,world);
 const allowed=new Set(world.landmarks.map(p=>p.id));
 return {bird:valid?{...createPaiPai(world),x:source.x,y:source.y,altitude:0}:createPaiPai(world),visited:Array.isArray(source.visited)?[...new Set(source.visited.slice(0,world.landmarks.length*8).filter(id=>allowed.has(id)))]:[]};
}
export function discoverFromAir(visited,bird,world){
 const radius=bird.altitude>.2?118:58;
 const found=world.landmarks.filter(place=>!visited.includes(place.id)&&Math.hypot(place.entry.x-bird.x,place.entry.y-bird.y)<=radius).map(place=>place.id);
 return found.length?[...visited,...found]:visited;
}
export function createPaiPai(world){return {...world.start,altitude:0,direction:'north',moving:false};}
export function stepPaiPai(state,input,dt,world){
 const seconds=Math.min(Math.max(dt,0),.05);
 const floor=!input.fly&&isBlocked(state.x,state.y,world)?.25:0;
 const altitude=Math.max(floor,Math.min(1,state.altitude+(input.fly?2.8:-2.2)*seconds));
 const dx=input.axisX||Number(Boolean(input.right))-Number(Boolean(input.left));
 const dy=input.axisY||Number(Boolean(input.down))-Number(Boolean(input.up));
 const magnitude=Math.max(1,Math.hypot(dx,dy));
 const speed=altitude>.2?245:135;
 const candidateX=Math.max(10,Math.min(world.width-10,state.x+dx/magnitude*speed*seconds));
 const x=altitude>.2||!isBlocked(candidateX,state.y,world)?candidateX:state.x;
 const candidateY=Math.max(10,Math.min(world.height-10,state.y+dy/magnitude*speed*seconds));
 const y=altitude>.2||!isBlocked(x,candidateY,world)?candidateY:state.y;
 const direction=Math.abs(dx)>Math.abs(dy)?dx>0?'east':'west':dy?dy>0?'south':'north':state.direction;
 return {...state,x,y,altitude,moving:x!==state.x||y!==state.y,direction};
}
