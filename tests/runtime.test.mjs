import test from 'node:test';
import assert from 'node:assert/strict';
import {execute,limits} from '../sandbox/runtime.mjs';
test('QuickJS exercises evaluate actual output and equivalent object key order',async()=>{
 const wrong=await execute('function solve(xs){return xs.reduce((a,b)=>a+b,0)}','sum-positive');assert.equal(wrong.passed,2);
 const right=await execute('function solve(xs){return xs.filter(n=>n>0).reduce((a,b)=>a+b,0)}','sum-positive');assert.equal(right.passed,4);
 const queue=await execute('function solve(xs){const remaining=[...xs];const value=remaining.shift()??null;return {remaining,value}}','queue-copy');assert.equal(queue.passed,3);
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
