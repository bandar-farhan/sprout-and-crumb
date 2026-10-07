import {DatabaseSync, type StatementSync} from "node:sqlite";
import {mkdirSync,readFileSync} from "node:fs";
import path from "node:path";

type SqlValue=string|number|bigint|Uint8Array|null;
let instance: DatabaseSync | undefined;

export function database(){
  if(instance)return instance;
  const file=path.join(process.cwd(),"data","bakery.db");
  mkdirSync(path.dirname(file),{recursive:true});
  instance=new DatabaseSync(file);
  instance.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
  instance.exec(readFileSync(path.join(process.cwd(),"database","schema.sql"),"utf8"));
  return instance;
}
function bind(_statement:StatementSync,values:unknown[]){return values as SqlValue[]}
export async function one<T>(sql:string,values:unknown[]=[]){const statement=database().prepare(sql);return (statement.get(...bind(statement,values)) as T|undefined)??null}
export async function many<T=Record<string,unknown>>(sql:string,values:unknown[]=[]){const statement=database().prepare(sql);return statement.all(...bind(statement,values)) as T[]}
export async function execute(sql:string,values:unknown[]=[]){const statement=database().prepare(sql);return statement.run(...bind(statement,values))}
export async function transaction<T>(work:()=>Promise<T>){const db=database();db.exec("BEGIN IMMEDIATE");try{const result=await work();db.exec("COMMIT");return result}catch(error){db.exec("ROLLBACK");throw error}}
