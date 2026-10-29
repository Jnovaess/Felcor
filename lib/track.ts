export function trackingSession(){try{let key=sessionStorage.getItem('felcor-analytics-session');if(!key){key=crypto.randomUUID();sessionStorage.setItem('felcor-analytics-session',key);}return key;}catch{return null;}}
export function track(kind:'visit'|'reseller'|'contact',attempt?:string){
  const session=trackingSession();if(!session)return;
  void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,session,...(attempt?{attempt}:{})}),keepalive:true}).catch(()=>{});
}
export function trackCheckout(attempt?:string|null){if(!attempt)return;void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'checkout',attempt}),keepalive:true}).catch(()=>{});}
