import { env } from 'cloudflare:workers';
import { digest } from './password.mjs';
export function reportDay(now=new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function analyticsDb(){return (env as unknown as {DB:D1Database}).DB;}
export async function prepareCheckout(session:string){
  const id=crypto.randomUUID();
  try{await analyticsDb().prepare('INSERT INTO analytics_events (id,kind,day,session_key,created_at) VALUES (?,?,?,?,?)').bind(id,'prepared',reportDay(),digest(session),Date.now()).run();return id;}catch{return null;}
}
