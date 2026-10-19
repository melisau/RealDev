import test from 'node:test';
import assert from 'node:assert/strict';
import {execute,limits} from '../sandbox/runtime.mjs';
test('QuickJS exercises evaluate actual output and equivalent object key order',async()=>{
 const wrong=await execute('function solve(xs){return xs.reduce((a,b)=>a+b,0)}','sum-positive');assert.equal(wrong.passed,2);
 const right=await execute('function solve(xs){return xs.filter(n=>n>0).reduce((a,b)=>a+b,0)}','sum-positive');assert.equal(right.passed,4);
 const queue=await execute('function solve(xs){const remaining=[...xs];const value=remaining.shift()??null;return {remaining,value}}','queue-copy');assert.equal(queue.passed,3);
});
test('hands-on AI, data, mobile and game code tasks run independent edge cases',async()=>{
 const solutions=[
  ['ai-code-grounding','function solve(claims){return claims.filter(c=>typeof c.sourceId==="string"&&c.sourceId.trim().length>0).map(c=>({id:c.id,sourceId:c.sourceId}))}'],
  ['data-code-dedupe','function solve(records){const seen=new Set();return records.filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true})}'],
  ['mobile-code-stale-response','function solve(input){const {state,currentRequestId,response}=input;return response.requestId===currentRequestId?{...state,data:response.data}:state}'],
  ['game-code-health','function solve(input){const [health,damage,maxHealth]=input;const next=Math.min(maxHealth,Math.max(0,health-damage));return {health:next,defeated:next===0}}']
 ];
 for(const [id,code] of solutions){const r=await execute(code,id);assert.equal(r.passed,r.total,id);assert.ok(r.total>=3,id);}
});
test('QuickJS has no host network, filesystem, DOM or identity access',async()=>{
 const r=await execute('console.log(typeof fetch,typeof process,typeof require,typeof document,typeof localStorage,typeof postMessage)');assert.deepEqual(r.logs,['undefined undefined undefined undefined undefined undefined']);
 const escape=await execute('console.log(console.log.constructor("return typeof process")())');assert.equal(escape.logs[0],'undefined');
});
test('QuickJS interrupts loops, limits allocations and recovers for the next run',async()=>{
 const loop=await execute('while(true){}');assert.match(loop.error,/interrupt/i);
 const memory=await execute('const xs=[];while(true){xs.push(new Array(100000).fill(1))}');assert.ok(memory.error);
 const logs=await execute('for(let i=0;i<10000;i++)console.log("x".repeat(1000))');assert.ok(logs.logs.join('').length<=limits.outputChars);
 assert.equal((await execute('console.log(42)')).logs[0],'42');
});
test('on hosts that forbid compiling WebAssembly at runtime, a precompiled module still grades code and failures are a clear 503',async()=>{
 const runtime=await import('../sandbox/runtime.mjs?embedder='+Date.now());
 const {newQuickJSWASMModuleFromVariant}=await import('quickjs-emscripten-core');const {default:variant}=await import('@jitl/quickjs-singlefile-browser-release-sync');
 const original=WebAssembly.instantiate,originalCompile=WebAssembly.compile;let bytes=null;
 WebAssembly.instantiate=function(source){if(!bytes&&ArrayBuffer.isView(source)||!bytes&&source instanceof ArrayBuffer)bytes=new Uint8Array(source instanceof ArrayBuffer?source:source.buffer.slice(source.byteOffset,source.byteOffset+source.byteLength));return original.apply(this,arguments);};
 await newQuickJSWASMModuleFromVariant(variant);WebAssembly.instantiate=original;assert.ok(bytes?.length>100000);
 const solution='function solve(numbers){return numbers.filter(n=>n>0).reduce((s,n)=>s+n,0)}';
 WebAssembly.instantiate=function(source){return source instanceof WebAssembly.Module?original.apply(this,arguments):Promise.reject(new WebAssembly.CompileError('Wasm code generation disallowed by embedder'));};
 WebAssembly.compile=()=>Promise.reject(new WebAssembly.CompileError('Wasm code generation disallowed by embedder'));
 const quiet=console.error;console.error=()=>{};
 try{
  await assert.rejects(runtime.execute(solution,'sum-positive'),e=>e.message==='code_runtime_unavailable'&&e.status===503,'embedded binary is refused like on Sites');
  runtime.setQuickJSWasmModule(async()=>({not:'a module'}));await assert.rejects(runtime.execute(solution,'sum-positive'),/code_runtime_unavailable/);
  const module=new WebAssembly.Module(bytes);runtime.setQuickJSWasmModule(async()=>module);
  const report=await runtime.execute(solution,'sum-positive');assert.equal(report.passed,report.total);assert.ok(report.total>=4);
  const looping=await runtime.execute('while(true){}');assert.ok(looping.error,'interrupts still apply with the precompiled module');
  const again=await runtime.execute(solution,'sum-positive');assert.equal(again.passed,again.total,'the runtime recovers for the next run');
 }finally{WebAssembly.instantiate=original;WebAssembly.compile=originalCompile;console.error=quiet;runtime.setQuickJSWasmModule(null);}
});
test('an unavailable code runtime returns code_runtime_unavailable and saves nothing',async()=>{
 const {api}=await import('../server/api.mjs');const {localDb}=await import('../scripts/local-db.mjs');const runtime=await import('../sandbox/runtime.mjs');
 const DB=localDb(),origin='https://realdev.test',call=(path,body)=>api(new Request(origin+'/api/'+path,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':'a',Origin:origin,'Content-Type':'application/json'},body:body&&JSON.stringify(body)}),{DB});
 const quiet=console.error;console.error=()=>{};runtime.setQuickJSWasmModule(async()=>{throw Error('module missing from the Worker archive');});
 try{const r=await call('code-runs',{id:'runtime-down',taskId:'playground',code:'console.log(1)'});assert.equal(r.status,503);assert.equal((await r.json()).error,'code_runtime_unavailable');
  assert.equal((await (await call('code-runs')).json()).records.length,0);}
 finally{console.error=quiet;runtime.setQuickJSWasmModule(null);DB.close();}
});
