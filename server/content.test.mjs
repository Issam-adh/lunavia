import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {makeSite} from './app.mjs';
import {database} from './sqlite.mjs';
const pair={fr:'Le monde',ar:'العالم',groups:['Accueil']};pair.id=JSON.stringify([pair.fr,pair.ar]);
const site=makeSite({catalog:[pair],page:s=>s,asset:()=>new Response('static')});
const origin='https://lunavia.test',api='/api/lunavia/admin/';
function setup(){return {DB:database(':memory:'),LUNAVIA_ADMIN_USER:'example',LUNAVIA_ADMIN_PASSWORD:randomBytes(20).toString('hex')};}
function call(env,path,body,{cookie='',identity='owner',from=origin}={}){
 const headers={'Origin':from,'Content-Type':'application/json','Cookie':cookie};if(identity)headers['oai-authenticated-user-id']=identity;
 return site.fetch(new Request(origin+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body)}),env);
}
async function login(env){
 const r=await call(env,api+'login',{username:env.LUNAVIA_ADMIN_USER,password:env.LUNAVIA_ADMIN_PASSWORD});assert.equal(r.status,200);
 const value=r.headers.get('set-cookie');assert.match(value,/HttpOnly/);assert.match(value,/Secure/);assert.match(value,/SameSite=Strict/);return value.split(';')[0];
}
test('private sessions and sign-in rate limit',async()=>{
 const e=setup();assert.equal((await call(e,'/admin',undefined,{identity:''})).status,403);assert.equal(await(await call(e,'/admin')).text(),'login');
 for(const endpoint of ['draft','publish','credentials','logout'])assert.equal((await call(e,api+endpoint,{})).status,401);
 for(let i=0;i<8;i++)assert.equal((await call(e,api+'login',{username:'wrong',password:'wrong'})).status,401);
 assert.equal((await call(e,api+'login',{})).status,429);e.DB.close();
});
test('draft and live content remain separate; bilingual publish is atomic and stale updates fail',async()=>{
 const e=setup(),cookie=await login(e),opts={cookie},edits={[pair.id]:{fr:'Monde',ar:'عالم'}};
 assert.equal(await(await call(e,'/admin',undefined,opts)).text(),'editor');
 assert.equal((await call(e,api+'state',undefined,{cookie,identity:'different'})).status,401);
 assert.equal((await call(e,api+'draft',{revision:0,edits},{cookie,from:'https://another.test'})).status,403);
 assert.equal((await call(e,api+'draft',{revision:0,edits},opts)).status,200);
 assert.deepEqual(await(await call(e,'/api/lunavia/content')).json(),{});
 assert.deepEqual((await(await call(e,api+'state',undefined,opts)).json()).draft,edits);
 assert.equal((await call(e,api+'publish',{revision:0,edits},opts)).status,409);
 assert.equal((await call(e,api+'publish',{revision:1,edits},opts)).status,200);
 assert.deepEqual(await(await call(e,'/api/lunavia/content')).json(),edits);
 assert.equal((await call(e,api+'publish',{revision:2,edits:{unknown:{fr:'x'}}},opts)).status,400);e.DB.close();
});
test('changing both credentials invalidates all old sessions and the bootstrap password',async()=>{
 const e=setup(),cookie=await login(e),other=await login(e),next=randomBytes(20).toString('hex');
 assert.equal((await call(e,api+'credentials',{current:'invalid',username:'new-editor',password:next},{cookie})).status,403);
 assert.equal((await call(e,api+'credentials',{current:e.LUNAVIA_ADMIN_PASSWORD,username:'new-editor',password:next},{cookie})).status,200);
 assert.equal((await call(e,api+'state',undefined,{cookie:other})).status,401);
 assert.equal((await call(e,api+'login',{username:e.LUNAVIA_ADMIN_USER,password:e.LUNAVIA_ADMIN_PASSWORD})).status,401);
 const r=await call(e,api+'login',{username:'new-editor',password:next});assert.equal(r.status,200);
 const newCookie=r.headers.get('set-cookie').split(';')[0];assert.equal((await call(e,api+'logout',{},{cookie:newCookie})).status,200);
 assert.equal((await call(e,api+'state',undefined,{cookie:newCookie})).status,401);e.DB.close();
});
