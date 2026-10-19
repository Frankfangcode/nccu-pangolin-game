import {isBlocked,segmentDistance} from './navigation.mjs';
import {CAMPUS} from './campus-data.mjs?v=5';
const aliases={school:'heritage',shop:'heritage',canteen:'heritage',academic:'office'};
const landmarks=CAMPUS.landmarks.map(p=>{
 const n={...p,asset:aliases[p.asset]??p.asset,w:p.w*.72,h:p.h*.72};
 n.entry={x:n.x,y:n.y+34};
 if(p.kind==='route'||p.w===0)n.entry={x:n.x,y:n.y};
 if(p.kind==='bridge'){
  const vertical=p.name!=='道南橋';
  n.asset=vertical?'bridge-ns':'bridge';n.vertical=vertical;n.w=vertical?148:440;n.h=vertical?260:148;
  n.y=p.y+n.h/2;n.entry={x:n.x,y:n.y+22};
 }
 if(p.name==='道南橋')n.entry={x:n.x+n.w/2+24,y:p.y};
 if(p.name==='指南溪')n.entry={x:2840,y:1910};

 return n;
});
const water=CAMPUS.water.map(r=>({...r,width:r.width*4,points:r.points.map(p=>p.map(v=>v*4))}));
const bridges=landmarks.filter(p=>p.kind==='bridge').map(p=>({x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h}));
// The short school connection crosses both tributaries where they meet.
bridges.push({x:900,y:1870,w:200,h:340});
const obstacles=landmarks.filter(p=>p.kind==='building'||p.asset==='lake'||['statue','monument','gate'].includes(p.asset)).map(p=>({x:p.x-p.w*.42,y:p.y-p.h*.31,w:p.w*.84,h:p.h*.31,kind:p.asset,id:p.id}));
const start={x:2360,y:3300};
const bushes=[{x:start.x-48,y:start.y-38,w:96,h:76},...landmarks.filter(p=>p.kind==='building').map(p=>({x:p.x+p.w/2+32,y:p.y+4,w:68,h:60}))];
const byName=name=>landmarks.find(p=>p.name===name);
const pranks=[['hall','四維堂','替立牌換上搞怪表情','嘿嘿！立牌露出搞怪笑臉。'],['library','中正圖書館','啟動紙青蛙箱','呱！紙青蛙跳出來了。'],['field','操場','推動鴨子布偶','嘎！鴨子坐上了看台。']].map(([id,name,action,message])=>({id,...byName(name).entry,title:name,action,message}));
const humans=[{x:2640,y:2680},{x:2180,y:2610},{x:3700,y:2400},{x:3000,y:1620},{x:4400,y:1180}].map((p,i)=>({id:`visitor${i}`, ...p,facing:0,range:140,route:[{x:p.x-65,y:p.y},{x:p.x+65,y:p.y}],waypointIndex:0,routeDirection:1,mode:'route',awareness:0,searchLeft:0,speed:50}));
export const WORLD={width:CAMPUS.width,height:CAMPUS.height,start,landmarks,water,bridges,roads:CAMPUS.roads.map(r=>r.map(p=>p.map(v=>v*4))),obstacles,bushes,humans,pranks};

// Deterministic decorative canopy placement; paths and landmark entrances stay open.
WORLD.trees=[];
for(let i=0;i<320;i++){
 const x=100+(i*673%4900),y=180+(i*997%3200),w=110+(i%4)*18,h=w*1.15;
 if(isBlocked(x,y,WORLD)||landmarks.some(p=>Math.abs(p.x-x)<p.w/2+90&&Math.abs(p.y-y)<p.h+80)||WORLD.roads.some(r=>r.slice(1).some((p,j)=>segmentDistance(x,y,r[j],p)<95)))continue;
 WORLD.trees.push({x,y,w,h});
}
