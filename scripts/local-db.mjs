// node:sqlite adapter with the D1 prepare/bind/batch API. Used by tests, the local preview and the VDS Node host
// (deploy/vds/server.mjs). Never bundled into the Sites Worker, which uses its D1 binding instead.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
export function localDb(filename=':memory:'){
 const db=new DatabaseSync(filename);db.exec('PRAGMA foreign_keys=ON');
 // File-backed databases: WAL survives a crash mid-write and lets a backup read while the server writes;
 // busy_timeout waits for a lock (for example during a backup) instead of failing the request immediately.
 if(filename!==':memory:')db.exec('PRAGMA journal_mode=WAL;PRAGMA synchronous=NORMAL;PRAGMA busy_timeout=5000');
 db.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
 for(const file of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())if(!db.prepare('SELECT name FROM local_migrations WHERE name=?').get(file)){
  db.exec('BEGIN');try{db.exec(readFileSync('drizzle/'+file,'utf8'));db.prepare('INSERT INTO local_migrations VALUES (?)').run(file);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }
 function prepare(sql){const stmt=db.prepare(sql);let args=[];return {bind(...values){args=values;return this;},async first(){return stmt.get(...args)||null;},async all(){return {results:stmt.all(...args)};},async run(){return stmt.run(...args);}};}
 return {prepare,async batch(statements){db.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());db.exec('COMMIT');return out;}catch(e){db.exec('ROLLBACK');throw e;}},close:()=>db.close()};
}
