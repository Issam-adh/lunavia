import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import ts from 'typescript';

const folder='src/app';
const catalogue=new Map();
const files={
  'home.html':'Accueil','app.html':'Navigation et pied de page','flight.ts':'Accueil',
  'about.html':'Agence','agency.html':'Agence','agency.ts':'Agence','umrah.ts':'Omra',
  'umrah.html':'Omra','contact.html':'Contact','destinations.html':'Destinations',
  'detail.html':'Voyages','card.ts':'Voyages','store.ts':'Destinations','pages.ts':'Accueil'
};
function add(fr,ar,group) {
  if(!fr?.trim()||!ar?.trim())return;
  const id=JSON.stringify([fr,ar]);
  if(!catalogue.has(id))catalogue.set(id,{id,fr,ar,groups:[]});
  const groups=catalogue.get(id).groups;
  if(!groups.includes(group))groups.push(group);
}
function literal(node){return node && ts.isStringLiteralLike(node)?node.text:null;}
function templateStrings(source,group) {
  // Angular bindings use JS string literals. Decode escape sequences through TypeScript.
  const quote=String.raw`'(?:\\.|[^'\\])*'`;
  const pattern=new RegExp(String.raw`\b(?:s|this)\.text\(\s*(`+quote+String.raw`)\s*,\s*(`+quote+String.raw`)\s*\)`,'gu');
  for(const m of source.matchAll(pattern)) {
    const a=ts.createSourceFile('pair.ts','['+m[1]+','+m[2]+']',ts.ScriptTarget.Latest,true).statements[0].expression.elements;
    add(a[0].text,a[1].text,group);
  }
}
for(const file of readdirSync(folder).filter(name=>files[name])){
  const source=readFileSync(folder+'/'+file,'utf8'), group=files[file];
  if(file.endsWith('.html')){templateStrings(source,group);continue;}
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
  function visit(n,context) {
    if(ts.isClassDeclaration(n)&&n.name){
      context=({'ContactComponent':'Contact','HomeComponent':'Accueil','TripDetailComponent':'Voyages','DestinationsComponent':'Destinations','TravelStore':'Destinations'})[n.name.text]??context;
    }
    if(ts.isPropertyAssignment(n)&&n.name.getText(ast)==='template'&&ts.isStringLiteralLike(n.initializer))templateStrings(n.initializer.text,context);
    if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='text'&&n.arguments.length===2)add(literal(n.arguments[0]),literal(n.arguments[1]),context);
    if(ts.isObjectLiteralExpression(n)){
      const values=Object.fromEntries(n.properties.filter(ts.isPropertyAssignment).map(p=>[p.name.getText(ast),literal(p.initializer)]));
      for(const name of Object.keys(values)){if(name==='fr')add(values.fr,values.ar,context);else if(values[name+'Ar'])add(values[name],values[name+'Ar'],context);}
    }
    ts.forEachChild(n,c=>visit(c,context));
  }
  visit(ast,group);
}
add('inspiration à découvrir','أفكار لاكتشافها','Destinations');
add('inspirations à découvrir','أفكار لاكتشافها','Destinations');
mkdirSync('dist/server',{recursive:true});
writeFileSync('dist/server/catalog.json',JSON.stringify([...catalogue.values()]));
console.log('Prepared '+catalogue.size+' bilingual content entries.');
