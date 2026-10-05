import {api} from './api.mjs';
import {assets} from './assets.generated.mjs';
import {database} from './db.mjs';
import {dispatchReminders,authorizedDispatcher} from './reminders.mjs';
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/internal/reminders/')){
  if(!await authorizedDispatcher(request,env))return Response.json({error:'service_only'},{status:403});
  try{
   if(path==='/internal/reminders/dispatch'&&request.method==='POST')return Response.json(await dispatchReminders(database(env),env));
   if(path==='/internal/reminders/status'&&request.method==='GET'){const row=await database(env).one('SELECT payload FROM source_cache WHERE key=?','reminder-dispatch');return Response.json(row?JSON.parse(row.payload):{at:null});}
   return new Response('Not found',{status:404});
  }catch(error){return Response.json({error:'reminder_dispatch_failed'},{status:error.status||503});}
 }
 if(path.startsWith('/api/'))return api(request,env);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[path==='/'?'/index.html':path];
 if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
}};
