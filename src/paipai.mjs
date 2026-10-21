import {WORLD} from './world.mjs?v=17';
import {manifest} from './manifest.mjs?v=17';
import {loadAssets} from './assets.mjs';
import {drawGround,drawPlace} from './landscape.mjs';
import {nearestPlace} from './exploration.mjs';
import {buildingStory} from './building-stories.mjs';
import {createPaiPai,restorePaiPai,stepPaiPai,discoverFromAir} from './paipai-state.mjs';
import {renderPaiPai} from './paipai-render.mjs?v=17';

const $=selector=>document.querySelector(selector);
const canvas=$('#campus'),ctx=canvas.getContext('2d');
const mapCanvas=$('#map-canvas'),mapCtx=mapCanvas.getContext('2d');
const mapDialog=$('#map-dialog'),helpDialog=$('#help-dialog');
const saveKey='nccu-paipai-v1';
let initial;
try{const raw=localStorage.getItem(saveKey);initial=raw?.length<30000?JSON.parse(raw):null;}catch{initial=null;}
let {bird,visited}=restorePaiPai(initial,WORLD);
$('#visited-count').textContent=`已認識 ${visited.length} / ${WORLD.landmarks.length}`;
let assets=null,started=false,flight=false,target=null,last=performance.now(),lastSave=0,stickOwner=null;
const held=new Set();let axis={x:0,y:0};
const buildings=WORLD.landmarks.filter(p=>p.kind==='building');
const closeTo=p=>Math.hypot(p.entry.x-bird.x,p.entry.y-bird.y);
function resize(){const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);}
new ResizeObserver(resize).observe(canvas);resize();
function showCard(place){
 if(!place)return;
 const story=buildingStory(place);
 $('#card-zone').textContent=story.zone+' / '+(visited.includes(place.id)?'已認識':'待探索');
 $('#card-name').textContent=story.name;
 $('#card-clue').textContent=story.clue;
 $('#card-status').textContent=story.status==='文字核對'?'資料已核對 · 插畫示意':'外觀待核實 · 插畫示意';
 $('#card-source').href=story.source;
 $('#place-card').hidden=false;
 $('#live').textContent='派派認識了'+story.name+'。'+story.clue;
}
function inspect(){const place=[...buildings].sort((a,b)=>closeTo(a)-closeTo(b))[0];if(place&&closeTo(place)<(bird.altitude>.2?260:170))showCard(place);else $('#live').textContent='再靠近一棟建築，就能認識它。';canvas.focus();}
$('#inspect').onclick=inspect;$('#card-close').onclick=()=>{$('#place-card').hidden=true;canvas.focus();};
function setFlight(next){flight=next;$('#flight').setAttribute('aria-pressed',String(flight));$('#flight-label').textContent=flight?'降落':'起飛';$('#flight-symbol').textContent=flight?'↓':'↑';canvas.focus();}
$('#flight').onclick=()=>setFlight(!flight);
function begin(){if(!assets)return;started=true;$('#welcome').hidden=true;$('.controls').hidden=false;canvas.focus();}
$('#begin').onclick=begin;
$('#map-button').onclick=()=>{if(!assets)return;mapDialog.showModal();renderMap();refreshList();};
$('#map-close').onclick=()=>mapDialog.close();mapDialog.addEventListener('close',()=>canvas.focus());
$('#help-button').onclick=()=>helpDialog.showModal();$('#help-close').onclick=()=>helpDialog.close();helpDialog.addEventListener('close',()=>canvas.focus());
$('#place-search').oninput=refreshList;
function refreshList(){const list=$('#place-list');list.replaceChildren();const q=$('#place-search').value.trim().toLocaleLowerCase();for(const p of buildings.filter(p=>p.name.toLocaleLowerCase().includes(q))){const row=document.createElement('button');row.type='button';row.className='place-row';const name=document.createElement('span');name.textContent=p.name;const state=document.createElement('small');state.textContent=visited.includes(p.id)?'已認識 ↗':'設為下一站 ↗';row.append(name,state);row.onclick=()=>{target=p;mapDialog.close();showCard(p);};list.append(row);}}
function renderMap(){const rect=mapCanvas.getBoundingClientRect();if(!rect.width)return;const ratio=Math.min(devicePixelRatio||1,2),width=rect.width,height=rect.height;mapCanvas.width=Math.round(width*ratio);mapCanvas.height=Math.round(height*ratio);mapCtx.setTransform(ratio,0,0,ratio,0,0);mapCtx.clearRect(0,0,width,height);const scale=Math.min(width/WORLD.width,height/WORLD.height),ox=(width-WORLD.width*scale)/2,oy=(height-WORLD.height*scale)/2;mapCtx.save();mapCtx.translate(ox,oy);mapCtx.scale(scale,scale);drawGround(mapCtx,WORLD,assets);for(const p of WORLD.landmarks)drawPlace(mapCtx,p,assets);mapCtx.restore();function dot(p,color,r){mapCtx.fillStyle=color;mapCtx.strokeStyle='#fff8e9';mapCtx.lineWidth=2;mapCtx.beginPath();mapCtx.arc(ox+p.x*scale,oy+p.y*scale,r,0,Math.PI*2);mapCtx.fill();mapCtx.stroke();}for(const p of WORLD.landmarks.filter(p=>visited.includes(p.id)))dot(p.entry,'#235e74',3);if(target)dot(target.entry,'#ce6740',6);dot(bird,'#163d35',6);}
new ResizeObserver(()=>{if(mapDialog.open)renderMap();}).observe(mapCanvas);
const keyNames={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
window.addEventListener('keydown',event=>{if(mapDialog.open||helpDialog.open||event.target?.tagName==='INPUT')return;const key=event.key.toLowerCase(),direction=keyNames[key];if(direction){event.preventDefault();held.add(direction);}else if(key===' '&&started&&!event.repeat){event.preventDefault();setFlight(!flight);}else if(key==='e'&&started&&!event.repeat){event.preventDefault();inspect();}});
window.addEventListener('keyup',event=>{const direction=keyNames[event.key.toLowerCase()];if(direction)held.delete(direction);});
window.addEventListener('blur',()=>{held.clear();axis={x:0,y:0};});
const joystick=$('#joystick'),knob=joystick.querySelector('span');
function moveStick(event){if(event.pointerId!==stickOwner)return;const r=joystick.getBoundingClientRect(),dx=event.clientX-r.left-r.width/2,dy=event.clientY-r.top-r.height/2,length=Math.hypot(dx,dy),strength=Math.min(1,Math.max(0,(length/r.width*2-.12)/.88));axis=length?{x:dx/length*strength,y:dy/length*strength}:{x:0,y:0};knob.style.transform=`translate(${axis.x*26}px,${axis.y*26}px)`;}
joystick.addEventListener('pointerdown',event=>{if(stickOwner!==null)return;event.preventDefault();stickOwner=event.pointerId;joystick.setPointerCapture(stickOwner);joystick.classList.add('held');moveStick(event);canvas.focus();});
joystick.addEventListener('pointermove',moveStick);
for(const type of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(type,event=>{if(event.pointerId!==stickOwner)return;stickOwner=null;axis={x:0,y:0};knob.style.transform='translate(0px,0px)';joystick.classList.remove('held');});
loadAssets(manifest).then(result=>{assets=result;$('#begin').disabled=false;$('#begin').textContent=visited.length?'繼續探索 →':'跟派派出發 →';}).catch(error=>{$('#begin').disabled=false;$('#begin').textContent='載入失敗 · 點此重試';$('#begin').onclick=()=>location.reload();$('#live').textContent='校園素材載入失敗：'+error.message;});
function save(){try{localStorage.setItem(saveKey,JSON.stringify({x:bird.x,y:bird.y,visited}));}catch{}}
window.addEventListener('pagehide',save);
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;if(started&&!mapDialog.open&&!helpDialog.open){const before=visited.length;bird=stepPaiPai(bird,{axisX:axis.x,axisY:axis.y,up:held.has('up'),down:held.has('down'),left:held.has('left'),right:held.has('right'),fly:flight},dt,WORLD);visited=discoverFromAir(visited,bird,WORLD);if(visited.length>before){const newPlace=WORLD.landmarks.find(p=>p.id===visited.at(-1));if(newPlace?.kind==='building')showCard(newPlace);$('#visited-count').textContent=`已認識 ${visited.length} / ${WORLD.landmarks.length}`;}if(target&&closeTo(target)<95)target=null;if(now-lastSave>1400){lastSave=now;save();}}if(assets)renderPaiPai(ctx,bird,WORLD,assets,{width:canvas.clientWidth,height:canvas.clientHeight},{target,visited,time:now/1000,reduceMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});$('#location').textContent=nearestPlace(bird,WORLD).name;requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.__paipaiSnapshot=()=>({bird:{...bird},visited:[...visited],flight,target:target?.id??null});
