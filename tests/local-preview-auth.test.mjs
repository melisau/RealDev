import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../web/auth.js',import.meta.url),'utf8');

function boot(location){
 let onReady;let fetches=0;let redirected='';
 const link={hidden:false,dataset:{},setAttribute(){},addEventListener(){}};
 const document={documentElement:{},title:'',getElementById:id=>id==='authLink'?link:null,querySelector:()=>null,addEventListener:(name,callback)=>{if(name==='DOMContentLoaded')onReady=callback;}};
 const window={fetch:async()=>{fetches++;return new Response('{"configured":false}',{headers:{'content-type':'application/json'}});}};
 const context={window,document,location:{...location,replace:url=>{redirected=url;}},localStorage:{getItem:()=>null,setItem(){}},URL,Promise,Response,Headers,CustomEvent:class{}};
 runInNewContext(source,context);
 return {context,document,get fetches(){return fetches;},get redirected(){return redirected;},ready:()=>onReady()};
}

test('localhost preview gets a disposable preview identity and skips Firebase sign-in',async()=>{
 const app=boot({protocol:'http:',hostname:'127.0.0.1',port:'4317',pathname:'/'});
 assert.equal(app.context.window.realdevLocalPreview,true);
 assert.equal(app.context.window.realdevCurrentUser.emailVerified,true);
 assert.equal(app.context.window.realdevCurrentUser.uid,'local-preview-user');
 await app.context.window.realdevSessionReady;
 await app.context.window.realdevAuthReady;
 assert.equal(app.context.window.realdevCurrentUser.uid,'local-preview-user');
 await app.ready();
 assert.equal(app.fetches,0);
 assert.equal(app.redirected,'');
});

test('local preview auth URL returns to the app instead of showing disabled Firebase fields',async()=>{
 const app=boot({protocol:'http:',hostname:'127.0.0.1',port:'4317',pathname:'/auth.html'});
 await app.ready();
 assert.equal(app.redirected,'/#today');
 assert.equal(app.fetches,0);
});

test('production hostname does not receive the local preview identity',async()=>{
 const app=boot({protocol:'https:',hostname:'realdev.example',port:'',pathname:'/'});
 assert.equal(app.context.window.realdevLocalPreview,false);
 assert.equal(app.context.window.realdevCurrentUser,null);
 await app.context.window.realdevAuthReady;
 assert.equal(app.fetches,1);
});
