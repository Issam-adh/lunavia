import {readFileSync,writeFileSync,readdirSync,mkdirSync,rmSync,copyFileSync} from 'node:fs';
import {join,extname,relative} from 'node:path';

const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain','.ico':'image/x-icon'};
const table=Object.create(null);
function walk(dir){
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  if(entry.name.startsWith('.')||entry.name==='server')continue;
  const disk=join(dir,entry.name),key='/'+relative('dist',disk).split('\\').join('/');
  if(entry.isDirectory()){walk(disk);continue;}
  if(!entry.isFile())throw Error('Unexpected file '+key);
  const type=types[extname(key)]||'application/octet-stream';
  table[key]=[type,readFileSync(disk).toString('base64')];
 }
}
walk('dist');
const catalog=JSON.parse(readFileSync('dist/server/catalog.json','utf8'));
const templates=Object.fromEntries(['login','editor'].map(key=>[key,readFileSync('server/admin/'+key+'.html','utf8')]));
const handler=readFileSync('server/app.mjs','utf8');
const serve=`
const site=makeSite({
 catalog:catalogue,
 page:name=>templates[name],
 asset:async(path,request)=>{
  let name;try{name=decodeURIComponent(path);}catch{return new Response('Invalid URL',{status:400});}
  const route=name.replace(/\\/+$/,'');
  let item=Object.hasOwn(assets,name)?assets[name]:assets[(route||'')+'/index.html'];
  if(!item && !name.startsWith('/api/') && !name.startsWith('/admin') && !name.includes('.'))item=assets['/index.html'];
  if(!item)return new Response('Introuvable',{status:404});
  const [type,base64]=item, headers={'Content-Type':type+(/^(text\\/|application\\/json)/.test(type)?'; charset=utf-8':''),'Cache-Control':type==='text/html'?'private, no-store':'private, max-age=0, must-revalidate','X-Content-Type-Options':'nosniff'};
  return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),{headers});
 }
});
export default site;
`;
writeFileSync('dist/server/index.js',handler+'\nconst catalogue='+JSON.stringify(catalog)+';\nconst templates='+JSON.stringify(templates)+';\nconst assets='+JSON.stringify(table)+';\n'+serve);
rmSync('dist/server/catalog.json');
mkdirSync('dist/.openai',{recursive:true});copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Packaged the Angular application and '+Object.keys(table).length+' client assets.');
