import {WORLD} from './world.mjs?v=15';
export const manifest = {
  hall:'assets/flat/hall.png',library:'assets/flat/library.png',
  tree:'assets/flat/tree.png',shrub:'assets/flat/pack/pack-1.png',sign:'assets/flat/pack/pack-2.png',
  frog:'assets/flat/pack/pack-3.png',duck:'assets/flat/pack/pack-4.png',
  pangolin:'assets/flat/pangolin/sheet-transparent.png',human:'assets/flat/human/sheet-transparent.png',
  curl:'assets/flat/curl/curl-1.png',gate:'assets/flat/gate/gate-1.png'
};
for(const key of new Set(['grass','path','water',...WORLD.landmarks.filter(p=>p.w>0).map(p=>p.asset)])){if(!manifest[key])manifest[key]=`assets/campus/${key}.png`;}

for(const key of ['law','roman','computer','jiying','gym','admin','zonghe'])manifest[key]=`assets/campus/${key}-v5.png`;

for(const key of ['quest-cat','quest-magpie','quest-treasure'])manifest[key]=`assets/campus/${key}.png`;

for(const key of ['green-hall','lohas','daren','pool'])manifest[key]=`assets/campus/${key}-v12.png`;

manifest.gatehouse='assets/campus/gatehouse-v12.png';

// Ship the compact .webp copies (scripts/optimize-assets.py); PNGs stay as sources.
for(const key of Object.keys(manifest))manifest[key]=manifest[key].replace(/\.png$/,'.webp');
