import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {assignment,validateDelivery,deliveryHash,DELIVERY_VERSION} from './contracts.mjs';
export const images={python:'python:3.12-slim@sha256:a6e34c598f2467ed0e9a8d349809fcd8b5c603269512df273a0bb1784edc11b1',dotnet:'realdev-project-dotnet:20261015',tester:'realdev-project-tester:20261015'};
const limits=['--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--pids-limit','128','--memory','1g','--cpus','1','--tmpfs','/tmp:rw,nosuid,size=64m','--tmpfs','/work:rw,exec,nosuid,size=192m,mode=1777'];
export function dockerCommand(args,{timeout=120000,max=64000}={}){return new Promise((resolve,reject)=>{let stdout='',stderr='',bytes=0,settled=false;const child=spawn('docker',args,{windowsHide:true,stdio:['ignore','pipe','pipe']});const finish=(error,result)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(result);};const timer=setTimeout(()=>{child.kill();finish(Error('project_timeout'));},timeout);for(const [stream,name] of [[child.stdout,'stdout'],[child.stderr,'stderr']])stream.on('data',chunk=>{bytes+=chunk.length;if(bytes>max){child.kill();finish(Error('project_output_limit'));return;}if(name==='stdout')stdout+=chunk;else stderr+=chunk;});child.on('error',()=>finish(Error('docker_unavailable')));child.on('close',code=>finish(null,{code,stdout,stderr}));});}
export async function runnerCapabilities(unityImage=process.env.PROJECT_UNITY_IMAGE){let docker=false;try{docker=(await dockerCommand(['version','--format','{{.Server.Version}}'],{timeout:5000})).code===0;}catch{}const present=async name=>{try{return docker&&(await dockerCommand(['image','inspect',name,'--format','{{.Id}}'],{timeout:5000})).code===0;}catch{return false;}};const [py,net,tester,unity]=await Promise.all([present(images.python),present(images.dotnet),present(images.tester),unityImage?present(unityImage):false]);return {suiteVersion:DELIVERY_VERSION,assignments:[{id:'booking-api',available:py&&tester},{id:'dotnet-board',available:net&&tester},{id:'unity-quest',available:!!unity,reason:unity?'':'unity_image_not_configured'}]};}
export async function runProject(input,{jobId,unityImage=process.env.PROJECT_UNITY_IMAGE,command=dockerCommand}={}){
 const clean=validateDelivery(input),a=assignment(clean.assignmentId),hash=await deliveryHash(clean);
 if(!/^[a-f0-9]{32,64}$/.test(jobId||''))throw Error('invalid_job_id');
 const directory=await mkdtemp(join(tmpdir(),'realdev-delivery-')),source=join(directory,'source'),appName='rd-app-'+jobId,testName='rd-test-'+jobId,volume='rd-data-'+jobId;
 const run=async(args,opts)=>{const r=await command(args,opts);if(r.code!==0){const error=Error('project_container_failed');error.stderr=r.stderr;throw error;}return r;};
 try{
  await mkdir(source);for(const file of clean.files){const target=resolve(source,file.path);if(!target.startsWith(resolve(source)+requireSeparator()))throw Error('invalid_delivery_file');await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,file.content);}
  await run(['volume','create','--label','realdev.delivery='+jobId,volume]);
  await run(['run','--rm','--network','none','--cap-drop','ALL','--cap-add','CHOWN','--mount','type=volume,source='+volume+',target=/data',images.python,'python','-c','import os; os.chmod("/data",0o700); os.chown("/data",10001,10001)']);
  if(a.runtime==='unity')return await runUnity({clean,hash,a,source,appName,testName,volume,jobId,unityImage,run,command});
  const start=['run','-d','--name',appName,'--label','realdev.delivery='+jobId,...limits,'--user','10001:10001','--mount','type=bind,source='+source+',target=/submission,readonly','--mount','type=volume,source='+volume+',target=/data','--env','SQLITE_PATH=/data/submission.db','--env','PYTHONDONTWRITEBYTECODE=1','--env','DOTNET_gcServer=0','--workdir','/submission',images[a.runtime]];
  if(a.runtime==='python')start.push('python','app.py');
  await run(start);
  const test=async phase=>{const result=await run(['run','--rm','--name',testName,'--network','container:'+appName,'--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--pids-limit','32','--memory','128m','--cpus','1','--user','10001:10001','--mount','type=volume,source='+volume+',target=/data,readonly',images.tester,a.id,phase,jobId],{timeout:65000});const report=JSON.parse(result.stdout);return report.cases;};
  const cases=await test('initial');await run(['restart',appName],{timeout:15000});cases.push(...await test('restart'));
  return {assignmentId:a.id,sourceHash:hash,suiteVersion:DELIVERY_VERSION,runner:'docker-project',engine:a.runtime,scope:'contract-acceptance',cases};
 }finally{
  for(const args of [['rm','-f',testName],['rm','-f',appName],['volume','rm','-f',volume]])try{await command(args,{timeout:10000,max:2000});}catch{}
  const absolute=resolve(directory);if(!absolute.startsWith(resolve(tmpdir())+requireSeparator())||!absolute.includes('realdev-delivery-'))throw Error('unsafe_cleanup');await rm(absolute,{recursive:true,force:true});
 }
}
function requireSeparator(){return process.platform==='win32'?'\\':'/';}
async function runUnity({clean,hash,a,source,appName,volume,jobId,unityImage,run}){
 if(!unityImage||!/^[-a-zA-Z0-9./:@_]+$/.test(unityImage))throw Error('unity_image_not_configured');
 // An operator-prepared, activated disposable image is required. Never pass account passwords into jobs.
 await run(['run','--name',appName,'--label','realdev.delivery='+jobId,...limits,'--memory','3g','--pids-limit','256','--tmpfs','/work:rw,exec,nosuid,size=1g,mode=1777','--user','10001:10001','--mount','type=bind,source='+source+',target=/submission,readonly','--mount','type=volume,source='+volume+',target=/results',unityImage],{timeout:180000,max:64000});
 const report=await run(['run','--rm','--network','none','--read-only','--cap-drop','ALL','--mount','type=volume,source='+volume+',target=/results,readonly',images.python,'python','-c',`import json,xml.etree.ElementTree as ET\ncases=[]\nfor phase in ['EditMode','PlayMode']:\n root=ET.parse('/results/'+phase+'.xml').getroot()\n for c in root.iter('test-case'):\n  name=c.get('name','');cases.append({'id':phase+'.'+name,'pass':c.get('result')=='Passed','detail':(c.findtext('failure/message') or '')[:500]})\nprint(json.dumps({'cases':cases}))`]);
 return {assignmentId:a.id,sourceHash:hash,suiteVersion:DELIVERY_VERSION,runner:'docker-project',engine:'unity',scope:'editor-editmode-playmode',cases:JSON.parse(report.stdout).cases};
}
