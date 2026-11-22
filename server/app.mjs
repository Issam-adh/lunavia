const prefix='/api/lunavia/admin/';
const cookie='__Host-lunavia-admin';
const enc=new TextEncoder();
const toHex=bytes=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
const random=size=>toHex(crypto.getRandomValues(new Uint8Array(size)));
const hash=async s=>toHex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const validUser=s=>typeof s==='string'&&/^[A-Za-z0-9_.-]{3,64}$/.test(s);
const validPass=s=>typeof s==='string'&&s.length>=12&&s.length<=256;
async function derive(password,salt){
 const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
 return toHex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:100000},key,256));
}
function equal(a,b){let diff=a.length^b.length;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
function reject(status,message){throw Object.assign(Error(message),{status});}
const json=(v,status=200,extra={})=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',...extra}});
function sessionHeader(value,age){return {'Set-Cookie':cookie+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age='+age};}
async function payload(req){
 if(req.headers.get('origin')!==new URL(req.url).origin||req.headers.get('content-type')?.split(';')[0]!=='application/json')reject(403,'Origine refusée.');
 const reader=req.body?.getReader();if(!reader)reject(400,'Requête vide.');
 const decoder=new TextDecoder();let size=0,body='';
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>780000){await reader.cancel();reject(413,'Contenu trop long.');}body+=decoder.decode(value,{stream:true});}
 try{const obj=JSON.parse(body+decoder.decode());if(obj&&typeof obj==='object'&&!Array.isArray(obj))return obj;}catch{}
 reject(400,'Requête invalide.');
}
async function account(env){
 const get=()=>env.DB.prepare('SELECT * FROM lunavia_admin WHERE id=1').first();
 const existing=await get();if(existing)return existing;
 if(!validUser(env.LUNAVIA_ADMIN_USER)||!validPass(env.LUNAVIA_ADMIN_PASSWORD))reject(503,'Configurez les identifiants du site.');
 const salt=random(16),digest=await derive(env.LUNAVIA_ADMIN_PASSWORD,salt);
 await env.DB.prepare('INSERT OR IGNORE INTO lunavia_admin(id,username,salt,digest) VALUES(1,?,?,?)').bind(env.LUNAVIA_ADMIN_USER,salt,digest).run();
 return get();
}
async function attempts(db,key){
 const now=Date.now(),cutoff=now-15*60000;
 await db.prepare('DELETE FROM lunavia_attempts WHERE started<?').bind(now-86400000).run();
 const row=await db.prepare('INSERT INTO lunavia_attempts(bucket,started,count) VALUES(?,?,1) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN started<? THEN 1 ELSE count+1 END, started=CASE WHEN started<? THEN excluded.started ELSE started END RETURNING count').bind(key,now,cutoff,cutoff).first();
 if(row.count>8)reject(429,'Trop de tentatives. Réessayez dans 15 minutes.');
}
async function current(req,db,identity){
 const value=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookie+'='))?.slice(cookie.length+1);
 if(!value||!/^[a-f0-9]{64}$/.test(value))return null;
 return db.prepare('SELECT a.username,a.generation,s.token FROM lunavia_sessions s JOIN lunavia_admin a ON a.id=1 AND a.generation=s.generation WHERE s.token=? AND s.identity=? AND s.expires>?').bind(await hash(value),identity,Date.now()).first();
}
const stillAuthorized='EXISTS(SELECT 1 FROM lunavia_sessions s JOIN lunavia_admin a ON a.id=1 AND a.generation=s.generation WHERE s.token=? AND s.expires>?)';
async function state(db){
 await db.prepare('INSERT OR IGNORE INTO lunavia_content(id) VALUES(1)').run();
 return db.prepare('SELECT * FROM lunavia_content WHERE id=1').first();
}
function edits(input,allowed){
 if(!input||typeof input!=='object'||Array.isArray(input))reject(400,'Brouillon invalide.');
 const out=Object.create(null);
 for(const [key,value] of Object.entries(input)){
  if(!allowed.has(key)||!value||typeof value!=='object'||Array.isArray(value))reject(400,'Champ inconnu.');
  const pair={};for(const [lang,text] of Object.entries(value)){
   if(!['fr','ar'].includes(lang)||typeof text!=='string'||!text.trim()||text.length>3000)reject(400,'Un texte est vide ou trop long.');
   pair[lang]=text;
  }
  if(Object.keys(pair).length)out[key]=pair;
 }
 return JSON.stringify(out);
}
export function makeSite({catalog,page,asset}){
 const keys=new Set(catalog.map(row=>row.id));
 return {async fetch(req,env){
  try{
   const path=new URL(req.url).pathname,db=env.DB;
   if(path==='/api/lunavia/content'&&req.method==='GET'){
    const s=await db.prepare('SELECT published FROM lunavia_content WHERE id=1').first();
    return json(s?JSON.parse(s.published):{});
   }
   if(path==='/admin'||path==='/admin/'||path.startsWith(prefix)){
    const identity=req.headers.get('oai-authenticated-user-id');
    if(!identity)reject(403,'Connexion au site privé requise.');
    if(path==='/admin'||path==='/admin/'){
     if(!['GET','HEAD'].includes(req.method))reject(405,'Méthode refusée.');
     const session=await current(req,db,identity),body=page(session?'editor':'login');
     return new Response(req.method==='HEAD'?null:body,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'",'X-Content-Type-Options':'nosniff'}});
    }
    const action=path.slice(prefix.length);
    if(action==='login'&&req.method==='POST'){
     const b=await payload(req);const key=await hash(identity+'|'+(req.headers.get('cf-connecting-ip')||'site'));
     await attempts(db,key);const a=await account(env);
     if(!equal(await derive(typeof b.password==='string'&&b.password.length<=256?b.password:'',a.salt),a.digest)||b.username!==a.username)reject(401,'Identifiant ou mot de passe incorrect.');
     const token=random(32);
     await db.batch([db.prepare('DELETE FROM lunavia_sessions WHERE expires<=? OR generation<>?').bind(Date.now(),a.generation),db.prepare('DELETE FROM lunavia_attempts WHERE bucket=?').bind(key),db.prepare('INSERT INTO lunavia_sessions(token,identity,generation,expires) VALUES(?,?,?,?)').bind(await hash(token),identity,a.generation,Date.now()+8*3600000)]);
     return json({ok:true},200,sessionHeader(token,28800));
    }
    const session=await current(req,db,identity);if(!session)reject(401,'Reconnectez-vous.');
    if(action==='state'&&req.method==='GET'){
     const s=await state(db);return json({username:session.username,catalog,draft:JSON.parse(s.draft),revision:s.revision,publishedRevision:s.published_revision,publishedAt:s.published_at});
    }
    if(req.method!=='POST')reject(405,'Méthode refusée.');
    const b=await payload(req);
    if(action==='logout'){await db.prepare('DELETE FROM lunavia_sessions WHERE token=?').bind(session.token).run();return json({ok:true},200,sessionHeader('',0));}
    if(action==='credentials'){
     if(!validUser(b.username)||!validPass(b.password))reject(400,'Utilisez un identifiant de 3 à 64 caractères et un mot de passe de 12 caractères minimum.');
     await attempts(db,'account/'+session.token);const a=await account(env);
     if(typeof b.current!=='string'||b.current.length>256||!equal(await derive(b.current,a.salt),a.digest))reject(403,'Mot de passe actuel incorrect.');
     const salt=random(16);
     const change=await db.prepare('UPDATE lunavia_admin SET username=?,salt=?,digest=?,generation=generation+1 WHERE id=1 AND generation=? AND '+stillAuthorized).bind(b.username,salt,await derive(b.password,salt),session.generation,session.token,Date.now()).run();
     if(!change.meta.changes)reject(409,'La session a changé. Reconnectez-vous.');
     return json({ok:true},200,sessionHeader('',0));
    }
    if(!['draft','publish'].includes(action))reject(404,'Page introuvable.');
    if(!Number.isSafeInteger(b.revision)||b.revision<0)reject(400,'Version invalide.');
    const data=edits(b.edits,keys),when=new Date().toISOString();
    await state(db);
    const statement=action==='publish'?db.prepare('UPDATE lunavia_content SET draft=?,published=?,published_at=?,published_revision=revision+1,revision=revision+1 WHERE id=1 AND revision=? AND '+stillAuthorized).bind(data,data,when,b.revision,session.token,Date.now()):
     db.prepare('UPDATE lunavia_content SET draft=?,revision=revision+1 WHERE id=1 AND revision=? AND '+stillAuthorized).bind(data,b.revision,session.token,Date.now());
    const result=await statement.run();if(!result.meta.changes)reject(409,'Une autre session a modifié ces textes. Rechargez la page avant de publier.');
    return json({revision:b.revision+1,...(action==='publish'?{publishedAt:when,publishedRevision:b.revision+1}:{})});
   }
   if(!['GET','HEAD'].includes(req.method))reject(405,'Méthode refusée.');
   return await asset(path,req);
  }catch(e){return json({error:e.status?e.message:'Service temporairement indisponible.'},e.status||503);}
 }};
}
