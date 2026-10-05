export function database(env){
 if(!env.DB)throw new Error('Database unavailable');
 const db=env.DB;
 return {one:(sql,...args)=>db.prepare(sql).bind(...args).first(),all:async(sql,...args)=>(await db.prepare(sql).bind(...args).all()).results,
  write:(sql,...args)=>db.prepare(sql).bind(...args).run(),batch:queries=>db.batch(queries.map(([sql,...args])=>db.prepare(sql).bind(...args)))};
}
