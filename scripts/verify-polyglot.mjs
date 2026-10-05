import {polyglotTasks} from '../sandbox/polyglot-tasks.mjs';
import {gradePolyglot} from '../server/polyglot.mjs';
import {solution} from '../tests/fixtures/polyglot-solutions.mjs';

if(!process.env.PISTON_URL)throw Error('Set PISTON_URL and the gateway secret, if used');
const env={PISTON_URL:process.env.PISTON_URL,PISTON_API_KEY:process.env.PISTON_API_KEY};let failed=false;
for(const task of polyglotTasks){
 try{
  const starter=await gradePolyglot(env,task.id,task.starter),fixed=await gradePolyglot(env,task.id,solution(task));
  const ok=starter.passed<starter.total&&fixed.passed===fixed.total;
  console.log(`${task.id}: ${ok?'PASS':'FAIL'} (starter ${starter.passed}/${starter.total}, solution ${fixed.passed}/${fixed.total})`);
  if(!ok){failed=true;console.log(JSON.stringify(fixed.cases.filter(c=>!c.pass)));}
 }catch(error){failed=true;console.log(`${task.id}: FAIL (${error.message})`);}
}
if(failed)process.exitCode=1;
