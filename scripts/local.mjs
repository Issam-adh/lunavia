import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {database} from '../server/sqlite.mjs';

if(!existsSync('dist/server/index.js')){
 const npm=process.env.npm_execpath;
 if(!npm)throw Error('Run npm start to build the Angular site first.');
 const build=spawnSync(process.execPath,[npm,'run','build'],{stdio:'inherit'});if(build.status!==0)process.exit(build.status??1);
}
// Import the exact production Worker as ESM in a Node project without a global module-type change.
const code=readFileSync('dist/server/index.js');
const {default:site}=await import('data:text/javascript;base64,'+code.toString('base64'));
const managed=process.argv.includes('--preview')&&process.env.SITES_MANAGED_LINUX_CONTAINER==='1';
const data=resolve(process.env.LUNAVIA_PREVIEW_DATA||'.lunavia-local');mkdirSync(data,{recursive:true});
const db=database(join(data,'content.sqlite')), isNew=!db.prepare('SELECT id FROM lunavia_admin WHERE id=1').first();
const env={DB:db,LUNAVIA_ADMIN_USER:process.env.LUNAVIA_ADMIN_USER||'lunavia-admin',LUNAVIA_ADMIN_PASSWORD:process.env.LUNAVIA_ADMIN_PASSWORD||randomBytes(18).toString('base64url')};
const at=process.argv.indexOf('--port'),port=Number(process.env.PORT||(at>=0?process.argv[at+1]:4200));
const server=http.createServer(async(req,res)=>{
 try{
  const host=req.headers.host||'localhost';
  if(!managed&&!['localhost:'+port,'127.0.0.1:'+port,'[::1]:'+port].includes(host)){res.writeHead(403);res.end();return;}
  const headers=new Headers();
  for(const [k,v] of Object.entries(req.headers)){if(v!==undefined)headers.set(k,Array.isArray(v)?v.join(', '):v);}
  // Synthetic identity belongs exclusively to the private, local development adapter.
  headers.set('oai-authenticated-user-id','local-preview');headers.delete('cf-connecting-ip');
  const origin=managed && req.headers['x-forwarded-host']?String(req.headers['x-forwarded-proto']||'https')+'://'+req.headers['x-forwarded-host']:'http://'+host;
  const props={method:req.method,headers};
  if(!['GET','HEAD'].includes(req.method)){props.body=req;props.duplex='half';}
  const response=await site.fetch(new Request(origin+req.url,props),env);
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Preview unavailable.');}
});
server.listen(port,managed?'0.0.0.0':'127.0.0.1',()=>{console.log('Lunavia at http://127.0.0.1:'+port+' and /admin');if(isNew){console.log('Local test username  '+env.LUNAVIA_ADMIN_USER);console.log('Local test password  '+env.LUNAVIA_ADMIN_PASSWORD);}});
