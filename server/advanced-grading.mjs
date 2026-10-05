import {advancedTasks} from './advanced.mjs';
import {executePistonCases} from '../sandbox/piston.mjs';
const pair=(input,expected)=>({input,expected});
export const advancedSuites={
 'advanced-api-validation':[
 pair([{op:'create',owner:'alice',name:'book'},{op:'list'}],[{status:201,id:1},{status:200,items:[{id:1,owner:'alice',name:'book'}]}]),
 pair([{op:'create',owner:'a',name:''},{op:'create',owner:'a',name:42},{op:'list'}],[{status:400},{status:400},{status:200,items:[]}]),
 pair([{op:'create',owner:' a ',name:"  x'; DROP TABLE items;-- "},{op:'list'}],[{status:201,id:1},{status:200,items:[{id:1,owner:'a',name:"x'; DROP TABLE items;--"}]}]),
 pair([{op:'create',owner:'',name:'ok'},{op:'create',owner:'b',name:'n'.repeat(81)},{op:'unknown'}],[{status:400},{status:400},{status:404}]),
 pair([{op:'create',owner:'b',name:' first '},{op:'create',owner:'a',name:'second'},{op:'list'}],[{status:201,id:1},{status:201,id:2},{status:200,items:[{id:1,owner:'b',name:'first'},{id:2,owner:'a',name:'second'}]}])],
 'advanced-api-ownership':[
 pair([{op:'create',owner:'alice',name:'secret'},{op:'list',owner:'bob'},{op:'delete',owner:'bob',id:1},{op:'list',owner:'alice'}],[{status:201,id:1},{status:200,items:[]},{status:404},{status:200,items:[{id:1,owner:'alice',name:'secret'}]}]),
 pair([{op:'create',owner:'a',name:'x'},{op:'delete',owner:'a',id:1},{op:'list',owner:'a'}],[{status:201,id:1},{status:204},{status:200,items:[]}]),
 pair([{op:'list'},{op:'delete',owner:' '},{op:'create',name:'x'}],[{status:401},{status:401},{status:401}]),
 pair([{op:'create',owner:'a',name:'x'},{op:'delete',owner:'a',id:true},{op:'delete',owner:'a',id:'1'},{op:'list',owner:'a'}],[{status:201,id:1},{status:404},{status:404},{status:200,items:[{id:1,owner:'a',name:'x'}]}]),
 pair([{op:'create',owner:' a ',name:' one '},{op:'create',owner:'b',name:'two'},{op:'create',owner:'a',name:''},{op:'list',owner:' a '}],[{status:201,id:1},{status:201,id:2},{status:400},{status:200,items:[{id:1,owner:'a',name:'one'}]}])],
 'advanced-api-transaction':[
 pair([{op:'transfer',from:1,to:2,quantity:3},{op:'stock'}],[{status:204},{status:200,stock:[[1,7],[2,7]]}]),
 pair([{op:'transfer',from:1,to:2,quantity:3,fail:true},{op:'stock'}],[{status:500},{status:200,stock:[[1,10],[2,4]]}]),
 pair([{op:'transfer',from:1,to:2,quantity:11},{op:'stock'}],[{status:409},{status:200,stock:[[1,10],[2,4]]}]),
 pair([{op:'transfer',from:1,to:1,quantity:1},{op:'transfer',from:1,to:2,quantity:true},{op:'transfer',from:1,to:2,quantity:-1},{op:'stock'}],[{status:400},{status:400},{status:400},{status:200,stock:[[1,10],[2,4]]}]),
 pair([{op:'transfer',from:1,to:9,quantity:1},{op:'transfer',from:2,to:1,quantity:4},{op:'transfer',from:2,to:1,quantity:1},{op:'stock'}],[{status:404},{status:204},{status:409},{status:200,stock:[[1,14],[2,0]]}])],
 'advanced-dotnet-contract':[pair('0 1 1\n','401'),pair('1 1 0\n1 0 -1\n','400\n400'),pair('1 0 2\n','404'),pair('1 1 11\n1 1 10\n','409\n201'),pair('0 0 -1\n1 1 1\n','401\n201')],
 'advanced-dotnet-stock':[pair('3 0\n','204 7 7'),pair('3 1\n2 0\n','500 10 4\n204 8 6'),pair('11 0\n','409 10 4'),pair('0 0\n-2 1\n','400 10 4\n400 10 4'),pair('10 0\n1 0\n','204 0 14\n409 0 14')],
 'advanced-dotnet-retry':[pair('start\nsuccess\nsuccess\n','running 1\ndone 1\ndone 1'),pair('start\ncancel\nsuccess\n','running 1\ncancelled 1\ncancelled 1'),pair('retry\nstart\ntransient\nretry\nsuccess\n','idle 0\nrunning 1\nfailed 1\nrunning 2\ndone 2'),pair('start\ntransient\nretry\ntransient\nretry\ntransient\nretry\n','running 1\nfailed 1\nrunning 2\nfailed 2\nrunning 3\nfailed 3\nfailed 3'),pair('start\ntransient\ncancel\nstart\n','running 1\nfailed 1\ncancelled 1\nrunning 1')],
 'advanced-unity-events':[pair('enable\nevent\n','0\n1'),pair('enable\nenable\nevent\n','0\n0\n1'),pair('enable\ndisable\nevent\n','0\n0\n0'),pair('disable\nenable\nevent\ndisable\nenable\nevent\n','0\n0\n1\n1\n1\n2'),pair('event\nevent\nenable\nevent\nevent\n','0\n0\n0\n1\n2')],
 'advanced-unity-pool':[pair('rent\ndamage 20\nreturn\nrent\n','100 true\n80 true\n0 false\n100 true'),pair('damage 4\nreturn\n','0 false\n0 false'),pair('rent\ndamage 120\nrent\n','100 true\n0 false\n100 true'),pair('rent\ndamage 10\nrent\n','100 true\n90 true\n90 true'),pair('rent\ndamage -20\nreturn\ndamage 3\n','100 true\n100 true\n0 false\n0 false')],
 'advanced-unity-save':[pair('1 30\n2 30\n','60\n30'),pair('3 30\nbad\n','100\n100'),pair('1 2147483647\n2 -2\n','100\n0'),pair('1 0\n2 100\n','0\n100'),pair('1 -10\n2 nope\n','0\n100')]
};
const normalize=x=>String(x).trim().split(/\s+/).filter(Boolean).join(' ');
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
export async function gradeAdvanced(env,id,code){
 const task=advancedTasks.find(t=>t.id===id);if(!task)throw Object.assign(Error('invalid_advanced_task'),{status:400});
 const suite=advancedSuites[id],inputs=suite.map(c=>task.language==='python'?JSON.stringify(c.input):c.input);
 const reports=await executePistonCases(env,{language:task.language,code,inputs});
 const cases=suite.map((c,i)=>{const r=reports[i];const completed=r&&r.exitCode===0&&!r.signal&&!r.compileSignal&&(r.compileExitCode===null||r.compileExitCode===0)&&(!r.compileStatus||r.compileStatus==='OK')&&(!r.runStatus||r.runStatus==='OK');let matches=false;
  if(completed){if(task.language==='python'){try{matches=JSON.stringify(canonical(JSON.parse(r.stdout)))===JSON.stringify(canonical(c.expected));}catch{}}else matches=normalize(r.stdout)===normalize(c.expected);}
  return {input:c.input,expected:c.expected,actual:r?.stdout||'',pass:!!completed&&matches,error:completed?'':r?.compileStderr||r?.stderr||r?.message||r?.runStatus||'program_failed'};
 });const passed=cases.filter(c=>c.pass).length;return {verification:'server-verified',runner:'piston',taskId:id,suiteVersion:task.suiteVersion,language:task.language,modality:task.modality,passed,total:cases.length,score:Math.round(passed/cases.length*100),cases};
}
export function advancedEvidence(row){
 const task=advancedTasks.find(t=>t.id===row.task_id);if(!task)return [];let saved;try{saved=JSON.parse(row.result);}catch{return [];}const r=saved?.report;
 if(saved.verification!=='server-verified'||r?.verification!=='server-verified'||r.runner!=='piston'||r.taskId!==task.id||r.suiteVersion!==task.suiteVersion||r.language!==task.language||r.total!==advancedSuites[task.id].length||!Number.isInteger(r.passed)||r.passed<0||r.passed>r.total)return [];
 return [{task_id:task.id,area:task.area,score:Math.round(r.passed/r.total*100),modality:task.modality,language:task.language,verification:'server-verified',hinted:0,skipped:0,created_at:row.created_at}];
}
