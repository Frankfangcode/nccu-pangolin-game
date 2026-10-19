import {clearLine} from './navigation.mjs';
export const QUEST_ACTORS={
 cat:{id:'cat',name:'半山腰的黑貓',asset:'quest-cat',entry:{x:3200,y:1800}},
 magpie:{id:'magpie',name:'四維堂的臺灣藍鵲',asset:'quest-magpie',entry:{x:2920,y:2590}},
 treasure:{id:'treasure',name:'人行道上的亮晶晶收藏',asset:'quest-treasure',entry:{x:2680,y:2680}}
};
export const createQuest=()=>({stage:'meet-cat'});
export const QUEST_STEPS={
 'meet-cat':{actor:'cat',next:'meet-magpie',objective:'去半山腰，和黑貓聊聊',title:'你身上有機油的味道。',text:'別緊張，我不會拆穿你。四維堂旁的藍鵲弄丟了收藏。替牠找回來，再回來找我；動物的信任，得靠行動換。'},
 'meet-magpie':{actor:'magpie',next:'collect',objective:'到四維堂找臺灣藍鵲',title:'我的小小星球不見了！',text:'一顆藍色玻璃珠，放在金色瓶蓋裡。掉在四維堂南側的人行道上了！等人類轉身再靠近；被看見就跑，躲進花叢按住 C。'},
 'collect':{actor:'treasure',next:'return-magpie',objective:'避開巡邏，撿回亮晶晶收藏',title:'找到亮晶晶收藏',text:'藍色玻璃珠在瓶蓋裡輕輕晃動。你把它收進機械穿山甲的儲物格。現在，帶回去給藍鵲吧。'},
 'return-magpie':{actor:'magpie',next:'report-cat',objective:'把收藏交還給藍鵲',title:'你真的把它找回來了！',text:'就是這個！我在樹上看得遠，以後會幫你注意人類。去告訴半山腰的黑貓吧，牠一直在等你的消息。'},
 'report-cat':{actor:'cat',next:'complete',objective:'回半山腰向黑貓報平安',title:'好吧，你是我們這邊的了。',text:'藍鵲已經告訴我了。就算你是鐵做的，也懂得替朋友跑一趟。獲得「藍鵲偵察」！按偵察按鈕，就能在地圖看見人類的位置。'}
};
export function questTarget(quest){return QUEST_ACTORS[QUEST_STEPS[quest.stage]?.actor]??null;}
export function interactQuest(state,world){
 const quest=state.quest??createQuest();
 const actor=Object.values(QUEST_ACTORS).find(a=>Math.hypot(state.player.x-a.entry.x,state.player.y-a.entry.y)<=48&&clearLine(state.player,a.entry,world));
 if(!actor)return {state};
 if(state.status==='chase'||state.status==='alert')return {state:{...state,message:'先避開人類的視線，再互動。'}};
 const step=QUEST_STEPS[quest.stage];
 if(step?.actor===actor.id){
  return {state:{...state,quest:{stage:step.next}},dialogue:{speaker:actor.id==='treasure'?'機械穿山甲':actor.name,asset:actor.asset,title:step.title,text:step.text}};
 }
 if(actor.id==='treasure')return {state};
 return {state,dialogue:{speaker:actor.name,asset:actor.asset,title:quest.stage==='complete'?'朋友，慢慢逛。':'還有一件事……',text:quest.stage==='complete'?'想知道人類在哪裡，就叫藍鵲幫忙偵察。校園裡還有很多地方等你去發現。':QUEST_STEPS[quest.stage].objective+'。按畫面上的任務提示，就能找到路。'}};
}
