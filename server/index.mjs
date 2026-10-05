import {api} from './api.mjs';
import {assets} from './assets.generated.mjs';
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/'))return api(request,env);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[path==='/'?'/index.html':path];
 if(!asset)return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
}};
