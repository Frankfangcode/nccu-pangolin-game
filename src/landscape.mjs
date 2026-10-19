import {knownPlaces,exploredAreas} from './exploration.mjs';
const patterns=new WeakMap();
function material(c,a,name){
 let cache=patterns.get(c);if(!cache){cache={};patterns.set(c,cache);}
 return cache[name]??(cache[name]=c.createPattern(a[name],'repeat'));
}
function stroke(c,points,width,paint){
 c.strokeStyle=paint;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
}
export function drawGround(c,world,a){
 c.fillStyle=material(c,a,'grass');c.fillRect(-1000,-1000,world.width+2000,world.height+2000);
 for(const r of world.roads.slice(4))stroke(c,r,48,material(c,a,'path'));
 for(const r of world.roadStyles??[])stroke(c,r.points,r.width+12,'#d0cbbb');
 for(const r of world.roadStyles??[]){
  stroke(c,r.points,r.width,({asphalt:'#7a807b',brick:'#bd7d60',stone:'#b9b9a4'})[r.surface]);
 }
 // Pedestrian crossing immediately outside the open gate lane.
 for(let x=2320;x<=2400;x+=16){c.fillStyle='#f4edda';c.fillRect(x,3340,8,40);}

 for(const r of world.water){stroke(c,r.points,r.width+14,'#a0c895');stroke(c,r.points,r.width,material(c,a,'water'));}
}
export function drawPlace(c,p,a){
 const img=a[p.asset];if(!img||!p.w)return;
 if(p.kind==='bridge'&&p.vertical){c.drawImage(a['bridge-ns'],p.x-p.w/2,p.y-p.h,p.w,p.h);}
 else{const scale=Math.min(p.w/img.width,p.h/img.height),w=img.width*scale,h=img.height*scale;c.drawImage(img,p.x-w/2,p.y-h,w,h);}
}
export function drawRoute(c,route){
 if(!route?.length)return;c.save();c.setLineDash([9,12]);stroke(c,route.map(p=>[p.x,p.y]),5,'#fff1b2');c.restore();
}
export function drawAtlas(c,world,a,state,target){
 const w=c.canvas.width,h=c.canvas.height;c.clearRect(0,0,w,h);if(!a)return;
 const scale=Math.min(w/world.width,h/world.height),ox=(w-world.width*scale)/2,oy=(h-world.height*scale)/2;
 c.save();c.translate(ox,oy);c.scale(scale,scale);drawGround(c,world,a);
 for(const p of [...knownPlaces(state,world),...(world.trees??[]).map(p=>({...p,asset:'tree'}))].sort((a,b)=>a.y-b.y))drawPlace(c,p,a);
 for(const b of world.bridges.filter(b=>!world.landmarks.some(p=>p.kind==='bridge'&&Math.abs(p.x-b.x-b.w/2)<1)))drawPlace(c,{x:b.x+b.w/2,y:b.y+b.h,w:b.w,h:b.h,asset:'bridge-ns',kind:'bridge',vertical:true},a);
 // Hide unexplored terrain; only visited neighborhoods and the current view remain.
 c.globalCompositeOperation='destination-in';c.beginPath();
 for(const area of exploredAreas(state,world)){c.moveTo(area.x+area.radius,area.y);c.arc(area.x,area.y,area.radius,0,Math.PI*2);}
 c.fill();c.globalCompositeOperation='source-over';
 c.restore();
 function dot(p,color,r){c.fillStyle=color;c.strokeStyle='#fff9e7';c.lineWidth=2;c.beginPath();c.arc(ox+p.x*scale,oy+p.y*scale,r,0,Math.PI*2);c.fill();c.stroke();}
 for(const p of world.landmarks)if(state.visited?.includes(p.id))dot(p.entry,'#2b6346',3);
 if(state.quest?.stage==='complete')for(const human of state.humans)dot(human,'#e68c42',5);
 if(target)dot(target.entry,'#b94d32',7);dot(state.player,'#203f36',7);
 c.font='600 12px "PingFang TC",sans-serif';c.textAlign='left';c.fillStyle='#203f36';c.fillText('N ↑',12,22);
}
