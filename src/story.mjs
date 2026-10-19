import {createStoryState,advanceStory,previousStory} from './story-state.mjs';
export const panels=[
 {image:'awakening',chapter:'序章 · 一次小小的越界',speaker:'你 · 校園研究室',title:'如果，能聽懂牠們。',text:'你一直很好奇：每天擦肩而過的動物，眼中的政大是什麼樣子？今天，你把接收器連上了這隻機械穿山甲。',alt:'研究室裡，學生準備操控桌上的機械穿山甲。'},
 {image:'awakening',chapter:'連線完成',speaker:'你',title:'好，先試著走一步。',text:'畫面亮起。你的視線降到草葉的高度。爪子、鱗片，還有一條不太聽話的尾巴——現在，牠就是你在校園裡的身體。',alt:'學生透過控制器與機械穿山甲連線。'},
 {image:'cat',chapter:'政大 · 半山腰',speaker:'山腰的黑貓',title:'你不是這裡的穿山甲。',text:'你長得像穿山甲。可是，你走了這麼久，一隻螞蟻都沒找。',alt:'半山腰的黑貓坐在石牆上，打量機械穿山甲。'},
 {image:'cat',chapter:'第一次聽見',speaker:'你',title:'等一下……我聽得懂？',text:'耳邊那聲喵，竟然變成了一句話。你還沒想好怎麼回答，黑貓已經湊近：「而且，你身上有研究室的味道。」',alt:'機械穿山甲抬頭看著黑貓，第一次聽懂動物說話。'},
 {image:'cat',chapter:'一個不能說的秘密',speaker:'山腰的黑貓',title:'放心，我先不拆穿你。',text:'我不管你裡面是誰。想知道我們怎麼過日子，就先幫個忙。有隻藍鵲，最近一直在找牠丟的東西。',alt:'黑貓決定暫時替機械穿山甲保守秘密。'},
 {image:'mission',chapter:'黑貓的第一個委託',speaker:'山腰的黑貓',title:'替我去山下看看。',text:'四維堂、圖書館，還有操場。藍鵲常在那一帶出沒。別急著相信人類，也別急著認定他們都是壞人。',alt:'黑貓指向山下校園，一隻臺灣藍鵲在枝頭看著牠們。'},
 {image:'mission',chapter:'序章結束 · 校園探索開始',speaker:'你',title:'原來，校園還有另一種生活。',text:'沿著山路，你來到校門旁。先熟悉校園、避開人類的注意。至於黑貓沒說完的事……等你回來，再問牠。',alt:'機械穿山甲準備沿山路出發。'}
];
export function createStory(onComplete){
 const dialog=document.querySelector('#prologue'),img=dialog.querySelector('img'),next=dialog.querySelector('[data-next]'),back=dialog.querySelector('[data-back]'),status=dialog.querySelector('[data-image-status]'),retry=dialog.querySelector('[data-retry]');
 let state=createStoryState(panels.length),callback=onComplete,request=0;
 const finish=()=>{if(!dialog.open)return;dialog.close();callback();};
 function show(){
  const p=panels[state.index];
  dialog.dataset.scene=p.image;dialog.dataset.speaker=p.speaker==='山腰的黑貓'?'cat':'you';
  dialog.querySelector('[data-chapter]').textContent=p.chapter;
  dialog.querySelector('[data-speaker]').textContent=p.speaker;
  dialog.querySelector('h2').textContent=p.title;
  dialog.querySelector('[data-text]').textContent=p.text;
  dialog.querySelector('[data-count]').textContent=`${state.index+1} / ${panels.length}`;
  next.textContent=state.index===panels.length-1?'進入校園 →':'下一步 →';back.disabled=state.index===0;
  img.alt=p.alt;
  if(img.dataset.scene!==p.image){
   img.dataset.scene=p.image;img.hidden=true;status.hidden=false;status.textContent='插畫載入中…';retry.hidden=true;
   const id=++request,loader=new Image();
   loader.onload=()=>{if(id!==request)return;img.src=loader.src;img.hidden=false;status.hidden=true;retry.hidden=true;};
   loader.onerror=()=>{if(id!==request)return;status.textContent='插畫暫時沒載入。可以重試，或繼續讀故事。';retry.hidden=false;};
   loader.src=`assets/story/${p.image}.png?v=6.2`;
  }
 }
 next.onclick=()=>{state=advanceStory(state);if(state.done)finish();else show();};
 back.onclick=()=>{state=previousStory(state);show();};
 dialog.querySelector('[data-skip]').onclick=finish;
 retry.onclick=()=>{img.dataset.scene='';show();};
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});
 return {dialog,open(done=onComplete){callback=done;state=createStoryState(panels.length);show();dialog.showModal();next.focus();}};
}
