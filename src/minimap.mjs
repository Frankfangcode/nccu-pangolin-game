import {drawAtlas} from './landscape.mjs?v=12';
export function localProjection(player,size=240,span=1000){
 return p=>({x:size/2+(p.x-player.x)*size/span,y:size/2+(p.y-player.y)*size/span});
}
export function objectiveMarker(p,size=240,radius=100){
 const dx=p.x-size/2,dy=p.y-size/2,d=Math.hypot(dx,dy),edge=d>radius;
 return {x:edge?size/2+dx/d*radius:p.x,y:edge?size/2+dy/d*radius:p.y,edge,angle:Math.atan2(dy,dx)};
}
export function createMinimap(canvas,world){
 const background=document.createElement('canvas');background.width=1300;background.height=900;
 const ctx=canvas.getContext('2d');let signature='';
 const size=240,span=1000,scale=background.width/world.width;
 canvas.width=size;canvas.height=size;
 return {paint(state,assets,target){
  if(!assets)return;
  const next=JSON.stringify([Math.round(state.player.x/30),Math.round(state.player.y/30),state.visited]);
  if(signature!==next){drawAtlas(background.getContext('2d'),world,assets,{...state,humans:[],quest:null},null);signature=next;}
  const project=localProjection(state.player,size,span);
  ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(120,120,116,0,Math.PI*2);ctx.clip();
  ctx.fillStyle='#254a38';ctx.fillRect(0,0,size,size);
  // Translate the cached campus beneath a stationary player; keep the same zoom at world edges.
  const origin=project({x:0,y:0});
  ctx.drawImage(background,origin.x,origin.y,background.width/scale*size/span,background.height/scale*size/span);
  function dot(p,color,r){ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#fff8e8';ctx.lineWidth=2;ctx.stroke();}
  if(state.quest?.stage==='complete')for(const h of state.humans){const p=project(h);if(Math.hypot(p.x-120,p.y-120)<108)dot(p,'#e9a24d',4);}
  if(target){
   const marker=objectiveMarker(project(target.entry));
   if(marker.edge){ctx.save();ctx.translate(marker.x,marker.y);ctx.rotate(marker.angle);ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-6,-6);ctx.lineTo(-6,6);ctx.closePath();ctx.fillStyle='#b94d32';ctx.fill();ctx.strokeStyle='#fff8e8';ctx.lineWidth=2;ctx.stroke();ctx.restore();}
   else dot(marker,'#b94d32',6);
  }
  dot({x:120,y:120},'#203f36',7);
  const facing=({east:0,south:Math.PI/2,west:Math.PI,north:-Math.PI/2})[state.player.direction]??0;
  ctx.save();ctx.translate(120,120);ctx.rotate(facing);ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(10,-4);ctx.lineTo(10,4);ctx.closePath();ctx.fillStyle='#fff8e8';ctx.fill();ctx.restore();
  ctx.fillStyle='#203f36';ctx.beginPath();ctx.arc(120,22,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff8e8';ctx.font='700 15px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('N',120,22);
  ctx.restore();
 }};
}
