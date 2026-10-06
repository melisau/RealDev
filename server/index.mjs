import {api} from './api.mjs';
import {assets} from './assets.generated.mjs';
import {database} from './db.mjs';
import {dispatchReminders,authorizedDispatcher} from './reminders.mjs';
import {pageForPath,renderPageDocument,robotsText,sitemapXml} from './page-routes.mjs';
export default {async fetch(request,env){
 const url=new URL(request.url);
 const path=url.pathname;
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
 if(path==='/robots.txt')return new Response(robotsText(url.origin),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
 if(path==='/sitemap.xml')return new Response(sitemapXml(url.origin),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
 const page=pageForPath(path),asset=assets[page?'/index.html':path];
 if(!asset)return new Response('Not found',{status:404});
 const document=page?renderPageDocument(asset.body,path,url.origin):null,body=document?.html??asset.body;
 return new Response(request.method==='HEAD'?null:body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',...(document?{'X-Robots-Tag':document.robots}:{})}});
}};
