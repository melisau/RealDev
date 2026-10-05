import {readFileSync,writeFileSync,mkdirSync,readdirSync,copyFileSync,rmSync} from 'node:fs';
import {resolve,dirname,basename} from 'node:path';
import {build} from 'esbuild';
const types={html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml'};
const output=resolve('dist');if(dirname(output)!==resolve('.')||basename(output)!=='dist')throw Error('Unsafe build path');
rmSync(output,{recursive:true,force:true});
await build({entryPoints:['sandbox/worker.mjs'],outfile:'web/code-worker.js',bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true});
await build({entryPoints:['sandbox/client.mjs'],outfile:'web/practice.js',bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true});
const assets={};for(const name of readdirSync('web')){const type=types[name.split('.').pop()];if(type)assets['/'+name]={body:readFileSync('web/'+name,'utf8'),type:type+'; charset=utf-8'};}
writeFileSync('server/assets.generated.mjs','export const assets = '+JSON.stringify(assets)+';');
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
await build({entryPoints:['server/index.mjs'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
const worker=await import('../dist/server/index.js?build='+Date.now());if(typeof worker.default?.fetch!=='function')throw Error('Missing Worker fetch');
console.log('Worker built and validated.');
