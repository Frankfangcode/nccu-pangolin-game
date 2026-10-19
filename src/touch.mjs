export function joystickVector(dx,dy,radius=32){
 const d=Math.hypot(dx,dy);if(d<radius*.12)return {x:0,y:0};
 const strength=Math.min(1,(d/radius-.12)/.88);
 return {x:dx/d*strength,y:dy/d*strength};
}
export function createTouchControls(canvas){
 const root=document.querySelector('#touch-controls'),stick=document.querySelector('#joystick'),knob=stick.querySelector('span');
 let vector={x:0,y:0},owner=null,interact=false;const curls=new Set();
 function reset(){vector={x:0,y:0};owner=null;interact=false;curls.clear();knob.style.transform='translate(0px,0px)';stick.classList.remove('held');document.querySelector('#touch-curl').classList.remove('held');}
 function move(e){if(e.pointerId!==owner)return;const r=stick.getBoundingClientRect();const dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;vector=joystickVector(dx,dy);knob.style.transform=`translate(${vector.x*26}px,${vector.y*26}px)`;}
 stick.addEventListener('pointerdown',e=>{e.preventDefault();if(owner!==null)return;canvas.focus();owner=e.pointerId;stick.setPointerCapture(owner);stick.classList.add('held');move(e);});
 stick.addEventListener('pointermove',move);
 for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,e=>{if(e.pointerId===owner){owner=null;vector={x:0,y:0};knob.style.transform='translate(0px,0px)';stick.classList.remove('held');}});
 const action=document.querySelector('#touch-interact');action.addEventListener('click',()=>{canvas.focus();interact=true;});
 const curl=document.querySelector('#touch-curl');curl.addEventListener('pointerdown',e=>{e.preventDefault();canvas.focus();curl.setPointerCapture(e.pointerId);curls.add(e.pointerId);curl.classList.add('held');});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])curl.addEventListener(type,e=>{curls.delete(e.pointerId);if(!curls.size)curl.classList.remove('held');});
 window.addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
 return {reset,read(){const result={axisX:vector.x,axisY:vector.y,interact,curl:curls.size>0};interact=false;return result;},show(visible){root.hidden=!visible;if(!visible)reset();}};
}
