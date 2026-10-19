import {clearLine} from './navigation.mjs';
export const QUEST_ACTORS={
 cat:{id:'cat',name:'半山腰的黑貓',asset:'quest-cat',entry:{x:2280,y:3050}},
 magpie:{id:'magpie',name:'四維堂的臺灣藍鵲',asset:'quest-magpie',entry:{x:2920,y:2590}},
 treasure:{id:'treasure',name:'人行道上的亮晶晶收藏',asset:'quest-treasure',entry:{x:2680,y:2680}}
};
export const createQuest=()=>({stage:'meet-cat'});
export const QUEST_STEPS={
 'meet-cat':{actor:'cat',next:'meet-magpie',objective:'沿步道找黑貓',title:'你身上有機油的味道。',text:'我從半山腰下來散步。噓，別讓人類發現你。四維堂旁的藍鵲弄丟了寶貝，去問問牠吧。我就在這裡等你。'},
 'meet-magpie':{actor:'magpie',next:'collect',objective:'到四維堂找臺灣藍鵲',title:'我的小小星球不見了！',text:'藍色玻璃珠，裝在金色瓶蓋裡，掉在南邊的人行道了。等人類轉身，再偷偷撿起來。被發現時，進花叢按住躲藏。'},
 'collect':{actor:'treasure',next:'return-magpie',objective:'避開巡邏，撿回亮晶晶收藏',title:'找到亮晶晶收藏',text:'喀噠。小小星球收進了儲物格，藍光從縫隙透出來。帶回去給藍鵲吧。'},
 'return-magpie':{actor:'magpie',next:'report-cat',objective:'把收藏交還給藍鵲',title:'你真的把它找回來了！',text:'就是這顆！藍鵲把收藏放回樹上，輕輕跳了兩下。以後，我幫你注意人類。黑貓在校門內的步道等你。告訴牠：收藏平安回家了。'},
 'report-cat':{actor:'cat',next:'complete',objective:'回步道向黑貓報平安',title:'好吧，你是我們這邊的了。',text:'黑貓慢慢眨了眨眼，替你讓出一塊樹蔭。你得到「藍鵲偵察」：打開偵察，就能看見人類的位置。'}
};
export function questTarget(quest){return QUEST_ACTORS[QUEST_STEPS[quest.stage]?.actor]??null;}
export function interactQuest(state,world){
 const quest=state.quest??createQuest();
 const actor=Object.values(QUEST_ACTORS).find(a=>Math.hypot(state.player.x-a.entry.x,state.player.y-a.entry.y)<=48&&clearLine(state.player,a.entry,world));
 if(!actor)return {state};
 if(state.status==='chase'||state.status==='alert')return {state:{...state,message:'先避開人類的視線，再互動。'}};
 const step=QUEST_STEPS[quest.stage];
 if(step?.actor===actor.id){
  const effect={'collect':['pickup','收藏已收好'],'return-magpie':['handoff','物歸原主'],'report-cat':['friendship','你有新朋友了']}[quest.stage];
  return {state:{...state,quest:{stage:step.next}},feedback:effect?{kind:effect[0],actor:actor.id,label:effect[1]}:undefined,dialogue:{speaker:actor.id==='treasure'?'機械穿山甲':actor.name,asset:actor.asset,title:step.title,text:step.text}};
 }
 if(actor.id==='treasure')return {state};
 return {state,dialogue:{speaker:actor.name,asset:actor.asset,title:quest.stage==='complete'?'朋友，慢慢逛。':'還有一件事……',text:quest.stage==='complete'?'想知道人類在哪裡，就叫藍鵲幫忙偵察。校園裡還有很多地方等你去發現。':QUEST_STEPS[quest.stage].objective+'。按畫面上的任務提示，就能找到路。'}};
}

// Derived from the saved quest stage: no second inventory that can drift out of sync.
export function questScene(state){
 const safe=state.status!=='alert'&&state.status!=='chase';
 const friend=safe?Object.values(QUEST_ACTORS).find(a=>a.id!=='treasure'&&Math.hypot(state.player.x-a.entry.x,state.player.y-a.entry.y)<100):null;
 return {carrying:state.quest?.stage==='return-magpie',greeting:friend?.id??null};
}
