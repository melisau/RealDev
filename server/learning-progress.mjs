// Descriptive account-local measurements, not claims of expertise or causal learning impact.
export function learningProgress({account,profile,baselineComplete=false,attempts=[],codeEvidence=[]}){
 const ordered=[...attempts].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));
 const latest=new Map();let reviewed=0,recovered=0;
 for(const a of ordered){const prior=latest.get(a.task_id);if(prior&&(prior.skipped||prior.score<100)){reviewed++;if(a.score===100&&!a.hinted&&!a.skipped)recovered++;}latest.set(a.task_id,a);}
 const coded=new Set(codeEvidence.filter(a=>a.verification==='server-verified').map(a=>a.task_id)).size;
 return {profileSaved:Boolean(account&&profile.saved),baselineComplete,answeredTasks:latest.size,reviewed,recovered,verifiedCodeTasks:coded,next:!account||!profile.saved?'account':!baselineComplete?'assessment':coded===0?'code':'route'};
}
