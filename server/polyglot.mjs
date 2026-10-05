import {polyglotTasks} from '../sandbox/polyglot-tasks.mjs';
import {executePistonCases} from '../sandbox/piston.mjs';

const arrayInput=numbers=>`${numbers.length}\n${numbers.join(' ')}\n`;
const suites={
 'positive-sum':[[2,-3,0,5],[],[-9,0,-1],[1,2,3],[-1000,1000,999,-999]],
 'stable-unique':[[3,1,3,0,1,-2],[],[0,0,0],[-2,4,-2,1,4],[9,8,7,6]],
 'health-clamp':[[3,8,10],[10,4,10],[12,-2,10],[0,0,0],[-2,0,10]]
};
function expected(problem,input){
 if(problem==='positive-sum')return String(input.reduce((sum,n)=>sum+(n>0?n:0),0));
 if(problem==='stable-unique')return [...new Set(input)].join(' ');
 const next=Math.max(0,Math.min(input[2],input[0]-input[1]));return `${next} ${next===0}`;
}
const normalize=x=>String(x).trim().split(/\s+/).filter(Boolean).join(' ');
const okStatus=x=>!x||x==='OK';
export async function gradePolyglot(env,taskId,code){
 const task=polyglotTasks.find(t=>t.id===taskId);if(!task)throw Object.assign(Error('invalid_polyglot_task'),{status:400});
 const inputs=suites[task.problem],stdin=inputs.map(input=>task.problem==='health-clamp'?input.join(' ')+'\n':arrayInput(input));
 let reports;try{reports=await executePistonCases(env,{language:task.language,code,inputs:stdin});}catch(error){throw error.status?error:Object.assign(Error('piston_unavailable'),{status:503});}
 const cases=inputs.map((input,i)=>{
  const r=reports[i],want=expected(task.problem,input);
  if(!r)return {input:stdin[i],expected:want,actual:null,pass:false,error:'not_run_after_compile_failure'};
  const completed=r.exitCode===0&&!r.signal&&!r.compileSignal&&(r.compileExitCode===null||r.compileExitCode===0)&&okStatus(r.compileStatus)&&okStatus(r.runStatus);
  const error=completed?'':r.compileStderr||r.stderr||r.message||r.compileStatus||r.runStatus||'program_failed';
  return {input:stdin[i],expected:want,actual:r.stdout,pass:completed&&normalize(r.stdout)===normalize(want),error,exitCode:r.exitCode,signal:r.signal,compileStatus:r.compileStatus,runStatus:r.runStatus};
 });
 const passed=cases.filter(c=>c.pass).length;
 return {verification:'server-verified',runner:'piston',language:task.language,version:reports[0]?.version,suiteVersion:task.suiteVersion,taskId:task.id,evidenceKey:task.evidenceKey,modality:task.modality,passed,total:cases.length,score:Math.round(passed/cases.length*100),cases};
}
export function polyglotEvidence(row){
 const task=polyglotTasks.find(t=>t.id===row.task_id);if(!task)return [];
 let saved;try{saved=JSON.parse(row.result);}catch{return [];}
 const report=saved.report;
 if(saved.verification!=='server-verified'||report?.verification!=='server-verified'||report?.runner!=='piston'||report?.suiteVersion!==task.suiteVersion||report?.taskId!==task.id||report?.language!==task.language||report?.total!==suites[task.problem].length||!Number.isInteger(report.passed)||report.passed<0||report.passed>report.total)return [];
 return [{task_id:task.id,evidence_key:task.evidenceKey,area:task.area,score:Math.round(report.passed/report.total*100),modality:task.modality,language:task.language,verification:'server-verified',hinted:0,skipped:0,created_at:row.created_at}];
}
