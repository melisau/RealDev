// Installs the Piston language packages RealDev uses. Talks to Piston's package API on loopback only; the public
// gateway never exposes package management. Idempotent: already-installed runtimes are skipped.
import {pathToFileURL} from 'node:url';

export const wanted=[
 {id:'Python',names:['python'],packages:['python'],version:'3.12.0'},
 {id:'C#',names:['csharp'],packages:['mono'],version:'6.12.0'},
 {id:'Java',names:['java'],packages:['java'],version:'15.0.2'}
];
const matches=(row,names)=>names.includes(row.language)||(row.aliases||[]).some(alias=>names.includes(alias));

export async function waitForPiston({base='http://127.0.0.1:2000/api/v2',fetcher=fetch,attempts=90,delay=2000}={}){
 for(let i=0;i<attempts;i++){try{const r=await fetcher(base+'/runtimes',{signal:AbortSignal.timeout(3000)});if(r.ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,delay));}
 throw Error('piston_not_ready');
}

export async function installRuntimes({base='http://127.0.0.1:2000/api/v2',fetcher=fetch,log=console.log}={}){
 const json=async(path,init)=>{const r=await fetcher(base+path,{...init,signal:AbortSignal.timeout(600000)});if(!r.ok)throw Error(`piston_${path.slice(1)}_http_${r.status}`);return r.json();};
 const available=await json('/runtimes'),packages=await json('/packages'),installed=[];
 for(const language of wanted){
  if(available.some(row=>matches(row,language.names)&&row.version===language.version)){log(`${language.id} ${language.version} already installed`);continue;}
  const pkg=packages.find(p=>language.packages.includes(p.language)&&p.language_version===language.version);
  if(!pkg)throw Error(`piston_package_missing_${language.packages[0]}_${language.version}`);
  log(`Installing ${pkg.language} ${pkg.language_version}...`);
  await json('/packages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:pkg.language,version:pkg.language_version})});
  installed.push(language.id);
 }
 return installed;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{await waitForPiston();await installRuntimes();}catch(error){console.error('Runtime installation failed: '+error.message);process.exitCode=1;}
}
