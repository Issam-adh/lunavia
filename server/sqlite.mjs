import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function database(path){
 const sqlite=new DatabaseSync(path);sqlite.exec('PRAGMA busy_timeout=5000');
 sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
 if(!sqlite.prepare('SELECT name FROM local_migrations WHERE name=?').get('0000_lunavia_editor')){
  sqlite.exec('BEGIN IMMEDIATE');
  try{sqlite.exec(readFileSync(new URL('../drizzle/0000_lunavia_editor.sql',import.meta.url),'utf8'));sqlite.prepare('INSERT INTO local_migrations(name) VALUES(?)').run('0000_lunavia_editor');sqlite.exec('COMMIT');}
  catch(e){sqlite.exec('ROLLBACK');throw e;}
 }
 const wrap=(stmt,args=[])=>({bind(...v){return wrap(stmt,v);},first(){return stmt.get(...args)??null;},run(){return {meta:{changes:Number(stmt.run(...args).changes)}};}});
 return {prepare:s=>wrap(sqlite.prepare(s)),batch(list){sqlite.exec('BEGIN IMMEDIATE');try{const values=list.map(v=>v.run());sqlite.exec('COMMIT');return values;}catch(e){sqlite.exec('ROLLBACK');throw e;}},close(){sqlite.close();}};
}
