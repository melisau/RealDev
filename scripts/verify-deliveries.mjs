import {readFile} from 'node:fs/promises';import {randomBytes} from 'node:crypto';import {runProject,dockerCommand} from '../delivery/docker-runner.mjs';import {starterFor} from '../delivery/contracts.mjs';
const fixture=async(path,source)=>({path,content:await readFile(new URL('../delivery/fixtures/'+source,import.meta.url),'utf8')});
const mode=process.argv[2]||'references',results=[];
for(const assignmentId of (process.argv[3]?[process.argv[3]]:['booking-api','dotnet-board'])){
 const files=assignmentId==='booking-api'?[await fixture('app.py','booking-app.py'),await fixture('store.py','booking-store.py')]:await Promise.all(['Program.cs','Store.cs','Models.cs'].map(name=>fixture('src/'+name,name)));
 const payload=mode==='starters'?starterFor(assignmentId):{assignmentId,files};
 const report=await runProject(payload,{jobId:randomBytes(16).toString('hex'),command:async(args,opts)=>{if(process.env.PROJECT_VERIFY_DEBUG&&args[0]==='rm'&&args.at(-1).startsWith('rd-app-')){const logs=await dockerCommand(['logs',args.at(-1)],{max:20000});console.error(logs.stdout+logs.stderr);}return dockerCommand(args,opts);}});const passed=report.cases.filter(c=>c.pass).length;results.push({assignmentId,passed,total:report.cases.length,cases:report.cases});console.log(JSON.stringify(results.at(-1)));
 if(mode==='references'&&passed!==report.cases.length)process.exitCode=1;if(mode==='starters'&&passed===report.cases.length)process.exitCode=1;
}
