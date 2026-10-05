import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {loadEnvFile} from 'node:process';
try{loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
import {api} from '../server/api.mjs';
import {localDb} from './local-db.mjs';
const port=Number(process.env.REALDEV_PORT)||4317;if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid preview port');
mkdirSync('.local',{recursive:true});const DB=localDb('.local/preview-'+port+'.sqlite');const host='http://127.0.0.1:'+port;
const types={html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml'};
createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,host);let response;
  if(url.pathname.startsWith('/api/')){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','local-preview-user');headers.set('oai-authenticated-user-email','preview@local.test');
   const request=new Request(url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
   response=await api(request,{DB,OPENAI_API_KEY:process.env.OPENAI_API_KEY,OPENAI_TEXT_MODEL:process.env.OPENAI_TEXT_MODEL,PISTON_URL:process.env.PISTON_URL||'http://127.0.0.1:2000',PISTON_API_KEY:process.env.PISTON_API_KEY});
  }else if(url.pathname.startsWith('/sign')){response=Response.redirect(host,302);}
  else{const base=resolve('web');const file=resolve(base,url.pathname==='/'?'index.html':'.'+url.pathname);if(!file.startsWith(base+sep)||!existsSync(file))response=new Response('Not found',{status:404});else response=new Response(readFileSync(file),{headers:{'content-type':(types[file.split('.').pop()]||'text/plain')+'; charset=utf-8','cache-control':'no-store'}});}
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e);res.writeHead(500);res.end('Preview error');}
}).listen(port,'127.0.0.1',()=>console.log('Local preview: '+host+' (isolated preview account)'));
