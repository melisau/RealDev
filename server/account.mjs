const tables=['accounts','profiles','runs','attempts','notes','saved_questions','github_profiles','code_runs','practice_submissions','ai_usage'];
export async function exportAccount(db,user){
 const data={};
 for(const table of tables)data[table]=await db.all(`SELECT * FROM ${table} WHERE user_id = ?`,user);
 data.hints=await db.all('SELECT h.* FROM hints h JOIN runs r ON r.id=h.run_id WHERE r.user_id = ?',user);
 for(const rows of Object.values(data))for(const row of rows)delete row.user_id;
 return {format:'realdev-account-v1',exportedAt:new Date().toISOString(),data};
}
export async function eraseAccount(db,user,scope){
 // D1 batch is atomic. Children must be removed before referenced parents.
 const order=['saved_questions','attempts','notes','code_runs','practice_submissions','ai_usage'];
 const queries=order.map(table=>[`DELETE FROM ${table} WHERE user_id = ?`,user]);
 queries.push(['DELETE FROM hints WHERE run_id IN (SELECT id FROM runs WHERE user_id = ?)',user],['DELETE FROM runs WHERE user_id = ?',user]);
 if(scope==='account')queries.push(['DELETE FROM github_profiles WHERE user_id = ?',user],['DELETE FROM profiles WHERE user_id = ?',user],['DELETE FROM accounts WHERE user_id = ?',user]);
 await db.batch(queries);
 return {deleted:true,scope};
}
