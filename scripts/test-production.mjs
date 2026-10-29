import assert from 'node:assert/strict';
import { Miniflare } from 'miniflare';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { hashPassword, verifyPassword } from '../lib/password.mjs';
import { configureToolEnvironment } from './tool-environment.mjs';
configureToolEnvironment(process.cwd());
const password = randomBytes(24).toString('hex');
const hash = await hashPassword(password);
assert(await verifyPassword(password,hash));
assert.equal(await verifyPassword('incorrect',hash),false);
const config=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
const files=(await readdir('dist/server',{recursive:true})).filter(file=>file.endsWith('.js') && file!=='index.js');
const worker=new Miniflare({modules:['index.js',...files].map(file=>({type:'ESModule',path:path.resolve('dist/server',file)})),modulesRoot:path.resolve('dist/server'),
  compatibilityDate:config.compatibility_date,compatibilityFlags:config.compatibility_flags,
  bindings:{...config.vars,ADMIN_PASSWORD_HASH:hash},d1Databases:['DB'],r2Buckets:['BUCKET'],
  assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}}});
const db=await worker.getD1Database('DB');
for(const file of ['drizzle/0000_strange_saracen.sql','drizzle/0001_admin_sessions.sql','drizzle/0002_customer_accounts.sql','drizzle/0003_analytics_events.sql']){
  const sql=await readFile(file,'utf8');
  for(const statement of sql.split(';').map(s=>s.replaceAll('--> statement-breakpoint','').trim()).filter(Boolean)) await db.prepare(statement).run();
}
const analyticsSession=crypto.randomUUID();
const origin = 'https://felcor.test';
let cookie='';
let logs='';
async function request(path,{method='GET',data,headers={}}={}) {
 const body=data===undefined?undefined:Buffer.isBuffer(data)?data:JSON.stringify(data);
 const response=await worker.dispatchFetch(origin+path,{method,redirect:'manual',headers:{...(body?{'Content-Type':'application/json'}:{}),Origin:origin,...(cookie?{Cookie:cookie}:{}),...headers},body});
 return {status:response.status,headers:{...Object.fromEntries(response.headers),'set-cookie':response.headers.getSetCookie()},text:await response.text()};
}
try {
  let ready=false;
  for(let i=0;i<60;i++){try{if((await request('/api/products')).status===200){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
  assert(ready,'Local Worker did not become ready: '+logs.slice(-2000));
  await new Promise(resolve=>setTimeout(resolve,3000));
  assert.equal((await request('/')).status,200);
  assert.equal((await request('/admin/login')).status,200);
  assert.equal((await request('/api/products?all=1')).status,403);
  assert.equal((await request('/api/products?all=1',{headers:{'oai-authenticated-user-id':'fake','oai-authenticated-user-email':'joaonovaesq4@gmail.com'}})).status,403);
  assert.equal((await request('/api/auth/login',{method:'POST',data:{email:'joaonovaesq4@gmail.com',password},headers:{Origin:'https://attacker.example'}})).status,403);
  const wrong = await request('/api/auth/login',{method:'POST',data:{email:'joaonovaesq4@gmail.com',password:'incorrect'}});
  if(wrong.status!==401) await new Promise(resolve=>setTimeout(resolve,1000));
  assert.equal(wrong.status,401,wrong.text+' '+logs.slice(-4000));
  assert.equal((await request('/api/auth/login',{method:'POST',data:{email:'other@example.com',password}})).status,401);
  const login=await request('/api/auth/login',{method:'POST',data:{email:'joaonovaesq4@gmail.com',password}});
  assert.equal(login.status,200,login.text);
  const setCookie=login.headers['set-cookie'][0];
  for(const attribute of ['HttpOnly','Secure','SameSite=Strict','Path=/']) assert(setCookie.toLowerCase().includes(attribute.toLowerCase()),attribute);
  cookie=setCookie.split(';')[0];
  assert.equal((await request('/admin')).status,200);
  assert.equal((await request('/api/admin',{method:'POST'})).status,200);
  assert.equal((await request('/api/admin',{method:'POST'})).status,200);
  let products=JSON.parse((await request('/api/products')).text);
  assert.equal(products.length,3);
  assert(products.every(p=>p.price>0 && p.stock===0));
  const product={...products[0],price:4990,stock:3};
  assert.equal((await request('/api/products',{method:'POST',data:{...product,price:-1}})).status,400);
  assert.equal((await request('/api/products',{method:'POST',data:product})).status,200);
  await request('/api/admin',{method:'POST'});
  products=JSON.parse((await request('/api/products')).text);
  assert.equal(products.find(p=>p.id===product.id).price,4990);
  const checkout=await request('/api/checkout',{method:'POST',data:{session:analyticsSession,items:[{id:product.id,quantity:2}],price:1}});
  assert.equal(checkout.status,200,checkout.text);
  const url=new URL(JSON.parse(checkout.text).url);
  assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/5511939002074');
  assert(url.searchParams.get('text').includes('99,80'));
  assert.equal((await request('/api/checkout',{method:'POST',data:{items:[{id:product.id,quantity:4}]}})).status,409);
  const boundary='felcor-test-boundary';
  const jpg=await readFile('public/assets/gold-jar.jpg');
  const multipart=Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="test.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),jpg,Buffer.from(`\r\n--${boundary}--\r\n`)]);
  const upload=await request('/api/images',{method:'POST',data:multipart,headers:{'Content-Type':`multipart/form-data; boundary=${boundary}`}});
  assert.equal(upload.status,201,upload.text);
  const imageUrl=JSON.parse(upload.text).url;
  const image=await request(imageUrl);assert.equal(image.status,200);assert.equal(image.headers['content-type'],'image/jpeg');
  assert.equal((await request('/api/products',{method:'POST',data:{...product,image:imageUrl,active:false}})).status,200);
  assert.equal(JSON.parse((await request('/api/products')).text).length,2);
  assert.equal((await request('/api/products',{method:'DELETE',data:{id:product.id}})).status,200);

  const record=async data=>request('/api/analytics',{method:'POST',headers:{Cookie:''},data});
  assert.equal((await request('/api/admin/reports',{headers:{Cookie:''}})).status,403);
  assert.equal((await request('/api/admin/reports?start=2026-02-30&end=2026-03-01')).status,400);
  assert.equal((await record({kind:'visit',session:analyticsSession})).status,204);
  await record({kind:'visit',session:analyticsSession});
  await record({kind:'reseller',session:analyticsSession});
  await record({kind:'contact',session:analyticsSession});
  const attempt=JSON.parse(checkout.text).attempt;
  assert(attempt);
  await record({kind:'checkout',attempt});
  await record({kind:'checkout',attempt});
  await record({kind:'checkout',attempt:crypto.randomUUID()});
  assert.equal((await request('/api/analytics',{method:'POST',data:{kind:'visit',session:crypto.randomUUID()}})).status,204);
  const report=JSON.parse((await request('/api/admin/reports')).text);
  assert.equal(report.days.length,1);
  assert.equal(report.days[0].visits,1);
  assert.equal(report.days[0].checkouts,1);
  assert.equal(report.days[0].resellers,1);
  assert.equal(report.days[0].contacts,1);
  assert.equal((await request('/api/analytics',{method:'POST',headers:{Origin:'https://attacker.example'},data:{kind:'visit',session:analyticsSession}})).status,403);
  console.log('PASS: analytics deduplication, confirmed checkout tokens, admin exclusion, date validation, aggregates and access control.');
  const oldCookie=cookie;
  assert.equal((await request('/api/auth/logout',{method:'POST'})).status,303);
  assert.equal((await request('/api/products?all=1',{headers:{Cookie:oldCookie}})).status,403);
  cookie='';
  assert.equal((await request('/api/products',{method:'POST',data:product})).status,403);
  assert.equal((await request('/api/images',{method:'POST',data:multipart,headers:{'Content-Type':`multipart/form-data; boundary=${boundary}`}})).status,403);
  const customerPassword=randomBytes(20).toString('hex');
  const account=async(action,extra={})=>request('/api/account',{method:'POST',data:{action,...extra}});
  assert.equal((await account('register',{email:'customer@example.com',password:customerPassword,name:'Cliente Teste',consent:true})).status,200);
  assert.equal((await account('login',{email:'customer@example.com',password:'wrongpassword1234'})).status,401);
  const customerLogin=await account('login',{email:'customer@example.com',password:customerPassword});
  assert.equal(customerLogin.status,200,customerLogin.text);
  cookie=customerLogin.headers['set-cookie'][0].split(';')[0];
  assert.equal((await request('/api/products?all=1')).status,403);
  assert.equal((await request('/api/profile',{method:'POST',data:{name:'Cliente Teste',phone:'11999999999'}})).status,200);
  assert.equal(JSON.parse((await request('/api/profile')).text).email,'customer@example.com');
  const firstCookie=cookie;
  assert.equal((await account('logout')).status,200);
  assert.equal((await request('/api/profile',{headers:{Cookie:firstCookie}})).status,401);
  cookie='';
  assert.equal((await account('register',{email:'second@example.com',password:customerPassword,name:'Segundo Cliente',consent:true})).status,200);
  const second=await account('login',{email:'second@example.com',password:customerPassword});
  cookie=second.headers['set-cookie'][0].split(';')[0];
  const secondProfile=JSON.parse((await request('/api/profile')).text);
  assert.equal(secondProfile.email,'second@example.com');assert.equal(secondProfile.phone,'');
  await account('logout');cookie='';
  let limited=false;
  for(let i=0;i<12;i++) {const result=await request('/api/auth/login',{method:'POST',data:{email:'joaonovaesq4@gmail.com',password:'incorrect'}});if(result.status===429){limited=true;break;}}
  assert(limited,'Login rate limit');
  console.log('PASS: local migrations, password hashing, login/logout, CSRF, forged identity rejection, cookie flags, idempotent import, product CRUD, stock, WhatsApp totals/destination, R2 upload/read and login rate limit. No production data changed.');
} finally {
  await worker.dispose();
}
