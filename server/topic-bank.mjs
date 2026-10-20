// Topic bank (20 October 2026): original bilingual questions that bring every
// assessment area to at least 100 questions. Each row is authored for RealDev;
// linked pages are technical references only and no external quiz is imported.
import {originalReference} from './content-policy.mjs';
import frontend from './topic-bank/frontend.mjs';
import dotnet from './topic-bank/dotnet.mjs';
import git from './topic-bank/git.mjs';
import sql from './topic-bank/sql.mjs';
import unity from './topic-bank/unity.mjs';
import devops from './topic-bank/devops.mjs';
import api from './topic-bank/api.mjs';
import testing from './topic-bank/testing.mjs';
import structures from './topic-bank/structures.mjs';
import ai from './topic-bank/ai.mjs';
import data from './topic-bank/data.mjs';
import mobile from './topic-bank/mobile.mjs';
import game from './topic-bank/game.mjs';

export const TOPIC_BANK_VERSION='2026-10-20.1';
export const TOPIC_BANK_CHECKED='2026-10-20';
export const topicBankAreas=[frontend,dotnet,git,sql,unity,devops,api,testing,structures,ai,data,mobile,game];
const bi=(pair)=>({tr:pair[0],en:pair[1]});
const levels={f:'foundation',i:'intermediate',a:'advanced'};
const formats={s:'scenario',c:'code-reading',d:'diagnosis'};
const hints={
 scenario:['Sorudaki kısıtları (ölçek, risk, kim karar veriyor) tek tek yaz; her seçeneğin hangi kısıtı çiğnediğine bak.','List each constraint in the question (scale, risk, who decides); check which constraint every option violates.'],
 'code-reading':['Kodu satır satır, değerleri bir tabloya yazarak izle; varsayılan davranışları (kopyalama, sıralama, tür dönüşümü) ayrıca düşün.','Trace the code line by line in a small value table; consider default behaviors such as copying, ordering and type conversion.'],
 diagnosis:['Önce belirtiyi açıklayan en dar kanıtı ara; veri silen veya güvenliği kapatan adımlar ilk teşhis olmamalı.','Look for the narrowest evidence that explains the symptom; steps that delete data or disable safety are not a first diagnosis.']
};
const checks=[
 ['Seçimimi sorudaki somut koşul ve davranışla gerekçelendirdim.','I justified my choice with the concrete condition and behavior in the question.'],
 ['Yanlış seçeneklerin hangi durumda doğru olabileceğini düşündüm.','I considered under which conditions the wrong options could become right.']
];
// Stable, id-derived answer position so placement does not follow authoring order.
function position(id){let h=2166136261;for(const c of id){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)%4;}

export function createTopicTasks(){
 const out=[];
 for(const {area,refs,rows} of topicBankAreas){
  for(const row of rows){
   const [slug,refKey,level,format,title,prompt,code,options,explain,hint]=row;
   const ref=refs[refKey];
   if(!ref)throw new Error('Unknown reference '+area+':'+refKey);
   const id='topic-'+area+'-'+slug;
   const answer=position(id);
   const fmt=formats[format];
   out.push({
    id,version:TOPIC_BANK_VERSION,area,
    kind:fmt==='diagnosis'?'error-diagnostic':'multiple-choice',
    format:fmt,difficulty:levels[level],minutes:level==='a'?4:3,
    topic:bi(title),tags:[...title,area],
    title:bi(title),prompt:bi(prompt),code,
    options:options.map((_,i)=>bi(options[(i-answer+4)%4])),answer,
    explain:bi(explain),hint:bi(hint||hints[fmt]),checks:checks.map(bi),
    source:originalReference(ref[0],ref[1],TOPIC_BANK_CHECKED)
   });
  }
 }
 return out;
}
