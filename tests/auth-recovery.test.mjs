import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../web/auth.js',import.meta.url),'utf8');
async function boot({hash='',resetImpl=async()=>{},configured=true}={}){
 const nodes=new Map(),callbacks=new Map(),storage=new Map(),timers=[],calls=[];
 let now=100000,redirect='';
 for(const id of ['authForm','authHeading','authLanguageToggle','authSubmit','signInTab','signUpTab','resendVerification','authEmail','authPassword','authPasswordLabel','forgotPassword','backToSignIn','resetDescription','authStatus','resetWait']){
  const events=new Map(),attributes=new Map();
  const element={id,value:'',textContent:'',hidden:['resendVerification','backToSignIn','resetDescription','resetWait'].includes(id),disabled:false,required:['authEmail','authPassword'].includes(id),dataset:{},autocomplete:'',events,
   addEventListener:(name,cb)=>events.set(name,cb),
   setAttribute:(name,value)=>attributes.set(name,value),removeAttribute:name=>attributes.delete(name),getAttribute:name=>attributes.get(name),
   focus(){this.focused=true;},
   reportValidity(){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nodes.get('authEmail').value)&&(!nodes.get('authPassword').required||nodes.get('authPassword').value.length>=8);},
   emit(name){return events.get(name)?.({preventDefault(){}});}
  };
  nodes.set(id,element);
 }
 const client={currentUser:null,languageCode:null,setPersistence:async()=>{},onAuthStateChanged:cb=>cb(null),
  sendPasswordResetEmail:async(...args)=>{calls.push({args,language:client.languageCode});return resetImpl(...args);},
  signInWithEmailAndPassword:async()=>{throw Error('Reset must not sign in');},createUserWithEmailAndPassword:async()=>{throw Error('Reset must not create users');},signOut:async()=>{}
 };
 const auth=()=>client;auth.Auth={Persistence:{SESSION:'session'}};
 const document={documentElement:{},title:'',getElementById:id=>nodes.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[...nodes.values()].filter(n=>['authEmail','authPassword','authSubmit','signInTab','signUpTab','forgotPassword','backToSignIn'].includes(n.id)),
  addEventListener:(name,cb)=>callbacks.set(name,cb),createElement:()=>({}),head:{appendChild:el=>queueMicrotask(()=>el.onload?.())}};
 const location={protocol:'https:',hostname:'realdev.example',port:'',pathname:'/auth.html',origin:'https://realdev.example',href:'https://realdev.example/auth.html',hash,assign:url=>redirect=url,replace:url=>redirect=url};
 const window={fetch:async()=>Response.json({configured,apiKey:'test-public-key',projectId:'test-project'}),firebase:{initializeApp:()=>({auth}),auth},dispatchEvent(){}};
 runInNewContext(source,{window,document,location,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,v)=>storage.set(key,v)},URL,Response,Headers,Promise,CustomEvent:class{},Date:class extends Date{static now(){return now;}},setTimeout:cb=>timers.push(cb)});
 await window.realdevAuthReady;await callbacks.get('DOMContentLoaded')();
 return {nodes,calls,window,client,document,storage,get redirect(){return redirect;},advance(){now+=60000;timers.splice(0).forEach(cb=>cb());}};
}
test('recovery needs only email, clears password and returns to a usable sign-in form',async()=>{
 const a=await boot(),n=a.nodes;
 n.get('authEmail').value='dev@example.com';n.get('authPassword').value='never-send-this';
 await n.get('forgotPassword').emit('click');
 assert.equal(n.get('authPassword').value,'');
 assert.equal(n.get('authPassword').hidden,true);
 assert.equal(n.get('authPassword').disabled,true);
 assert.equal(n.get('authPassword').required,false);
 assert.equal(n.get('resetDescription').hidden,false);
 assert.equal(n.get('authEmail').focused,true);
 await n.get('authForm').emit('submit');
 assert.equal(a.calls.length,1);
 assert.equal(a.calls[0].args.length,2);
 assert.equal(a.calls[0].args[0],'dev@example.com');
 assert.equal(a.calls[0].args[1].url,'https://realdev.example/auth.html#/sign-in');
 assert.equal(a.calls[0].args[1].handleCodeInApp,false);
 assert.equal(a.calls[0].language,'tr');
 assert.doesNotMatch(JSON.stringify(a.calls),/never-send-this/);
 assert.match(n.get('authStatus').textContent,/bir hesap varsa/);
 assert.equal(a.redirect,'');
 await n.get('backToSignIn').emit('click');
 assert.equal(n.get('authPassword').hidden,false);
 assert.equal(n.get('authPassword').required,true);
 assert.equal(n.get('authPassword').disabled,false);
 assert.equal(n.get('authSubmit').disabled,false);
});
test('unknown email and successful reset have identical visible results',async()=>{
 const messages=[];
 for(const resetImpl of [async()=>{},async()=>{throw {code:'auth/user-not-found'};}]){
  const a=await boot({hash:'#/reset-password',resetImpl});
  a.nodes.get('authEmail').value='dev@example.com';
  await a.nodes.get('authForm').emit('submit');
  messages.push(a.nodes.get('authStatus').textContent);
  assert.equal(a.nodes.get('resetWait').hidden,false);
 }
 assert.equal(messages[0],messages[1]);
});
test('invalid email makes no request; offline and provider limits remain recoverable',async()=>{
 const a=await boot({hash:'#/reset-password',resetImpl:async()=>{throw {code:'auth/network-request-failed'};}});
 a.nodes.get('authEmail').value='not-email';
 await a.nodes.get('authForm').emit('submit');
 assert.equal(a.calls.length,0);
 a.nodes.get('authEmail').value='dev@example.com';
 await a.nodes.get('authForm').emit('submit');
 assert.match(a.nodes.get('authStatus').textContent,/İnternetini/);
 assert.equal(a.nodes.get('authSubmit').disabled,false);
 assert.equal(a.nodes.get('backToSignIn').disabled,false);
 assert.equal(a.nodes.get('authForm').getAttribute('aria-busy'),undefined);
 const b=await boot({hash:'#/reset-password',resetImpl:async()=>{throw {code:'auth/too-many-requests',message:'provider secret details'};}});
 b.nodes.get('authEmail').value='dev@example.com';
 await b.nodes.get('authForm').emit('submit');
 assert.match(b.nodes.get('authStatus').textContent,/Çok fazla/);
 assert.doesNotMatch(b.nodes.get('authStatus').textContent,/provider secret/);
});
test('pending and accepted requests cannot be duplicated; cooldown survives mode changes',async()=>{
 let release;const waiting=new Promise(resolve=>release=resolve);
 const a=await boot({hash:'#/reset-password',resetImpl:()=>waiting}),n=a.nodes;
 n.get('authEmail').value='dev@example.com';
 const pending=n.get('authForm').emit('submit');
 assert.equal(n.get('authSubmit').disabled,true);
 assert.equal(n.get('authForm').getAttribute('aria-busy'),'true');
 await n.get('authForm').emit('submit');
 assert.equal(a.calls.length,1);
 release();await pending;
 await n.get('backToSignIn').emit('click');
 await n.get('forgotPassword').emit('click');
 assert.equal(n.get('authSubmit').disabled,true);
 await n.get('authForm').emit('submit');
 assert.equal(a.calls.length,1);
 a.advance();
 assert.equal(n.get('authSubmit').disabled,false);
 await n.get('authForm').emit('submit');
 assert.equal(a.calls.length,2);
});
test('English recovery and provider email locale update together',async()=>{
 const a=await boot({hash:'#/reset-password'}),n=a.nodes;
 await n.get('authLanguageToggle').emit('click');
 assert.equal(a.document.title,'RealDeveloper · Reset password');
 assert.equal(n.get('authHeading').textContent,'Reset your password');
 n.get('authEmail').value='dev@example.com';
 await n.get('authForm').emit('submit');
 assert.equal(a.calls[0].language,'en');
 assert.match(n.get('authStatus').textContent,/If an account/);
 await n.get('authLanguageToggle').emit('click');
 assert.match(n.get('authStatus').textContent,/bir hesap varsa/);
});
test('unavailable Firebase disables recovery instead of pretending to send an email',async()=>{
 const a=await boot({configured:false});
 assert.equal(a.nodes.get('forgotPassword').disabled,true);
 assert.equal(a.calls.length,0);
});
