import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {mkdtemp,readFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('Pages distribution works under a repository path and excludes private project files',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'pangolin-pages-'));
 try{
  const run=spawnSync(process.execPath,['scripts/package-site.mjs',dir],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const html=await readFile(join(dir,'index.html'),'utf8');assert.ok(html.includes('./src/main.mjs'));
  await access(join(dir,'assets/story/awakening.webp'));await access(join(dir,'assets/campus/lohas-v12.webp'));
  await assert.rejects(access(join(dir,'HANDOFF.md')));await assert.rejects(access(join(dir,'.git')));
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('every file the published site loads is tracked by git (the .gitignore is an allowlist)',async()=>{
 const tracked=new Set(spawnSync('git',['ls-files'],{encoding:'utf8'}).stdout.split('\n'));
 if(tracked.size<2)return; // not a git checkout (e.g. unpacked ZIP)
 const dir=await mkdtemp(join(tmpdir(),'pangolin-tracked-'));
 try{
  spawnSync(process.execPath,['scripts/package-site.mjs',dir]);
  const files=spawnSync('find',['.','-type','f'],{cwd:dir,encoding:'utf8'}).stdout.split('\n').filter(Boolean).map(f=>f.slice(2)).filter(f=>f!=='.nojekyll');
  const missing=files.filter(f=>!tracked.has(f));
  assert.deepEqual(missing,[],'runtime files would be missing on GitHub Pages');
 }finally{await rm(dir,{recursive:true,force:true});}
});
