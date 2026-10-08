const local=(value,language)=>typeof value==='string'?value:(value?.[language]||value?.tr||'');
export const normalizeErrorSearch=value=>String(value??'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function filterErrors(tasks,{query='',area='',level='',language='tr'}={}){
 const terms=normalizeErrorSearch(query).trim().split(/\s+/).filter(Boolean);
 return tasks.filter(q=>(!area||q.area===area)&&(!level||(q.level||'unspecified')===level)&&terms.every(term=>normalizeErrorSearch([q.title?.tr,q.title?.en,local(q.topic,language),q.topic?.tr,q.topic?.en,q.prompt?.tr,q.prompt?.en,q.code,q.area].join(' ')).includes(term)))
  .sort((a,b)=>Number(b.id.startsWith('diagnostic-'))-Number(a.id.startsWith('diagnostic-')));
}