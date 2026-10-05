import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {api} from '../server/api.mjs';
import {localDb} from './local-db.mjs';
mkdirSync('.local',{recursive:true});const DB=localDb('.local/preview.sqlite');const host='http://127.0.0.1:4317';
const types={html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml'};
createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,host);let response;
  if(url.pathname.startsWith('/api/')){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','local-preview-user');headers.set('oai-authenticated-user-email','preview@local.test');
   const request=new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
   response=await api(request,{DB,PISTON_URL:process.env.PISTON_URL||'http://127.0.0.1:2000'});
  }else if(url.pathname.startsWith('/sign')){response=Response.redirect(host,302);}
  else{const base=resolve('web');const file=resolve(base,url.pathname==='/'?'index.html':'.'+url.pathname);if(!file.startsWith(base+sep)||!existsSync(file))response=new Response('Not found',{status:404});else response=new Response(readFileSync(file),{headers:{'content-type':(types[file.split('.').pop()]||'text/plain')+'; charset=utf-8','cache-control':'no-store'}});}
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e);res.writeHead(500);res.end('Preview error');}
}).listen(4317,'127.0.0.1',()=>console.log('Local preview: '+host+' (isolated preview account)'));
