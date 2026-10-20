import {createTouchControls} from './touch.mjs?v=15';
import {createQuest,QUEST_STEPS,questTarget,interactQuest} from './quest.mjs?v=15';
import {readSave,writeSave} from './save.mjs?v=15';
import {createStory} from './story.mjs?v=15';
import {manifest} from './manifest.mjs?v=15';
import {discoverPlaces,nearestPlace,entryObjective} from './exploration.mjs';
import {findRoute} from './navigation.mjs';
import {createAtlas} from './atlas.mjs?v=15';
import { WORLD } from './world.mjs?v=15';
import { createGame, stepMovement, advanceActivities, advanceHumans, advanceAwareness, advanceChase, interact, nearbyPrank } from './rules.mjs?v=15';
import { createInput } from './input.mjs?v=15';
import { render,cameraFor } from './render.mjs?v=15';
import {createMinimap} from './minimap.mjs?v=15';
import { loadAssets } from './assets.mjs';
import {createCloseup} from './closeup.mjs?v=15';
let assets;
const startButton=document.querySelector('#start');
const intro=document.querySelector('#intro');
const finish=document.querySelector('#finish');
const dialog=document.querySelector('#instructions');
document.querySelector('#help').onclick=()=>dialog.showModal();
document.querySelector('#close-help').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>canvas.focus());
document.querySelector('#resume').onclick=()=>{dialog.close();canvas.focus();};
startButton.onclick=()=>{if(!assets){location.reload();return;} intro.hidden=true;story.open();};
document.querySelector('#continue-exploring').onclick=()=>{state={...state,won:false,message:''};finish.hidden=true;canvas.focus();};
document.querySelector('#again').onclick=()=>{state=returnHome();target=null;route=null;finish.hidden=true;canvas.focus();};
loadAssets(manifest,undefined,(done,total)=>{startButton.textContent=`素材載入中… ${Math.round(done/total*100)}%`;}).then(result=>{assets=result;startButton.disabled=false;startButton.textContent='開始故事 →';intro.hidden=true;if(saved.data){started=true;guideQuest();canvas.focus();}else story.open();}).catch(error=>{startButton.disabled=false;startButton.textContent='載入失敗，點此重試';document.querySelector('#game-status').textContent=error.message;});

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const minimap=createMinimap(document.querySelector('#minimap'),WORLD);let mapPaintAt=0;
const live = document.querySelector('#game-status');
const input = createInput(canvas);
const touchControls=createTouchControls(canvas);
let storage;try{storage=window.localStorage;}catch{}
const saved=readSave(storage,WORLD);
let state = {...createGame(WORLD),quest:createQuest(),...saved.data};
function returnHome(){return {...createGame(WORLD),quest:state.quest,visited:state.visited,completedPranks:state.completedPranks,message:'回到秘密基地。任務進度已保留。'};}
let lastSaved='',saveFailed=Boolean(saved.error);
function persist(){
 const snapshot=JSON.stringify([state.quest,state.visited,state.completedPranks]);
 if(snapshot===lastSaved)return;lastSaved=snapshot;
 if(saved.error){saveFailed=true;return;}
 saveFailed=!writeSave(storage,state);
}
// Read-only diagnostic snapshot also used by browser journey tests.
export function getGameSnapshot(){return structuredClone(state);}

let target=null,route=null,lastRouteAt=0;
let feedback=null,pendingFeedback=null,sceneTime=0;
function guideTo(p){target=p;route=p?findRoute(state.player,p.entry,WORLD):null;lastRouteAt=0;}
function guideQuest(){guideTo(entryObjective(state,WORLD)??questTarget(state.quest));}
const atlas=createAtlas(WORLD,()=>state,()=>assets,guideTo);
const questDialog=document.querySelector('#quest-dialog');
const closeup=createCloseup(document.querySelector('#closeup'));
document.querySelector('#quest-close').onclick=()=>questDialog.close();
questDialog.addEventListener('close',()=>{
 if(pendingFeedback){feedback={...pendingFeedback,startedAt:sceneTime};pendingFeedback=null;}
 canvas.focus();
});
document.querySelector('#quest-guide').onclick=()=>{guideQuest();canvas.focus();};
document.querySelector('#scout').onclick=()=>{if(state.quest.stage==='complete')atlas.open();};
function showQuestDialogue(data){
 document.querySelector('#quest-speaker').textContent=data.speaker;
 document.querySelector('#quest-title').textContent=data.title;
 document.querySelector('#quest-text').textContent=data.text;
 document.querySelector('#quest-portrait').src=manifest[data.asset];
 document.querySelector('#quest-portrait').alt=data.speaker;
 document.querySelector('#quest-close').textContent=({
 'meet-magpie':'去找藍鵲 →','collect':'我去找找 →','return-magpie':'收好，帶回去 →',
 'report-cat':'回去告訴黑貓 →','complete':'和朋友繼續散步 →'
 })[state.quest.stage]??'繼續散步 →';
 questDialog.showModal();
}

document.querySelector('#destination').onclick=()=>{target=null;route=null;};
let started = false;
const story=createStory(()=>{started=true;intro.hidden=true;guideQuest();canvas.focus();});
document.querySelector('#replay-story').onclick=()=>{dialog.close();story.open(()=>canvas.focus());};
let previous = performance.now();
let lastAnnouncement = '';
let messageTime = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

new ResizeObserver(resize).observe(canvas);
resize();

function frame(now) {
  const dt = Math.min((now - previous) / 1000, 0.05);
  previous = now;
  const keys=input.read(),finger=touchControls.read();
  const actions={...keys,axisX:finger.axisX,axisY:finger.axisY,interact:keys.interact||finger.interact,curl:keys.curl||finger.curl};
  if (state.won && actions.restart && !atlas.dialog.open && !dialog.open && !story.dialog.open && !questDialog.open&&!closeup.dialog.open) {
    state = returnHome();target=null;route=null;
    started = true;
  } else if (started && !state.won && !dialog.open && !atlas.dialog.open && !story.dialog.open && !questDialog.open&&!closeup.dialog.open) {
    if (actions.restart) {state = returnHome();target=null;route=null;}
    else {
      state = stepMovement(state, actions, dt, WORLD);
      state = advanceActivities(state, dt);
      state = advanceHumans(state, dt, WORLD);
      state = advanceAwareness(state, dt, WORLD);
      state = advanceChase(state, dt, WORLD);
      if (actions.interact){
       const before=state.quest.stage,result=interactQuest(state,WORLD);
       if(result.dialogue){state=result.state;pendingFeedback=result.feedback??null;showQuestDialogue(result.dialogue);if(state.quest.stage!==before)guideQuest();}
       else if(result.state!==state)state=result.state;
       else if(nearbyPrank(state,WORLD)){
        if(state.status==='chase')state={...state,message:'先甩掉追你的人，再搞怪。'};
        else closeup.open(nearbyPrank(state,WORLD),finished=>{if(finished)state=interact(state,WORLD);canvas.focus();});
       }
       else state=interact(state,WORLD);
      }
      const entering=entryObjective(state,WORLD);
      state=discoverPlaces(state,WORLD);
      if(entering&&!entryObjective(state,WORLD))guideQuest();
    }
  }

  const paused=!started||dialog.open||atlas.dialog.open||story.dialog.open||questDialog.open||closeup.dialog.open||state.won;
  if(!paused)sceneTime+=dt;
  if(feedback&&sceneTime-feedback.startedAt>1.6)feedback=null;
  if(started)persist();
  const stage=state.quest.stage,step=QUEST_STEPS[stage];
  document.querySelector('#quest-guide').textContent=entryObjective(state,WORLD)?'從正門走進校園 ↗':step?`${step.objective} ↗`:'黑貓的委託 · 已完成 ✓';
  document.querySelector('#quest-guide').disabled=!step;document.querySelector('#quest-guide').hidden=!step;
  document.querySelector('#quest-progress').textContent=step?`動物朋友 / ${Object.keys(QUEST_STEPS).indexOf(stage)+1} · 5`:'動物朋友 / 信任建立';
  document.querySelector('#scout').hidden=stage!=='complete';
  document.querySelector('#save-status').textContent=saveFailed?'暫時無法存檔 · 本次仍可玩':'進度自動保存在此瀏覽器';
  document.querySelector('#save-status').hidden=!saveFailed;
  const warning=document.querySelector('#danger');warning.hidden=state.status==='safe'&&!state.player.curled;warning.textContent=state.status==='chase'?'被發現了！快躲起來':state.status==='alert'?'小心，有人看過來了':'蜷縮中 · 花叢裡才能隱藏';
  if (state.message) {
    if (!messageTime) messageTime = now;
    else if (now - messageTime > 2600) { state = { ...state, message: '' }; messageTime = 0; }
  } else messageTime = 0;

  if(target&&started&&!atlas.dialog.open){
    if(Math.hypot(state.player.x-target.entry.x,state.player.y-target.entry.y)<28){target=null;route=null;}
    else if(now-lastRouteAt>1800){route=findRoute(state.player,target.entry,WORLD);lastRouteAt=now;}
  }
  const destination=document.querySelector('#destination');destination.hidden=!target;if(target)destination.textContent=`↗ ${target.name} · 取消 ×`;
  document.querySelector('#explored').textContent=`校園足跡　${state.visited?.length??0} / ${WORLD.landmarks.length}`;
  const nearby=nearestPlace(state.player,WORLD);document.querySelector('#location').textContent=`${nearby.zone} · ${nearby.name}`;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const touch = window.matchMedia('(pointer: coarse)').matches || width < 600;
  touchControls.show(touch&&started&&!dialog.open&&!atlas.dialog.open&&!story.dialog.open&&!questDialog.open&&!closeup.dialog.open&&!state.won);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  render(ctx, state, WORLD, { width, height, time: now / 1000, touch, started, reduceMotion,route,target,sceneTime,feedback,conversing:questDialog.open }, {assets});
  if(now-mapPaintAt>150){minimap.paint(state,assets,target??questTarget(state.quest),cameraFor(state.player,WORLD,{width,height,touch}),{width,height});mapPaintAt=now;}
  document.querySelector('#counter').textContent=`今日搞怪　${state.completedPranks.length} / 3`;
  document.querySelector('#mood').textContent=state.status==='chase'?'被發現了！快躲進花叢':state.status==='alert'?'有人看過來了…':state.player.curled?'蜷縮中 · 花叢裡才安全':'躲好，別被人類發現。';
  finish.hidden=!state.won;
  const toast=document.querySelector('#toast');toast.hidden=!state.message;toast.textContent=state.message||'';

  const status = state.won ? '搞怪完成。可以繼續動物朋友的委託。' :
    `${state.completedPranks.length} / 3 個搞怪任務。${state.status === 'chase' ? '人類正在追你。' : state.status === 'alert' ? '有人看見你了。' : '目前安全。'}${state.message ?? ''}`;
  if (status !== lastAnnouncement) {
    live.textContent = status;
    lastAnnouncement = status;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
