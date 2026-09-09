(()=>{
  'use strict';
  // Este archivo solo garantiza que el módulo de participantes se cargue una vez.
  // Evitamos fetch()+Function(), que puede bloquear la página bajo CSP o políticas del navegador.
  const loadLocal=(src)=>new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return}
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
  const start=async()=>{
    try{
      await loadLocal('./participants-details.js');
    }catch(error){
      console.error('TRD participantes:',error);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
