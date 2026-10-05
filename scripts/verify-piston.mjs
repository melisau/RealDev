import {executePiston,runtimes} from '../sandbox/piston.mjs';

if(!process.env.PISTON_URL)throw Error('Set PISTON_URL to the runner origin; set PISTON_API_KEY for the authenticated gateway');
const env={PISTON_URL:process.env.PISTON_URL,PISTON_API_KEY:process.env.PISTON_API_KEY};
const cases=[
 {language:'python',code:'print(6 * 7)'},
 {language:'csharp',code:'using System; class Program { static void Main() { Console.WriteLine(6 * 7); } }'},
 {language:'java',code:'public class Main { public static void main(String[] args) { System.out.println(6 * 7); } }'}
];
const available=await runtimes(env);console.log('Available runtimes:',available.map(r=>`${r.label} ${r.version}`).join(', '));
let failed=false;
for(const item of cases){
 try{
  const result=await executePiston(env,item),ok=result.exitCode===0&&!result.signal&&result.stdout.trim()==='42';
  console.log(`${item.language}: ${ok?'PASS':'FAIL'} (${result.version}, exit ${result.exitCode})`);if(!ok)failed=true;
 }catch(error){console.log(`${item.language}: FAIL (${error.message})`);failed=true;}
}
if(failed)process.exitCode=1;
