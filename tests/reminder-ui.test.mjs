import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../web/reminders.js',import.meta.url),'utf8');
function setup({permission=()=>Promise.resolve('granted'),failSave=false,hangFetch=false}={}){
 const timers=new Map(),handlers={},calls=[],status={textContent:''},count={textContent:''};let timerId=0,subscribed=0;
 const controls=['save','enable','test','remove','close'].map(action=>({dataset:{reminder:action},disabled:false}));
 const fields={'#reminderEnabled':{checked:false},'#reminderTime':{value:'19:00'},'#reminderZone':{value:'Europe/Istanbul'}};
 const dialog={open:false,innerHTML:'',showModal(){this.open=true;},close(){this.open=false;handlers.close?.();},addEventListener(name,fn){handlers[name]=fn;},querySelector(selector){return selector==='[role=status]'?status:selector==='[data-device-count]'?count:fields[selector];},querySelectorAll(){return controls;}};
 const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/example',toJSON(){return {endpoint:this.endpoint};},unsubscribe:async()=>true};
 const reg={pushManager:{getSubscription:async()=>null,subscribe:async()=>{subscribed++;return subscription;}}};
 const state={settings:{enabled:false,time:'19:00',timezone:'Europe/Istanbul',language:'tr'},devices:0,publicKey:'YQ',configured:true,scheduled:false,lastDispatch:null};
 const window={isSecureContext:true,realdevLocale:'tr',PushManager(){},Notification:{requestPermission:permission,permission:'default'}};
 const context={window,document:{createElement:()=>dialog,body:{append(){}}},navigator:{serviceWorker:{register:async()=>reg,ready:Promise.resolve(reg)}},Notification:window.Notification,Intl,Date,URLSearchParams,Uint8Array,AbortController,location:{search:''},esc:s=>s,atob:s=>Buffer.from(s,'base64').toString('binary'),setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id),fetch:async(path,options)=>{
  calls.push({path,options});if(hangFetch)return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(Error('aborted'),{name:'AbortError'}))));
  if(path.endsWith('/subscription'))state.devices++;
  if(path==='/api/reminders'&&options.method==='PUT'){
   if(failSave)return {ok:false,json:async()=>({error:'unavailable'})};
   state.settings=JSON.parse(options.body);
  }
  return {ok:true,json:async()=>({...state})};
 }};
 vm.runInNewContext(source,context);
 return {dialog,status,count,calls,controls,open:()=>window.realdevReminders(),click:action=>handlers.click({target:{closest:()=>controls.find(n=>n.dataset.reminder===action)}}),expire(ms){for(const [id,item] of [...timers])if(item.ms===ms){timers.delete(id);item.fn();}},get subscribed(){return subscribed;}};
}
test('unanswered permission times out, unlocks controls and never saves an enabled preference',async()=>{
 const ui=setup({permission:()=>new Promise(()=>{})});await ui.open();const running=ui.click('enable');assert.equal(ui.controls[0].disabled,true);
 await ui.click('test');assert.equal(ui.calls.length,1);ui.expire(30000);await running;
 assert.match(ui.status.textContent,/zaman aşımına/);assert.equal(ui.controls[1].disabled,false);assert.equal(ui.subscribed,0);assert.equal(ui.calls.length,1);
});
test('permission denial does not create subscriptions and the dialog remains usable',async()=>{
 const ui=setup({permission:()=>Promise.resolve('denied')});await ui.open();await ui.click('enable');assert.match(ui.status.textContent,/izni verilmedi/);assert.equal(ui.calls.length,1);assert.equal(ui.controls[1].disabled,false);
});
test('device connection never claims paused daily scheduling is active',async()=>{
 const ui=setup();await ui.open();await ui.click('enable');assert.equal(ui.subscribed,1);assert.match(ui.count.textContent,/1/);assert.equal(ui.dialog.querySelector('#reminderEnabled').checked,true);
 assert.match(ui.status.textContent,/günlük teslimat başlamadı/);assert.match(ui.status.textContent,/Test bildiriminin/);
});
test('partial server failure does not claim success or visually enable an unsaved preference',async()=>{
 const ui=setup({failSave:true});await ui.open();await ui.click('enable');assert.equal(ui.dialog.querySelector('#reminderEnabled').checked,false);assert.match(ui.status.textContent,/tamamlanamadı/);assert.equal(ui.controls[1].disabled,false);
});
test('closing during permission prevents late approval from writing an old dialog',async()=>{
 let resolve;const ui=setup({permission:()=>new Promise(r=>resolve=r)});await ui.open();const running=ui.click('enable');await ui.click('close');resolve('granted');await running;assert.equal(ui.calls.length,1);assert.equal(ui.subscribed,0);
});
test('a stalled settings request aborts and replaces loading with a recoverable message',async()=>{
 const ui=setup({hangFetch:true});const loading=ui.open();ui.expire(15000);await loading;assert.match(ui.status.textContent,/Sunucu yanıt vermedi/);
});