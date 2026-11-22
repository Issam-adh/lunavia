document.querySelector('form').addEventListener('submit',async event=>{
 event.preventDefault();const form=event.currentTarget,button=form.querySelector('button'),status=document.querySelector('#status');
 button.disabled=true;status.textContent='';
 try{
  const r=await fetch('/api/lunavia/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
  if(!r.ok)throw Error((await r.json()).error);location.replace('/admin');
 }catch(e){status.textContent=e.message||'Connexion indisponible.';}finally{button.disabled=false;}
});
