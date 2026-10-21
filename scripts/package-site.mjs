import {mkdir,copyFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {manifest} from '../src/manifest.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const destination=resolve(process.argv[2]??'dist');
if(destination===root)throw Error('Output must be a separate distribution directory');
const files=['index.html','classic.html','meadow.html','style.css','meadow.css','paipai.css',...(await readdir(resolve(root,'src'))).filter(f=>f.endsWith('.mjs')).map(f=>'src/'+f),...(await readdir(resolve(root,'src/meadow'))).filter(f=>f.endsWith('.mjs')).map(f=>'src/meadow/'+f),...new Set(Object.values(manifest)),...['awakening','cat','mission'].map(f=>`assets/story/${f}.webp`)];
for(const file of files){await mkdir(dirname(resolve(destination,file)),{recursive:true});await copyFile(resolve(root,file),resolve(destination,file));}
await writeFile(resolve(destination,'.nojekyll'),'');
console.log(`Packaged ${files.length} runtime files.`);
