(()=>{
  'use strict';

  const waitForCore=()=>new Promise(resolve=>{
    if(window.__TRD_DB)return resolve(true);
    let tries=0;
    const timer=setInterval(()=>{
      if(window.__TRD_DB){clearInterval(timer);resolve(true);return}
      if(++tries>=100){clearInterval(timer);resolve(false)}
    },50);
  });

  const loadLocal=(src)=>new Promise((resolve,reject)=>{
    const existing=document.querySelector(`script[src="${src}"]`);
    if(existing){resolve();return}
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });

  const start=async()=>{
    try{
      const section=document.querySelector('#participantes');
      if(section && !section.querySelector('#teamsGrid')){
        section.insertAdjacentHTML('beforeend',
          '<div id="teamsGrid"><section class="participants-panel participants-empty"><span>⏳</span><h3>Cargando participantes…</h3><p>Conectando con el registro.</p></section></div>'
        );
      }

      const ready=await waitForCore();
      if(!ready){
        const grid=document.querySelector('#teamsGrid');
        if(grid)grid.innerHTML='<section class="participants-panel participants-empty"><span>⚠️</span><h3>No se pudo iniciar la conexión</h3><p>Recarga la página para intentarlo nuevamente.</p></section>';
        return;
      }

      await loadLocal('./participants-details.js');
      // El panel administrativo no debe bloquear la carga pública.
      loadLocal('./admin-fix.js').catch(error=>console.error('TRD admin-fix:',error));
    }catch(error){
      console.error('TRD módulos:',error);
      const grid=document.querySelector('#teamsGrid');
      if(grid)grid.innerHTML='<section class="participants-panel participants-empty"><span>⚠️</span><h3>No se pudo cargar Participantes</h3><p>Hubo un problema al iniciar este módulo.</p></section>';
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
