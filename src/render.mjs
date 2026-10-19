import {QUEST_ACTORS,questTarget,questScene} from './quest.mjs?v=13';
import {drawGround,drawPlace,drawRoute} from './landscape.mjs?v=13';
import { depthSort } from './assets.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function cameraFor(player,world,{width,height,touch}) {
 const zoom=touch?1.15:1.75,viewWidth=width/zoom,viewHeight=height/zoom;
 return {zoom,width:viewWidth,height:viewHeight,x:clamp(player.x-viewWidth/2,0,Math.max(0,world.width-viewWidth)),y:Math.max(0,player.y-viewHeight*(touch?.55:.62))};
}

function text(c,t,x,y,size=14,color='#fff9e7'){c.font=`700 ${size}px "PingFang TC", sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(t,x,y);}
function pill(c,t,x,y,w=100){c.fillStyle='#203f36e8';c.beginPath();c.roundRect(x-w/2,y-15,w,30,12);c.fill();text(c,t,x,y);}
function shadow(c,x,y,w){c.fillStyle='#183e342b';c.beginPath();c.ellipse(x+5,y+2,w*.35,w*.12,0,0,Math.PI*2);c.fill();}
function sprite(c,img,x,y,w,h=w){c.drawImage(img,x-w/2,y-h,w,h);}
function actor(c,img,p,t,size,row,animated){shadow(c,p.x,p.y,size*.6);const col=animated?Math.floor(t*8)%4:0;c.drawImage(img,col*128,row*128,128,128,p.x-size/2,p.y-size*.91,size,size);}
export function render(c,state,world,v,{assets:a}={}) {
 const {width:w,height:h,time:t,touch}=v;c.clearRect(0,0,w,h);if(!a)return;
 const camera=cameraFor(state.player,world,v);c.save();c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);
 const scene=questScene(state),clock=v.reduceMotion?0:(v.sceneTime??t);
 drawGround(c,world,a);
 for(const p of world.landmarks.filter(p=>['ground','bridge','nature'].includes(p.kind)))drawPlace(c,p,a);
 drawPlace(c,{x:1000,y:2210,w:200,h:340,asset:'bridge-ns',kind:'bridge',vertical:true},a);
 if(!v.conversing)drawRoute(c,v.route);
 for(const human of state.humans){c.save();c.translate(human.x,human.y);c.rotate(human.facing);const g=c.createRadialGradient(0,0,10,0,0,human.range);g.addColorStop(0,human.awareness>0?'#ff7d434d':'#fff3af55');g.addColorStop(1,'#fff3af05');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.arc(0,0,human.range,-.55,.55);c.closePath();c.fill();c.restore();}
 const objects=[];
 if(world.gatehouse){const p=world.gatehouse;objects.push({sortY:p.y,draw(){sprite(c,a.gatehouse,p.x,p.y,p.w,p.h);}});}

 const visible=p=>p.x+p.w/2>camera.x&&p.x-p.w/2<camera.x+camera.width&&p.y>camera.y&&p.y-p.h<camera.y+camera.height;
 for(const p of world.landmarks.filter(p=>!['ground','bridge','nature','route'].includes(p.kind)&&visible(p)))objects.push({sortY:p.y,draw(){c.save();if(state.player.y<p.y&&state.player.y>p.y-p.h&&Math.abs(state.player.x-p.x)<p.w/2)c.globalAlpha=.4;shadow(c,p.x,p.y,p.w*.8);drawPlace(c,p,a);c.restore();}});
 for(const p of world.trees??[])if(visible(p))objects.push({sortY:p.y,draw(){c.save();if(state.player.y<p.y&&state.player.y>p.y-p.h&&Math.abs(state.player.x-p.x)<p.w/2)c.globalAlpha=.35;sprite(c,a.tree,p.x,p.y,p.w,p.h);c.restore();}});

 for(const b of world.bushes)objects.push({sortY:b.y+b.h,draw(){c.save();const inside=state.player.x>=b.x&&state.player.x<=b.x+b.w&&state.player.y>=b.y&&state.player.y<=b.y+b.h;c.globalAlpha=inside?.22:1;sprite(c,a.shrub,b.x+b.w/2,b.y+b.h,b.w+24,b.h+35);c.restore();}});
 world.pranks.forEach((p,i)=>objects.push({sortY:p.y,draw(){shadow(c,p.x,p.y,50);sprite(c,a[['sign','frog','duck'][i]],p.x,p.y,i===0?68:55,i===0?78:60);const done=state.completedPranks.includes(p.id);pill(c,done?'✓':String(i+1),p.x,p.y-88,30);if(Math.hypot(state.player.x-p.x,state.player.y-p.y)<65&&!done)pill(c,touch?'按「互動」':`E · ${p.action}`,p.x,p.y-120,touch?110:220);}}));
 state.humans.forEach(p=>objects.push({sortY:p.y,draw(){const row=Math.abs(Math.cos(p.facing))>.6?(Math.cos(p.facing)>0?0:1):(Math.sin(p.facing)>0?2:3);actor(c,a.human,p,clock,84,row,!v.reduceMotion);if(p.awareness>0)pill(c,p.mode==='chase'?'!':'?',p.x,p.y-83,28);}}));
 objects.push({sortY:state.player.y,draw(){const p=state.player;if(p.curled){shadow(c,p.x,p.y,48);sprite(c,a.curl,p.x,p.y+5,58,58);}else actor(c,a.pangolin,p,clock,85,({east:0,west:1,south:2,north:3})[p.direction]??0,p.moving&&!v.reduceMotion);}});
 for(const npc of Object.values(QUEST_ACTORS)){
  if(npc.id==='treasure'&&state.quest?.stage!=='collect')continue;
  const p=npc.entry,img=a[npc.asset],welcoming=scene.greeting===npc.id,breath=v.reduceMotion?0:Math.sin(clock*2.4)*.7,size=npc.id==='treasure'?28:npc.id==='cat'?32:42;
  if(!img)continue;
  if(npc.id==='magpie'){
   // The conversation anchor stays at ground level; the bird sits on a canopy.
   objects.push({sortY:p.y-20,draw(){
    sprite(c,a.tree,p.x,p.y-20,90,110);
    const hop=welcoming&&!v.reduceMotion?Math.max(0,Math.sin(clock*4))*4:0;
    sprite(c,img,p.x+18,p.y-88-hop,size,size*img.height/img.width);
    if(state.quest?.stage==='report-cat'||state.quest?.stage==='complete')sprite(c,a['quest-treasure'],p.x+36,p.y-83,12,12);
   }});
  }else objects.push({sortY:p.y,draw(){shadow(c,p.x,p.y,size);
   c.save();c.translate(p.x,p.y);if(npc.id==='cat'&&state.player.x<p.x)c.scale(-1,1);
   sprite(c,img,0,0,size,size*img.height/img.width+breath);c.restore();
   if(npc.id==='treasure'){const shine=v.reduceMotion?1:.65+Math.sin(clock*3)*.25;c.save();c.globalAlpha=shine;text(c,'✦',p.x+17,p.y-24,16,'#fff1b2');c.restore();}}});
 }
 depthSort(objects).forEach(o=>o.draw());
 const closest=world.landmarks.reduce((a,b)=>Math.hypot(a.x-state.player.x,a.y-state.player.y)<Math.hypot(b.x-state.player.x,b.y-state.player.y)?a:b);
 for(const p of world.landmarks){if(!visible({...p,w:250,h:p.h+50}))continue;const near=Math.hypot(state.player.x-p.x,state.player.y-p.y)<440;const labelY=p.y-(a[p.asset]?Math.min(p.h,p.w*a[p.asset].height/a[p.asset].width):0)-20;const labelW=Math.max(90,p.name.length*14+24);if(!scene.greeting&&!v.conversing&&((near&&p.id===closest.id)||v.target?.id===p.id)&&labelY>camera.y+20&&labelY<camera.y+camera.height-20&&p.x-labelW/2>camera.x+4&&p.x+labelW/2<camera.x+camera.width-4)pill(c,p.name,p.x,labelY,labelW);}
 if(v.target&&!v.conversing){const p=v.target.entry;c.strokeStyle='#fff1b2';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,22,0,Math.PI*2);c.stroke();}
 if(state.completedPranks.length===3&&Math.hypot(state.player.x-world.start.x,state.player.y-world.start.y)<90)pill(c,'秘密基地 · 完成後按 E 回家',world.start.x,world.start.y+54,228);

 for(const npc of Object.values(QUEST_ACTORS)){
  if(npc.id==='treasure'&&state.quest?.stage!=='collect')continue;
  const p=npc.entry,near=Math.hypot(state.player.x-p.x,state.player.y-p.y)<100,active=questTarget(state.quest)?.id===npc.id;
  if(v.conversing)continue;
  if(near)pill(c,Math.hypot(state.player.x-p.x,state.player.y-p.y)<=48?(touch?'按互動 · '+(npc.id==='treasure'?'拾取':'對話'):'E · '+(npc.id==='treasure'?'拾取收藏':'和'+(npc.id==='cat'?'黑貓':'藍鵲')+'說話')):npc.name,p.x,p.y-(npc.id==='magpie'?155:76),touch?136:144);
  else if(active)pill(c,'!',p.x,p.y-(npc.id==='magpie'?155:70),30);
 }
 const player=state.player;
 if(scene.carrying){
  shadow(c,player.x+22,player.y-46,18);
  sprite(c,a['quest-treasure'],player.x+22,player.y-43,20,20);
 }
 // One brief acknowledgement after closing dialogue; the world remains playable.
 if(v.feedback){
  const age=(v.sceneTime??t)-v.feedback.startedAt,progress=v.reduceMotion?1:clamp(age/.65,0,1);
  const source=QUEST_ACTORS[v.feedback.actor].entry;
  const pickup=v.feedback.kind==='pickup';
  const from=pickup?source:{x:player.x+22,y:player.y-43};
  const to=pickup?{x:player.x+22,y:player.y-43}:{x:source.x+36,y:source.y-83};
  const x=from.x+(to.x-from.x)*progress,y=from.y+(to.y-from.y)*progress;
  if(!v.reduceMotion&&age<.65&&v.feedback.kind!=='friendship')sprite(c,a['quest-treasure'],x,y-Math.sin(progress*Math.PI)*28,22,22);
  c.save();c.globalAlpha=v.reduceMotion?1:clamp((1.6-age)/.3,0,1);
  pill(c,v.feedback.label,player.x,player.y-101,150);c.restore();
 }
 text(c,'▼',player.x,player.y-70,16,'#fff9e7');
 c.restore();
}
