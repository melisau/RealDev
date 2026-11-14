import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {securityHeaders,withSecurityHeaders} from '../server/security-headers.mjs';

const directives=Object.fromEntries(securityHeaders['Content-Security-Policy'].split('; ').map(d=>{const [name,...values]=d.split(' ');return [name,values];}));

test('every response gets the security headers; status, body and handler headers survive',async()=>{
 const original=new Response('{"ok":true}',{status:201,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 const response=withSecurityHeaders(original);
 assert.equal(response.status,201);assert.equal(await response.text(),'{"ok":true}');
 assert.equal(response.headers.get('content-type'),'application/json');assert.equal(response.headers.get('cache-control'),'no-store');
 // A value the handler chose is not overwritten.
 assert.equal(response.headers.get('referrer-policy'),'no-referrer');
 for(const name of ['Content-Security-Policy','Strict-Transport-Security','X-Frame-Options','X-Content-Type-Options','Permissions-Policy','Cross-Origin-Opener-Policy'])assert.equal(response.headers.get(name),securityHeaders[name],name);
 for(const status of [204,304,404]){const empty=withSecurityHeaders(new Response(null,{status}));assert.equal(empty.status,status);assert.equal(empty.headers.get('x-frame-options'),'DENY');}
 const redirect=withSecurityHeaders(Response.redirect('https://realdev.test/auth',302));assert.equal(redirect.status,302);assert.equal(redirect.headers.get('location'),'https://realdev.test/auth');
});

test('the policy forbids inline script, eval, framing and unknown origins',()=>{
 assert.deepEqual(directives['default-src'],["'self'"]);
 const scripts=directives['script-src'];
 assert.ok(!scripts.includes("'unsafe-inline'")&&!scripts.includes("'unsafe-eval'")&&!scripts.some(v=>v.includes('*')||v==='https:'||v==='data:'),'script-src must stay strict');
 assert.deepEqual(directives['frame-ancestors'],["'none'"]);assert.deepEqual(directives['object-src'],["'none'"]);
 assert.deepEqual(directives['base-uri'],["'self'"]);assert.deepEqual(directives['form-action'],["'self'"]);
 assert.equal(securityHeaders['X-Frame-Options'],'DENY');
 assert.match(securityHeaders['Strict-Transport-Security'],/^max-age=(\d+)$/);assert.ok(Number(securityHeaders['Strict-Transport-Security'].split('=')[1])>=15552000);
 assert.match(securityHeaders['Permissions-Policy'],/microphone=\(self\)/);assert.match(securityHeaders['Permissions-Policy'],/camera=\(\)/);
});

test('the policy still allows what the pages load, and the pages need nothing it forbids',()=>{
 const web=name=>readFileSync(new URL('../web/'+name,import.meta.url),'utf8');
 // Firebase Auth SDK origin used by web/auth.js must be allowed, and it must be the only external script origin.
 const external=[...web('auth.js').matchAll(/\.src='(https:\/\/[^/']+)/g)].map(m=>m[1]);
 assert.ok(external.length>0);for(const origin of external)assert.ok(directives['script-src'].includes(origin),origin);
 // The QuickJS worker compiles WebAssembly at runtime.
 assert.ok(directives['script-src'].includes("'wasm-unsafe-eval'"));
 // Every stylesheet a CSS file @imports must be allowed, with the font host Google Fonts serves files from.
 const imports=['styles.css','theme.css','theme-mode.css','public.css','public-learning.css','assessment.css','learning.css','goals.css','study.css','header-responsive.css'].flatMap(name=>[...web(name).matchAll(/@import\s+url\(['"]?(https:\/\/[^/'")]+)/g)].map(m=>m[1]));
 assert.ok(imports.length>0);for(const origin of imports)assert.ok(directives['style-src'].includes(origin),origin);
 assert.ok(directives['font-src'].includes('https://fonts.gstatic.com'));
 for(const origin of ['https://identitytoolkit.googleapis.com','https://securetoken.googleapis.com'])assert.ok(directives['connect-src'].includes(origin),origin);
 // No inline scripts or inline event handlers in the shipped HTML, so script-src needs no 'unsafe-inline'.
 for(const page of ['index.html','auth.html']){
  const html=web(page);
  for(const tag of html.match(/<script\b[^>]*>/g)||[])assert.match(tag,/\ssrc="\/[^"]+"/,page+': '+tag);
  assert.doesNotMatch(html,/\son[a-z]+\s*=\s*["']/i,page+' has an inline event handler');
  for(const href of [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m=>m[1]))assert.ok(href.startsWith('/'),page+': '+href);
 }
});

test('the Worker entry and the local preview both apply the headers',()=>{
 const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
 assert.match(read('../server/index.mjs'),/export default \{async fetch\(request,env\)\{return withSecurityHeaders\(await handle\(request,env\)\);\}\};/);
 assert.match(read('../scripts/dev.mjs'),/response=withSecurityHeaders\(response\);res\.writeHead/);
});
