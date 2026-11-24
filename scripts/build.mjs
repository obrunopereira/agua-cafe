import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=process.cwd(),dist=path.join(root,'dist');
await fs.rm(dist,{recursive:true,force:true});await fs.cp('public',dist,{recursive:true});
const assets=[];
async function copy(src,dest){const out=path.join(dist,dest);await fs.mkdir(path.dirname(out),{recursive:true});await fs.copyFile(src,out);assets.push('./'+dest.replaceAll('\\','/'));}
for(const name of ['tesseract.min.js','worker.min.js'])await copy('node_modules/tesseract.js/dist/'+name,'vendor/tesseract/'+name);
const core='node_modules/tesseract.js-core';const names=await fs.readdir(core);
for(const name of names.filter(n=>/^tesseract-core.*\.(?:js|wasm)$/.test(n)))await copy(core+'/'+name,'vendor/core/'+name);
for(const name of ['tesseract-core.wasm.js','tesseract-core-simd.wasm.js','tesseract-core-lstm.wasm.js','tesseract-core-simd-lstm.wasm.js'])if(!names.includes(name))throw Error('Core ausente: '+name);
const lang='node_modules/@tesseract.js-data/por';
async function find(dir){let files=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())files.push(...await find(p));else if(e.name==='por.traineddata.gz')files.push(p);}return files;}
const models=await find(lang);const model=models.find(p=>p.includes('best_int'))||models.find(p=>p.includes('fast'))||models[0];if(!model)throw Error('Modelo por.traineddata.gz ausente');await copy(model,'vendor/lang/por.traineddata.gz');
await fs.writeFile(path.join(dist,'vendor/assets.json'),JSON.stringify(assets));
for(const pkg of ['tesseract.js','tesseract.js-core','@tesseract.js-data/por']){const dir='node_modules/'+pkg;const files=await fs.readdir(dir);for(const n of files.filter(x=>/^(license|notice|copying)/i.test(x))){const stat=await fs.stat(path.join(dir,n));if(stat.isFile()){const dest=path.join(dist,'vendor/licenses',pkg.replaceAll('/','_')+'-'+n);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(path.join(dir,n),dest);}}}
const hash=createHash('sha256');for(const n of ['index.html','app.js','core.js','style.css','manifest.webmanifest','sw.js'])hash.update(await fs.readFile(path.join(dist,n)));const version=hash.digest('hex').slice(0,12);const sw=path.join(dist,'sw.js');await fs.writeFile(sw,(await fs.readFile(sw,'utf8')).replace('agua-cafe-shell-v1','agua-cafe-shell-'+version));await fs.writeFile(path.join(dist,'.nojekyll'),'');console.log(`Build concluído: ${assets.length} recursos OCR; modelo ${model}.`);
