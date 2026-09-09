(()=>{
  'use strict';
  const loadLocal=(src)=>new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return}
    const s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });

  const start=async()=>{
    try{
      // El módulo público se carga primero. El panel administrativo se difiere
      // para no bloquear la pantalla de participantes.
      await loadLocal('./participants-details.js');
      loadLocal('./admin-fix.js').catch(error=>console.error('TRD admin-fix:',error));
    }catch(error){
      console.error('TRD módulos:',error);
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
