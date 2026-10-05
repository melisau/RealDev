import {newQuickJSWASMModuleFromVariant} from 'quickjs-emscripten-core';
import variant from '@jitl/quickjs-singlefile-browser-release-sync';
import {codeTasks} from './tasks.mjs';
export const limits={memoryBytes:16*1024*1024,stackBytes:256*1024,cpuMs:350,codeChars:12000,outputChars:4000};
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
export async function execute(code,taskId=null){
 if(typeof code!=='string'||code.length>limits.codeChars)return {error:'code_limit',logs:[],cases:[]};
 const engine=await newQuickJSWASMModuleFromVariant(variant);const logs=[];let outputChars=0;
 const rt=engine.newRuntime();rt.setMemoryLimit(limits.memoryBytes);rt.setMaxStackSize(limits.stackBytes);
 const deadline=Date.now()+limits.cpuMs;let ticks=0;rt.setInterruptHandler(()=>Date.now()>deadline||++ticks>15000);
 const task=codeTasks.find(t=>t.id===taskId);const cases=[];
 try{
  for(const test of task?.tests||[null]){
   const vm=rt.newContext();try{
    const consoleObject=vm.newObject();
    const log=vm.newFunction('log',(...args)=>{if(logs.length>=30)return;const line=args.map(h=>{const kind=vm.typeof(h);return kind==='string'?vm.getString(h).slice(0,1000):kind==='number'?String(vm.getNumber(h)):kind==='undefined'?'undefined':kind==='boolean'?String(vm.dump(h)):'[object]';}).join(' ').slice(0,1000);if(outputChars+line.length<=limits.outputChars){logs.push(line);outputChars+=line.length;}});
    vm.setProp(consoleObject,'log',log);vm.setProp(consoleObject,'error',log);vm.setProp(vm.global,'console',consoleObject);log.dispose();consoleObject.dispose();
    const wrapped=code+(test?'\n; JSON.stringify(solve('+JSON.stringify(test.input)+')).slice(0,4000)':'');
    const result=vm.evalCode(wrapped,'exercise.js');
    if(result.error){const error=vm.dump(result.error);result.error.dispose();const message=String(error?.message||error).slice(0,2000);if(test)cases.push({input:test.input,expected:test.expected,actual:null,pass:false,error:message});else return {logs,cases,error:message};}
    else{if(test){let actual;try{actual=JSON.parse(vm.getString(result.value));}catch{actual=null;}cases.push({input:test.input,expected:test.expected,actual,pass:JSON.stringify(canonical(actual))===JSON.stringify(canonical(test.expected))});}result.value.dispose();}
   }finally{vm.dispose();}
  }
  return {logs,cases,passed:cases.filter(c=>c.pass).length,total:cases.length,verification:'server-verified'};
 }catch(error){return {logs,cases,error:String(error.message||error).slice(0,1000)};}finally{rt.dispose();}
}
