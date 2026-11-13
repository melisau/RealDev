import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';import {spawnSync} from 'node:child_process';
import {installRuntimes,wanted} from '../deploy/runner/install-runtimes.mjs';
import {checkRunner} from '../deploy/runner/health.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const key='k'.repeat(64);

test('runtime installer installs only missing Python/C#/Java packages over loopback and fails on an unknown version',async()=>{
 const posts=[],calls=[];
 const fetcher=async(url,init={})=>{calls.push(url);if(url.endsWith('/runtimes'))return Response.json([{language:'python',version:'3.12.0',aliases:[]}]);
  if(url.endsWith('/packages')&&init.method==='POST'){posts.push(JSON.parse(init.body));return Response.json({});}
  return Response.json(wanted.map(w=>({language:w.packages[0],language_version:w.version})));};
 assert.deepEqual(await installRuntimes({fetcher,log(){}}),['C#','Java']);
 assert.deepEqual(posts,[{language:'mono',version:'6.12.0'},{language:'java',version:'15.0.2'}]);
 assert.ok(calls.every(u=>u.startsWith('http://127.0.0.1:2000/')));
 await assert.rejects(installRuntimes({fetcher:async url=>url.endsWith('/runtimes')?Response.json([]):Response.json([]),log(){}}),/piston_package_missing_python/);
});

function healthMocks(over={}){
 const env=[];return {
  key,log(){},
  fetcher:async(url,init={})=>{if(url.endsWith('/runtimes'))return new Response('{}',{status:over.anonymousStatus??401});
   assert.equal(init.headers.Authorization,'Bearer '+key);return Response.json(over.caps??{assignments:[{id:'booking-api',available:true},{id:'dotnet-board',available:true},{id:'unity-quest',available:false}]});},
  list:async e=>{env.push(e);return (over.runtimes??['python','csharp','java']).map(id=>({id}));},
  execute:async(e,item)=>({exitCode:0,signal:null,stdout:over.stdout?.[item.language]??'42\n'}),env};
}
test('health check proves auth, real execution in three languages and project assignments',async()=>{
 const m=healthMocks();const r=await checkRunner(m);
 assert.deepEqual(r,{runtimes:['python','csharp','java'],projects:['booking-api','dotnet-board']});
 assert.deepEqual(m.env[0],{PISTON_URL:'http://127.0.0.1:2001',PISTON_API_KEY:key});
 const fails=[[{anonymousStatus:200},/gateway_accepts_unauthenticated_requests_200/],[{runtimes:['python','java']},/runtime_missing_csharp/],[{stdout:{java:'41'}},/execution_failed_java/],[{caps:{assignments:[{id:'booking-api',available:true}]}},/project_assignment_unavailable_dotnet-board/]];
 for(const [over,pattern] of fails){const error=await checkRunner(healthMocks(over)).catch(e=>e);assert.match(error.message,pattern);assert.equal(error.message.includes(key),false,'errors never contain the key');}
 await assert.rejects(checkRunner({...healthMocks(),key:'short'}),/runner_key_missing/);
});

test('runner compose keeps Piston and both gateways on loopback and stores no secrets',()=>{
 const compose=read('deploy/runner/compose.yml');
 assert.match(compose,/"127\.0\.0\.1:2000:2000"/);
 assert.equal((compose.match(/^\s+- "\d/gm)||[]).length,1,'no other published ports');
 assert.equal((compose.match(/network_mode: host/g)||[]).length,2,'gateway anchor and caddy use host networking');
 assert.match(compose,/env_file: \/etc\/realdev\/runner\.env/);
 assert.doesNotMatch(compose,/PISTON_API_KEY\s*[:=]/);
 assert.match(compose,/TMPDIR: \/var\/lib\/realdev\/jobs/);
 assert.match(compose,/\/var\/lib\/realdev\/jobs:\/var\/lib\/realdev\/jobs/,'job sources resolve to the same host path');
 const caddy=read('deploy/runner/Caddyfile');assert.match(caddy,/reverse_proxy 127\.0\.0\.1:2001/);assert.match(caddy,/max_size 300KB/);
 for(const line of read('deploy/runner/Dockerfile.gateway').split('\n').filter(l=>l.startsWith('COPY ')))for(const src of line.slice(5).trim().split(/\s+/).slice(0,-1))assert.ok(existsSync(new URL('../'+src,import.meta.url)),'missing COPY source '+src);
});

test('deploy workflow runs only for production, tests first, pins the host key and checks the public endpoint',()=>{
 const wf=read('.github/workflows/deploy-runner.yml');
 assert.match(wf,/push:\n\s+branches: \[production\]/);
 assert.match(wf,/needs: verify/);assert.match(wf,/if: \$\{\{ vars\.RUNNER_DOMAIN != '' \}\}/,'deploy waits until the host is configured');assert.match(wf,/npm test/);assert.match(wf,/npm run build/);
 assert.match(wf,/StrictHostKeyChecking=yes/);assert.doesNotMatch(wf,/StrictHostKeyChecking=no|ssh-keyscan/);
 assert.match(wf,/"deploy@\$HOST" "\$GITHUB_SHA"/);assert.match(wf,/test "\$code" = 401/);
 assert.match(wf,/permissions:\n\s+contents: read/);
});

test('server scripts are valid shell, deploy only production commits and the SSH key can only request a SHA',()=>{
 for(const f of ['deploy-runner.sh','ssh-deploy.sh','setup-server.sh']){const r=spawnSync('bash',['-n','deploy/runner/'+f]);assert.equal(r.status,0,f+': '+r.stderr);}
 const deploy=read('deploy/runner/deploy-runner.sh');
 assert.match(deploy,/\^\[0-9a-f\]\{40\}\$/);assert.match(deploy,/merge-base --is-ancestor "\$SHA" "origin\/\$BRANCH"/);assert.match(deploy,/BRANCH=production/);
 assert.match(deploy,/rolling back/);assert.match(deploy,/flock -n/);
 for(const cmd of ['ls','bash -i','$(id)',`${'a'.repeat(40)}; id`,'']){const r=spawnSync('bash',['deploy/runner/ssh-deploy.sh'],{env:{...process.env,SSH_ORIGINAL_COMMAND:cmd}});assert.equal(r.status,2,'refused: '+JSON.stringify(cmd));}
 const setup=read('deploy/runner/setup-server.sh');
 assert.match(setup,/command="\/opt\/realdev\/bin\/ssh-deploy\.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty/);
 assert.match(setup,/NOPASSWD: \/opt\/realdev\/bin\/deploy-runner\.sh\\n/);assert.match(setup,/visudo -cf/);
 assert.match(setup,/umask 077; printf 'PISTON_API_KEY=%s\\n' "\$\(openssl rand -hex 32\)"/);
 assert.doesNotMatch(setup,/echo[^\n]*PISTON_API_KEY=/,'the generated key is never echoed');
 assert.match(setup,/ufw allow 80\/tcp/);assert.match(setup,/ufw allow 443\/tcp/);
});
