import {database} from './db.mjs';
import {tasks,areas,baselineIds,goals,goalLabels,VERSION,publicTask} from './catalog.mjs';
import {grade,evidence,route} from './assessment.mjs';
import {newsFeed,githubRepo,validateRepo} from './live.mjs';
import {execute} from '../sandbox/runtime.mjs';
import {codeTasks} from '../sandbox/tasks.mjs';
import {executePiston,runtimes as pistonRuntimes} from '../sandbox/piston.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(x);
function identity(req){const id=req.headers.get('oai-authenticated-user-id');if(!id)throw fail('sign_in_required',401);return {id,email:req.headers.get('oai-authenticated-user-email')||''};}
const defaultProfile={goals:['fullstack','game'],dailyMinutes:15};
function noteQuery(user,note,taskId){
 if(!note||!validId(note.id)||typeof note.text!=='string'||!note.text.trim()||note.text.length>3000||!tasks.some(t=>t.id===taskId))throw fail('invalid_note');
 const now=new Date().toISOString();
 return ['INSERT INTO notes (id,user_id,task_id,body,resolved,created_at,updated_at) VALUES (?,?,?,?,0,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body, updated_at=excluded.updated_at WHERE notes.user_id = excluded.user_id',note.id,user,taskId,note.text.trim(),now,now];
}
async function profile(db,user){const p=await db.one('SELECT * FROM profiles WHERE user_id = ?',user);return p?{goals:JSON.parse(p.goals),dailyMinutes:p.daily_minutes,saved:true}:{...defaultProfile,saved:false};}
function unpack(a){return {...a,answer:JSON.parse(a.answer_json),feedback:JSON.parse(a.feedback_json),answer_json:undefined,feedback_json:undefined,user_id:undefined};}
async function runData(db,user,id){
 const run=await db.one('SELECT * FROM runs WHERE id = ? AND user_id = ?',id,user);if(!run)throw fail('run_not_found',404);
 const records=await db.all('SELECT * FROM attempts WHERE run_id = ? AND user_id = ? ORDER BY created_at, id',id,user);
 const hintRows=await db.all('SELECT task_id FROM hints WHERE run_id = ?',id);
 return {id:run.id,kind:run.kind,complete:!!run.complete,taskIds:JSON.parse(run.task_ids),attempts:records.map(unpack),hints:hintRows.map(h=>({taskId:h.task_id,hint:tasks.find(t=>t.id===h.task_id)?.hint}))};
}
export async function api(req,env){
 try{
  const user=identity(req);const url=new URL(req.url);const method=req.method;const db=database(env);
  if(!['GET','POST','PUT'].includes(method))throw fail('method_not_allowed',405);
  if(method!=='GET'){
   if(req.headers.get('origin')!==url.origin)throw fail('origin_not_allowed',403);
   if(!(req.headers.get('content-type')||'').startsWith('application/json'))throw fail('json_required',415);
  }
  let body={};if(method!=='GET'){const text=await req.text();if(text.length>36000)throw fail('request_too_large',413);try{body=JSON.parse(text);}catch{throw fail('invalid_json');}if(!body||typeof body!=='object'||Array.isArray(body))throw fail('invalid_json');}
  const p=url.pathname;
  if(p==='/api/news'&&method==='GET')return json(await newsFeed(db));
  if(p==='/api/github'&&method==='GET'){
   const profile=await db.one('SELECT repository FROM github_profiles WHERE user_id = ?',user.id);const repository=profile?.repository||'melisau/RealDev';return json({selected:repository,...await githubRepo(db,repository)});
  }
  if(p==='/api/github'&&method==='PUT'){
   if(!validateRepo(body.repository))throw fail('invalid_repository');
   const result=await githubRepo(db,body.repository);if(!result.repository) return json(result,422);
   await db.write('INSERT INTO github_profiles (user_id,repository) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET repository=excluded.repository',user.id,body.repository);return json({saved:true,selected:body.repository,...result});
  }
  if(p==='/api/code-runs'&&method==='GET')return json({records:await db.all('SELECT id, task_id, code, result, created_at FROM code_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',user.id)});
  if(p==='/api/piston/runtimes'&&method==='GET')return json({runtimes:await pistonRuntimes(env)});
  if(p==='/api/piston-runs'&&method==='POST'){
   if(!validId(body.id)||!['python','csharp','java'].includes(body.language)||typeof body.code!=='string'||body.code.length>12000||typeof (body.stdin||'')!=='string'||(body.stdin||'').length>8000)throw fail('invalid_code_run');
   const taskId='piston-'+body.language;const prior=await db.one('SELECT user_id,task_id,code,result FROM code_runs WHERE id = ?',body.id);if(prior&&prior.user_id!==user.id)throw fail('code_run_not_found',404);
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body.code+'\0'+(body.stdin||'')));
   const sourceHash=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
   if(prior&&(prior.task_id!==taskId||prior.code!==body.code||JSON.parse(prior.result).sourceHash!==sourceHash))throw fail('code_run_conflict',409);
   if(prior)return json({saved:true,verification:'piston-executed-unscored',result:JSON.parse(prior.result).report});
   const report=await executePiston(env,{language:body.language,code:body.code,stdin:body.stdin||''});
   const record={verification:'piston-executed-unscored',sourceHash,report};
   await db.write('INSERT INTO code_runs (id,user_id,task_id,code,result,created_at) VALUES (?,?,?,?,?,?)',body.id,user.id,taskId,body.code,JSON.stringify(record),new Date().toISOString());
   return json({saved:true,verification:record.verification,result:report});
  }
  if(p==='/api/code-runs'&&method==='POST'){
   if(!validId(body.id)||!(body.taskId==='playground'||codeTasks.some(t=>t.id===body.taskId))||typeof body.code!=='string'||body.code.length>12000)throw fail('invalid_code_run');
   const prior=await db.one('SELECT user_id,task_id,code,result FROM code_runs WHERE id = ?',body.id);if(prior&&prior.user_id!==user.id)throw fail('code_run_not_found',404);
   if(prior&&(prior.task_id!==body.taskId||prior.code!==body.code))throw fail('code_run_conflict',409);
   if(prior)return json({saved:true,verification:'server-verified',result:JSON.parse(prior.result).report});
   const report=await execute(body.code,body.taskId==='playground'?null:body.taskId);
   const verified={...report,verification:'server-verified'};
   await db.write('INSERT INTO code_runs (id,user_id,task_id,code,result,created_at) VALUES (?,?,?,?,?,?)',body.id,user.id,body.taskId,body.code,JSON.stringify({verification:'server-verified',report:verified}),new Date().toISOString());return json({saved:true,verification:'server-verified',result:verified});
  }
  if(p==='/api/state'&&method==='GET'){
   const account=await db.one('SELECT display_name, technologies, created_at, updated_at FROM accounts WHERE user_id = ?',user.id);
   const prefs=await profile(db,user.id);const records=(await db.all('SELECT * FROM attempts WHERE user_id = ? ORDER BY created_at, id',user.id)).map(unpack);
   const codeRecords=await db.all('SELECT task_id,result,created_at FROM code_runs WHERE user_id = ? ORDER BY created_at,id',user.id);
   const codeEvidence=codeRecords.flatMap(row=>{const task=codeTasks.find(t=>t.id===row.task_id);if(!task?.area)return [];try{const report=JSON.parse(row.result).report;if(!report?.total)return [];return [{task_id:row.task_id,area:task.area,score:Math.round(report.passed/report.total*100),hinted:0,skipped:0,created_at:row.created_at}];}catch{return [];}});
   const active=await db.one("SELECT id FROM runs WHERE user_id = ? AND kind = 'baseline' AND complete = 0 ORDER BY created_at DESC LIMIT 1",user.id);
   const notes=await db.all('SELECT id, task_id, body, resolved, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY created_at DESC',user.id);
   const library=await db.all('SELECT task_id, attempt_id, created_at FROM saved_questions WHERE user_id = ? ORDER BY created_at DESC',user.id);
   const allEvidence=[...records,...codeEvidence];
   return json({user:{email:user.email},account,profile:prefs,tasks:tasks.map(publicTask),areas,goals:goalLabels,version:VERSION,attempts:records,notes,library,evidence:evidence(allEvidence),route:route(prefs,allEvidence),activeRun:active?await runData(db,user.id,active.id):null});
  }
  if(p==='/api/profile'&&method==='PUT'){
   if(!Array.isArray(body.goals)||!body.goals.length||body.goals.length>goals.length||body.goals.some(g=>!goals.includes(g))||![10,15,25].includes(body.dailyMinutes))throw fail('invalid_profile');
   const now=new Date().toISOString();const statements=[['INSERT INTO profiles (user_id, goals, daily_minutes, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET goals=excluded.goals, daily_minutes=excluded.daily_minutes, updated_at=excluded.updated_at',user.id,JSON.stringify([...new Set(body.goals)]),body.dailyMinutes,now]];
   if(body.displayName!==undefined){
    if(typeof body.displayName!=='string'||!body.displayName.trim()||body.displayName.length>80||typeof body.technologies!=='string'||body.technologies.length>500)throw fail('invalid_account');
    statements.push(['INSERT INTO accounts (user_id,display_name,technologies,created_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,technologies=excluded.technologies,updated_at=excluded.updated_at',user.id,body.displayName.trim(),body.technologies.trim(),now,now]);
   }
   await db.batch(statements);return json({saved:true});
  }
  if(p==='/api/library'&&method==='POST'){
   if(!validId(body.attemptId))throw fail('invalid_attempt');
   const attempt=await db.one('SELECT id, task_id FROM attempts WHERE id = ? AND user_id = ?',body.attemptId,user.id);if(!attempt)throw fail('attempt_not_found',404);
   await db.write('INSERT INTO saved_questions (user_id,task_id,attempt_id,created_at) VALUES (?,?,?,?) ON CONFLICT(user_id,task_id) DO UPDATE SET attempt_id=excluded.attempt_id',user.id,attempt.task_id,attempt.id,new Date().toISOString());return json({saved:true});
  }
  if(p==='/api/notes'&&method==='POST'){
   const prior=await db.one('SELECT user_id FROM notes WHERE id = ?',body.id||'');if(prior&&prior.user_id!==user.id)throw fail('note_not_found',404);
   await db.write(...noteQuery(user.id,{id:body.id,text:body.text},body.taskId));return json({saved:true});
  }
  if(p==='/api/notes'&&method==='PUT'){
   if(!validId(body.id)||typeof body.resolved!=='boolean')throw fail('invalid_note');
   const note=await db.one('SELECT id FROM notes WHERE id = ? AND user_id = ?',body.id,user.id);if(!note)throw fail('note_not_found',404);
   await db.write('UPDATE notes SET resolved = ?, updated_at = ? WHERE id = ? AND user_id = ?',body.resolved?1:0,new Date().toISOString(),body.id,user.id);return json({saved:true});
  }
  if(p==='/api/runs'&&method==='POST'){
   if(!validId(body.id)||!['baseline','practice'].includes(body.kind))throw fail('invalid_run');
   if(body.kind==='baseline'){const active=await db.one("SELECT id FROM runs WHERE user_id = ? AND kind = 'baseline' AND complete = 0",user.id);if(active)return json(await runData(db,user.id,active.id));}
   const ids=body.kind==='baseline'?baselineIds:[body.taskId];if(ids.some(id=>!tasks.find(t=>t.id===id)))throw fail('invalid_task');
   await db.write('INSERT OR IGNORE INTO runs (id,user_id,kind,task_ids,complete,created_at) VALUES (?,?,?,?,0,?)',body.id,user.id,body.kind,JSON.stringify(ids),new Date().toISOString());
   const active=body.kind==='baseline'?await db.one("SELECT id FROM runs WHERE user_id = ? AND kind = 'baseline' AND complete = 0",user.id):null;
   return json(await runData(db,user.id,active?.id||body.id));
  }
  if(p==='/api/run'&&method==='GET')return json(await runData(db,user.id,url.searchParams.get('id')));
  if(['/api/hint','/api/answer'].includes(p)&&method==='POST'){
   if(!validId(body.runId)||!validId(body.taskId))throw fail('invalid_task');
   const run=await runData(db,user.id,body.runId);const task=tasks.find(t=>t.id===body.taskId);
   if(!task||!run.taskIds.includes(task.id))throw fail('invalid_task');
   const existing=run.attempts.find(a=>a.task_id===task.id);if(existing&&p==='/api/answer')return json({attempt:existing,run});
   if(run.complete||existing||run.taskIds.find(id=>!run.attempts.some(a=>a.task_id===id))!==task.id)throw fail('task_not_current',409);
   if(p==='/api/hint'){await db.write('INSERT OR IGNORE INTO hints (run_id,task_id) VALUES (?,?)',run.id,task.id);return json({hint:task.hint});}
   if(typeof body.explanation!=='string'||body.explanation.length>6000||![0,1,2].includes(body.confidence)||typeof body.skipped!=='boolean')throw fail('invalid_answer');
   let feedback;try{feedback=grade(task,body.answer,body.skipped);}catch{throw fail('invalid_answer');}
   if(feedback.score===null)return json({feedback},422);
   const hinted=run.hints.some(h=>h.taskId===task.id)?1:0;
   const id=crypto.randomUUID();
   let noteStatements=[];
   if(body.note?.text?.trim()){
    const prior=await db.one('SELECT user_id FROM notes WHERE id = ?',body.note.id||'');if(prior&&prior.user_id!==user.id)throw fail('note_not_found',404);
    noteStatements=[noteQuery(user.id,body.note,task.id)];
   }
   await db.batch([
    ['INSERT OR IGNORE INTO attempts (id,user_id,run_id,task_id,version,area,answer_json,explanation,confidence,hinted,skipped,score,feedback_json,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',id,user.id,run.id,task.id,VERSION,task.area,JSON.stringify(body.answer??null),body.explanation.trim(),body.confidence,hinted,body.skipped?1:0,feedback.score,JSON.stringify(feedback),new Date().toISOString()],
    ['UPDATE runs SET complete = 1 WHERE id = ? AND user_id = ? AND (SELECT COUNT(*) FROM attempts WHERE run_id = ?) = ?',run.id,user.id,run.id,run.taskIds.length],...noteStatements
   ]);
   const fresh=await runData(db,user.id,run.id);return json({attempt:fresh.attempts.find(a=>a.task_id===task.id),run:fresh});
  }
  throw fail('not_found',404);
 }catch(error){if(!error.status)console.error('API storage failure',error.message);return json({error:error.status?error.message:'storage_unavailable'},error.status||503);}
}
