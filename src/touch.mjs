export function joystickVector(dx,dy,radius=32){
 const d=Math.hypot(dx,dy);if(d<radius*.12)return {x:0,y:0};
 const strength=Math.min(1,(d/radius-.12)/.88);
 return {x:dx/d*strength,y:dy/d*strength};
}
// v15 phone controls: press anywhere on the playfield and drag — the stick appears
// under the finger. The 互動 / 躲藏 buttons sit above the canvas, so a second
// finger can use them while the first one steers.
export const STICK_RADIUS=48;
export function createTouchControls(canvas){
 const root=document.querySelector('#touch-controls'),stick=document.querySelector('#joystick'),knob=stick.querySelector('span');
 let vector={x:0,y:0},owner=null,origin={x:0,y:0},interact=false,enabled=false;const curls=new Set();
 function release(){owner=null;vector={x:0,y:0};knob.style.transform='translate(0px,0px)';stick.classList.remove('held');}
 function reset(){release();interact=false;curls.clear();document.querySelector('#touch-curl').classList.remove('held');}
 function move(e){
  if(e.pointerId!==owner)return;
  vector=joystickVector(e.clientX-origin.x,e.clientY-origin.y,STICK_RADIUS);
  knob.style.transform=`translate(${vector.x*36}px,${vector.y*36}px)`;
 }
 canvas.addEventListener('pointerdown',e=>{
  if(!enabled||owner!==null||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();canvas.focus();owner=e.pointerId;origin={x:e.clientX,y:e.clientY};
  const r=root.getBoundingClientRect();stick.style.left=`${e.clientX-r.left}px`;stick.style.top=`${e.clientY-r.top}px`;
  stick.classList.add('held');try{canvas.setPointerCapture(owner);}catch{}move(e);
 });
 canvas.addEventListener('pointermove',move);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===owner)release();});
 const action=document.querySelector('#touch-interact');action.addEventListener('click',()=>{canvas.focus();interact=true;});
 const curl=document.querySelector('#touch-curl');curl.addEventListener('pointerdown',e=>{e.preventDefault();canvas.focus();curl.setPointerCapture(e.pointerId);curls.add(e.pointerId);curl.classList.add('held');});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])curl.addEventListener(type,e=>{curls.delete(e.pointerId);if(!curls.size)curl.classList.remove('held');});
 window.addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
 return {reset,read(){const result={axisX:vector.x,axisY:vector.y,interact,curl:curls.size>0};interact=false;return result;},show(visible){enabled=visible;root.hidden=!visible;if(!visible)reset();}};
}
