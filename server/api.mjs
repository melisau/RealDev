import {database} from './db.mjs';
import {tasks,areas,baselineIds,goals,goalLabels,VERSION,publicTask} from './catalog.mjs';
import {grade,evidence,route} from './assessment.mjs';
import {newsFeed,githubRepo,validateRepo} from './live.mjs';
import {execute} from '../sandbox/runtime.mjs';
import {codeTasks} from '../sandbox/tasks.mjs';
import {executePiston,runtimes as pistonRuntimes} from '../sandbox/piston.mjs';
import {exportAccount,eraseAccount} from './account.mjs';
import {capabilities,reserveAI,summarize,evaluateExplanation,transcribe} from './ai.mjs';
import {practicalTasks,publicPractice,projects,practiceProgress} from './practice.mjs';
import {polyglotTasks} from '../sandbox/polyglot-tasks.mjs';
import {gradePolyglot,polyglotEvidence} from './polyglot.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(x);
async function boundedBody(req,max){const reader=req.body?.getReader();if(!reader)return new Uint8Array();const chunks=[];let total=0;while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();throw fail('request_too_large',413);}chunks.push(value);}const bytes=new Uint8Array(total);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.length;}return bytes;}
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
   if(url.pathname==='/api/transcribe'&&method==='POST'){
    if(!(req.headers.get('content-type')||'').startsWith('multipart/form-data'))throw fail('multipart_required',415);
    const bytes=await boundedBody(req,8*1024*1024+8192);
    const form=await new Response(bytes,{headers:{'content-type':req.headers.get('content-type')}}).formData();
    if(form.get('consent')!=='yes')throw fail('ai_consent_required');
    const file=form.get('file');if(!file||typeof file.arrayBuffer!=='function'||!file.size||file.size>8*1024*1024)throw fail('invalid_audio');
    const language=form.get('language')==='en'?'en':'tr';await reserveAI(db,user.id,'audio',env);return json(await transcribe(env,file,language));
   }
   if(!(req.headers.get('content-type')||'').startsWith('application/json'))throw fail('json_required',415);
  }
  let body={};if(method!=='GET'){const text=new TextDecoder().decode(await boundedBody(req,144000));if(text.length>36000)throw fail('request_too_large',413);try{body=JSON.parse(text);}catch{throw fail('invalid_json');}if(!body||typeof body!=='object'||Array.isArray(body))throw fail('invalid_json');}
  const p=url.pathname;
  if(p==='/api/account/export'&&method==='GET')return json(await exportAccount(db,user.id));
  if(p==='/api/account/erase'&&method==='POST'){
   if(!['learning','account'].includes(body.scope)||body.confirmation!==(body.scope==='account'?'DELETE REALDEV':'RESET LEARNING'))throw fail('confirmation_required');
   return json(await eraseAccount(db,user.id,body.scope));
  }
  if(p==='/api/ai/status'&&method==='GET')return json(capabilities(env));
  if(p==='/api/news'&&method==='GET')return json({...await newsFeed(db,fetch,url.searchParams.get('refresh')==='1'),ai:capabilities(env)});
  if(p==='/api/news/summary'&&method==='POST'){
   if(body.consent!==true||typeof body.itemId!=='string'||!['tr','en'].includes(body.language))throw fail('invalid_summary_request');
   const feed=await newsFeed(db);const item=feed.items.find(i=>i.id===body.itemId);if(!item||item.stale)throw fail('news_not_current',409);
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(item.title+'\n'+item.summary+'\n'+body.language+'\n'+(env.OPENAI_TEXT_MODEL||'gpt-4.1-mini'))))).map(b=>b.toString(16).padStart(2,'0')).join('');
   const key='summary:'+hash;const saved=await db.one('SELECT payload FROM source_cache WHERE key = ?',key);if(saved)return json({...JSON.parse(saved.payload),cached:true});
   await reserveAI(db,user.id,'text',env);const result=await summarize(env,item,body.language);await db.write('INSERT OR REPLACE INTO source_cache (key,payload,fetched_at) VALUES (?,?,?)',key,JSON.stringify(result),new Date().toISOString());return json(result);
  }
  if(p==='/api/explanation'&&method==='POST'){
   if(body.consent!==true||!validId(body.attemptId))throw fail('ai_consent_required');
   const a=await db.one('SELECT * FROM attempts WHERE id = ? AND user_id = ?',body.attemptId,user.id);if(!a)throw fail('attempt_not_found',404);
   if(!a.explanation.trim())throw fail('empty_explanation');const task=tasks.find(t=>t.id===a.task_id);const language=body.language==='en'?'en':'tr';
   const prior=await db.one('SELECT result FROM practice_submissions WHERE user_id = ? AND task_id = ? AND code = ? ORDER BY created_at DESC LIMIT 1',user.id,'explanation-'+a.task_id,a.id);if(prior)return json(JSON.parse(prior.result));
   await reserveAI(db,user.id,'text',env);const result=await evaluateExplanation(env,{prompt:task.prompt[language],code:task.code||'',reference:task.explain[language],criteria:task.checks.map((c,i)=>({id:'c'+(i+1),text:c[language]})),answer:a.explanation,language});
   await db.write('INSERT INTO practice_submissions (id,user_id,task_id,modality,code,explanation,result,created_at) VALUES (?,?,?,?,?,?,?,?)',crypto.randomUUID(),user.id,'explanation-'+a.task_id,'explanation',a.id,a.explanation,JSON.stringify(result),new Date().toISOString());return json(result);
  }
  if(p==='/api/practice'&&method==='GET'){
   const records=await db.all('SELECT id,task_id,modality,code,explanation,result,created_at FROM practice_submissions WHERE user_id = ? ORDER BY created_at,id',user.id);
   return json({tasks:practicalTasks.map(publicPractice),projects:practiceProgress(records),records,ai:capabilities(env)});
  }
  if(p==='/api/practice'&&method==='POST'){
   const task=practicalTasks.find(t=>t.id===body.taskId);if(!task||!validId(body.id)||typeof body.code!=='string'||body.code.length>12000||typeof body.explanation!=='string'||body.explanation.length>6000)throw fail('invalid_practice');
   const prior=await db.one('SELECT * FROM practice_submissions WHERE id = ?',body.id);if(prior&&prior.user_id!==user.id)throw fail('practice_not_found',404);if(prior){if(prior.task_id!==task.id||prior.code!==body.code||prior.explanation!==body.explanation)throw fail('practice_conflict',409);return json({saved:true,result:JSON.parse(prior.result)});}
   if(task.project){const project=projects.find(p=>p.id===task.project);const index=project.stages.indexOf(task.id);for(const id of project.stages.slice(0,index)){const previous=await db.one('SELECT result FROM practice_submissions WHERE user_id = ? AND task_id = ? ORDER BY created_at DESC,id DESC LIMIT 1',user.id,id);let r;try{r=JSON.parse(previous?.result||'{}');}catch{r={};}if(r.verification!=='server-verified'||!r.total||r.passed!==r.total)throw fail('project_stage_locked',409);}}
   let result;if(task.modality==='review'){
    if(body.consent!==true)throw fail('ai_consent_required');if(body.explanation.trim().length<40)throw fail('explanation_too_short');await reserveAI(db,user.id,'text',env);
    const language=body.language==='en'?'en':'tr';result=await evaluateExplanation(env,{prompt:task.prompt[language],code:task.code,reference:task.reference,criteria:task.criteria.map(c=>({id:c.id,text:c.text[language]})),answer:body.explanation,language});
   }else{if(!body.code.trim())throw fail('empty_code');result=await execute(body.code,task.id);result.verification='server-verified';}
   await db.write('INSERT INTO practice_submissions (id,user_id,task_id,modality,code,explanation,result,created_at) VALUES (?,?,?,?,?,?,?,?)',body.id,user.id,task.id,task.modality,body.code,body.explanation,JSON.stringify(result),new Date().toISOString());return json({saved:true,result});
  }
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
  if(p==='/api/polyglot-runs'&&method==='POST'){
   const task=polyglotTasks.find(t=>t.id===body.taskId);
   if(!task||!validId(body.id)||typeof body.code!=='string'||!body.code.trim()||body.code.length>12000)throw fail('invalid_code_run');
   const prior=await db.one('SELECT user_id,task_id,code,result FROM code_runs WHERE id = ?',body.id);
   if(prior&&prior.user_id!==user.id)throw fail('code_run_not_found',404);
   if(prior&&(prior.task_id!==task.id||prior.code!==body.code))throw fail('code_run_conflict',409);
   if(prior)return json({saved:true,verification:'server-verified',result:JSON.parse(prior.result).report});
   const since=new Date(Date.now()-15*60*1000).toISOString();
   const usage=await db.one("SELECT COUNT(*) AS count FROM code_runs WHERE user_id = ? AND task_id LIKE 'polyglot-%' AND created_at >= ?",user.id,since);
   if(usage.count>=12)throw fail('polyglot_rate_limited',429);
   const report=await gradePolyglot(env,task.id,body.code);
   await db.write('INSERT INTO code_runs (id,user_id,task_id,code,result,created_at) VALUES (?,?,?,?,?,?)',body.id,user.id,task.id,body.code,JSON.stringify({verification:'server-verified',report}),new Date().toISOString());
   return json({saved:true,verification:'server-verified',result:report});
  }
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
   const codeEvidence=codeRecords.flatMap(row=>{if(row.task_id.startsWith('polyglot-'))return polyglotEvidence(row);const task=codeTasks.find(t=>t.id===row.task_id);if(!task?.area)return [];try{const report=JSON.parse(row.result).report;if(!report?.total)return [];return [{task_id:row.task_id,area:task.area,score:Math.round(report.passed/report.total*100),hinted:0,skipped:0,created_at:row.created_at}];}catch{return [];}});
   const active=await db.one("SELECT id FROM runs WHERE user_id = ? AND kind = 'baseline' AND complete = 0 ORDER BY created_at DESC LIMIT 1",user.id);
   const notes=await db.all('SELECT id, task_id, body, resolved, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY created_at DESC',user.id);
   const library=await db.all('SELECT task_id, attempt_id, created_at FROM saved_questions WHERE user_id = ? ORDER BY created_at DESC',user.id);
   const practiceRecords=await db.all('SELECT * FROM practice_submissions WHERE user_id = ? ORDER BY created_at,id',user.id);
   const practicalEvidence=practiceRecords.flatMap(row=>{const task=practicalTasks.find(t=>t.id===row.task_id);if(!task)return [];const result=JSON.parse(row.result);return [{task_id:task.id,area:task.area,score:result.verification==='server-verified'&&result.total?Math.round(result.passed/result.total*100):result.score||0,modality:task.modality,verification:result.verification,hinted:0,skipped:0,created_at:row.created_at}];});
   for(const row of codeEvidence){const task=codeTasks.find(t=>t.id===row.task_id);row.modality=row.modality||task?.modality||'code';row.verification='server-verified';}
   const allEvidence=[...records,...codeEvidence,...practicalEvidence];
   return json({user:{email:user.email},account,profile:prefs,tasks:tasks.map(publicTask),areas,goals:goalLabels,version:VERSION,attempts:records,notes,library,evidence:evidence(allEvidence),route:route(prefs,allEvidence),projects:practiceProgress(practiceRecords),ai:capabilities(env),activeRun:active?await runData(db,user.id,active.id):null});
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
