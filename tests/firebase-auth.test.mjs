import assert from 'node:assert/strict';
import test from 'node:test';
import {verifyFirebaseSession} from '../server/firebase-auth.mjs';
import {api} from '../server/api.mjs';
const env={FIREBASE_PROJECT_ID:'realdev-test1',FIREBASE_API_KEY:'A'.repeat(32)};
test('Firebase ID token is checked by Google and mapped to a namespaced account',async()=>{
 const original=globalThis.fetch;let request;
 try{globalThis.fetch=async(url,init)=>{request={url:String(url),init};return Response.json({users:[{localId:'firebaseUser_123',email:'dev@example.com',emailVerified:true}]});};assert.deepEqual(await verifyFirebaseSession('a'.repeat(40),env),{id:'firebase:realdev-test1:firebaseUser_123',email:'dev@example.com'});assert.equal(request.url,'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key='+env.FIREBASE_API_KEY);assert.equal(JSON.parse(request.init.body).idToken,'a'.repeat(40));assert.equal(request.init.redirect,'manual');}finally{globalThis.fetch=original;}
});
test('Firebase verifier rejects malformed credentials, redirects and users',async()=>{
 await assert.rejects(()=>verifyFirebaseSession('short',env),/invalid_token/);
 await assert.rejects(()=>verifyFirebaseSession('a'.repeat(40),{...env,FIREBASE_PROJECT_ID:'../attacker'}),/invalid_project_id/);
 await assert.rejects(()=>verifyFirebaseSession('a'.repeat(40),{...env,FIREBASE_API_KEY:'invalid'}),/invalid_api_key/);
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>new Response('',{status:302,headers:{Location:'https://attacker.example'}});await assert.rejects(()=>verifyFirebaseSession('a'.repeat(40),env),/invalid_token/);globalThis.fetch=async()=>Response.json({users:[{localId:'bad:id',emailVerified:true}]});await assert.rejects(()=>verifyFirebaseSession('a'.repeat(40),env),/invalid_auth_response/);globalThis.fetch=async()=>Response.json({users:[{localId:'validUser',email:'dev@example.com',emailVerified:false}]});await assert.rejects(()=>verifyFirebaseSession('a'.repeat(40),env),/email_not_verified/);}finally{globalThis.fetch=original;}
});
test('Firebase public config is readable, secrets stay private and API data still needs authentication',async()=>{
 const response=await api(new Request('https://realdev.example/api/auth/config'),{FIREBASE_PROJECT_ID:env.FIREBASE_PROJECT_ID,FIREBASE_API_KEY:env.FIREBASE_API_KEY,FIREBASE_PRIVATE_KEY:'never-return-this'});
 assert.equal(response.status,200);const body=await response.json();assert.equal(body.configured,true);assert.equal(body.provider,'firebase');assert.equal(body.apiKey,env.FIREBASE_API_KEY);assert.equal(JSON.stringify(body).includes('never-return-this'),false);
 const protectedResponse=await api(new Request('https://realdev.example/api/profile'),{FIREBASE_PROJECT_ID:env.FIREBASE_PROJECT_ID,FIREBASE_API_KEY:env.FIREBASE_API_KEY});assert.equal(protectedResponse.status,401);
});

