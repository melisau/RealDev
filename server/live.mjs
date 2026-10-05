import {XMLParser} from 'fast-xml-parser';
const feeds=[{id:'openai',name:'OpenAI',url:'https://openai.com/news/rss.xml',host:'openai.com'},{id:'github',name:'GitHub Changelog',url:'https://github.blog/changelog/feed/',host:'github.blog'},{id:'dotnet',name:'.NET Blog',url:'https://devblogs.microsoft.com/dotnet/feed/',host:'devblogs.microsoft.com'},{id:'kubernetes',name:'Kubernetes',url:'https://kubernetes.io/feed.xml',host:'kubernetes.io'}];
const plain=value=>String(value?.['#text']??value??'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#\d+;/g,' ').replace(/\s+/g,' ').trim();
const list=x=>x?Array.isArray(x)?x:[x]:[];
export function parseFeed(xml,feed){
 if(xml.length>1500000||/<!DOCTYPE|<!ENTITY/i.test(xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g,'')))throw Error('invalid_feed');
 const parsed=new XMLParser({ignoreAttributes:false,processEntities:false}).parse(xml);
 const rows=parsed.rss?.channel?.item||parsed.feed?.entry;
 if(!rows)throw Error('invalid_feed');
 return list(rows).slice(0,20).flatMap(item=>{
  const rawLink=typeof item.link==='string'?item.link:list(item.link).find(l=>l['@_rel']==='alternate')?.['@_href']||list(item.link)[0]?.['@_href'];
  let url;try{url=new URL(rawLink);if(url.protocol!=='https:'||url.hostname!==feed.host)return [];}catch{return [];}
  const date=new Date(item.pubDate||item.published||item.updated);if(!Number.isFinite(date.getTime()))return [];
  return [{id:url.href,title:plain(item.title).slice(0,300),url:url.href,publishedAt:date.toISOString(),source:feed.name,sourceId:feed.id,summary:plain(item.description||item.summary||item['content:encoded']||item.content).slice(0,900)}];
 });
}
async function boundedText(response,max=1500000){
 const reader=response.body.getReader();let size=0,out='';const decoder=new TextDecoder();
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('response_too_large');}out+=decoder.decode(value,{stream:true});}return out+decoder.decode();
}
async function cache(db,key,ttl,load){
 const prior=await db.one('SELECT * FROM source_cache WHERE key = ?',key);const now=Date.now();
 if(prior&&now-Date.parse(prior.fetched_at)<ttl)return {...JSON.parse(prior.payload),fetchedAt:prior.fetched_at,stale:false};
 try{const payload=await load();const at=new Date().toISOString();await db.write('INSERT INTO source_cache (key,payload,fetched_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,fetched_at=excluded.fetched_at',key,JSON.stringify(payload),at);return {...payload,fetchedAt:at,stale:false};}
 catch(error){if(prior)return {...JSON.parse(prior.payload),fetchedAt:prior.fetched_at,stale:true,error:String(error.message).slice(0,100)};return {error:String(error.message).slice(0,100),stale:true,fetchedAt:null};}
}
export async function newsFeed(db,fetcher=fetch){
 const results=await Promise.all(feeds.map(feed=>cache(db,'feed:'+feed.id,900000,async()=>{const r=await fetcher(feed.url,{headers:{Accept:'application/rss+xml, application/xml, text/xml','User-Agent':'RealDev/1.0'},signal:AbortSignal.timeout(10000),redirect:'error'});if(!r.ok)throw Error('HTTP '+r.status);return {items:parseFeed(await boundedText(r),feed)};}).then(r=>({...r,id:feed.id,name:feed.name}))));
 return {sources:results.map(({items,...x})=>x),items:results.flatMap(r=>(r.items||[]).map(i=>({...i,stale:r.stale}))).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,45)};
}
export const validateRepo=value=>typeof value==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[a-zA-Z0-9_.-]{1,100}$/.test(value)&&!value.includes('..');
export async function githubRepo(db,repo,fetcher=fetch){
 if(!validateRepo(repo))throw Error('invalid_repository');
 return cache(db,'github:'+repo.toLowerCase(),300000,async()=>{
  const get=async suffix=>{const r=await fetcher('https://api.github.com/repos/'+repo+suffix,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'RealDev/1.0'},signal:AbortSignal.timeout(10000),redirect:'error'});if(!r.ok)throw Error('GitHub HTTP '+r.status);return JSON.parse(await boundedText(r,1200000));};
  const info=await get('');if(info.private)throw Error('public_repositories_only');
  const sections=await Promise.allSettled([get('/commits?per_page=5'),get('/pulls?state=open&per_page=5'),get('/actions/runs?per_page=5'),get('/languages')]);
  return {repository:{name:info.full_name,url:info.html_url,description:info.description,branch:info.default_branch},commits:sections[0].status==='fulfilled'?sections[0].value.map(c=>({sha:c.sha,url:c.html_url,message:c.commit?.message?.slice(0,500),date:c.commit?.author?.date})):[],pulls:sections[1].status==='fulfilled'?sections[1].value.map(p=>({title:p.title,url:p.html_url,number:p.number})):[],runs:sections[2].status==='fulfilled'?sections[2].value.workflow_runs.map(r=>({name:r.name,url:r.html_url,status:r.status,conclusion:r.conclusion,date:r.updated_at})):[],languages:sections[3].status==='fulfilled'?sections[3].value:{},errors:sections.map((r,i)=>r.status==='rejected'?{section:['commits','pulls','actions','languages'][i],error:String(r.reason.message)}:null).filter(Boolean)};
 });
}
