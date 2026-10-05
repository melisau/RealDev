import {parse} from 'acorn';
import {areas,tasks} from './catalog.mjs';
const L=(tr,en)=>({tr,en});
const operators={'+':(a,b)=>a+b,'-':(a,b)=>a-b,'*':(a,b)=>a*b,'/':(a,b)=>a/b,'%':(a,b)=>a%b,'>':(a,b)=>a>b,'>=':(a,b)=>a>=b,'<':(a,b)=>a<b,'<=':(a,b)=>a<=b,'===':(a,b)=>a===b,'!==':(a,b)=>a!==b,'==':(a,b)=>a==b,'!=':(a,b)=>a!=b};
// Interpret a small, side-effect-free AST. Never eval user code or call properties/functions.
export function expression(source){
 if(typeof source!=='string'||source.length>400)throw new Error('expression');
 const ast=parse(source,{ecmaVersion:2022});
 if(ast.body.length!==1||ast.body[0].type!=='ExpressionStatement')throw new Error('expression');
 function compile(x,depth=0){
  if(depth>20)throw new Error('expression');
  if(x.type==='Literal'&&(typeof x.value==='number'||typeof x.value==='boolean'))return ()=>x.value;
  if(x.type==='Identifier'&&x.name==='n')return n=>n;
  if(x.type==='UnaryExpression'&&['!','-','+'].includes(x.operator)){const a=compile(x.argument,depth+1);return n=>x.operator==='!'?!a(n):x.operator==='-'?-a(n):+a(n);}
  if(x.type==='BinaryExpression'&&operators[x.operator]){const a=compile(x.left,depth+1),b=compile(x.right,depth+1);return n=>operators[x.operator](a(n),b(n));}
  if(x.type==='LogicalExpression'&&['&&','||'].includes(x.operator)){const a=compile(x.left,depth+1),b=compile(x.right,depth+1);return n=>x.operator==='&&'?(a(n)&&b(n)):(a(n)||b(n));}
  throw new Error('expression');
 }
 return compile(ast.body[0].expression);
}
export function grade(task,answer,skipped=false){
 if(skipped)return {score:0,outcome:'skipped',explain:task.explain,checks:task.checks,source:task.source};
 if(task.kind==='expression'){
  let fn;try{fn=expression(answer);}catch{return {score:null,outcome:'unsupported',message:L('Bu koşul değerlendirilemedi. Yalnızca n, sayılar, parantezler, karşılaştırma, aritmetik ve && / || / ! kullan. Tam fonksiyon değil, yalnızca ifadeyi yaz.','This condition could not be evaluated. Use only n, numbers, parentheses, comparisons, arithmetic and && / || / !. Enter an expression, not a full function.')};}
  const inputs=task.rule==='positive-even'?[-8,-3,-2,0,1,2,3,4,10,11,0.5,2.5]:[-10,-0.1,0,0.1,5,9,9.99,10,10.1,20];
  const cases=inputs.map(input=>{const expected=task.rule==='positive-even'?input>0&&input%2===0:input>=0&&input<10;const actual=Boolean(fn(input));return {input,expected,actual,pass:expected===actual};});
  const passed=cases.filter(c=>c.pass).length;
  return {score:Math.round(passed/cases.length*100),outcome:passed===cases.length?'correct':'needs-practice',cases,explain:task.explain,checks:task.checks,source:task.source};
 }
 if(!Number.isInteger(answer)||answer<0||answer>=task.options.length)throw new Error('Invalid answer');
 return {score:answer===task.answer?100:0,outcome:answer===task.answer?'correct':'needs-practice',expected:task.options[task.answer],explain:task.explain,checks:task.checks,source:task.source};
}
export function evidence(attempts){
 return Object.keys(areas).map(area=>{
  const rows=attempts.filter(a=>a.area===area);
  const latest=new Map();for(const a of [...rows].sort((a,b)=>a.created_at.localeCompare(b.created_at)))latest.set(a.task_id,a);
  const distinct=[...latest.values()];
  const verified=distinct.filter(a=>a.verification!=='ai-provisional');
  const independent=verified.filter(a=>a.score===100&&!a.hinted&&!a.skipped);
  const modalities=[...new Set(independent.map(a=>a.modality||(tasks.find(t=>t.id===a.task_id)?.kind==='expression'?'code':'choice')))];
  const provisional=distinct.filter(a=>a.verification==='ai-provisional').length;
  const depth=modalities.includes('project')&&modalities.includes('transfer')&&modalities.some(m=>['code','debug'].includes(m));
  return {area,count:rows.length,distinct:distinct.length,independent:independent.length,
   score:verified.length?Math.round(verified.reduce((s,a)=>s+a.score,0)/verified.length):null,modalities,provisional,
   status:!distinct.length?'unmeasured':independent.length>=5&&depth?'supported':independent.length?'initial':'practice',
   lastAt:rows.at(-1)?.created_at||null};
 });
}
const relevance={fullstack:['frontend','dotnet','api','sql','git','testing','devops','structures','ai','data','mobile','game'],frontend:['frontend','api','testing','git','structures'],ai:['ai','testing','api','devops','structures'],data:['data','sql','structures','testing'],devops:['devops','git','api','data'],mobile:['mobile','api','testing','unity'],game:['game','unity','dotnet','testing','git','structures']};
export function route(profile,attempts,now=new Date()){
 const selected=new Set(profile.goals.flatMap(g=>relevance[g]||[]));
 const suggestions=evidence(attempts).map(e=>{
  const list=attempts.filter(a=>a.area===e.area);const last=list.at(-1);
  const distinctTasks=tasks.filter(t=>t.area===e.area);
  const unseen=distinctTasks.find(t=>!list.some(a=>a.task_id===t.id));
  const task=unseen||distinctTasks.find(t=>t.id!==last?.task_id)||distinctTasks[0];
  const days=e.status==='supported'?7:e.status==='initial'?3:1;
  const due=last?new Date(new Date(last.created_at).getTime()+days*86400000):now;
  const isDue=due<=now;
  const reason=!last?'unmeasured':e.status==='practice'?'gap':unseen?'transfer':isDue?'review':'scheduled';
  return {area:e.area,taskId:task.id,title:task.title,minutes:task.minutes+2,reason,dueAt:due.toISOString(),priority:(e.status==='practice'?50:!last?35:unseen?30:isDue?25:0)+(selected.has(e.area)?20:0),available:reason!=='scheduled'};
 }).sort((a,b)=>b.priority-a.priority||a.area.localeCompare(b.area));
 let total=0;return suggestions.map(item=>{const today=item.available&&total+item.minutes<=profile.dailyMinutes;if(today)total+=item.minutes;return {...item,today};});
}
