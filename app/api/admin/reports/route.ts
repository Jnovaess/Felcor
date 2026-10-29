import { adminAllowed } from '@/lib/access';
import { analyticsDb,reportDay } from '@/lib/analytics';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!await adminAllowed())return Response.json({error:'Acesso restrito.'},{status:403});
 const params=new URL(request.url).searchParams;
 const end=params.get('end')||reportDay(),start=params.get('start')||end.slice(0,8)+'01';
 const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 if(!valid(start)||!valid(end)||start>end||(Date.parse(end)-Date.parse(start))>366*86400000)return Response.json({error:'Selecione um intervalo válido de até 366 dias.'},{status:400});
 try{const result=await analyticsDb().prepare(`SELECT day, SUM(kind='visit') AS visits, SUM(kind='checkout') AS checkouts, SUM(kind='reseller') AS resellers, SUM(kind='contact') AS contacts FROM analytics_events WHERE day BETWEEN ? AND ? AND kind!='prepared' GROUP BY day ORDER BY day`).bind(start,end).all();
 return Response.json({start,end,days:result.results},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Não foi possível carregar o relatório.'},{status:503});}
}
