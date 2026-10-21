import {drawGround,drawPlace} from './landscape.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function paipaiCamera(bird,world,width,height){
 const mobile=width<600;
 const zoom=(mobile?1.12:1.35)-(mobile?.38:.55)*bird.altitude;
 const viewWidth=width/zoom,viewHeight=height/zoom;
 return {zoom,width:viewWidth,height:viewHeight,x:clamp(bird.x-viewWidth/2,0,Math.max(0,world.width-viewWidth)),y:clamp(bird.y-viewHeight*.55,0,Math.max(0,world.height-viewHeight))};
}
function label(c,p,text,active=false){
 const width=Math.max(86,text.length*15+24);
 c.fillStyle=active?'#234c55ee':'#173e35df';c.beginPath();c.roundRect(p.x-width/2,p.y-29,width,28,8);c.fill();
 c.font='700 14px "PingFang TC",sans-serif';c.fillStyle='#fff9e9';c.textAlign='center';c.textBaseline='middle';c.fillText(text,p.x,p.y-15);
}
export function renderPaiPai(c,bird,world,assets,view,{target=null,visited=[],time=0,reduceMotion=false}={}){
 const {width,height}=view;
 c.clearRect(0,0,width,height);
 if(!assets)return;
 const camera=paipaiCamera(bird,world,width,height);
 c.save();c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);
 drawGround(c,world,assets);
 const visible=p=>p.x+p.w/2>camera.x-100&&p.x-p.w/2<camera.x+camera.width+100&&p.y>camera.y-160&&p.y-p.h<camera.y+camera.height+160;
 for(const p of world.landmarks.filter(p=>['ground','bridge','nature'].includes(p.kind)&&visible(p)))drawPlace(c,p,assets);
 const scenery=[...world.landmarks.filter(p=>!['ground','bridge','nature'].includes(p.kind)&&visible(p)),...(world.trees??[]).filter(visible).map(p=>({...p,asset:'tree',kind:'tree'}))].sort((a,b)=>a.y-b.y);
 for(const p of scenery)drawPlace(c,p,assets);
 if(target){c.strokeStyle='#fff4bf';c.lineWidth=4;c.beginPath();c.arc(target.entry.x,target.entry.y,34,0,Math.PI*2);c.stroke();}
 const nearby=world.landmarks.filter(p=>p.kind==='building'&&visible(p)&&Math.hypot(p.entry.x-bird.x,p.entry.y-bird.y)<(bird.altitude>.2?480:320)).sort((a,b)=>Math.hypot(a.x-bird.x,a.y-bird.y)-Math.hypot(b.x-bird.x,b.y-bird.y)).slice(0,3);
 for(const p of nearby)label(c,{x:p.x,y:p.y-p.h*.66},p.name,target?.id===p.id);
 c.fillStyle='#16393c44';c.beginPath();c.ellipse(bird.x+5,bird.y+7,28-bird.altitude*5,10-bird.altitude*2,0,0,Math.PI*2);c.fill();
 const bob=reduceMotion||bird.altitude<=.2?0:Math.sin(time*11)*3;
 const size=bird.altitude>.2?77:61;
 c.save();c.translate(bird.x,bird.y-8-bird.altitude*47+bob);
 if(bird.direction==='west')c.scale(-1,1);
 if(bird.altitude>.2)c.rotate(-.14);
 const sprite=(bird.altitude>.2&&assets['paipai-flying'])||assets['quest-magpie'];
 c.drawImage(sprite,-size*.5,-size*.72,size,size*sprite.height/sprite.width);
 c.restore();
 c.fillStyle='#fff9e9';c.font='800 13px "PingFang TC",sans-serif';c.textAlign='center';c.fillText('派派',bird.x,bird.y-73-bird.altitude*47);
 c.restore();
}
