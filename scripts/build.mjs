import {readFileSync,writeFileSync,mkdirSync,readdirSync,copyFileSync,rmSync} from 'node:fs';
import {resolve,dirname,basename} from 'node:path';
import {build} from 'esbuild';
const types={html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml',webmanifest:'application/manifest+json'};
const output=resolve('dist');if(dirname(output)!==resolve('.')||basename(output)!=='dist')throw Error('Unsafe build path');
rmSync(output,{recursive:true,force:true});
await build({entryPoints:['sandbox/worker.mjs'],outfile:'web/code-worker.js',bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true});
await build({entryPoints:['sandbox/client.mjs'],outfile:'web/practice.js',bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true});
const assets={};for(const name of readdirSync('web')){const type=types[name.split('.').pop()];if(type)assets['/'+name]={body:readFileSync('web/'+name,'utf8'),type:type+'; charset=utf-8'};}
writeFileSync('server/assets.generated.mjs','export const assets = '+JSON.stringify(assets)+';');
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
await build({entryPoints:['server/index.mjs'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,external:['./quickjs.wasm']});
writeFileSync('dist/server/quickjs.wasm',await extractQuickJSWasm());
copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
const worker=await import('../dist/server/index.js?build='+Date.now());if(typeof worker.default?.fetch!=='function')throw Error('Missing Worker fetch');
await verifyPrecompiledQuickJS(readFileSync('dist/server/quickjs.wasm'));
console.log('Worker built and validated.');

// QuickJS ships its WebAssembly embedded in JavaScript. Capture the bytes Node compiles once, so the Worker can import
// them as a precompiled module instead of compiling at runtime (which Workers forbid).
async function extractQuickJSWasm(){
 const {newQuickJSWASMModuleFromVariant}=await import('quickjs-emscripten-core');const {default:variant}=await import('@jitl/quickjs-singlefile-browser-release-sync');
 let bytes=null;const original=WebAssembly.instantiate;
 WebAssembly.instantiate=function(source){if(!bytes&&(source instanceof ArrayBuffer||ArrayBuffer.isView(source)))bytes=Buffer.from(source instanceof ArrayBuffer?new Uint8Array(source):new Uint8Array(source.buffer,source.byteOffset,source.byteLength));return original.apply(this,arguments);};
 try{await newQuickJSWASMModuleFromVariant(variant);}finally{WebAssembly.instantiate=original;}
 if(!bytes||bytes.readUInt32BE(0)!==0x0061736d)throw Error('QuickJS wasm extraction failed');return bytes;
}
// Re-run a graded exercise the way the Worker will: compiling from bytes is refused, only the precompiled module works.
async function verifyPrecompiledQuickJS(bytes){
 const runtime=await import('../sandbox/runtime.mjs?verify='+Date.now());const module=new WebAssembly.Module(bytes);
 const original=WebAssembly.instantiate,originalCompile=WebAssembly.compile;
 WebAssembly.instantiate=function(source){return source instanceof WebAssembly.Module?original.apply(this,arguments):Promise.reject(new WebAssembly.CompileError('Wasm code generation disallowed by embedder'));};
 WebAssembly.compile=()=>Promise.reject(new WebAssembly.CompileError('Wasm code generation disallowed by embedder'));
 try{runtime.setQuickJSWasmModule(async()=>module);const r=await runtime.execute('function solve(numbers){return numbers.filter(n=>n>0).reduce((s,n)=>s+n,0)}','sum-positive');if(!r.total||r.passed!==r.total)throw Error('Precompiled QuickJS did not grade the reference solution: '+JSON.stringify(r).slice(0,200));}
 finally{WebAssembly.instantiate=original;WebAssembly.compile=originalCompile;}
}
