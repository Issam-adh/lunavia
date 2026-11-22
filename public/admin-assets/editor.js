const $=id=>document.getElementById(id);
const PAGE_SIZE=12;
let catalog=[],draft={},lang='fr',index=0,revision=null,publishedRevision=0,publishedAt=null,dirty=false,busy=false;
async function api(action,body){
 const r=await fetch('/api/lunavia/admin/'+action,body===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const v=await r.json();if(!r.ok)throw Error(v.error||'Service indisponible.');return v;
}
function status(text,error=false){$('status').textContent=text;$('status').dataset.error=String(error);}
function controls(){
 $('save').disabled=busy||revision===null||!dirty;$('publish').disabled=busy||revision===null||(!dirty&&revision===publishedRevision);
 $('revision').textContent=dirty?'Modifications à enregistrer.':revision!==publishedRevision?'Brouillon enregistré.':publishedAt?'Publié le '+new Intl.DateTimeFormat('fr',{dateStyle:'short',timeStyle:'short'}).format(new Date(publishedAt)):'Les textes d’origine sont en ligne.';
}
function render(){
 const group=$('section').selectedIndex?$('section').value:null,query=$('search').value.trim().toLocaleLowerCase();
 const matches=catalog.filter(r=>(!group||r.groups.includes(group))&&(!query||[r.fr,r.ar,draft[r.id]?.fr,draft[r.id]?.ar].some(t=>t?.toLocaleLowerCase().includes(query))));
 index=Math.min(index,Math.max(0,Math.floor((matches.length-1)/PAGE_SIZE)));const start=index*PAGE_SIZE;
 const host=$('fields');host.replaceChildren();
 for(const row of matches.slice(start,start+PAGE_SIZE)){
  const label=document.createElement('label');label.className='field';
  const source=document.createElement('span');source.className='source';source.lang=lang;source.dir=lang==='ar'?'rtl':'ltr';source.textContent=row[lang];
  const area=document.createElement('textarea');area.rows=row[lang].length>90?3:2;area.dir=source.dir;area.lang=lang;area.maxLength=3000;area.required=true;area.value=draft[row.id]?.[lang]??row[lang];
  area.addEventListener('input',()=>{
    if(area.value===row[lang]){if(draft[row.id]){delete draft[row.id][lang];if(!Object.keys(draft[row.id]).length)delete draft[row.id];}}
    else{draft[row.id]??={};draft[row.id][lang]=area.value;}
    dirty=true;controls();
  });label.append(source,area);host.append(label);
 }
 $('range').textContent=matches.length?(start+1)+'–'+Math.min(start+PAGE_SIZE,matches.length)+' / '+matches.length:'Aucun texte correspondant.';
 $('prev').disabled=index===0;$('next').disabled=start+PAGE_SIZE>=matches.length;
}
async function save(action){
 if(busy||revision===null)return;
 if(Object.values(draft).some(r=>Object.values(r).some(t=>!t.trim()))){status('Un champ modifié est vide.',true);return;}
 busy=true;controls();$('fields').inert=true;
 try{const r=await api(action,{revision,edits:draft});revision=r.revision;if(action==='publish'){publishedRevision=r.publishedRevision;publishedAt=r.publishedAt;}
  dirty=false;status(action==='publish'?'Les textes français et arabes sont publiés.':'Le brouillon est enregistré.');
 }catch(e){status(e.message,true);}finally{busy=false;$('fields').inert=false;controls();}
}
for(const code of ['fr','ar'])$(code).onclick=()=>{lang=code;for(const l of ['fr','ar'])$(l).setAttribute('aria-pressed',String(l===lang));render();};
$('prev').onclick=()=>{index--;render();};$('next').onclick=()=>{index++;render();};
$('section').onchange=$('search').oninput=()=>{index=0;render();};
$('save').onclick=()=>save('draft');$('publish').onclick=()=>save('publish');
$('logout').onclick=async()=>{if(dirty&&!confirm('Quitter sans enregistrer le brouillon ?'))return;try{await api('logout',{});dirty=false;location.replace('/admin');}catch(e){status(e.message,true);}};
$('account').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,b=form.querySelector('button');b.disabled=true;
 try{if(dirty)throw Error('Enregistrez le brouillon avant de modifier vos identifiants.');await api('credentials',Object.fromEntries(new FormData(form)));location.replace('/admin');}catch(e){$('account-status').textContent=e.message;}finally{b.disabled=false;}};
addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
try{const s=await api('state');catalog=s.catalog;draft=s.draft;revision=s.revision;publishedRevision=s.publishedRevision;publishedAt=s.publishedAt;
 for(const group of [...new Set(catalog.flatMap(r=>r.groups))])$('section').add(new Option(group,group));
 $('account').elements.username.value=s.username;controls();render();
}catch(e){status(e.message,true);}
