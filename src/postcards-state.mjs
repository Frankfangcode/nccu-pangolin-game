export const DESIGNS=[
 {id:'hall',zh:'四維堂的午後',en:'An afternoon at Si Wei Hall',asset:'assets/flat/hall.webp'},
 {id:'library',zh:'圖書館裡的青春',en:'Days at the library',asset:'assets/flat/library.webp'},
 {id:'gate',zh:'從校門說聲想念',en:'Where our story began',asset:'assets/flat/gate/gate-1.webp'},
 {id:'bridge',zh:'河畔的那陣風',en:'A breeze by the river',asset:'assets/campus/bridge.webp'},
 {id:'daxian',zh:'山上的風景',en:'Memories on the hillside',asset:'assets/campus/daxian.webp'},
 {id:'paipai',zh:'派派的特別郵件',en:'A special delivery by PaiPai',asset:'assets/campus/quest-magpie.webp'}
];
// Representative country locations on a stylized equirectangular route map, not geolocation.
export const COUNTRIES=[['FR','法國','France',2,47],['JP','日本','Japan',138,37],['KR','韓國','South Korea',128,36],['US','美國','United States',-100,39],['CA','加拿大','Canada',-106,56],['GB','英國','United Kingdom',-2,54],['DE','德國','Germany',10,51],['ES','西班牙','Spain',-4,40],['IT','義大利','Italy',12,43],['NL','荷蘭','Netherlands',5,52],['AU','澳洲','Australia',134,-25],['NZ','紐西蘭','New Zealand',173,-41],['SG','新加坡','Singapore',104,1],['MY','馬來西亞','Malaysia',102,4],['TH','泰國','Thailand',101,15],['VN','越南','Vietnam',106,16],['ID','印尼','Indonesia',118,-3],['IN','印度','India',79,22],['BR','巴西','Brazil',-52,-10],['TW','台灣','Taiwan',121,25]];
export const STORE_KEY='nccu-postcards-demo-v1';
export const DRAFT_KEY='nccu-postcards-draft-v1';
export function createPostcard(input,id){
 const name=String(input.name??'').trim(),message=String(input.message??'').trim();
 if(!name||name.length>60||!message||message.length>500||!COUNTRIES.some(c=>c[0]===input.country)||!DESIGNS.some(d=>d.id===input.design)||!['exchange','degree'].includes(input.kind))throw Error('invalid-card');
 return {id,name,message,country:input.country,kind:input.kind,design:input.design,public:input.public===true,createdAt:new Date().toISOString()};
}
export function readCards(storage){
 const data=JSON.parse(storage.getItem(STORE_KEY)??'[]');
 if(!Array.isArray(data)||data.length>1000)throw Error('invalid-storage');
 return data.map(c=>{if(!c||typeof c.id!=='string')throw Error('invalid-storage');return {...createPostcard(c,c.id),createdAt:c.createdAt};});
}
export function saveCard(storage,card){
 const cards=readCards(storage);
 if(cards.some(c=>c.id===card.id))return cards;
 if(cards.length>=100)throw Error('demo-limit');
 const next=[card,...cards];storage.setItem(STORE_KEY,JSON.stringify(next));return next;
}
export const point=(lon,lat)=>({x:(lon+180)/360*900,y:(90-lat)/180*450});
export function journeyFrame(progress,country){
 const c=COUNTRIES.find(c=>c[0]===country)??COUNTRIES[0],home=point(121.58,24.99),away=point(c[3],c[4]);
 const p=Math.max(0,Math.min(1,progress));
 const phase=p<.42?'outbound':p<.56?'pickup':p<1?'returning':'arrived';
 if(p===0||p===1)return {...home,carrying:p===1,phase};
 const t=phase==='outbound'?p/.42:phase==='pickup'?1:1-(p-.56)/.44;
 const u=Math.max(0,Math.min(1,t));
 return {x:home.x+(away.x-home.x)*u,y:home.y+(away.y-home.y)*u-Math.sin(Math.PI*u)*60,carrying:p>=.5,phase};
}
